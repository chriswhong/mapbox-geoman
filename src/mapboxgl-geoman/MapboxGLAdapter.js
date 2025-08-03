import { BaseMapAdapter } from "@geoman-io/maplibre-geoman-free";
import { isEqual, uniqWith } from 'lodash-es';
import mapboxgl from 'mapbox-gl';

import { MapboxGLSource } from './MapboxGLSource.js';
import { MapboxGLLayer } from './MapboxGLLayer.js';
import { MapboxGLDomMarker } from "./MapboxGLDomMarker.js";

const isMapboxglSupportedPointerEventName = (eventName) => {
    return [
        'click',
        'dblclick',
        'mousedown',
        'mouseup',
        'mousemove',
        'mouseenter',
        'mouseleave',
        'mouseover',
        'mouseout',
        'contextmenu',
        'touchstart',
        'touchend',
        'touchcancel',
    ].includes
}

export class MapboxGLAdapter
    extends BaseMapAdapter {
    gm;
    mapType = 'mapbox';
    mapInstance;

    constructor(map, gm) {
        super();
        this.gm = gm;
        this.mapInstance = map;
    }

    getMapInstance() {
        return this.mapInstance;
    }

    isLoaded() {
        return this.mapInstance.loaded();
    }

    getContainer() {
        return this.mapInstance.getContainer();
    }

    getCanvas() {
        return this.mapInstance.getCanvas();
    }

    addControl(control) {
        this.mapInstance.addControl(control);
    }

    removeControl(control) {
        this.mapInstance.removeControl(control);
    }

    async loadImage({ id, image }) {
        this.mapInstance.loadImage(image, (error, loadedImage) => {
            if (error) throw error;
            this.mapInstance.addImage(id, loadedImage);
        });
    }

    getBounds() {
        const mapBounds = this.mapInstance.getBounds();
        return mapBounds.toArray();
    }

    fitBounds(
        bounds,
        options,
    ) {
        this.mapInstance.fitBounds(bounds, options);
    }

    setCursor(cursor) {
        this.mapInstance.getCanvas().style.cursor = cursor;
    }

    disableMapInteractions(interactionTypes) {
        interactionTypes.forEach((interactionType) => {
            this.mapInstance[interactionType].disable();
        });
    }

    enableMapInteractions(interactionTypes) {
        interactionTypes.forEach((interactionType) => {
            this.mapInstance[interactionType].enable();
        });
    }

    setDragPan(value) {
        if (value) {
            this.mapInstance.dragPan.enable();
        } else {
            this.mapInstance.dragPan.disable();
        }
    }

    queryFeaturesByScreenCoordinates({ queryCoordinates = undefined, sourceNames }) {
        const features = uniqWith(this.mapInstance
            .queryRenderedFeatures(queryCoordinates)
            .map((feature) => ({
                featureId: feature.id || feature.properties[FEATURE_ID_PROPERTY],
                featureSourceName: feature.source,
            })), isEqual);

        return features.map(({ featureId, featureSourceName }) => {
            if (featureId === undefined || !sourceNames.includes(featureSourceName)) {
                return null;
            }

            return this.gm.features.get(featureSourceName, featureId) || null;
        }).filter((featureData) => !!featureData);
    }

    queryGeoJsonFeatures({ queryCoordinates = undefined, sourceNames }) {
        const comparator = (
            item1,
            item2,
        ) => {
            return item1?.id === item2?.id;
        };

        const features = uniqWith(this.mapInstance
            .queryRenderedFeatures(queryCoordinates)
            .map((feature) => {
                const geoJson = this.convertToGeoJsonImportFeature(feature);
                if (!geoJson) {
                    return null;
                }
                return {
                    id: feature.id || feature.properties[FEATURE_ID_PROPERTY],
                    sourceName: feature.source,
                    geoJson,
                };
            }), comparator);

        return features.filter(
            (item) => {
                return !!item
                    && item.id !== undefined
                    && item.geoJson
                    && sourceNames.includes(item.sourceName);
            },
        );
    }

    convertToGeoJsonImportFeature(feature) {
        const featureId = feature.id || feature.properties[FEATURE_ID_PROPERTY];
        if (featureId === undefined || feature.geometry.type === 'GeometryCollection') {
            return null;
        }

        return {
            id: featureId,
            type: 'Feature',
            properties: feature.properties,
            geometry: feature.geometry,
        };
    }

    addSource(sourceId, geoJson) {
        return new MapboxGLSource({ gm: this.gm, sourceId, geoJson });
    }

    getSource(sourceId) {
        return new MapboxGLSource({ gm: this.gm, sourceId });
    }

    addLayer(options) {
        const layerId = options.id;
        return new MapboxGLLayer({ gm: this.gm, layerId, options });
    }

    getLayer(layerId) {
        return new MapboxGLLayer({ gm: this.gm, layerId });
    }

    removeLayer(layerId) {
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.remove();
        }
    }

    eachLayer(callback) {
        this.mapInstance.getStyle().layers.forEach((layer) => {
            callback(new MapboxGLLayer({ gm: this.gm, layerId: layer.id }));
        });
    }

    createDomMarker(options, lngLat) {
        return new MapboxGLDomMarker({
            mapInstance: this.mapInstance,
            options,
            lngLat,
        });
    }

    createPopup(options, lngLat) {
        return new MaplibrePopup({
            mapInstance: this.mapInstance,
            options,
            lngLat,
        });
    }

    project(position) {
        const point = this.mapInstance.project(position);
        return [point.x, point.y];
    }

    unproject(point) {
        const lngLat = this.mapInstance.unproject(point);
        return [lngLat.lng, lngLat.lat];
    }

    coordBoundsToScreenBounds(
        bounds,
    ) {
        const mlBounds = new mapboxgl.LngLatBounds(bounds);
        const sw = this.project(mlBounds.getSouthWest().toArray());
        const ne = this.project(mlBounds.getNorthEast().toArray());
        return [sw, ne];
    }

    fire(type, data) {
        this.mapInstance.fire(type, data);
    }

    on(type, arg2, listener) {
        if (typeof arg2 === 'string' && listener && isMapboxglSupportedPointerEventName(type)) {
            this.mapInstance.on(type, arg2, listener);
        } else if (typeof arg2 === 'function') {
            this.mapInstance.on(type, arg2);
        } else {
            throw new Error('Invalid arguments passed to \'on\' method');
        }
    }

    once(type, arg2, listener) {
        // note: it's possible to have promise returned from maplibre-gl
        // (it's not implemented for this adapter)
        if (typeof arg2 === 'string' && listener && isMapboxglSupportedPointerEventName(type)) {
            this.mapInstance.once(type, arg2, listener);
        } else if (typeof arg2 === 'function') {
            this.mapInstance.once(type, arg2);
        } else {
            throw new Error('Invalid arguments passed to \'once\' method.');
        }
    }

    off(type, arg2, listener) {
        if (typeof arg2 === 'string' && listener && isMapboxglSupportedPointerEventName(type)) {
            this.mapInstance.off(type, arg2, listener);
        } else if (typeof arg2 === 'function') {
            this.mapInstance.off(type, arg2);
        } else {
            throw new Error('Invalid arguments passed to \'off\' method');
        }
    }
}
