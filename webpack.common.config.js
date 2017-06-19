const path = require('path');
const dotenv = require('dotenv');

/* eslint-disable no-console */

try {
  dotenv.config();
} catch (e) {
  console.log('no .env file found, skipping dotenv');
  console.log('expecting API server at http://localhost:3000');
}

const uglifyJsConfig = {
  compress: {
    warnings: false,
    screw_ie8: true,
    conditionals: true,
    unused: true,
    comparisons: true,
    sequences: true,
    dead_code: true,
    evaluate: true,
    if_return: true,
    join_vars: true,
  },
  output: {
    comments: false,
  },
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv !== 'development';
const buildPath = path.join(__dirname, './build');
const ckeditorPath = path.join(__dirname, './node_modules/ckeditor');
const ckeditorCustomPluginsPath = path.join(__dirname, './src/js/components/FormElements/CKEditor/plugins');

const vendorManifestPath = path.join(__dirname, './build/vendor-manifest.json');
const cssManifestPath = path.join(__dirname, './build/vendorCss-manifest.json');
const vendorDllPath = path.join(__dirname, './build/vendor.dll.js');
const cssDllPath = path.join(__dirname, './build/vendorCss.dll.js');

const jsSourcePath = path.join(__dirname, './src/js');
const imgPath = path.join(__dirname, './src/assets/img');
const sourcePath = path.join(__dirname, './src');

const vendor = [
  'babel-polyfill',
  'ckeditor',
  'classnames',
  'lodash',
  'moment',
  'moment-timezone',
  'normalize-object',
  'prop-types',
  'query-string',
  'react',
  'react-collapse',
  'react-dom',
  'react-dropzone',
  'react-hot-loader',
  'react-moment',
  'react-motion',
  'react-redux',
  'react-router-dom',
  'react-router-redux',
  'react-sortable-hoc',
  'react-transition-group',
  'reactstrap',
  'redux',
  'redux-thunk',
  'seamless-immutable',
  'shortid',
  'store',
  'superagent',
  'uuid',
  'whatwg-fetch',
  'bootstrap',
];

module.exports = {
  uglifyJsConfig,
  buildPath,
  ckeditorPath,
  vendorDllPath,
  cssDllPath,
  ckeditorCustomPluginsPath,
  vendor,
  vendorManifestPath,
  cssManifestPath,
  jsSourcePath,
  imgPath,
  sourcePath,
  nodeEnv,
  isProduction,
};
