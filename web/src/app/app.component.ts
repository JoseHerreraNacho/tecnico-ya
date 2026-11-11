
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from './api';
import { LocationMapComponent } from './location-map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, LocationMapComponent],
  template: `
    <div class="app sodimac-experience">

      <!-- BARRA LATERAL -->
      <aside class="sidebar" *ngIf="user">
        <div class="logo">
          <span class="logo-icon">TY</span>
          <div>
            <strong>Técnico Ya</strong>
            <small>JJV · Plataforma de gestión</small>
          </div>
        </div>

        <div class="nav-label">CENTRO DE GESTIÓN</div><div class="sidebar-caption">SERVICIOS PARA EL HOGAR</div>

        <button
          *ngFor="let t of tabs"
          class="nav-item"
          [class.selected]="tab === t"
          (click)="changeTab(t)"
        >
          <span class="nav-icon" [ngSwitch]="t"><ng-container *ngSwitchCase="'Panel'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></ng-container><ng-container *ngSwitchCase="'Solicitudes'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M8 4v4H3M8 12h9M8 16h9"/></svg></ng-container><ng-container *ngSwitchCase="'Órdenes'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4.5h6M9 10h6M9 14h6M9 18h4"/></svg></ng-container><ng-container *ngSwitchCase="'Técnicos'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15v-2a8 8 0 0 1 16 0v2M3 15h18v3H3zM12 5V3M8 6V4M16 6V4"/></svg></ng-container><ng-container *ngSwitchCase="'Usuarios'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 0 0 0-6M17 14a5 5 0 0 1 4 5v1"/></svg></ng-container><ng-container *ngSwitchCase="'Servicios'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 7a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3z"/></svg></ng-container><ng-container *ngSwitchCase="'Solicitar servicio'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></ng-container></span>
          <span>{{ t }}</span>
          <span class="nav-arrow" *ngIf="tab === t">›</span>
        </button>

        <div class="sidebar-bottom">
          <div class="avatar">{{ user.name?.charAt(0) }}</div>
          <div class="who">
            <strong>{{ user.name }}</strong>
            <small>{{ roleLabel }}</small>
          </div>
          <button class="signout" (click)="logout()">Salir</button>
        </div>
      </aside>

      <main class="main" [class.public]="!user">

        <!-- CABECERA -->
        <header class="header" *ngIf="user">
          <div>
            <div class="breadcrumb">
              Técnico Ya <span>/</span> {{ tab }}
            </div>
            <h1>{{ tab === 'Panel' ? 'Panel de control' : tab }}</h1>
            <p class="subheading">
              {{ tab === 'Panel'
                ? 'Resumen de operaciones y servicios en tiempo real'
                : 'Gestiona la información de tu plataforma de servicios' }}
            </p>
          </div>
          <div class="header-actions">
            <span class="online"><i></i> Plataforma JJV</span>
            <div class="header-avatar">
              {{ user.name?.charAt(0) }}
            </div>
          </div>
        </header>

        <!-- PAGINA PUBLICA -->
        <div *ngIf="!user" class="landing">

          <div class="store-utility"><span>TECNICO YA <b>PRO</b> · SERVICIOS PARA TU HOGAR</span><span>Atención coordinada · Seguimiento online · Técnicos especializados</span></div>
          <header class="public-header">
            <div class="logo">
              <span class="logo-icon">TY</span>
              <div>
                <strong>Técnico Ya</strong>
                <small>Servicios profesionales · JJV</small>
              </div>
            </div>

            <div class="public-links"><span class="header-service-label">CENTRO DE SERVICIOS</span>
              <a href="#beneficios" *ngIf="!authVisible">
                Cómo funciona
              </a>
              <a href="#servicios" *ngIf="!authVisible">
                Servicios
              </a>
              <button
                class="btn btn-light"
                (click)="authVisible = true; register = false"
              >
                Iniciar sesión
              </button>
              <button
                class="btn"
                (click)="authVisible = true; register = true"
              >
                Crear cuenta
              </button>
            </div>
          </header>

          <!-- INICIO PUBLICO -->
          <div *ngIf="!authVisible" class="landing-content">

            <div class="hero-copy">
              <div class="eyebrow"><span class="eyebrow-dot"></span> SERVICIOS TÉCNICOS A DOMICILIO</div>

              <h1>
                Todo lo que tu hogar necesita,
                <em>en un solo lugar.</em>
              </h1>

              <p>
                Encuentra asistencia especializada para tu hogar. Solicita un servicio,
                coordina tu visita y sigue cada etapa de tu trabajo en línea.
              </p>

              <div class="hero-buttons">
                <button
                  class="btn btn-lg"
                  (click)="authVisible = true; register = true"
                >
                  Solicitar un servicio
                </button>
                <button
                  class="btn btn-outline btn-lg"
                  (click)="authVisible = true; register = false"
                >
                  Ya tengo una cuenta
                </button>
              </div>

              <div class="hero-stats">
                <div>
                  <strong>01</strong>
                  <span>Solicita tu servicio</span>
                </div>
                <div>
                  <strong>02</strong>
                  <span>Coordinamos tu visita</span>
                </div>
                <div>
                  <strong>03</strong>
                  <span>Revisa su avance</span>
                </div>
              </div>
            </div>

            <div class="hero-visual"><div class="hero-corner-tag">SERVICIO EN TERRENO</div>
              <div class="visual-top"><span class="hero-badge">TÉCNICO YA · JJV</span><span>Asistencia para tu hogar</span></div>
              <div class="visual-symbol"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 7a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3z"/></svg></div>
              <div class="hero-illustration"><div class="illustration-roof"></div><div class="illustration-house"><div class="illustration-window"></div><div class="illustration-door"></div></div><div class="illustration-tool">✦</div></div>
              <div class="visual-card">
                <div class="visual-check">✓</div>
                <div>
                  <strong>Tu servicio, paso a paso</strong>
                  <small>
                    Solicita · Coordina · Supervisa
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div class="trust-strip" *ngIf="!authVisible"><div><span class="trust-icon">✓</span><strong>Proceso verificado</strong><small>Códigos de inicio y cierre</small></div><div><span class="trust-icon">⌖</span><strong>Seguimiento en línea</strong><small>Estado actualizado de tu orden</small></div><div><span class="trust-icon">★</span><strong>Atención especializada</strong><small>Técnicos según el servicio</small></div></div>
          <section
            id="beneficios"
            class="feature-row"
            *ngIf="!authVisible"
          >
            <div>
              <span>01</span>
              <strong>1. Cuéntanos qué necesitas</strong>
              <p>Cuéntanos qué necesitas en pocos pasos.</p>
            </div>
            <div>
              <span>02</span>
              <strong>2. Coordinamos tu visita</strong>
              <p>Conoce el estado de cada solicitud.</p>
            </div>
            <div>
              <span>03</span>
              <strong>3. Confirma el resultado</strong>
              <p>Inicio y cierre mediante códigos de seguridad.</p>
            </div>
          </section>

          <section
            id="servicios"
            class="service-preview"
            *ngIf="!authVisible"
          >
            <div class="section-kicker">NUESTRAS ESPECIALIDADES</div><h2>¿En qué podemos ayudarte?</h2><p class="service-lead">Soluciones prácticas para mantener tu hogar funcionando.</p>
            <div class="service-cards">
              <div
                class="service-tile"
                *ngFor="let s of publicServices"
              >
                <div class="service-emoji" [ngSwitch]="s.icon"><ng-container *ngSwitchCase="'EL'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-12h-7z"/></svg></ng-container><ng-container *ngSwitchCase="'GF'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v7M8 7h8M5 10h14M7 10v4a5 5 0 0 0 10 0v-4M12 19v3"/></svg></ng-container><ng-container *ngSwitchCase="'ED'"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M7 7h2"/></svg></ng-container></div>
                <h3>{{ s.name }}</h3>
                <p>{{ s.description }}</p>
                <button
                  class="text-button"
                  (click)="authVisible = true; register = true"
                >
                  Solicitar
                </button>
              </div>
            </div>
          </section>
          <footer class="public-footer" *ngIf="!authVisible"><div><strong>TÉCNICO YA</strong><span>Plataforma de servicios técnicos · JJV</span></div><span>Solicitudes, coordinación y seguimiento en un solo lugar.</span></footer>

          <!-- LOGIN Y REGISTRO -->
          <div *ngIf="authVisible" class="auth-layout">

            <div class="auth-intro">
              <span class="eyebrow">PLATAFORMA JJV</span>
              <h2>Tu servicio, en buenas manos.</h2>
              <p>
                Accede a tus solicitudes, revisa tus trabajos
                y mantente informado en cada etapa.
              </p>
              <button
                class="back-link"
                (click)="authVisible = false"
              >
                Volver al inicio
              </button>
            </div>

            <div class="auth-card">
              <div class="auth-icon">TY</div>
              <h2>
                {{ register
                  ? 'Crea tu cuenta'
                  : 'Bienvenido de nuevo' }}
              </h2>
              <p>
                {{ register
                  ? 'Comienza a solicitar servicios en Técnico Ya'
                  : 'Ingresa tus datos para continuar' }}
              </p>

              <form (ngSubmit)="authenticate()">

                <div class="field" *ngIf="register">
                  <label>Nombre completo</label>
                  <input
                    name="name"
                    required
                    [(ngModel)]="form.name"
                    placeholder="Tu nombre y apellido"
                  >
                </div>

                <div class="field">
                  <label>Correo electrónico</label>
                  <input
                    name="email"
                    type="email"
                    required
                    [(ngModel)]="form.email"
                    placeholder="nombre@correo.cl"
                  >
                </div>

              <div class="field">
  <label>Contraseña</label>

<div style="position:relative; width:100%;">
  <input
    name="password"
    [type]="mostrarPassword ? 'text' : 'password'"
    required
    minlength="10"
    [(ngModel)]="form.password"
    placeholder="Mínimo 10 caracteres"
    style="width:100%; box-sizing:border-box; padding-right:48px;"
  >

  <button
    type="button"
    (click)="mostrarPassword = !mostrarPassword"
    [attr.aria-label]="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
    style="position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:transparent; box-shadow:none; padding:8px; cursor:pointer; color:#666; display:flex; align-items:center; justify-content:center; width:auto; min-width:0;"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <!-- Ojo abierto: contraseña oculta -->
      <ng-container *ngIf="!mostrarPassword">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
        <circle cx="12" cy="12" r="3"/>
      </ng-container>

      <!-- Ojo tachado: contraseña visible -->
      <ng-container *ngIf="mostrarPassword">
        <path d="M3 3l18 18"/>
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
        <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c5 0 9 7 9 7a13.9 13.9 0 0 1-3 3.5M6.6 6.6C3.8 8.3 3 12 3 12s4 7 9 7a9.6 9.6 0 0 0 4.1-.9"/>
      </ng-container>
    </svg>
  </button>
</div>
</div>

                <div class="field" *ngIf="register">
                  <label>Teléfono</label>
                  <input
                    name="phone"
                    [(ngModel)]="form.phone"
                    placeholder="+56 9 1234 5678"
                  >
                </div>

                <button
                  class="btn full btn-lg"
                  type="submit"
                >
                  {{ register ? 'Crear cuenta' : 'Iniciar sesión' }}
                </button>
              </form>

              <div class="auth-switch">
                {{ register
                  ? '¿Ya tienes una cuenta?'
                  : '¿Aún no tienes cuenta?' }}
                <button
                  (click)="register = !register; message = ''"
                >
                  {{ register
                    ? 'Iniciar sesión'
                    : 'Regístrate aquí' }}
                </button>
              </div>

              <div
                class="alert"
                [class.alert-error]="isError"
                *ngIf="message"
                style="margin-top: 16px;"
              >
                {{ message }}
              </div>
            </div>
          </div>
        </div>

        <!-- CONTENIDO PRIVADO -->
        <div class="content" *ngIf="user">

          <div
            *ngIf="message"
            class="alert"
            [class.alert-error]="isError"
          >
            <span>{{ isError ? 'Error:' : 'Correcto:' }}</span>
            <span>{{ message }}</span>
            <button (click)="message = ''">×</button>
          </div>

          <!-- DASHBOARD -->
          <section *ngIf="tab === 'Panel'">

            <div class="operations-kicker">OPERACIONES / VISIÓN GENERAL</div><div class="welcome-banner">
              <div>
                <div class="eyebrow">CENTRO DE OPERACIONES · TÉCNICO YA</div>
                <h2>
                  Bienvenido, {{ user.name?.split(' ')?.[0] }}
                </h2>
                <p>
                  Monitorea las solicitudes y el trabajo
                  de tu equipo desde un solo lugar.
                </p>
              </div>
              <div class="banner-art"><span>GESTIÓN</span><strong>360°</strong><small>Solicitudes · Técnicos · Órdenes</small></div>
            </div>

            <div class="stats-grid">

              <div class="metric">
                <div class="metric-top">
                  <span>Órdenes totales</span>
                  <div class="metric-icon blue"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4.5h6M9 10h6M9 14h6M9 18h4"/></svg></div>
                </div>
                <strong>
                  {{ dashboard?.counts?.total || 0 }}
                </strong>
                <small>Registradas en la plataforma</small>
              </div>

              <div class="metric">
                <div class="metric-top">
                  <span>Pendientes</span>
                  <div class="metric-icon amber"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></div>
                </div>
                <strong>
                  {{ dashboard?.counts?.pending || 0 }}
                </strong>
                <small>Por gestionar</small>
              </div>

              <div class="metric">
                <div class="metric-top">
                  <span>En proceso</span>
                  <div class="metric-icon violet"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5"/><path d="M18 3v4h-4M6 21v-4h4"/></svg></div>
                </div>
                <strong>
                  {{ dashboard?.counts?.in_progress || 0 }}
                </strong>
                <small>Trabajos activos</small>
              </div>

              <div class="metric">
                <div class="metric-top">
                  <span>Finalizadas</span>
                  <div class="metric-icon green"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></div>
                </div>
                <strong>
                  {{ dashboard?.counts?.completed || 0 }}
                </strong>
                <small>Trabajos completados</small>
              </div>

            </div>

            <div class="dashboard-bottom">

              <div class="panel">
                <div class="panel-title">
                  <div>
                    <h3>Servicios más solicitados</h3>
                    <p>Distribución de órdenes por categoría</p>
                  </div>
                  <span class="chip">Datos reales</span>
                </div>

                <div
                  class="service-bar"
                  *ngFor="let s of dashboard?.byService"
                >
                  <div>
                    <strong>{{ s.name }}</strong>
                    <span>{{ s.total }} órdenes</span>
                  </div>
                  <div class="bar-track">
                    <div
                      [style.width.%]="barWidth(s.total)"
                    ></div>
                  </div>
                </div>

                <div
                  class="empty"
                  *ngIf="!dashboard?.byService?.length"
                >
                  Aún no hay órdenes para mostrar.
                </div>
              </div>

              <div class="panel">
                <div class="panel-title">
                  <div>
                    <h3>Resumen operativo</h3>
                    <p>Indicadores de atención</p>
                  </div>
                </div>

                <div class="big-average">
                  {{ dashboard?.counts?.avg_minutes || 0 }}
                  <small>min</small>
                </div>

                <p>
                  Tiempo promedio de ejecución
                  de trabajos finalizados.
                </p>

                <button
                  class="btn btn-outline"
                  (click)="changeTab('Órdenes')"
                >
                  Ver órdenes
                </button>
              </div>

            </div>
          </section>

          <!-- NUEVA SOLICITUD -->
          <section *ngIf="tab === 'Solicitar servicio'">

            <div class="section-heading">
              <div>
                <h2>Nueva solicitud</h2>
                <p>
                  Cuéntanos qué necesitas y coordinaremos
                  tu servicio.
                </p>
              </div>
            </div>

            <div class="panel form-panel">
              <div class="form-title">
                01 <span>Información del servicio</span>
              </div>

              <div class="form-grid">

                <div class="field">
                  <label>Tipo de servicio *</label>
                  <select [(ngModel)]="request.service_id">
                    <option [ngValue]="undefined">
                      Selecciona una categoría
                    </option>
                    <option
                      *ngFor="let s of services"
                      [ngValue]="s.id"
                    >
                      {{ s.name }}
                    </option>
                  </select>
                </div>

                <div class="field">
                  <label>Teléfono de contacto *</label>
                  <input
                    [(ngModel)]="request.contact_phone"
                    placeholder="+56 9 ..."
                  >
                </div>

                <div class="field">
                  <label>Dirección *</label>
                  <input
                    [(ngModel)]="request.address"
                    (ngModelChange)="invalidateLocation()"
                    placeholder="Calle y número"
                  >
                </div>

                <div class="field">
                  <label>Comuna *</label>
                  <input
                    [(ngModel)]="request.comuna"
                    (ngModelChange)="invalidateLocation()"
                    placeholder="Ej. Maipú"
                  >
                </div>

                <div class="field">
                  <label>Fecha preferida</label>
                  <input
                    type="date"
                    [(ngModel)]="request.preferred_date"
                  >
                </div>

                <div class="field span2">
                  <label>Descripción del problema *</label>
                  <textarea
                    rows="5"
                    [(ngModel)]="request.description"
                    placeholder="Describe el trabajo que necesitas realizar..."
                  ></textarea>
                </div>
              </div>

              <!-- UBICACIÓN DEL SERVICIO -->
              <div style="margin-top: 24px;">

                <app-location-map
                  [address]="request.address || ''"
                  [comuna]="request.comuna || ''"
                  (locationSelected)="setLocation($event)"
                ></app-location-map>

                <div
                  *ngIf="request.location_confirmed"
                  style="
                    background: #ecfdf5;
                    color: #166534;
                    padding: 14px;
                    border-radius: 10px;
                    margin-top: 12px;
                    font-weight: 600;
                  "
                >
                  ✓ Ubicación confirmada correctamente.
                  El técnico podrá llegar al domicilio.
                </div>

              </div>
              <div class="form-footer">
                <span>
                  Los campos marcados con * son obligatorios.
                </span>
                <button
                  class="btn"
                  (click)="createRequest()"
                >
                  Enviar solicitud
                </button>
              </div>
            </div>
          </section>

          <!-- SOLICITUDES -->
          <section *ngIf="tab === 'Solicitudes'">

            <div class="section-heading">
              <div>
                <h2>Solicitudes de servicio</h2>
                <p>
                  Revisa y gestiona las solicitudes registradas.
                </p>
              </div>
              <span class="count-chip">
                {{ requests.length }} solicitudes
              </span>
            </div>

            <div class="panel table-panel">

              <div class="table-toolbar">
                <strong>Listado de solicitudes</strong>
                <input
                  [(ngModel)]="search"
                  placeholder="Buscar por cliente o servicio"
                >
              </div>

              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Comuna</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr *ngFor="let r of filtered(requests)">
                      <td class="id-cell">#{{ r.id }}</td>
                      <td>{{ r.client_name }}</td>
                      <td>{{ r.service_name }}</td>
                      <td>{{ r.comuna }}</td>
                      <td>
                        <span
                          class="status"
                          [ngClass]="statusClass(r.status)"
                        >
                          {{ pretty(r.status) }}
                        </span>
                      </td>
                      <td>
                        <button
                          *ngIf="staff && (r.status === 'PENDIENTE' || r.status === 'REVISADA')"
                          class="btn btn-sm"
                          (click)="convert(r.id)"
                        >
                          Crear orden
                        </button>
                        <span
                          *ngIf="!staff || (r.status !== 'PENDIENTE' && r.status !== 'REVISADA')"
                        >
                          —
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  class="empty"
                  *ngIf="!filtered(requests).length"
                >
                  No hay solicitudes que coincidan.
                </div>
              </div>
            </div>
          </section>

          <!-- ORDENES DE TRABAJO -->
          <section *ngIf="tab === 'Órdenes'">

            <div class="section-heading">
              <div>
                <h2>Órdenes de trabajo</h2>
                <p>
                  Consulta el progreso, los códigos de seguridad
                  y las evidencias de los servicios.
                </p>
              </div>
              <span class="count-chip">
                {{ orders.length }} órdenes
              </span>
            </div>

            <div class="panel table-panel">

              <div class="table-toolbar">
                <strong>Gestión de órdenes</strong>
                <input
                  [(ngModel)]="search"
                  placeholder="Buscar órdenes"
                >
              </div>

              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Técnico</th>
                      <th>Estado</th>
                      <th *ngIf="staff">Asignación</th>
                      <th *ngIf="user?.role === 'CLIENTE'">
                        Código de seguridad
                      </th>
                      <th>Informe técnico</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr *ngFor="let o of filtered(orders)">

                      <td class="id-cell">#{{ o.id }}</td>
                      <td>{{ o.client_name }}</td>
                      <td>{{ o.service_name }}</td>
                      <td>
                        {{ o.technician_name || 'Sin asignar' }}
                      </td>

                      <td>
                        <span
                          class="status"
                          [ngClass]="statusClass(o.status)"
                        >
                          {{ pretty(o.status) }}
                        </span>
                      </td>

                      <!-- ASIGNACION -->
                      <td *ngIf="staff">
                        <div
                          class="inline-form"
                          *ngIf="o.status === 'PENDIENTE' || o.status === 'ASIGNADA'"
                        >
                          <select [(ngModel)]="selection[o.id]">
                            <option [ngValue]="undefined">
                              Seleccionar técnico
                            </option>
                            <option
                              *ngFor="let t of technicians"
                              [ngValue]="t.id"
                            >
                              {{ t.name }} ·
                              {{ t.active_orders }} activos
                            </option>
                          </select>

                          <button
                            class="btn btn-sm"
                            (click)="assign(o.id)"
                          >
                            Asignar
                          </button>
                        </div>

                        <span
                          *ngIf="o.status !== 'PENDIENTE' && o.status !== 'ASIGNADA'"
                        >
                          —
                        </span>
                      </td>

                      <!-- CODIGOS DEL CLIENTE -->
                      <td *ngIf="user?.role === 'CLIENTE'">
                        <button
                          *ngIf="o.status === 'ASIGNADA' || o.status === 'EN_PROCESO'"
                          class="btn btn-sm"
                          (click)="viewCodes(o.id)"
                          [disabled]="loadingCodes"
                        >
                          {{ loadingCodes && loadingOrderId === o.id
                            ? 'Consultando...'
                            : 'Ver código' }}
                        </button>

                        <span
                          *ngIf="o.status !== 'ASIGNADA' && o.status !== 'EN_PROCESO'"
                        >
                          —
                        </span>
                      </td>

                      <!-- NUEVO BOTON INFORME -->
                      <td>
                        <button
                          class="btn btn-sm"
                          (click)="viewReport(o.id)"
                          [disabled]="loadingReport"
                        >
                          {{ loadingReport && reportOrderId === o.id
                            ? 'Cargando...'
                            : 'Ver informe' }}
                        </button>
                      </td>

                    </tr>
                  </tbody>
                </table>

                <div
                  class="empty"
                  *ngIf="!filtered(orders).length"
                >
                  No hay órdenes registradas.
                </div>
              </div>
            </div>

            <!-- INFORME DEL TECNICO -->
            <div
              class="panel form-panel"
              *ngIf="reportOrderId !== null"
              style="margin-top: 24px;"
            >

              <div class="section-heading">
                <div>
                  <h2>
                    Informe técnico - Orden #{{ reportOrderId }}
                  </h2>
                  <p>
                    Fotografías y observaciones registradas
                    por el técnico asignado.
                  </p>
                </div>

                <button
                  class="btn btn-outline"
                  (click)="closeReport()"
                >
                  Cerrar informe
                </button>
              </div>

              <div
                *ngIf="reportOrder"
                style="margin-bottom: 20px;"
              >
                <p>
                  <strong>Cliente:</strong>
                  {{ reportOrder.client_name }}
                </p>
                <p>
                  <strong>Servicio:</strong>
                  {{ reportOrder.service_name }}
                </p>
                <p>
                  <strong>Técnico:</strong>
                  {{ reportOrder.technician_name || 'Sin asignar' }}
                </p>
                <p>
                  <strong>Estado:</strong>
                  {{ pretty(reportOrder.status) }}
                </p>
                <p *ngIf="reportOrder.started_at">
                  <strong>Inicio:</strong>
                  {{ reportOrder.started_at | date:'dd/MM/yyyy HH:mm' }}
                </p>
                <p *ngIf="reportOrder.finished_at">
                  <strong>Finalización:</strong>
                  {{ reportOrder.finished_at | date:'dd/MM/yyyy HH:mm' }}
                </p>
              </div>

              <p *ngIf="loadingReport">
                Cargando evidencias del trabajo...
              </p>

              <div
                class="empty"
                *ngIf="!loadingReport && reportEvidence.length === 0"
              >
                El técnico todavía no ha registrado
                observaciones ni fotografías para esta orden.
              </div>

              <div
                *ngFor="let evidence of reportEvidence"
                style="margin-top: 18px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;"
              >

                <h3>Registro #{{ evidence.id }}</h3>

                <p style="margin-top: 10px;">
                  <strong>Fecha:</strong>
                  {{ evidence.created_at | date:'dd/MM/yyyy HH:mm' }}
                </p>

                <div style="margin-top: 16px;">
                  <h4>Observaciones del técnico</h4>
                  <p style="white-space: pre-wrap; margin-top: 8px;">
                    {{ evidence.note || 'Sin observaciones registradas.' }}
                  </p>
                </div>

                <div
                  *ngIf="evidence.photo_path"
                  style="margin-top: 18px;"
                >
                  <h4>Fotografía del trabajo</h4>

                  <img
                    *ngIf="reportPhotos[evidence.id]"
                    [src]="reportPhotos[evidence.id]"
                    alt="Fotografía del trabajo"
                    style="display: block; max-width: 100%; max-height: 450px; border-radius: 12px; object-fit: contain; margin-top: 12px;"
                  >

                  <p
                    *ngIf="!reportPhotos[evidence.id] && !loadingReport"
                  >
                    No fue posible cargar esta fotografía.
                  </p>
                </div>

              </div>
            </div>

            <!-- CODIGOS DE SEGURIDAD -->
            <div
              class="panel form-panel"
              *ngIf="user?.role === 'CLIENTE' && visibleCodes"
              style="margin-top: 24px;"
            >

              <div class="section-heading">
                <div>
                  <h2>
                    Códigos de seguridad - Orden
                    #{{ visibleCodes.order_id }}
                  </h2>
                  <p>
                    Estos códigos son personales. Entrégalos
                    únicamente al técnico asignado.
                  </p>
                </div>

                <span
                  class="status"
                  [ngClass]="statusClass(visibleCodes.status)"
                >
                  {{ pretty(visibleCodes.status) }}
                </span>
              </div>

              <div *ngIf="visibleCodes.start_code">
                <h3>Código de inicio</h3>

                <div
                  style="font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 16px 0;"
                >
                  {{ visibleCodes.start_code }}
                </div>

                <p>
                  Entrega este código al técnico cuando llegue
                  para comenzar el trabajo.
                </p>
              </div>

              <div *ngIf="visibleCodes.end_code">
                <h3>Código de término</h3>

                <div
                  style="font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 16px 0;"
                >
                  {{ visibleCodes.end_code }}
                </div>

                <p>
                  Entrega este código cuando hayas comprobado
                  que el servicio está terminado correctamente.
                </p>
              </div>

              <p *ngIf="visibleCodes.status === 'ASIGNADA'">
                El código de término estará disponible
                cuando el técnico inicie el servicio.
              </p>

              <p
                *ngIf="!visibleCodes.start_code && !visibleCodes.end_code"
              >
                No hay códigos disponibles para el estado
                actual de esta orden.
              </p>

              <div class="form-footer">
                <span>
                  Nunca compartas estos códigos antes
                  de que corresponda utilizarlos.
                </span>

                <button
                  class="btn btn-outline"
                  (click)="visibleCodes = null"
                >
                  Cerrar
                </button>
              </div>

            </div>

          </section>

          <!-- TECNICOS -->
          <section *ngIf="tab === 'Técnicos'">

            <div class="section-heading">
              <div>
                <h2>Equipo técnico</h2>
                <p>
                  Disponibilidad, especialidades y carga de trabajo.
                </p>
              </div>
              <span class="count-chip">
                {{ technicians.length }} técnicos
              </span>
            </div>

            <div class="panel table-panel">
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Técnico</th>
                      <th>Especialidad</th>
                      <th>Zona</th>
                      <th>Órdenes activas</th>
                      <th>Disponibilidad</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr *ngFor="let t of technicians">
                      <td>
                        <div class="person">
                          <span class="person-avatar">
                            {{ t.name?.charAt(0) }}
                          </span>
                          <div>
                            <strong>{{ t.name }}</strong>
                            <small>{{ t.email }}</small>
                          </div>
                        </div>
                      </td>

                      <td>{{ t.specialty }}</td>
                      <td>{{ t.zone }}</td>
                      <td>{{ t.active_orders }}</td>

                      <td>
                        <span
                          class="status"
                          [class.status-success]="t.available"
                          [class.status-muted]="!t.available"
                        >
                          {{ t.available
                            ? 'Disponible'
                            : 'No disponible' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  class="empty"
                  *ngIf="!technicians.length"
                >
                  No hay técnicos registrados.
                </div>
              </div>
            </div>
          </section>

          <!-- USUARIOS -->
          <section *ngIf="tab === 'Usuarios'">

            <div class="section-heading">
              <div>
                <h2>Administración de usuarios</h2>
                <p>
                  Crea accesos para gestores y técnicos de JJV.
                </p>
              </div>
            </div>

            <div class="panel form-panel">
              <h3>Registrar nuevo integrante</h3>

              <div class="form-grid">

                <div class="field">
                  <label>Nombre completo</label>
                  <input [(ngModel)]="newUser.name">
                </div>

                <div class="field">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    [(ngModel)]="newUser.email"
                  >
                </div>

                <div class="field">
  <label>Contraseña inicial (mín. 10)</label>

<div style="position:relative; width:100%;">
  <input
    [type]="mostrarPasswordNuevo ? 'text' : 'password'"
    [(ngModel)]="newUser.password"
    style="width:100%; box-sizing:border-box; padding-right:48px;"
  >

  <button
    type="button"
    (click)="mostrarPasswordNuevo = !mostrarPasswordNuevo"
    [attr.aria-label]="mostrarPasswordNuevo ? 'Ocultar contraseña' : 'Mostrar contraseña'"
    style="position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:transparent; box-shadow:none; padding:8px; cursor:pointer; color:#666; display:flex; align-items:center; justify-content:center; width:auto; min-width:0;"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <!-- Ojo abierto: contraseña oculta -->
      <ng-container *ngIf="!mostrarPasswordNuevo">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
        <circle cx="12" cy="12" r="3"/>
      </ng-container>

      <!-- Ojo tachado: contraseña visible -->
      <ng-container *ngIf="mostrarPasswordNuevo">
        <path d="M3 3l18 18"/>
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
        <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c5 0 9 7 9 7a13.9 13.9 0 0 1-3 3.5M6.6 6.6C3.8 8.3 3 12 3 12s4 7 9 7a9.6 9.6 0 0 0 4.1-.9"/>
      </ng-container>
    </svg>
  </button>
</div>
</div>

                <div class="field">
                  <label>Rol</label>
                  <select [(ngModel)]="newUser.role">
                    <option value="TECNICO">Técnico</option>
                    <option value="GESTOR">Gestor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div
                  class="field"
                  *ngIf="newUser.role === 'TECNICO'"
                >
                  <label>Especialidad</label>
                  <input [(ngModel)]="newUser.specialty">
                </div>

                <div
                  class="field"
                  *ngIf="newUser.role === 'TECNICO'"
                >
                  <label>Zona de atención</label>
                  <input [(ngModel)]="newUser.zone">
                </div>

              </div>

              <div class="form-footer">
                <span>
                  Solo los administradores pueden crear
                  usuarios internos.
                </span>

                <button
                  class="btn"
                  (click)="createUser()"
                >
                  Crear usuario
                </button>
              </div>
            </div>

            <div class="panel table-panel">
              <div class="table-toolbar">
                <strong>Usuarios registrados</strong>
                <span class="count-chip">
                  {{ users.length }} usuarios
                </span>
              </div>

              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr *ngFor="let u of users">
                      <td>{{ u.name }}</td>
                      <td>{{ u.email }}</td>
                      <td>
                        <span class="status status-blue">
                          {{ pretty(u.role) }}
                        </span>
                      </td>
                      <td>
                        <span
                          class="status"
                          [class.status-success]="u.active"
                          [class.status-muted]="!u.active"
                        >
                          {{ u.active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </section>

          <!-- SERVICIOS -->
          <section *ngIf="tab === 'Servicios'">

            <div class="section-heading">
              <div>
                <h2>Catálogo de servicios</h2>
                <p>
                  Especialidades disponibles para las solicitudes.
                </p>
              </div>
            </div>

            <div class="service-cards inside">
              <div
                class="service-tile"
                *ngFor="let s of services"
              >
                <div class="service-emoji"><svg class="ty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 7a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3z"/></svg></div>
                <h3>{{ s.name }}</h3>
                <p>{{ s.description }}</p>
                <span class="status status-success">Activo</span>
              </div>
            </div>

            <div class="panel form-panel">
              <h3>Agregar nuevo servicio</h3>

              <div class="form-grid">
                <div class="field">
                  <label>Nombre del servicio</label>
                  <input
                    [(ngModel)]="newService.name"
                    placeholder="Ej. Climatización"
                  >
                </div>

                <div class="field">
                  <label>Descripción</label>
                  <input
                    [(ngModel)]="newService.description"
                    placeholder="Breve descripción"
                  >
                </div>
              </div>

              <div class="form-footer">

                <span>
                  El nuevo servicio estará disponible
                  para los clientes.
                </span>

                <button
                  class="btn"
                  (click)="createService()"
                >
                  Agregar servicio
                </button>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  `
})
export class AppComponent implements OnDestroy {
mostrarPassword = false;
mostrarPasswordNuevo = false;
  api = inject(Api);

  user: any = this.api.user();

  tab = '';
  register = false;
  authVisible = false;
  search = '';
  message = '';
  isError = false;

  form: any = {};
  request: any = {};
  newUser: any = { role: 'TECNICO' };
  newService: any = {};

  services: any[] = [];
  requests: any[] = [];
  orders: any[] = [];
  technicians: any[] = [];
  users: any[] = [];

  dashboard: any;
  selection: any = {};

  // CODIGOS DE SEGURIDAD
  visibleCodes: any = null;
  loadingCodes = false;
  loadingOrderId: number | null = null;

  // INFORME TECNICO
  reportOrderId: number | null = null;
  reportOrder: any = null;
  reportEvidence: any[] = [];
  reportPhotos: Record<number, string> = {};
  loadingReport = false;

  // Evita mostrar respuestas antiguas al cambiar de orden.
  private reportRequestId = 0;

  publicServices = [
    {
      icon: 'EL',
      name: 'Electricidad',
      description: 'Instalaciones y reparaciones eléctricas.'
    },
    {
      icon: 'GF',
      name: 'Gasfitería',
      description: 'Soluciones sanitarias para tu hogar.'
    },
    {
      icon: 'ED',
      name: 'Electrodomésticos',
      description: 'Diagnóstico y reparación de equipos.'
    }
  ];

  constructor() {
    if (this.user) {
      this.tab = this.staff ? 'Panel' : 'Solicitar servicio';
      this.load();
    }
  }

  get staff(): boolean {
    return ['ADMIN', 'GESTOR'].includes(this.user?.role);
  }

  get roleLabel(): string {
    const roles: any = {
      ADMIN: 'Administrador',
      GESTOR: 'Gestor',
      CLIENTE: 'Cliente',
      TECNICO: 'Técnico'
    };

    return roles[this.user?.role] || 'Usuario';
  }

  get tabs(): string[] {
    if (this.user?.role === 'ADMIN') {
      return [
        'Panel',
        'Solicitudes',
        'Órdenes',
        'Técnicos',
        'Usuarios',
        'Servicios'
      ];
    }

    if (this.user?.role === 'GESTOR') {
      return [
        'Panel',
        'Solicitudes',
        'Órdenes',
        'Técnicos',
        'Servicios'
      ];
    }

    if (this.user?.role === 'CLIENTE') {
      return [
        'Solicitar servicio',
        'Solicitudes',
        'Órdenes'
      ];
    }

    return ['Órdenes'];
  }


  pretty(value: string): string {
    return (value || '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^./, letter => letter.toUpperCase());
  }

  statusClass(value: string): string {
    if (['FINALIZADA', 'CONVERTIDA'].includes(value)) {
      return 'status-success';
    }

    if (value === 'PENDIENTE') {
      return 'status-warning';
    }

    if (['ASIGNADA', 'REVISADA'].includes(value)) {
      return 'status-blue';
    }

    if (value === 'EN_PROCESO') {
      return 'status-violet';
    }

    return 'status-muted';
  }

  filtered(rows: any[]): any[] {
    const searchText = this.search.trim().toLowerCase();

    if (!searchText) {
      return rows;
    }

    return rows.filter(row =>
      Object.values(row).some(value =>
        String(value ?? '')
          .toLowerCase()
          .includes(searchText)
      )
    );
  }

  barWidth(total: number): number {
    const max = Math.max(
      1,
      ...(this.dashboard?.byService || [])
        .map((service: any) => Number(service.total))
    );

    return Math.round(Number(total) / max * 100);
  }

  changeTab(nextTab: string): void {
    this.closeReport();
    this.tab = nextTab;
    this.search = '';
    this.message = '';
    this.visibleCodes = null;
    this.load();
  }

  async run(
    action: () => Promise<any>,
    successMessage = 'Operación realizada'
  ): Promise<void> {
    try {
      await action();

      if (successMessage) {
        this.message = successMessage;
        this.isError = false;
      }

      await this.load();

    } catch (error: any) {
      this.message =
        error.error?.error ||
        error.message ||
        'Error al realizar la operación';

      this.isError = true;
    }
  }

  // INICIO DE SESION Y REGISTRO
  async authenticate(): Promise<void> {
    try {
      if (this.register) {
        await this.api.post('/auth/register', this.form);

        this.register = false;
        this.form.password = '';
        this.message = 'Cuenta creada. Ahora inicia sesión.';
        this.isError = false;
        return;
      }

      await this.api.login(
        this.form.email,
        this.form.password
      );

      this.user = this.api.user();
      this.tab = this.staff ? 'Panel' : 'Solicitar servicio';
      this.message = '';

      await this.load();

    } catch (error: any) {
      this.message =
        error.error?.error ||
        error.message ||
        'No se pudo iniciar sesión';

      this.isError = true;
    }
  }

  logout(): void {
    this.closeReport();
    this.api.logout();
    this.user = null;
    this.message = '';
    this.authVisible = false;
    this.visibleCodes = null;
  }

  // CARGAR INFORMACION REAL
  async load(): Promise<void> {
    if (!this.user) {
      return;
    }

    this.visibleCodes = null;

    try {
      this.services = await this.api.get('/services');

      if (this.tab === 'Solicitudes') {
        this.requests = await this.api.get('/requests');
      }

      if (this.tab === 'Órdenes') {
        this.orders = await this.api.get('/orders');
      }

      if (
        this.staff &&
        ['Órdenes', 'Técnicos'].includes(this.tab)
      ) {
        this.technicians = await this.api.get('/technicians');
      }

      if (this.tab === 'Usuarios') {
        this.users = await this.api.get('/users');
      }

      if (this.tab === 'Panel') {
        this.dashboard = await this.api.get('/dashboard');
      }

    } catch (error: any) {
      this.message =
        error.error?.error ||
        'No se pudo cargar información. Comprueba el backend.';

      this.isError = true;
    }
  }

  // CONSULTAR CODIGOS DEL CLIENTE
  async viewCodes(orderId: number): Promise<void> {
    if (this.user?.role !== 'CLIENTE') {
      return;
    }

    this.visibleCodes = null;
    this.message = '';
    this.loadingCodes = true;
    this.loadingOrderId = orderId;

    try {
      const response = await this.api.get(
        '/orders/' + orderId + '/codes'
      );

      this.visibleCodes = response;
      this.isError = false;

    } catch (error: any) {
      this.message =
        error.error?.error ||
        'No fue posible consultar los códigos de esta orden.';

      this.isError = true;

    } finally {
      this.loadingCodes = false;
      this.loadingOrderId = null;
    }
  }

  // CONSULTAR INFORME DEL TECNICO
  async viewReport(orderId: number): Promise<void> {
    this.closeReport();

    const currentRequestId = this.reportRequestId;

    this.reportOrderId = orderId;
    this.reportOrder =
      this.orders.find(o => Number(o.id) === Number(orderId)) || null;

    this.reportEvidence = [];
    this.loadingReport = true;
    this.message = '';

    try {
      const evidenceList: any[] = await this.api.get(
        '/orders/' + orderId + '/evidence'
      );

      if (currentRequestId !== this.reportRequestId) {
        return;
      }

      this.reportEvidence = evidenceList;

      // Las fotografias requieren autenticacion.
      // Usamos el token y la URL del servicio Api existente.
      const token = this.api.token();

      for (const evidence of evidenceList) {
        if (currentRequestId !== this.reportRequestId) {
          return;
        }

        if (!evidence.photo_path) {
          continue;
        }

        try {
          const response = await fetch(
            this.api.base +
              '/evidence/' +
              evidence.id +
              '/photo',
            {
              headers: {
                Authorization: 'Bearer ' + token
              }
            }
          );

          if (!response.ok) {
            throw new Error(
              'No se pudo cargar la fotografía'
            );
          }

          const blob = await response.blob();

          if (currentRequestId !== this.reportRequestId) {
            return;
          }

          const imageUrl = URL.createObjectURL(blob);
          this.reportPhotos[evidence.id] = imageUrl;

        } catch (photoError) {
          console.error(
            'Error al cargar fotografía:',
            photoError
          );
        }
      }

      if (currentRequestId === this.reportRequestId) {
        this.isError = false;
      }

    } catch (error: any) {
      if (currentRequestId !== this.reportRequestId) {
        return;
      }

      this.message =
        error.error?.error ||
        error.message ||
        'No fue posible cargar el informe del técnico.';

      this.isError = true;
      this.closeReport();

    } finally {
      if (currentRequestId === this.reportRequestId) {
        this.loadingReport = false;
      }
    }
  }

  // CERRAR INFORME Y LIBERAR FOTOGRAFIAS
  closeReport(): void {
    this.reportRequestId++;

    for (const photoUrl of Object.values(this.reportPhotos)) {
      URL.revokeObjectURL(photoUrl);
    }

    this.reportPhotos = {};
    this.reportEvidence = [];
    this.reportOrderId = null;
    this.reportOrder = null;
    this.loadingReport = false;
  }

  ngOnDestroy(): void {
    this.closeReport();
  }

  // UBICACIÓN SELECCIONADA POR EL CLIENTE
  setLocation(location: {
    latitude: number;
    longitude: number;
    location_confirmed: boolean;
  }): void {
    this.request.latitude = location.latitude;
    this.request.longitude = location.longitude;
    this.request.location_confirmed =
      location.location_confirmed;
  }

  // INVALIDAR CONFIRMACIÓN AL CAMBIAR LA DIRECCIÓN
  invalidateLocation(): void {
    this.request.location_confirmed = false;
  }

  // CREAR SOLICITUD CON UBICACIÓN REAL
  createRequest(): Promise<void> {
    return this.run(async () => {

      if (!this.request.service_id) {
        throw new Error(
          'Selecciona un tipo de servicio.'
        );
      }

      if (!this.request.contact_phone?.trim()) {
        throw new Error(
          'Ingresa un teléfono de contacto.'
        );
      }

      if (!this.request.address?.trim()) {
        throw new Error(
          'Ingresa la dirección del servicio.'
        );
      }

      if (!this.request.comuna?.trim()) {
        throw new Error(
          'Ingresa la comuna.'
        );
      }

      if (!this.request.description?.trim()) {
        throw new Error(
          'Describe el problema.'
        );
      }

      if (!this.request.location_confirmed) {
        throw new Error(
          'Selecciona y confirma la ubicación en el mapa.'
        );
      }

      if (
        !Number.isFinite(this.request.latitude) ||
        !Number.isFinite(this.request.longitude)
      ) {
        throw new Error(
          'Las coordenadas no son válidas.'
        );
      }

      await this.api.post('/requests', {
        service_id: Number(this.request.service_id),
        contact_phone: this.request.contact_phone.trim(),
        address: this.request.address.trim(),
        comuna: this.request.comuna.trim(),
        description: this.request.description.trim(),
        preferred_date: this.request.preferred_date || null,
        latitude: this.request.latitude,
        longitude: this.request.longitude,
        location_confirmed: true
      });

      this.request = {};

    }, 'Solicitud registrada correctamente');
  }
  // CONVERTIR SOLICITUD EN ORDEN
  convert(requestId: number): Promise<void> {
    return this.run(
      () => this.api.post(
        '/requests/' + requestId + '/order',
        {}
      ),
      'Orden creada correctamente'
    );
  }

  // ASIGNAR TECNICO
  assign(orderId: number): Promise<void> {
    return this.run(async () => {
      const technicianId = this.selection[orderId];

      if (!technicianId) {
        throw new Error(
          'Selecciona un técnico antes de asignar.'
        );
      }

      await this.api.post(
        '/orders/' + orderId + '/assign',
        { technician_id: technicianId }
      );

      this.message =
        'Técnico asignado correctamente. ' +
        'Los códigos fueron generados y el cliente puede ' +
        'consultarlos desde su cuenta.';

      this.isError = false;

    }, '');
  }

  // CREAR USUARIO
  createUser(): Promise<void> {
    return this.run(async () => {
      await this.api.post('/users', this.newUser);
      this.newUser = { role: 'TECNICO' };
    }, 'Usuario creado correctamente');
  }

  // CREAR SERVICIO
  createService(): Promise<void> {
    return this.run(async () => {
      await this.api.post('/services', this.newService);
      this.newService = {};
    }, 'Servicio agregado correctamente');
  }
}
