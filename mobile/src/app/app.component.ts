
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/angular/standalone';
import { Api } from './api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonApp,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle
  ],
  template: `
    <ion-app>
      <ion-header class="corporate-header">
        <ion-toolbar>
          <div class="top-brand">
            <span class="brand-mark"><span class="brand-roof"></span>TY</span>
            <div class="brand-words"><strong>Técnico Ya</strong><small>GESTIÓN DE SERVICIOS · TERRENO</small></div>
            <span class="brand-chip">APP TÉCNICOS</span>
          </div>
        </ion-toolbar>
        <div class="brand-stripe"><i></i><i></i><i></i></div>
      </ion-header>

      <ion-content>
        <main class="contenedor">

          <!-- INICIO DE SESIÓN -->
          <section *ngIf="!user" class="acceso">
            <div class="login-kicker">PORTAL DE COLABORADORES</div>
            <div class="marca">TY<span class="marca-linea"></span></div>
            <h1>Tu jornada comienza aquí.</h1>
            <p>Ingresa a tu espacio de trabajo para gestionar servicios, visitas y evidencias.</p>

            <div class="tarjeta login-card">
              <div class="login-card-head"><strong>Acceso seguro</strong><span>PERSONAL AUTORIZADO</span></div>
              <label>Correo electrónico</label>
              <input
                type="email"
                [(ngModel)]="email"
                placeholder="tecnico@correo.cl"
              />

             <label>Contraseña</label>

<div style="display:flex; align-items:center; position:relative;">
  <input
    [type]="mostrarPassword ? 'text' : 'password'"
    [(ngModel)]="password"
    placeholder="Ingresa tu contraseña"
    style="width:100%; padding-right:48px; box-sizing:border-box;"
  />

  <button
    type="button"
    (click)="mostrarPassword = !mostrarPassword"
    [attr.aria-label]="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
    [attr.aria-pressed]="mostrarPassword"
    style="position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:transparent; padding:8px; cursor:pointer; color:#666; display:flex; align-items:center; justify-content:center;"
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <ng-container *ngIf="!mostrarPassword">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
        <circle cx="12" cy="12" r="3"/>
      </ng-container>

      <ng-container *ngIf="mostrarPassword">
        <path d="M3 3l18 18"/>
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
        <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c5 0 9 7 9 7a13.9 13.9 0 0 1-3 3.5M6.6 6.6C3.8 8.3 3 12 3 12s4 7 9 7a9.6 9.6 0 0 0 4.1-.9"/>
      </ng-container>
    </svg>
  </button>
</div>

              <button
                class="boton principal"
                (click)="login()"
                [disabled]="busy"
              >
                {{ busy ? 'Ingresando...' : 'Iniciar sesión' }}
              </button>
            </div>
          </section>

          <!-- PANEL DEL TÉCNICO -->
          <ng-container *ngIf="user">

            <section class="bienvenida">
              <div>
                <span class="etiqueta">CENTRO DE OPERACIONES · TERRENO</span>
                <h1>Hola, {{ user.name?.split(' ')[0] }} <span class="saludo-punto">.</span></h1>
                <p>Tu jornada de servicios, organizada en un solo lugar.</p>
              </div>

              <div class="cabecera-derecha">
                <button class="campana" type="button" (click)="showNotifications=!showNotifications" aria-label="Notificaciones">
                  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg> <span *ngIf="unreadCount" class="burbuja">{{ unreadCount }}</span>
                </button>
                <div class="avatar">{{ user.name?.charAt(0) }}</div>
              </div>
            </section>

            <section class="tarjeta notificaciones" *ngIf="showNotifications">
              <div class="barra"><h2>Notificaciones</h2>
                <button class="boton secundario" (click)="readAll()" [disabled]="!unreadCount">Marcar leídas</button>
              </div>
              <p *ngIf="!notifications.length" class="ayuda">No tienes notificaciones.</p>
              <button type="button" class="notificacion" *ngFor="let n of notifications" [class.no-leida]="!n.is_read" (click)="readNotification(n)">
                <strong>{{ n.title }}</strong><span>{{ n.body }}</span>
                <small>{{ n.created_at | date:'dd/MM/yyyy HH:mm' }}</small>
              </button>
            </section>

            <!-- RESUMEN OPERATIVO -->
            <section class="resumen" aria-label="Resumen de órdenes">
              <div class="resumen-card pendientes-card"><span class="resumen-icon"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6"/></svg></span><span>Por atender</span><strong>{{ countStatus('ASIGNADA') + countStatus('PENDIENTE') }}</strong><small>Órdenes pendientes</small></div>
              <div class="resumen-card proceso-card"><span class="resumen-icon"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><span>En ejecución</span><strong>{{ countStatus('EN_PROCESO') }}</strong><small>Trabajos activos</small></div>
              <div class="resumen-card final-card"><span class="resumen-icon"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span><span>Completados</span><strong>{{ countStatus('FINALIZADA') }}</strong><small>Servicios cerrados</small></div>
            </section>

            <div class="barra">
              <h2>Órdenes asignadas</h2>

              <div class="acciones">
                <button
                  class="boton secundario"
                  (click)="load()"
                  [disabled]="busy"
                >
                  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2"/></svg> Actualizar
                </button>

                <button
                  class="boton secundario"
                  (click)="logout()"
                >
                  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg> Salir
                </button>
              </div>
            </div>

            <nav class="tabs-trabajo" aria-label="Filtrar trabajos">
              <button type="button" [class.activa]="activeTab === 'pendientes'" (click)="activeTab='pendientes'">
                Pendientes <b>{{ countStatus('ASIGNADA') + countStatus('PENDIENTE') }}</b>
              </button>
              <button type="button" [class.activa]="activeTab === 'proceso'" (click)="activeTab='proceso'">
                En proceso <b>{{ countStatus('EN_PROCESO') }}</b>
              </button>
              <button type="button" [class.activa]="activeTab === 'finalizadas'" (click)="activeTab='finalizadas'">
                Finalizadas <b>{{ countStatus('FINALIZADA') }}</b>
              </button>
            </nav>
            <div *ngIf="!filteredOrders.length" class="tarjeta vacio">
              No hay trabajos en esta categoría.
            </div>

            <!-- LISTADO DE ÓRDENES -->
            <article
              class="tarjeta orden"
              *ngFor="let o of filteredOrders"
            >

              <div class="orden-cabecera">
                <div>
                  <span class="folio">ORDEN #{{ o.id }}</span>
                  <h3>{{ o.service_name }}</h3>
                </div>

                <span
                  class="estado"
                  [ngClass]="statusClass(o.status)"
                >
                  {{ statusLabel(o.status) }}
                </span>
              </div>

              <!-- DATOS DEL CLIENTE -->
              <div class="detalle">
                <p>
                  <span>Cliente</span>
                  <strong>{{ o.client_name }}</strong>
                </p>

                <p>
                  <span>Dirección</span>
                  <strong>
                    {{ o.address }}, {{ o.comuna }}
                  </strong>
                </p>

                <p>
                  <span>Teléfono</span>
                  <strong>{{ o.contact_phone }}</strong>
                </p>
              </div>

              <div class="descripcion">
                <strong>Descripción del trabajo</strong>
                <p>{{ o.description }}</p>
              </div>

              <!-- NAVEGACIÓN -->
              <button
                class="boton mapa"
                (click)="openMaps(o)"
              >
                 <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg> Cómo llegar con Google Maps
              </button>

              <!-- INICIAR O FINALIZAR -->
              <section
                class="proceso"
                *ngIf="
                  o.status === 'ASIGNADA' ||
                  o.status === 'EN_PROCESO'
                "
              >
                <h4>
                  {{
                    o.status === 'ASIGNADA'
                      ? 'Iniciar trabajo'
                      : 'Finalizar trabajo'
                  }}
                </h4>

                <p class="ayuda">
                  Solicita al cliente su código de seguridad
                  de seis dígitos.
                </p>

                <label>Código del cliente</label>

                <input
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  [(ngModel)]="codes[o.id]"
                  placeholder="000000"
                  [disabled]="busy"
                />

                <button
                  class="boton principal"
                  (click)="verify(o)"
                  [disabled]="busy"
                >
                  {{
                    o.status === 'ASIGNADA'
                      ? 'Confirmar inicio'
                      : 'Confirmar finalización'
                  }}
                </button>
              </section>

              <!-- EVIDENCIAS SOLO EN PROCESO -->
              <section
                class="proceso"
                *ngIf="o.status === 'EN_PROCESO'"
              >
                <h4>Informe técnico</h4>

                <p class="ayuda">
                  Registra tus observaciones y fotografías
                  antes de finalizar el trabajo.
                </p>

                <label>Observaciones del trabajo</label>

                <textarea
                  rows="4"
                  [(ngModel)]="notes[o.id]"
                  placeholder="Describe el trabajo realizado..."
                  [disabled]="busy"
                ></textarea>

                <label>Fotografía de evidencia</label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  (change)="fileChanged(o.id, $event)"
                  [disabled]="busy"
                />

                <button
                  class="boton secundario guardar"
                  (click)="evidence(o.id)"
                  [disabled]="busy"
                >
                  Guardar evidencia
                </button>
              </section>

              <!-- ORDEN FINALIZADA -->
              <section
                class="proceso"
                *ngIf="o.status === 'FINALIZADA'"
              >
                <div class="cierre-orden">
                  <h4>✓ SERVICIO FINALIZADO</h4>

                  <p>
                    Este trabajo se encuentra completado
                    y cerrado.
                  </p>

                  <p>
                    No se pueden agregar fotografías,
                    observaciones ni modificar su estado.
                  </p>

                  <small *ngIf="o.finished_at">
                    Finalizado el
                    {{
                      o.finished_at
                        | date:'dd/MM/yyyy HH:mm'
                    }}
                  </small>
                </div>
              </section>

            </article>
          </ng-container>

          <!-- MENSAJES -->
          <div
            *ngIf="message"
            class="mensaje"
            [class.error]="isError"
          >
            {{ message }}

            <button (click)="message = ''">
              ×
            </button>
          </div>

        </main>
      </ion-content>
    </ion-app>
  `,
  styles: [`
    :host {
      --azul: #2563eb;
      --texto: #14213d;
      --borde: #e2e8f0;
    }

    ion-content {
      --background: #f4f7fc;
    }

    .contenedor {
      max-width: 760px;
      margin: auto;
      padding: 22px 16px 60px;
      color: var(--texto);
    }

    h1, h2, h3, h4, p {
      margin-top: 0;
    }

    h1 {
      font-size: 26px;
    }

    h2 {
      font-size: 20px;
    }

    h3 {
      font-size: 19px;
      margin-bottom: 0;
    }

    h4 {
      font-size: 17px;
      margin-bottom: 12px;
    }

    .acceso {
      max-width: 420px;
      margin: 45px auto;
      text-align: center;
    }

    .acceso p,
    .bienvenida p,
    .ayuda {
      color: #64748b;
    }

    .marca {
      display: grid;
      place-items: center;
      width: 68px;
      height: 68px;
      margin: 0 auto 20px;
      border-radius: 20px;
      background: #2563eb;
      color: white;
      font-size: 24px;
      font-weight: 800;
    }

    .tarjeta {
      background: white;
      border: 1px solid var(--borde);
      border-radius: 18px;
      padding: 22px;
      margin-bottom: 18px;
      box-shadow: 0 5px 24px rgba(20, 33, 61, .04);
    }

    .acceso .tarjeta {
      text-align: left;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin: 15px 0 7px;
    }

    input:not([type="file"]),
    textarea {
      display: block;
      width: 100%;
      padding: 13px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background: white;
      color: #14213d;
      font: inherit;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
      outline: 2px solid #93c5fd;
    }

    input[type="file"] {
      width: 100%;
      font-size: 13px;
      margin-bottom: 15px;
    }

    .boton {
      border: 0;
      border-radius: 11px;
      padding: 13px 16px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .boton:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .principal {
      width: 100%;
      background: #2563eb;
      color: white;
      margin-top: 17px;
    }

    .secundario {
      background: #eaf1ff;
      color: #1d4ed8;
    }

    .bienvenida,
    .barra,
    .orden-cabecera {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .bienvenida {
      margin-bottom: 20px;
    }

    .bienvenida h1 {
      margin: 7px 0;
    }

    .etiqueta,
    .folio {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #2563eb;
    }

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 15px;
      background: #dbeafe;
      color: #1d4ed8;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 22px;
      flex-shrink: 0;
    }

    .resumen {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 25px;
    }

    .resumen > div {
      background: white;
      border: 1px solid var(--borde);
      border-radius: 14px;
      padding: 15px;
    }

    .resumen span {
      display: block;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 9px;
    }

    .resumen strong {
      font-size: 27px;
      color: #1d4ed8;
    }

    .barra {
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .barra h2 {
      margin: 0;
    }

    .acciones {
      display: flex;
      gap: 7px;
    }

    .acciones .boton {
      padding: 9px 12px;
      font-size: 12px;
    }

    .orden-cabecera {
      align-items: flex-start;
      padding-bottom: 17px;
      border-bottom: 1px solid var(--borde);
    }

    .estado {
      font-size: 11px;
      font-weight: 800;
      padding: 7px 10px;
      border-radius: 20px;
      white-space: nowrap;
    }

    .asignada {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .progreso {
      background: #ede9fe;
      color: #6d28d9;
    }

    .finalizada {
      background: #dcfce7;
      color: #15803d;
    }

    .pendiente {
      background: #fef3c7;
      color: #92400e;
    }

    .detalle {
      padding: 10px 0;
    }

    .detalle p {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 12px 0;
    }

    .detalle span {
      color: #64748b;
      font-size: 12px;
    }

    .detalle strong {
      font-size: 14px;
    }

    .descripcion {
      background: #f8fafc;
      padding: 15px;
      border-radius: 12px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .descripcion p {
      margin: 8px 0 0;
      color: #475569;
      white-space: pre-wrap;
    }

    .mapa {
      width: 100%;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .proceso {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--borde);
    }

    .guardar {
      width: 100%;
    }

    .cierre-orden {
      padding: 20px;
      border: 1px solid #86efac;
      border-radius: 14px;
      background: #f0fdf4;
      text-align: center;
    }

    .cierre-orden h4 {
      color: #166534;
      font-weight: 800;
      margin-bottom: 12px;
    }

    .cierre-orden p {
      color: #166534;
      line-height: 1.5;
    }

    .cierre-orden small {
      color: #64748b;
    }

    .cabecera-derecha { display:flex; align-items:center; gap:10px; }
    .campana { position:relative; background:white; border:1px solid #dbe4f0; border-radius:13px; padding:12px; font-size:20px; cursor:pointer; }
    .burbuja { position:absolute; top:-7px; right:-7px; background:#dc2626; color:white; border-radius:20px; padding:2px 6px; font-size:11px; }
    .tabs-trabajo { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-bottom:18px; }
    .tabs-trabajo button { border:1px solid #dbe4f0; border-radius:12px; background:white; color:#475569; padding:13px 5px; font-weight:700; cursor:pointer; font-size:12px; }
    .tabs-trabajo button.activa { background:#1d4ed8; color:white; border-color:#1d4ed8; }
    .tabs-trabajo b { display:block; font-size:20px; margin-top:5px; }
    .notificaciones { padding:16px; }
    .notificacion { width:100%; display:flex; flex-direction:column; text-align:left; gap:5px; border:0; border-bottom:1px solid #e2e8f0; background:white; padding:12px 8px; color:#334155; cursor:pointer; }
    .notificacion.no-leida { background:#eff6ff; border-left:3px solid #2563eb; }
    .notificacion span { font-size:13px; }
    .notificacion small { color:#64748b; }
    .vacio {
      text-align: center;
      color: #64748b;
    }

    .mensaje {
      position: sticky;
      bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 15px;
      background: #dcfce7;
      color: #166534;
      border-radius: 12px;
      font-weight: 600;
    }

    .mensaje.error {
      background: #fee2e2;
      color: #991b1b;
    }

    .mensaje button {
      background: transparent;
      color: inherit;
      border: 0;
      padding: 0;
      font-size: 20px;
      cursor: pointer;
    }


    /* Identidad visual corporativa - Técnico Ya / servicios de terreno */
    :host { --azul:#0057a8; --azul-oscuro:#003b77; --rojo:#df252b; --amarillo:#ffc928; --texto:#142840; --borde:#e2e8f0; }
    ion-content { --background:#f3f6f9; }
    .corporate-header ion-toolbar { --background:#0057a8; --color:white; --min-height:76px; --padding-start:0; --padding-end:0; }
    .top-brand { display:flex;align-items:center;gap:12px;padding:11px 17px;max-width:800px;margin:auto;color:white; }
    .brand-mark { position:relative;display:grid;place-items:center;flex:none;width:45px;height:45px;background:white;color:#0057a8;font-weight:900;font-size:17px;border-radius:11px;letter-spacing:-1px; }
    .brand-roof { position:absolute;top:-5px;left:12px;width:20px;height:5px;background:#ffc928;border-radius:4px;transform:rotate(-12deg); }
    .brand-words { display:flex;flex-direction:column;min-width:0;gap:3px; }
    .brand-words strong { font-size:18px;letter-spacing:-.5px;line-height:1; }
    .brand-words small { font-size:8px;letter-spacing:1.1px;color:#d9eafb;font-weight:700; }
    .brand-chip { margin-left:auto;border:1px solid #ffffff55;color:white;border-radius:30px;font-size:9px;font-weight:800;letter-spacing:.6px;padding:7px 9px;white-space:nowrap; }
    .brand-stripe { display:flex;height:5px; } .brand-stripe i:nth-child(1){background:#e2272e;flex:2}.brand-stripe i:nth-child(2){background:#ffc928;flex:1}.brand-stripe i:nth-child(3){background:#fff;flex:1}
    .contenedor { max-width:800px;padding:22px 16px 90px; }
    h1,h2,h3,h4 { letter-spacing:-.6px; }
    .acceso { margin:34px auto 55px;max-width:450px; }
    .login-kicker {font-size:10px;letter-spacing:1.8px;font-weight:900;color:#0057a8;margin-bottom:17px;}
    .marca {width:78px;height:78px;border-radius:19px;background:#0057a8;box-shadow:0 12px 30px #0057a82e;position:relative;margin-bottom:24px;font-size:29px;}
    .marca-linea {position:absolute;width:32px;height:6px;bottom:0;right:0;background:#ffc928;border-radius:5px 0 16px 0;}
    .acceso h1 {font-size:clamp(27px,6vw,36px);font-weight:800;color:#122e50;margin-bottom:12px;line-height:1.12;}
    .acceso>p {font-size:14px;line-height:1.65;max-width:340px;margin:0 auto 24px;}
    .tarjeta {border-radius:17px;border-color:#e0e7f0;box-shadow:0 8px 30px #12345b0a;}
    .login-card {padding:24px;border-top:4px solid #e2272e;}
    .login-card-head {display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid #e7edf4;}
    .login-card-head strong {font-size:16px;color:#14365a;}.login-card-head span{font-size:9px;font-weight:800;color:#71839b;letter-spacing:.5px;}
    label {color:#304760;}
    input:not([type="file"]),textarea {border-color:#d4dfe9;border-radius:10px;padding:14px;background:#fff;}
    input:focus,textarea:focus {outline:none;border-color:#0057a8;box-shadow:0 0 0 3px #0057a81a;}
    .boton {display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:10px;min-height:44px;transition:filter .15s,transform .15s;}
    .boton:active {transform:scale(.99);}.boton:not(:disabled):hover{filter:brightness(.96);}
    .principal {background:#e2272e;color:white;box-shadow:0 5px 15px #e2272e20;}
    .secundario {background:#e7f0f9;color:#0057a8;}
    .ui-icon {width:19px;height:19px;flex:none;vertical-align:middle;}
    .bienvenida {padding:22px 20px;background:linear-gradient(115deg,#00447f,#0067b9);color:white;border-radius:17px;position:relative;overflow:hidden;box-shadow:0 10px 24px #0057a81c;margin-bottom:17px;}
    .bienvenida:after {content:'';position:absolute;right:-35px;bottom:-85px;width:175px;height:175px;border:27px solid #ffffff0e;border-radius:50%;pointer-events:none;}
    .bienvenida h1 {font-size:27px;margin:10px 0 7px;color:white;}.bienvenida p{color:#d7e9f9;font-size:12px;margin-bottom:0;line-height:1.5;}
    .etiqueta {color:#ffd55c;font-size:9px;letter-spacing:1.1px;}
    .saludo-punto{color:#ffc928;}
    .avatar {background:#fff;color:#0057a8;border-radius:50%;width:43px;height:43px;font-size:18px;border:3px solid #ffffff88;}
    .campana {background:#ffffff18;color:white;border:1px solid #ffffff35;padding:10px;border-radius:12px;display:grid;place-items:center;}
    .burbuja {background:#e2272e;border:2px solid #0057a8;}
    .resumen {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:26px;}
    .resumen>div {padding:14px 12px 13px;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 4px 15px #0e305408;}
    .resumen-icon {display:grid!important;place-items:center;width:34px;height:34px;border-radius:10px;background:#e9f1fa;color:#0057a8;margin-bottom:10px!important;}
    .resumen>div>span:not(.resumen-icon){font-size:11px;font-weight:800;color:#41556d;margin-bottom:3px;}
    .resumen strong {font-size:29px;color:#14365a;line-height:1.2;display:block;}
    .resumen small {font-size:9px;color:#8997a8;display:block;margin-top:3px;line-height:1.3;}
    .proceso-card .resumen-icon {background:#fff3d5;color:#a86c00;}.final-card .resumen-icon{background:#e3f6ec;color:#17805a;}
    .barra h2 {font-size:19px;color:#173958;}.acciones .boton {font-size:11px;padding:9px 11px;}
    .tabs-trabajo {gap:7px;margin-bottom:17px;}
    .tabs-trabajo button {border-radius:10px;padding:12px 5px;font-size:11px;color:#41556d;box-shadow:0 3px 10px #0e305406;}
    .tabs-trabajo button.activa {background:#0057a8;border-color:#0057a8;box-shadow:0 5px 15px #0057a826;}
    .tabs-trabajo b {font-size:19px;}
    .orden {padding:0;overflow:hidden;border-top:4px solid #0057a8;margin-bottom:18px;}
    .orden-cabecera {padding:19px 18px 16px;align-items:flex-start;gap:10px;}
    .orden-cabecera h3 {color:#173958;font-size:19px;margin-top:7px;line-height:1.25;}
    .folio {color:#0057a8;font-size:10px;letter-spacing:1.2px;}
    .estado {font-size:10px;padding:7px 9px;}
    .asignada{background:#e7f0fa;color:#0057a8;}.progreso{background:#fff0d5;color:#9a5d00;}.finalizada{background:#e1f5e9;color:#147b4f;}
    .detalle {padding:7px 18px 12px;display:grid;grid-template-columns:1fr 1fr;gap:0 14px;}
    .detalle p {margin:10px 0;min-width:0;}.detalle p:nth-child(2){grid-column:1/-1;}
    .detalle span {font-size:11px;color:#78889b;}.detalle strong{font-size:13px;color:#273c55;overflow-wrap:anywhere;}
    .descripcion {margin:0 18px 15px;background:#f4f7fa;border-left:3px solid #ffc928;border-radius:6px 10px 10px 6px;padding:14px;}
    .descripcion strong {color:#1b3b5c;}.descripcion p{font-size:13px;line-height:1.5;}
    .mapa {width:calc(100% - 36px);margin:0 18px 17px;background:#e8f1fa;color:#0057a8;border:1px solid #cbdfee;}
    .proceso {margin:0 18px 20px;padding-top:18px;}.proceso h4{color:#183a5a;}
    .proceso .principal {margin-top:13px;}.proceso input[inputmode="numeric"] {text-align:center;font-size:24px;font-weight:800;letter-spacing:9px;}
    .guardar {background:#0057a8;color:white;}
    .cierre-orden {border-color:#b5e5cc;background:#f0faf5;}.cierre-orden h4{color:#16774f;}
    .notificaciones {border-top:3px solid #ffc928;}.notificacion.no-leida{background:#eff6fc;border-left-color:#0057a8;}
    .mensaje {z-index:20;box-shadow:0 6px 25px #122d4d20;}
    @media(max-width:420px){.brand-chip{font-size:8px;padding:6px}.brand-words strong{font-size:17px}.resumen>div{padding:12px 9px}.resumen strong{font-size:26px}.resumen small{font-size:8px}.resumen-icon{width:30px;height:30px}.orden-cabecera{flex-wrap:wrap}}

    @media (max-width: 420px) {
      .contenedor {
        padding: 15px 12px 40px;
      }

      .tarjeta {
        padding: 17px;
      }

      .resumen > div {
        padding: 11px;
      }

      .resumen strong {
        font-size: 23px;
      }

      .orden-cabecera {
        flex-wrap: wrap;
      }
    }
  `]
})
export class AppComponent implements OnDestroy {
  mostrarPassword = false;
  api = inject(Api);

  user: any = this.api.user();

  email = '';
  password = '';

  orders: any[] = [];
  activeTab: 'pendientes' | 'proceso' | 'finalizadas' = 'pendientes';
  notifications: any[] = [];
  showNotifications = false;
  private refreshTimer?: ReturnType<typeof setInterval>;

  get filteredOrders(): any[] {
    return this.orders.filter(o => this.activeTab === 'pendientes'
      ? o.status === 'ASIGNADA' || o.status === 'PENDIENTE'
      : this.activeTab === 'proceso' ? o.status === 'EN_PROCESO' : o.status === 'FINALIZADA');
  }
  get unreadCount(): number { return this.notifications.filter(n => !n.is_read).length; }

  async loadNotifications(): Promise<void> {
    if (!this.user) return;
    try { this.notifications = await this.api.get('/notifications'); }
    catch (error) { console.warn('No se pudieron cargar notificaciones', error); }
  }
  async readNotification(n: any): Promise<void> {
    try {
      if (!n.is_read) await this.api.patch('/notifications/' + n.id + '/read', {});
      n.is_read = 1;
      if (n.order_id) {
        const o = this.orders.find(x => Number(x.id) === Number(n.order_id));
        if (o) this.activeTab = o.status === 'FINALIZADA' ? 'finalizadas' : o.status === 'EN_PROCESO' ? 'proceso' : 'pendientes';
      }
      this.showNotifications = false;
    } catch (error: any) { this.fail(error); }
  }
  async readAll(): Promise<void> {
    try {
      await this.api.patch('/notifications/read-all', {});
      this.notifications.forEach(n => n.is_read = 1);
    } catch (error: any) { this.fail(error); }
  }
  startRefresh(): void {
    this.stopRefresh();
    this.refreshTimer = setInterval(() => {
      if (this.user && !this.busy) { void this.load(); }
    }, 30000);
  }
  ngOnDestroy(): void { this.stopRefresh(); }
  stopRefresh(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = undefined;
  }

  codes: Record<number, string> = {};
  notes: Record<number, string> = {};
  photos: Record<number, File | undefined> = {};

  message = '';
  isError = false;
  busy = false;

  constructor() {
    if (this.user) {
      this.load();
      this.startRefresh();
    }
  }

  countStatus(status: string): number {
    return this.orders.filter(
      o => o.status === status
    ).length;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      ASIGNADA: 'Asignada',
      EN_PROCESO: 'En proceso',
      FINALIZADA: 'Finalizada'
    };

    return labels[status] || status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDIENTE: 'pendiente',
      ASIGNADA: 'asignada',
      EN_PROCESO: 'progreso',
      FINALIZADA: 'finalizada'
    };

    return classes[status] || 'pendiente';
  }

  async login(): Promise<void> {
    if (this.busy) return;

    this.busy = true;

    try {
      const response = await this.api.login(
        this.email,
        this.password
      );

      if (response.user.role !== 'TECNICO') {
        this.api.logout();

        throw new Error(
          'Esta aplicación es exclusiva para técnicos.'
        );
      }

      this.user = response.user;
      this.message = '';
      this.isError = false;

      await this.load();
      this.startRefresh();

    } catch (error: any) {
      this.fail(error);

    } finally {
      this.busy = false;
    }
  }

  logout(): void {
    this.stopRefresh();
    this.api.logout();

    this.user = null;
    this.orders = [];
    this.notifications = [];
    this.showNotifications = false;
    this.codes = {};
    this.notes = {};
    this.photos = {};
    this.message = '';
  }

  async load(): Promise<void> {
    try {
      this.orders = await this.api.get('/orders');
      await this.loadNotifications();

    } catch (error: any) {
      this.fail(error);
    }
  }

  openMaps(order: any): void {
    const lat = Number(order.latitude);
    const lng = Number(order.longitude);

    let destination = '';

    if (
      order.location_confirmed &&
      order.latitude != null &&
      order.longitude != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      destination = lat + ',' + lng;

    } else {
      destination = [
        order.address,
        order.comuna,
        'Chile'
      ]
        .filter(Boolean)
        .join(', ');
    }

    if (!destination.trim()) {
      this.message =
        'Esta orden no tiene una dirección registrada.';
      this.isError = true;
      return;
    }

    const url =
      'https://www.google.com/maps/dir/?api=1' +
      '&destination=' +
      encodeURIComponent(destination) +
      '&travelmode=driving';

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  async verify(order: any): Promise<void> {
    if (this.busy) return;

    // Solo se permite iniciar o finalizar
    // órdenes en los estados correspondientes.
    if (
      order.status !== 'ASIGNADA' &&
      order.status !== 'EN_PROCESO'
    ) {
      this.message =
        'Esta orden no permite iniciar ni finalizar trabajos.';
      this.isError = true;
      return;
    }

    const code = String(
      this.codes[order.id] || ''
    ).trim();

    if (!/^\d{6}$/.test(code)) {
      this.message =
        'Ingresa un código válido de seis dígitos.';
      this.isError = true;
      return;
    }

    // Confirmación antes del cierre definitivo.
    if (order.status === 'EN_PROCESO') {
      const confirmed = window.confirm(
        '¿Seguro que deseas finalizar este trabajo? ' +
        'Después no podrás agregar fotografías ' +
        'ni observaciones.'
      );

      if (!confirmed) return;
    }

    this.busy = true;

    try {
      const action =
        order.status === 'ASIGNADA'
          ? 'start'
          : 'finish';

      await this.api.post(
        '/orders/' + order.id + '/verify',
        {
          action,
          code
        }
      );

      this.codes[order.id] = '';

      if (action === 'finish') {
        delete this.notes[order.id];
        delete this.photos[order.id];

        this.message =
          'Servicio finalizado correctamente. ' +
          'La orden ha quedado cerrada.';
      } else {
        this.message =
          'Trabajo iniciado correctamente.';
      }

      this.isError = false;

      await this.load();

    } catch (error: any) {
      this.fail(error);

    } finally {
      this.busy = false;
    }
  }

  fileChanged(
    orderId: number,
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const order = this.orders.find(
      o => Number(o.id) === Number(orderId)
    );

    if (
      !order ||
      order.status !== 'EN_PROCESO' ||
      this.busy
    ) {
      input.value = '';
      delete this.photos[orderId];

      this.message =
        'No puedes agregar fotografías a esta orden.';
      this.isError = true;
      return;
    }

    this.photos[orderId] =
      input.files?.[0];
  }

  async evidence(orderId: number): Promise<void> {
    if (this.busy) return;

    const order = this.orders.find(
      o => Number(o.id) === Number(orderId)
    );

    if (
      !order ||
      order.status !== 'EN_PROCESO'
    ) {
      this.message =
        'Esta orden no está en proceso. ' +
        'No se pueden agregar nuevas evidencias.';
      this.isError = true;
      return;
    }

    const note = String(
      this.notes[orderId] || ''
    ).trim();

    const photo = this.photos[orderId];

    if (!note && !photo) {
      this.message =
        'Escribe una observación o adjunta una fotografía.';
      this.isError = true;
      return;
    }

    if (
      photo &&
      photo.size > 5 * 1024 * 1024
    ) {
      this.message =
        'La fotografía no puede superar los 5 MB.';
      this.isError = true;
      return;
    }

    this.busy = true;

    try {
      const form = new FormData();

      form.append('note', note);

      if (photo) {
        form.append('photo', photo);
      }

      await this.api.upload(
        '/orders/' + orderId + '/evidence',
        form
      );

      this.notes[orderId] = '';
      this.photos[orderId] = undefined;

      this.message =
        'Informe técnico guardado correctamente.';
      this.isError = false;

      await this.load();

    } catch (error: any) {
      this.fail(error);

    } finally {
      this.busy = false;
    }
  }

  fail(error: any): void {
    this.message =
      error?.error?.error ||
      error?.message ||
      'Ocurrió un error. Inténtalo nuevamente.';

    this.isError = true;
  }
}
