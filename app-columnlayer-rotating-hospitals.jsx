import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';
import {LinearInterpolator} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';


const DATA_URL = 'https://raw.githubusercontent.com/onefact/maps.payless.health/main/data/newyork_hospitals.json';
  //'https://raw.githubusercontent.com/onefact/maps.payless.health/main/data/hexagons.json'; // eslint-disable-line

const transitionInterpolator = new LinearInterpolator();

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
  latitude: 40.7368521,
  longitude: -73.9936065,
  zoom: 11,
  pitch: 60,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Colors for the breaks of the polygon layer
const POLYGON_COLORS = {
  COLOR_1: [225, 83, 131],
  COLOR_2: [241, 109, 122],
  COLOR_3: [250, 138, 118],
  COLOR_4: [255, 166, 121],
  COLOR_5: [255, 194, 133],
  COLOR_6: [255, 221, 154],
  OTHER: [254, 246, 181]
};

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

({object}) => object && `height: ${object.value * 30}m`
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
    Name: ${object.name}
    Address: ${object.address}
    Ownership type: ${object.ownership}
    Median wait time: ${Number.isFinite(object.value) ? 1 * object.value.toFixed(3): ''} minutes
    Readmission rate: ${Number.isFinite(object.readmission_rate) ? 1 * object.readmission_rate.toFixed(3): ''}%
    `;
}

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  mapStyle = MAP_STYLE,
  radius = 1000,
  upperPercentile = 100,
  coverage = 1
}) {
  const [viewState, updateViewState] = useState(INITIAL_VIEW_STATE);

  const rotateCamera = useCallback(() => {
    updateViewState(v => ({
      ...v,
      bearing: v.bearing + 0.5,
      transitionDuration: 1000,
      transitionInterpolator,
      onTransitionEnd: rotateCamera
    }));
  }, []);

  const layers = [
    new ColumnLayer({
      id: 'column',
      diskResolution: 12,
      elevationScale: 100,
      extruded: true,
      data: DATA_URL,
      getElevation: d => (d.value - 117.0) * 0.3,
      getFillColor: object => {
        console.log(object.value)
        if (object.value > 220) {
          return POLYGON_COLORS.COLOR_1;
        } else if (object.value > 200) {
          return POLYGON_COLORS.COLOR_2;
        } else if (object.value > 180) {
          return POLYGON_COLORS.COLOR_3;
        } else if (object.value > 160) {
          return POLYGON_COLORS.COLOR_4;
        } else if (object.value > 140) {
          return POLYGON_COLORS.COLOR_5;
        } else if (object.value > 120) {
          return POLYGON_COLORS.COLOR_6;
        }
        return POLYGON_COLORS.OTHER;
      },
      // getFillColor: d => [48, 128, d.value * 255, 255],
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
      },
    })
  ];

  return (
    <DeckGL
      layers={layers}
      effects={[lightingEffect]}
      viewState={viewState}
      controller={true}
      getTooltip={getTooltip}
      onLoad={rotateCamera}
      onViewStateChange={v => updateViewState(v.viewState)}
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);
}