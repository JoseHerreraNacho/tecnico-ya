import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="location-box">
      <h3>02 · Ubicación del servicio</h3>
      <p>
        Busca tu dirección o selecciona el punto exacto
        haciendo clic sobre el mapa.
      </p>

      <button
        type="button"
        class="map-button"
        [disabled]="searching"
        (click)="searchAddress()"
      >
        {{ searching ? 'Buscando...' : 'Buscar dirección' }}
      </button>

      <div #mapElement class="map"></div>

      <p *ngIf="selected">
        Coordenadas:
        {{ selected.lat.toFixed(6) }},
        {{ selected.lng.toFixed(6) }}
      </p>

      <p *ngIf="error" class="error">{{ error }}</p>

      <button
        type="button"
        class="map-button confirm"
        [disabled]="!selected"
        (click)="confirmLocation()"
      >
        {{ confirmed ? '✓ Ubicación confirmada' : 'Confirmar ubicación' }}
      </button>

      <small>© OpenStreetMap contributors</small>
    </section>
  `,
  styles: [`
    .location-box {
      padding: 20px;
      margin: 20px 0;
      border-radius: 14px;
      background: #f8fbff;
      border: 1px solid #dbe5f2;
    }
    h3 { color: #183e80; }
    p { color: #52627a; }
    .map {
      width: 100%;
      height: 350px;
      margin: 15px 0;
      border-radius: 12px;
      z-index: 0;
    }
    .map-button {
      padding: 12px 18px;
      background: #2563eb;
      color: white;
      border: 0;
      border-radius: 10px;
      cursor: pointer;
    }
    .map-button:disabled { opacity: .5; }
    .confirm {
      display: block;
      width: 100%;
      margin: 12px 0;
      background: #15803d;
    }
    .error { color: #dc2626; }
    small { color: #64748b; }
  `]
})
export class LocationMapComponent
  implements AfterViewInit, OnDestroy {

  @Input() address = '';
  @Input() comuna = '';

  @Output() locationSelected =
    new EventEmitter<{
      latitude: number;
      longitude: number;
      location_confirmed: boolean;
    }>();

  @ViewChild('mapElement', { static: true })
  mapElement!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.CircleMarker;

  selected: L.LatLng | null = null;
  confirmed = false;
  searching = false;
  error = '';

  ngAfterViewInit(): void {
    this.map = L.map(this.mapElement.nativeElement)
      .setView([-33.4489, -70.6693], 11);

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);

    this.map.on('click', event => {
      this.setLocation(event.latlng);
    });

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private setLocation(position: L.LatLng): void {
    this.selected = position;
    this.confirmed = false;

    if (this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = L.circleMarker(position, {
        radius: 10,
        color: '#ffffff',
        weight: 3,
        fillColor: '#2563eb',
        fillOpacity: 1
      }).addTo(this.map!);
    }

    this.locationSelected.emit({
      latitude: position.lat,
      longitude: position.lng,
      location_confirmed: false
    });
  }

  async searchAddress(): Promise<void> {
    if (!this.address.trim() || !this.comuna.trim()) {
      this.error = 'Ingresa la dirección y la comuna.';
      return;
    }

    this.searching = true;
    this.error = '';

    try {
      const params = new URLSearchParams({
        q: `${this.address}, ${this.comuna}, Chile`,
        format: 'json',
        limit: '1',
        countrycodes: 'cl'
      });

      const response = await fetch(
        'https://nominatim.openstreetmap.org/search?' +
        params.toString(),
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        throw new Error('Error de búsqueda');
      }

      const results = await response.json();

      if (!results.length) {
        this.error =
          'Dirección no encontrada. Selecciónala en el mapa.';
        return;
      }

      const position = L.latLng(
        Number(results[0].lat),
        Number(results[0].lon)
      );

      this.map?.setView(position, 17);
      this.setLocation(position);

    } catch {
      this.error =
        'No se pudo buscar. Selecciona el punto manualmente.';
    } finally {
      this.searching = false;
    }
  }

  confirmLocation(): void {
    if (!this.selected) return;

    this.confirmed = true;

    this.locationSelected.emit({
      latitude: this.selected.lat,
      longitude: this.selected.lng,
      location_confirmed: true
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}