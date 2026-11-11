# Técnico Ya — JJV

Proyecto de desarrollo basado en la ERS aportada. Incluye **API Express + MySQL**, **web Angular** y **aplicación Ionic/Angular para técnicos**. Es un **prototipo funcional de desarrollo**, no un producto auditado para producción. No incluye pagos, inventario, facturación ni GPS continuo.

## Requisitos (Windows 11)

- Node.js 22 LTS y npm
- MySQL Server 8.x y MySQL Workbench (Workbench **no** instala necesariamente el servidor)
- Visual Studio Code opcional
- Para generar APK Android: Android Studio, JDK y herramientas de Android

## 1. Preparar MySQL

1. Abre MySQL Workbench y conecta con una cuenta administradora local.
2. Abre `backend/sql/schema.sql` y ejecuta todo el script (icono del rayo). Crea `tecnico_ya` y las tablas.
3. En una pestaña SQL ejecuta, cambiando la contraseña:

```sql
CREATE USER IF NOT EXISTS 'tecnicoya'@'localhost' IDENTIFIED BY 'PON_UNA_CLAVE_SEGURA';
GRANT SELECT, INSERT, UPDATE, DELETE ON tecnico_ya.* TO 'tecnicoya'@'localhost';
```

No uses la cuenta root para la API. El usuario de aplicación no necesita permisos de administración de tablas.

## 2. Iniciar API

Abre una terminal en `backend`:

```powershell
copy .env.example .env
notepad .env
npm install
npm run seed
npm run dev
```

En `.env`, cambia `DB_PASSWORD`, `JWT_SECRET` (32+ caracteres aleatorios) y `SEED_ADMIN_PASSWORD` (10+ caracteres). `npm run seed` crea el primer administrador si no existe. Abre http://localhost:4000/api/health y verifica `{"ok":true,"database":"connected"}`.

## 3. Iniciar web

En **otra** terminal:

```powershell
cd web
npm install
npm start
```

Abre http://localhost:4200. Ingresa con el correo y contraseña del administrador definidos en `.env`.

## 4. Iniciar aplicación de técnicos

En **otra** terminal:

```powershell
cd mobile
npm install
npm start
```

Abre http://localhost:8100. La app Ionic funciona inicialmente como aplicación web móvil en el navegador. Para Android nativo, primero compila (`npm run build`), después `npx cap add android` (una sola vez), `npx cap sync android` y `npx cap open android`, con Android Studio instalado.

**Atención:** `localhost` desde un celular o emulador Android no apunta necesariamente a tu PC. Cambia la dirección de la API en el almacenamiento local `apiUrl` o en `src/app/api.ts` a `http://IP_DE_TU_PC:4000/api`. Para un teléfono real debes habilitar red local, CORS y transporte seguro apropiado; Android puede bloquear HTTP sin configuración adicional. Para uso real, despliega la API con HTTPS. No abras MySQL directamente a Internet.

## 5. Prueba de extremo a extremo

1. En la web, como administrador, abre **Usuarios** y crea un técnico con correo, contraseña, especialidad y zona.
2. Abre una ventana privada del navegador en http://localhost:4200, crea una cuenta de cliente e inicia sesión.
3. En **Solicitar servicio**, registra un trabajo con descripción, dirección, comuna y teléfono.
4. Como administrador, entra a **Solicitudes** y selecciona **Crear orden**.
5. En **Órdenes**, elige el técnico y pulsa **Asignar**. **Guarda los dos códigos de seis dígitos que aparecen**: se muestran una sola vez al administrador, quien debe comunicarlos al cliente por un canal seguro.
6. En http://localhost:8100 ingresa con la cuenta del técnico. La orden debe aparecer.
7. Ingresa el código de inicio del cliente: la orden pasa a **EN_PROCESO**.
8. Agrega una observación y una imagen de evidencia.
9. Ingresa el código de término del cliente: la orden pasa a **FINALIZADA**.
10. Recarga la web de administrador y cliente para comprobar el cambio en ambos.

La sincronización implementada es **por consulta/recarga**, no mediante WebSockets ni notificaciones push.

## Arquitectura

```
Web Angular :4200 ----\
                       > API REST Express :4000 ---> MySQL :3306
Ionic Angular :8100 --/
```

La API verifica tokens JWT y permisos por rol. La aplicación móvil **no se conecta directamente a MySQL**. El backend es el único componente que accede a la base de datos.

## Endpoints principales

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/register` | Público, solo cliente |
| POST | `/api/auth/login` | Público |
| GET | `/api/me` | Autenticado |
| GET | `/api/services` | Público |
| POST | `/api/services` | Admin/Gestor |
| GET | `/api/users` | Admin/Gestor |
| POST | `/api/users` | Admin |
| GET | `/api/technicians` | Admin/Gestor |
| PATCH | `/api/technicians/:id` | Admin/Gestor |
| POST | `/api/requests` | Cliente |
| GET | `/api/requests` | Autenticado (filtrado) |
| PATCH | `/api/requests/:id/status` | Admin/Gestor |
| POST | `/api/requests/:id/order` | Admin/Gestor |
| GET | `/api/orders` | Autenticado (filtrado) |
| POST | `/api/orders/:id/assign` | Admin/Gestor |
| POST | `/api/orders/:id/verify` | Técnico asignado |
| POST | `/api/orders/:id/evidence` | Técnico asignado |
| GET | `/api/orders/:id/evidence` | Usuario autorizado |
| GET | `/api/evidence/:id/photo` | Usuario autorizado |
| GET | `/api/dashboard` | Admin/Gestor |
| GET | `/api/audit` | Admin |

## Seguridad y límites conocidos

- Contraseñas con bcrypt y JWT de 8 horas; los tokens se guardan en localStorage para facilitar la demo. Para producción conviene usar sesiones/cookies seguras, rotación de tokens, controles CSRF según arquitectura y política de contraseñas.
- Códigos de inicio y término guardados como hash, de un solo uso; los códigos son mostrados al asignar. El sistema **no envía SMS/correos**. La entrega segura al cliente es manual.
- La asignación es manual; lista carga activa de técnicos, pero no calcula distancia ni disponibilidad horaria avanzada.
- Fotografías de hasta 5 MB con control de tipo MIME declarado; antes de producción validar firmas de archivo, limpiar metadatos y aplicar controles de almacenamiento/antimalware.
- No se implementan notificaciones push, mapas, recuperación de contraseña, borrado lógico general, paginación, respaldos automáticos ni auditoría de seguridad externa.
- No se ha probado en el Windows del usuario. Verifica versiones, instalación, red y credenciales localmente.
- **Documento ERS:** la sección de requisitos funcionales y no funcionales hace referencia a un archivo `.xlsm` externo que no estaba adjunto; por eso no es posible garantizar cobertura total de esa matriz.

## Solución de problemas

- `ECONNREFUSED 3306`: MySQL Server no está iniciado o usa otro puerto.
- `Access denied for user`: revisa `.env`, el usuario MySQL y permisos.
- `CORS`: revisa `CORS_ORIGINS` y los puertos web/móvil.
- `401`: vuelve a iniciar sesión; el token expiró o el secreto cambió.
- `npm` no reconocido: instala Node.js LTS y reinicia la terminal.
- `ng` no reconocido: usa `npm start` dentro de cada proyecto; el CLI se instala localmente.
- `Port in use`: cierra la otra instancia del proceso.

## Alcance respecto de ERS

Implementado: roles principales, registro cliente, gestión de usuarios/servicios, solicitudes, conversión a órdenes, asignación manual, consulta de trabajos, validación de inicio y cierre, observaciones/fotografías, métricas básicas y auditoría de operaciones clave.

Pendiente para una entrega empresarial: validar matriz completa de RF/RNF, UX contra mockups definitivos, despliegue HTTPS, notificaciones, geolocalización, pruebas automáticas de integración, pruebas de carga, backups y políticas de privacidad.
