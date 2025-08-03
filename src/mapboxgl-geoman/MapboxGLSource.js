
import { BaseSource } from '@geoman-io/maplibre-geoman-free';



export class MapboxGLSource extends BaseSource {
  gm;
  mapInstance;
  sourceInstance;
  data; // Internal copy of the full GeoJSON data

  constructor({ gm, geoJson, sourceId }) {
    super();
    this.gm = gm;
    this.mapInstance = this.gm.mapAdapter.mapInstance;
    
    // Initialize internal data copy
    this.data = geoJson || {
      type: 'FeatureCollection',
      features: []
    };

    if (geoJson) {
      this.sourceInstance = this.createSource({ geoJson, sourceId });
    } else {
      this.sourceInstance = this.mapInstance.getSource(sourceId) || null;
      // If getting existing source, sync our internal data
      if (this.sourceInstance) {
        this.data = this.sourceInstance.serialize().data;
      }
    }
  }

  get id() {
    if (!this.isInstanceAvailable()) {
      throw new Error('Source instance is not available');
    }

    return this.sourceInstance.id;
  }

  createSource(
    { geoJson, sourceId },
  ) {
    this.mapInstance.addSource(sourceId, {
      type: 'geojson',
      data: geoJson,
      promoteId: '_gmid',
    });
    return this.mapInstance.getSource(sourceId) || null;
  }

  getGeoJson() {
    // Return our internal copy instead of querying the source
    return this.data;
  }

  setGeoJson(geoJson) {
    if (!this.isInstanceAvailable()) {
      throw new Error('Source instance is not available');
    }
    
    // Update internal copy
    this.data = geoJson;
    
    // Update the source
    return this.sourceInstance.setData(geoJson);
  }

  updateData(updateStorage) {
    if (!this.isInstanceAvailable()) {
      return;
    }

    
    // Ensure our data has a valid features array
    if (!this.data || !Array.isArray(this.data.features)) {
      this.data = {
        type: 'FeatureCollection',
        features: []
      };
    }
    
    // Make a deep copy of our current data to work with
    const updatedData = JSON.parse(JSON.stringify(this.data));
    
    // Process removals first
    if (updateStorage.remove && updateStorage.remove.length > 0) {
      // Remove features by ID (check _gmid property)
      updateStorage.remove.forEach(removeId => {
        const index = updatedData.features.findIndex(feature => 
          feature && feature.properties && feature.properties._gmid === removeId
        );
        if (index !== -1) {
          updatedData.features.splice(index, 1);
        }
      });
    }

    // Process updates - replace existing features with same ID
    if (updateStorage.update && updateStorage.update.length > 0) {
      updateStorage.update.forEach(updateFeature => {
        if (!updateFeature || !updateFeature.properties || !updateFeature.properties._gmid) {
          return; // Skip invalid features
        }
        
        const index = updatedData.features.findIndex(feature => 
          feature && feature.properties && feature.properties._gmid === updateFeature.properties._gmid
        );
        if (index !== -1) {
          updatedData.features[index] = updateFeature;
        } else {
          // If feature doesn't exist, add it
          updatedData.features.push(updateFeature);
        }
      });
    }

    // Process additions - add new features
    if (updateStorage.add && updateStorage.add.length > 0) {
      updateStorage.add.forEach(addFeature => {
        if (!addFeature || !addFeature.properties || !addFeature.properties._gmid) {
          return; // Skip invalid features
        }
        
        // Check if feature already exists to avoid duplicates (check _gmid property)
        const existingIndex = updatedData.features.findIndex(feature => 
          feature && feature.properties && feature.properties._gmid === addFeature.properties._gmid
        );
        if (existingIndex === -1) {
          updatedData.features.push(addFeature);
        } else {
          // Replace existing feature
          updatedData.features[existingIndex] = addFeature;
        }
      });
    }

    // Update our internal data
    this.data = updatedData;
    
    // Filter out any null/undefined features before updating the source
    const validFeatures = this.data.features.filter(feature => 
      feature && 
      feature.type === 'Feature' && 
      feature.geometry && 
      feature.properties
    );
    
    // Always update the source with clean data (empty array if no valid features)
    const cleanData = {
      type: 'FeatureCollection',
      features: validFeatures
    };
        
    // Use setData to update the source with the clean dataset
    this.sourceInstance.setData(cleanData);
  }

  remove({ removeLayers }) {
    if (!this.isInstanceAvailable()) {
      return;
    }

    if (removeLayers) {
      this.gm.mapAdapter.eachLayer((layer) => {
        if (layer.source === this.sourceInstance.id) {
          this.gm.mapAdapter.removeLayer(layer.id);
        }
      });
    }
    this.mapInstance.removeSource(this.sourceInstance.id);
  }
}