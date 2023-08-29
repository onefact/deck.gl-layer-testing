import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {ColumnLayer} from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';

import {csv} from 'd3-request';

const DATA_URL =
  'https://raw.githubusercontent.com/onefact/maps.payless.health/main/data/hexagons.json'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
};

const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 11,
  maxZoom: 20,
  pitch: 30,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

({object}) => object && `height: ${object.value * 5000}m`
function getTooltip({object}) {
  if (!object) {
    return null;
  }
  // const lat = object.centroid.position[1];
  // const lng = object.centroid.position[0];
  // const count = object.points.length;
    // latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    // longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    // ${count} Accidents`;
  return `\
    height: ${Number.isFinite(object.value) ? 5000 * object.value.toFixed(3): ''}m`;
}

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  mapStyle = MAP_STYLE,
  radius = 1000,
  upperPercentile = 100,
  coverage = 1
}) {
  console.log(data)
  const layers = [
    new ColumnLayer({
      id: 'column',
      diskResolution: 12,
      elevationScale: 100,
      extruded: true,
      data: DATA_URL,
      getElevation: d => d.value * 50,
      getFillColor: d => [48, 128, d.value * 255, 255],
      getLineColor: [0, 0, 0],
      getLineWidth: 20,
      getPosition: d => d.centroid,
      pickable: true,
      radius: 250,
      transitions: {
        getElevation: {
          duration: 1000,
          enter: () => [0]
        }
      }
    })
  ];

  return (
    <DeckGL
      layers={layers}
      effects={[lightingEffect]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);
}