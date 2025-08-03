import { BaseLayer } from '@geoman-io/maplibre-geoman-free';


export class MapboxGLLayer extends BaseLayer {
  gm;
  layerInstance = null;
  mapInstance;

  constructor({ gm, layerId, options }) {
    super();
    this.gm = gm;
    this.mapInstance = this.gm.mapAdapter.mapInstance;

    if (options) {
      this.layerInstance = this.createLayer(options);
    } else {
      this.layerInstance = this.mapInstance.getLayer(layerId) || null;
    }
  }

  get id() {
    if (!this.isInstanceAvailable()) {
      throw new Error('Layer instance is not available');
    }

    return this.layerInstance.id;
  }

  get source() {
    if (!this.isInstanceAvailable()) {
      throw new Error('Layer instance is not available');
    }

    return this.layerInstance.source;
  }

  createLayer(options) {
    this.mapInstance.addLayer(options);
    return this.mapInstance.getLayer(options.id) || null;
  }

  remove() {
    if (this.isInstanceAvailable()) {
      this.mapInstance.removeLayer(this.id);
    }
    this.layerInstance = null;
  }
}

