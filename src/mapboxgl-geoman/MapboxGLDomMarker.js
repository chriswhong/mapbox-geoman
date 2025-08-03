import mapboxgl from 'mapbox-gl';
import log from 'loglevel';

import { BaseDomMarker } from '@geoman-io/maplibre-geoman-free';


export class MapboxGLDomMarker extends BaseDomMarker {
  markerInstance;

  constructor({ mapInstance, options, lngLat }) {
    super();
    this.markerInstance = new mapboxgl.Marker(options)
      .setLngLat(lngLat)
      .addTo(mapInstance);
  }

  getElement() {
    if (!this.isMarkerInstanceAvailable()) {
      return null;
    }

    return this.markerInstance?.getElement() || null;
  }

  setLngLat(lngLat) {
    if (!this.isMarkerInstanceAvailable()) {
      return;
    }
    this.markerInstance?.setLngLat(lngLat);
  }

  getLngLat() {
    if (!this.isMarkerInstanceAvailable()) {
      return [0, 0];
    }

    return this.markerInstance?.getLngLat().toArray() || [0, 0];
  }

  remove() {
    this.markerInstance?.remove();
  }
}
