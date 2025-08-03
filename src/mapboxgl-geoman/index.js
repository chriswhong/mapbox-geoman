import { Geoman } from '@geoman-io/maplibre-geoman-free';
import { MapboxGLAdapter } from './MapboxGLAdapter.js';

const getMapAdapter = async (
  gm,
  map,
) => {
  return new MapboxGLAdapter(map, gm);
};

class MapboxGeoman extends Geoman {
  constructor(map, options) {
    super(map, options);
    this.map = map;
  }

  async init(map) {
    this.mapAdapterInstance = await getMapAdapter(this, map);
    this.features.init();
    await this.addControls();
  }


  async onMapLoad() {
    if (this.loaded) {
      return;
    }

    await this.mapAdapter.loadImage({
      id: 'default-marker',
      image: '/default-marker.png',
    });

    this.events.fire(`gm:control`, {
      level: 'system',
      type: 'control',
      action: 'loaded',
    });
    this.loaded = true;
  }
}

export default MapboxGeoman;