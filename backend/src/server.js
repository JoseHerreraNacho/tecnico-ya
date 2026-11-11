
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  randomInt,
  randomBytes,
  createCipheriv,
  createDecipheriv
} from 'node:crypto';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { z, ZodError } from 'zod';
import { pool, query } from './db.js';

// CONFIGURACIÓN DE SEGURIDAD

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Configura JWT_SECRET (mínimo 32 caracteres)');
}

const encryptionKeyHex = process.env.CODES_ENCRYPTION_KEY;

if (!/^[0-9a-fA-F]{64}$/.test(encryptionKeyHex || '')) {
  throw new Error(
    'CODES_ENCRYPTION_KEY debe contener 64 caracteres hexadecimales'
  );
}

const encryptionKey = Buffer.from(encryptionKeyHex, 'hex');

function encryptCode(code) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(code), 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted.toString('hex')
  ].join(':');
}

function decryptCode(value) {
  const parts = value.split(':');

  if (parts.length !== 3) {
    throw new Error('Formato de código cifrado inválido');
  }

  const [ivHex, tagHex, encryptedHex] = parts;

  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey,
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
}

// CONFIGURACIÓN DE EXPRESS

const app = express();

app.use(cors({
  origin: (
    process.env.CORS_ORIGINS ||
    'http://localhost:4200,http://localhost:8100,https://localhost'
  ).split(',').map(origin => origin.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50
}));

const safe = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const auth = (roles = []) => safe(async (req, res, next) => {
  const token = (req.headers.authorization || '')
    .replace(/^Bearer /, '');

  let data;

  try {
    data = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      error: 'Sesión no válida'
    });
  }

  const [user] = await query(
    'SELECT id,name,email,role,active FROM users WHERE id=?',
    [data.id]
  );

  if (!user?.active) {
    return res.status(401).json({
      error: 'Usuario inactivo'
    });
  }

  if (roles.length && !roles.includes(user.role)) {
    return res.status(403).json({
      error: 'Acceso denegado'
    });
  }

  req.user = user;
  next();
});

const admin = ['ADMIN', 'GESTOR'];
const valid = (schema, data) => schema.parse(data);
const str = z.string().trim().min(1);
const id = z.coerce.number().int().positive();

const audit = (uid, oid, action, detail = {}) =>
  query(
    'INSERT INTO audit_log(user_id,order_id,action,detail) VALUES(?,?,?,?)',
    [uid, oid, action, JSON.stringify(detail)]
  );

// ESTADO DEL SERVIDOR

app.get('/api/health', safe(async (req, res) => {
  await query('SELECT 1');
  res.json({ ok: true, database: 'connected' });
}));

// AUTENTICACIÓN

app.post('/api/auth/register', safe(async (req, res) => {
  const x = valid(z.object({
    name: str.max(120),
    email: z.string().email().max(190),
    password: z.string().min(10),
    phone: z.string().max(30).optional()
  }), req.body);

  const hash = await bcrypt.hash(x.password, 12);

  try {
    const result = await query(
      `INSERT INTO users(name,email,password_hash,role,phone)
       VALUES(?,?,?,?,?)`,
      [x.name, x.email.toLowerCase(), hash, 'CLIENTE', x.phone || null]
    );

    res.status(201).json({ id: result.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Correo ya registrado'
      });
    }
    throw e;
  }
}));

app.post('/api/auth/login', safe(async (req, res) => {
  const x = valid(z.object({
    email: z.string().email(),
    password: z.string()
  }), req.body);

  const [user] = await query(
    'SELECT * FROM users WHERE email=? AND active=1',
    [x.email.toLowerCase()]
  );

  if (!user || !await bcrypt.compare(x.password, user.password_hash)) {
    return res.status(401).json({
      error: 'Credenciales incorrectas'
    });
  }

  res.json({
    token: jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    ),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

app.get('/api/me', auth(), (req, res) => {
  res.json(req.user);
});


// NOTIFICACIONES PERSISTENTES POR USUARIO
const notify = async (connection, userId, orderId, title, body) => {
  if (!userId) return;
  await connection.execute(
    'INSERT INTO notifications(user_id,order_id,title,body) VALUES(?,?,?,?)',
    [userId, orderId || null, title, body]
  );
};

app.get('/api/notifications', auth(), safe(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await query(
    `SELECT id,order_id,title,body,is_read,created_at
     FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 100`,
    [req.user.id]
  ));
}));

app.patch('/api/notifications/:id/read', auth(), safe(async (req, res) => {
  const notificationId = id.parse(req.params.id);
  const result = await query(
    'UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',
    [notificationId, req.user.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Notificación no encontrada' });
  res.json({ ok: true });
}));

app.patch('/api/notifications/read-all', auth(), safe(async (req, res) => {
  await query('UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0', [req.user.id]);
  res.json({ ok: true });
}));

// SERVICIOS

app.get('/api/services', safe(async (req, res) => {
  res.json(await query(
    'SELECT * FROM services WHERE active=1 ORDER BY name'
  ));
}));

app.post('/api/services', auth(admin), safe(async (req, res) => {
  const x = valid(z.object({
    name: str.max(120),
    description: z.string().optional()
  }), req.body);

  const result = await query(
    'INSERT INTO services(name,description) VALUES(?,?)',
    [x.name, x.description || null]
  );

  res.status(201).json({ id: result.insertId });
}));

// USUARIOS Y TÉCNICOS

app.get('/api/users', auth(admin), safe(async (req, res) => {
  res.json(await query(
    'SELECT id,name,email,phone,role,active FROM users ORDER BY id DESC'
  ));
}));

app.post('/api/users', auth(['ADMIN']), safe(async (req, res) => {
  const x = valid(z.object({
    name: str,
    email: z.string().email(),
    password: z.string().min(10),
    role: z.enum(['ADMIN', 'GESTOR', 'TECNICO']),
    phone: z.string().optional(),
    specialty: z.string().optional(),
    zone: z.string().optional()
  }), req.body);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO users(name,email,password_hash,role,phone)
       VALUES(?,?,?,?,?)`,
      [
        x.name,
        x.email.toLowerCase(),
        await bcrypt.hash(x.password, 12),
        x.role,
        x.phone || null
      ]
    );

    if (x.role === 'TECNICO') {
      await connection.execute(
        'INSERT INTO technicians(user_id,specialty,zone) VALUES(?,?,?)',
        [
          result.insertId,
          x.specialty || 'General',
          x.zone || 'Santiago'
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}));

app.get('/api/technicians', auth(admin), safe(async (req, res) => {
  res.json(await query(
    `SELECT u.id,u.name,u.email,t.specialty,t.zone,t.available,
       (SELECT COUNT(*)
        FROM orders o
        WHERE o.technician_id=u.id
          AND o.status IN ('ASIGNADA','EN_PROCESO')) AS active_orders
     FROM technicians t
     JOIN users u ON u.id=t.user_id
     WHERE u.active=1
     ORDER BY active_orders,u.name`
  ));
}));

app.patch('/api/technicians/:id', auth(admin), safe(async (req, res) => {
  const x = valid(z.object({
    specialty: str.optional(),
    zone: str.optional(),
    available: z.boolean().optional()
  }), req.body);

  const fields = Object.keys(x);

  if (!fields.length) {
    return res.status(400).json({ error: 'Sin cambios' });
  }

  await query(
    'UPDATE technicians SET ' +
    fields.map(k => k + '=?').join(',') +
    ' WHERE user_id=?',
    [...Object.values(x), req.params.id]
  );

  res.json({ ok: true });
}));

// SOLICITUDES DE CLIENTES


app.post('/api/requests', auth(['CLIENTE']), safe(async (req, res) => {
  const x = valid(z.object({
    service_id: id,
    description: str,
    address: str,
    comuna: str,
    contact_phone: str,
    preferred_date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),

    latitude: z.number().finite().min(-90).max(90).nullable().optional(),
    longitude: z.number().finite().min(-180).max(180).nullable().optional(),
    location_confirmed: z.boolean().optional()
  }).superRefine((data, ctx) => {
    const hasLatitude = data.latitude != null;
    const hasLongitude = data.longitude != null;

    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({
        code: 'custom',
        message: 'Debes enviar ambas coordenadas.'
      });
    }

    if (data.location_confirmed && (!hasLatitude || !hasLongitude)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Confirma una ubicación válida en el mapa.'
      });
    }

    if (!data.location_confirmed && (hasLatitude || hasLongitude)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Debes confirmar la ubicación antes de guardarla.'
      });
    }
  }), req.body);

  const result = await query(
    `INSERT INTO requests (
       client_id,
       service_id,
       description,
       address,
       comuna,
       contact_phone,
       preferred_date,
       latitude,
       longitude,
       location_confirmed
     ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      req.user.id,
      x.service_id,
      x.description,
      x.address,
      x.comuna,
      x.contact_phone,
      x.preferred_date || null,
      x.latitude ?? null,
      x.longitude ?? null,
      x.location_confirmed ? 1 : 0
    ]
  );

  try {
    const recipients = await query("SELECT id FROM users WHERE role IN ('ADMIN','GESTOR') AND active=1");
    for (const recipient of recipients) {
      await query('INSERT INTO notifications(user_id,title,body) VALUES(?,?,?)',
        [recipient.id, 'Nueva solicitud', 'Solicitud #' + result.insertId + ' recibida para revisión']);
    }
  } catch (error) { console.error('No se pudo notificar la solicitud:', error); }

  res.status(201).json({
    id: result.insertId,
    status: 'PENDIENTE'
  });
}));


const requestSelect = `
  SELECT r.*,u.name AS client_name,s.name AS service_name
  FROM requests r
  JOIN users u ON u.id=r.client_id
  JOIN services s ON s.id=r.service_id
`;

app.get('/api/requests', auth(), safe(async (req, res) => {
  const isClient = req.user.role === 'CLIENTE';

  res.json(await query(
    requestSelect +
    (isClient ? ' WHERE r.client_id=?' : '') +
    ' ORDER BY r.id DESC',
    isClient ? [req.user.id] : []
  ));
}));

app.patch('/api/requests/:id/status', auth(admin), safe(async (req, res) => {
  const x = valid(z.object({
    status: z.enum(['REVISADA', 'CANCELADA'])
  }), req.body);

  const result = await query(
    `UPDATE requests SET status=?
     WHERE id=? AND status IN ('PENDIENTE','REVISADA')`,
    [x.status, req.params.id]
  );

  if (!result.affectedRows) {
    return res.status(409).json({
      error: 'Solicitud no modificable'
    });
  }

  res.json({ ok: true });
}));

app.post('/api/requests/:id/order', auth(admin), safe(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[request]] = await connection.execute(
      'SELECT status FROM requests WHERE id=? FOR UPDATE',
      [req.params.id]
    );

    if (!request || !['PENDIENTE', 'REVISADA'].includes(request.status)) {
      await connection.rollback();
      return res.status(409).json({
        error: 'Solicitud no disponible'
      });
    }

    const [result] = await connection.execute(
      'INSERT INTO orders(request_id) VALUES(?)',
      [req.params.id]
    );

    await connection.execute(
      "UPDATE requests SET status='CONVERTIDA' WHERE id=?",
      [req.params.id]
    );

    await connection.commit();

    await audit(req.user.id, result.insertId, 'ORDEN_CREADA');

    res.status(201).json({ id: result.insertId });
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}));

// ÓRDENES DE TRABAJO

const orderSelect = `
  SELECT
    o.id,o.request_id,o.technician_id,o.status,
    o.started_at,o.finished_at,o.created_at,
    r.client_id,r.description,r.address,r.comuna,
r.latitude,r.longitude,r.location_confirmed,
    r.contact_phone,r.preferred_date,
    u.name AS client_name,
    s.name AS service_name,
    t.name AS technician_name
  FROM orders o
  JOIN requests r ON r.id=o.request_id
  JOIN users u ON u.id=r.client_id
  JOIN services s ON s.id=r.service_id
  LEFT JOIN users t ON t.id=o.technician_id
`;

app.get('/api/orders', auth(), safe(async (req, res) => {
  let where = '';
  let params = [];

  if (req.user.role === 'TECNICO') {
    where = ' WHERE o.technician_id=?';
    params = [req.user.id];
  }

  if (req.user.role === 'CLIENTE') {
    where = ' WHERE r.client_id=?';
    params = [req.user.id];
  }

  res.json(await query(
    orderSelect + where + ' ORDER BY o.id DESC',
    params
  ));
}));

// ASIGNAR TÉCNICO Y GENERAR CÓDIGOS

app.post('/api/orders/:id/assign', auth(admin), safe(async (req, res) => {
  const x = valid(
    z.object({ technician_id: id }),
    req.body
  );

  const [technician] = await query(
    `SELECT t.user_id
     FROM technicians t
     JOIN users u ON u.id=t.user_id
     WHERE t.user_id=?
       AND t.available=1
       AND u.active=1`,
    [x.technician_id]
  );

  if (!technician) {
    return res.status(400).json({
      error: 'Técnico no disponible'
    });
  }

  const start = String(randomInt(100000, 1000000));
  const end = String(randomInt(100000, 1000000));

  const result = await query(
    `UPDATE orders
     SET technician_id=?,
         status='ASIGNADA',
         start_code_hash=?,
         end_code_hash=?,
         start_code_encrypted=?,
         end_code_encrypted=?,
         start_code_used=0,
         end_code_used=0
     WHERE id=?
       AND status IN ('PENDIENTE','ASIGNADA')`,
    [
      x.technician_id,
      await bcrypt.hash(start, 10),
      await bcrypt.hash(end, 10),
      encryptCode(start),
      encryptCode(end),
      req.params.id
    ]
  );

  if (!result.affectedRows) {
    return res.status(409).json({
      error: 'Orden no asignable'
    });
  }

  try {
    const [recipient] = await query(
      `SELECT r.client_id FROM orders o JOIN requests r ON r.id=o.request_id WHERE o.id=?`,
      [req.params.id]
    );
    await query('INSERT INTO notifications(user_id,order_id,title,body) VALUES(?,?,?,?)',
      [x.technician_id, req.params.id, 'Nuevo trabajo asignado', 'Se te asignó la orden #' + req.params.id]);
    if (recipient?.client_id) await query('INSERT INTO notifications(user_id,order_id,title,body) VALUES(?,?,?,?)',
      [recipient.client_id, req.params.id, 'Técnico asignado', 'Tu orden #' + req.params.id + ' ya tiene técnico']);
  } catch (error) { console.error('No se pudo notificar la asignación:', error); }

  await audit(
    req.user.id,
    Number(req.params.id),
    'ORDEN_ASIGNADA',
    { technician_id: x.technician_id }
  );

  res.json({
    ok: true,
    start_code: start,
    end_code: end,
    notice: 'Códigos generados correctamente.'
  });
}));

// CONSULTAR CÓDIGOS (SOLO CLIENTE PROPIETARIO)

app.get('/api/orders/:id/codes', auth(['CLIENTE']), safe(async (req, res) => {
  const [order] = await query(
    `SELECT
       o.id,
       o.status,
       o.start_code_encrypted,
       o.end_code_encrypted,
       o.start_code_used,
       o.end_code_used
     FROM orders o
     JOIN requests r ON r.id=o.request_id
     WHERE o.id=?
       AND r.client_id=?`,
    [req.params.id, req.user.id]
  );

  if (!order) {
    return res.status(404).json({
      error: 'Orden no encontrada'
    });
  }

  res.set('Cache-Control', 'no-store');

  if (!order.start_code_encrypted || !order.end_code_encrypted) {
    return res.status(409).json({
      error: 'Los códigos de esta orden aún no están disponibles'
    });
  }

  res.json({
    order_id: order.id,
    status: order.status,
    start_code:
      order.status === 'ASIGNADA' && !order.start_code_used
        ? decryptCode(order.start_code_encrypted)
        : null,
    end_code:
      order.status === 'EN_PROCESO' && !order.end_code_used
        ? decryptCode(order.end_code_encrypted)
        : null
  });
}));

// VALIDAR CÓDIGO DESDE LA APP DEL TÉCNICO

app.post('/api/orders/:id/verify', auth(['TECNICO']), safe(async (req, res) => {
  const x = valid(z.object({
    action: z.enum(['start', 'finish']),
    code: z.string().regex(/^\d{6}$/)
  }), req.body);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[order]] = await connection.execute(
      'SELECT * FROM orders WHERE id=? FOR UPDATE',
      [req.params.id]
    );

    if (!order || order.technician_id !== req.user.id) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Orden no encontrada'
      });
    }

    const starting = x.action === 'start';

    if (
      order.status !== (starting ? 'ASIGNADA' : 'EN_PROCESO') ||
      order[starting ? 'start_code_used' : 'end_code_used']
    ) {
      await connection.rollback();
      return res.status(409).json({
        error: 'Transición no permitida'
      });
    }

    const correct = await bcrypt.compare(
      x.code,
      order[starting ? 'start_code_hash' : 'end_code_hash']
    );

    if (!correct) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Código incorrecto'
      });
    }

    await connection.execute(
      starting
        ? `UPDATE orders
           SET status='EN_PROCESO',
               start_code_used=1,
               started_at=NOW()
           WHERE id=?`
        : `UPDATE orders
           SET status='FINALIZADA',
               end_code_used=1,
               finished_at=NOW()
           WHERE id=?`,
      [order.id]
    );

    await connection.execute(
      `INSERT INTO audit_log(user_id,order_id,action,detail)
       VALUES(?,?,?,?)`,
      [
        req.user.id,
        order.id,
        starting ? 'INICIO_VALIDADO' : 'TERMINO_VALIDADO',
        JSON.stringify({})
      ]
    );

    const [[recipient]] = await connection.execute(
      `SELECT r.client_id FROM requests r JOIN orders o ON o.request_id=r.id WHERE o.id=?`,
      [order.id]
    );
    const eventTitle = starting ? 'Trabajo iniciado' : 'Servicio finalizado';
    const eventBody = 'La orden #' + order.id + (starting ? ' está en proceso' : ' fue finalizada');
    await notify(connection, recipient?.client_id, order.id, eventTitle, eventBody);
    const [managers] = await connection.execute(
      "SELECT id FROM users WHERE role IN ('ADMIN','GESTOR') AND active=1"
    );
    for (const manager of managers) {
      await notify(connection, manager.id, order.id, eventTitle, eventBody);
    }

    await connection.commit();

    res.json({
      ok: true,
      status: starting ? 'EN_PROCESO' : 'FINALIZADA'
    });
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}));

// EVIDENCIAS Y FOTOGRAFÍAS

const uploadDir = path.resolve('uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) =>
      cb(
        null,
        Date.now() + '-' +
        randomInt(100000, 999999) +
        path.extname(file.originalname).toLowerCase()
      )
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) =>
    cb(
      null,
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
    )
});

app.post(
  '/api/orders/:id/evidence',
  auth(['TECNICO']),
  upload.single('photo'),
  safe(async (req, res) => {
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();
      const [[order]] = await connection.execute(
        'SELECT id,status FROM orders WHERE id=? AND technician_id=? FOR UPDATE',
        [req.params.id, req.user.id]
      );
      if (!order) {
        await connection.rollback();
        return res.status(403).json({ error: 'Orden no autorizada' });
      }
      if (order.status !== 'EN_PROCESO') {
        await connection.rollback();
        return res.status(409).json({ error: 'La orden no está en proceso; no se permiten nuevas evidencias.' });
      }
      const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 5000) : '';
      if (!note && !req.file) {
        await connection.rollback();
        return res.status(400).json({ error: 'Adjunta una foto o escribe una observación.' });
      }
      const [result] = await connection.execute(
        'INSERT INTO evidence(order_id,technician_id,note,photo_path) VALUES(?,?,?,?)',
        [order.id, req.user.id, note || null, req.file?.filename || null]
      );
      await connection.execute(
        'INSERT INTO audit_log(user_id,order_id,action,detail) VALUES(?,?,?,?)',
        [req.user.id, order.id, 'EVIDENCIA_REGISTRADA', '{}']
      );
      await connection.commit();
      committed = true;
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      if (!committed) await connection.rollback();
      throw error;
    } finally {
      connection.release();
      if (!committed && req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
    }
  })
);

app.get('/api/orders/:id/evidence', auth(), safe(async (req, res) => {
  const [order] = await query(
    `SELECT o.technician_id,r.client_id
     FROM orders o
     JOIN requests r ON r.id=o.request_id
     WHERE o.id=?`,
    [req.params.id]
  );

  if (
    !order ||
    (
      !admin.includes(req.user.role) &&
      order.technician_id !== req.user.id &&
      order.client_id !== req.user.id
    )
  ) {
    return res.status(403).json({
      error: 'No autorizado'
    });
  }

  res.json(await query(
    `SELECT id,order_id,technician_id,note,photo_path,created_at
     FROM evidence WHERE order_id=?`,
    [req.params.id]
  ));
}));

app.get('/api/evidence/:id/photo', auth(), safe(async (req, res) => {
  const [evidence] = await query(
    `SELECT e.photo_path,o.technician_id,r.client_id
     FROM evidence e
     JOIN orders o ON o.id=e.order_id
     JOIN requests r ON r.id=o.request_id
     WHERE e.id=?`,
    [req.params.id]
  );

  if (
    !evidence ||
    !evidence.photo_path ||
    (
      !admin.includes(req.user.role) &&
      evidence.technician_id !== req.user.id &&
      evidence.client_id !== req.user.id
    )
  ) {
    return res.status(403).json({
      error: 'No autorizado'
    });
  }

  res.sendFile(
    path.join(uploadDir, path.basename(evidence.photo_path))
  );
}));

// DASHBOARD

app.get('/api/dashboard', auth(admin), safe(async (req, res) => {
  const [counts] = await query(
    `SELECT
       COUNT(*) AS total,
       SUM(status='PENDIENTE') AS pending,
       SUM(status='EN_PROCESO') AS in_progress,
       SUM(status='FINALIZADA') AS completed,
       ROUND(AVG(
         CASE WHEN finished_at IS NOT NULL
         THEN TIMESTAMPDIFF(MINUTE,started_at,finished_at)
         END
       ),1) AS avg_minutes
     FROM orders`
  );

  const byService = await query(
    `SELECT s.name,COUNT(*) AS total
     FROM orders o
     JOIN requests r ON r.id=o.request_id
     JOIN services s ON s.id=r.service_id
     GROUP BY s.id
     ORDER BY total DESC`
  );

  res.json({ counts, byService });
}));

// AUDITORÍA

app.get('/api/audit', auth(['ADMIN']), safe(async (req, res) => {
  res.json(await query(
    'SELECT * FROM audit_log ORDER BY id DESC LIMIT 200'
  ));
}));

// MANEJO DE ERRORES

app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.flatten()
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Registro duplicado'
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.message
    });
  }

  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

// INICIAR SERVIDOR

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Técnico Ya API: http://localhost:${port}`);
});
