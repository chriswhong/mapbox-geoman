# Mapbox GL JS Geoman Integration

This is a proof-of-concept implementation demonstrating how to adapt the Geoman geojson drawing library for use with the Mapbox GL JS mapping library.

![geoman mapbox](https://github.com/user-attachments/assets/6349cc31-cca6-4862-aac3-0220ce48877e)


## Overview

This repository contains a Vite-based web application that showcases the integration. The core implementation includes:

- **MapboxGLAdapter**: Custom adapter that bridges Geoman's API with Mapbox GL JS
- **MapboxGLSource**: Handles GeoJSON data sources with proper feature ID management
- **MapboxGLLayer**: Manages map layers and styling
- **MapboxGLDomMarker**: Custom marker implementation for Mapbox GL JS

The main application (`main.js`) creates a Mapbox GL JS map instance and initializes the Geoman integration, providing drawing and editing tools for GeoJSON features. For detailed usage instructions, refer to the [Geoman documentation](https://geoman.io/docs/maplibre).

The app includes an "export geojson" button that calls `geoman.features.exportGeojson()` and presents the stringified geojson in a div.

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Add your Mapbox access token to `main.js` (replace `'YOUR_MAPBOX_ACCESS_TOKEN'`)
4. Start the development server: `npm run dev`

## Known issues

When drawing point features using the circle tool, they remain orange in the UI (meaning they are in the "temporary" source/layers for some reason). 



