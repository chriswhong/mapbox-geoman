import './style.css'


import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeoman from './mapboxgl-geoman';

import './mapboxgl-geoman/mapboxgl-geoman.css';


mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const map = window.map = new mapboxgl.Map({
  container: 'dev-map',
  center: [-73.96282, 40.63616],
  zoom: 11.12,
});

const gmOptions = {};

// create a new geoman instance
const geoman = window.gm =  new MapboxGeoman(map, gmOptions);


// Create export button and result div
const exportButton = document.createElement('button');
exportButton.textContent = 'Export GeoJSON';
exportButton.style.cssText = `
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-family: Arial, sans-serif;
`;

const resultDiv = document.createElement('div');
resultDiv.id = 'geojson-result';
resultDiv.style.cssText = `
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  max-height: 200px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
  overflow: auto;
  z-index: 1000;
  display: none;
`;

// Add elements to the page
document.body.appendChild(exportButton);
document.body.appendChild(resultDiv);

// Add click handler for export button
exportButton.addEventListener('click', () => {
  try {
    const geoJson = geoman.features.exportGeoJson();
    resultDiv.textContent = JSON.stringify(geoJson, null, 2);
    resultDiv.style.display = 'block';
  } catch (error) {
    resultDiv.textContent = `Error: ${error.message}`;
    resultDiv.style.display = 'block';
  }
});

// Add click handler to hide result div when clicked
resultDiv.addEventListener('click', () => {
  resultDiv.style.display = 'none';
});

