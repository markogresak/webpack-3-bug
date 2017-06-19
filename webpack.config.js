const fs = require('fs');
const path = require('path');
const glob = require('glob');

/* eslint-disable no-console */

const {
  vendorManifestPath,
  cssManifestPath,
  vendorDllPath,
  cssDllPath,
  buildPath,
  jsSourcePath,
  imgPath,
  sourcePath,
  nodeEnv,
  isProduction,
} = require('./webpack.common.config');

const cssPath = glob.sync(path.join(buildPath, './vendor-*.css'))[0];

function checkPathExists(p) {
  if (!fs.existsSync(p)) {
    console.error(`Manifest file not found at '${p}'. Please run 'yarn run build:dll' to build vendor dependencies.`);
    process.exit(1);
  }
}
[vendorManifestPath, cssManifestPath, cssPath].forEach(checkPathExists);

const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

const devPort = process.env.PORT || 8000;

const postcssOptions = {
  sourceMap: !isProduction,
  plugins: [
    autoprefixer({
      browsers: [
        'last 3 version',
        'ie >= 10',
      ],
    }),
  ],
};

// Common plugins
const plugins = [
  new webpack.DllReferencePlugin({
    manifest: require(vendorManifestPath), // eslint-disable-line
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    context: path.resolve(__dirname),
  }),
  new webpack.DllReferencePlugin({
    manifest: require(cssManifestPath), // eslint-disable-line
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    context: path.resolve(__dirname),
    scope: 'vendor-css',
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv),
      API_BASE: JSON.stringify(process.env.API_BASE || 'http://localhost:3000'),
    },
  }),
  new webpack.NamedModulesPlugin(),
  new HtmlWebpackPlugin({
    template: path.join(sourcePath, 'index.html'),
    path: buildPath,
    filename: 'index.html',
    favicon: '../assets/favicon.ico',
  }),
  new AddAssetHtmlPlugin([
    {
      filepath: require.resolve(vendorDllPath),
      includeSourcemap: false,
    },
    {
      filepath: require.resolve(cssDllPath),
      includeSourcemap: false,
    },
    {
      filepath: require.resolve(cssPath),
      includeSourcemap: false,
      typeOfAsset: 'css',
    },
  ]),
  new webpack.optimize.ModuleConcatenationPlugin(),
];

// Common rules
const rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [
      'react-hot-loader/webpack',
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: !isProduction,
        },
      },
    ],
  },
  {
    test: /\.(png|gif|jpg)$/,
    include: imgPath,
    use: 'url-loader?limit=20480&name=assets/[name]-[hash].[ext]',
  },
];

// Common entries
const entry = {
  js: [
    '../scss/app.scss',
    './index.js',
  ],
};

if (isProduction) {
  // Production plugins
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
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
    }),
    new ExtractTextPlugin('app-[hash].css')
  );

  // Production rules
  rules.push(
    {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          'css-loader?minimize',
          {
            loader: 'postcss-loader',
            options: postcssOptions,
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                path.join(sourcePath, './scss'),
                path.join(__dirname, 'node_modules'),
              ],
            },
          },
        ],
      }),
    }
  );
} else {
  // Development plugins
  plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );

  // Development rules
  rules.push(
    {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: [
        'style-loader',
        // Using source maps breaks urls in the CSS loader
        // https://github.com/webpack/css-loader/issues/232
        // This comment solves it, but breaks testing from a local network
        // https://github.com/webpack/css-loader/issues/232#issuecomment-240449998
        // 'css-loader?sourceMap',
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: postcssOptions,
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    }
  );

  entry.js = [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://0.0.0.0:${devPort}`,
    ...(Array.isArray(entry.js) ? entry.js : [entry.js]),
  ];
}

module.exports = {
  name: 'app',
  devtool: isProduction ? false : 'cheap-eval-source-map',
  cache: !isProduction,
  context: jsSourcePath,
  entry,
  output: {
    path: buildPath,
    publicPath: isProduction ? '/' : `http://localhost:${devPort}/`,
    filename: 'app-[hash].js',
  },
  module: {
    rules,
  },
  resolve: {
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  plugins,
  devServer: {
    contentBase: buildPath,
    historyApiFallback: true,
    port: devPort,
    compress: isProduction,
    inline: !isProduction,
    hot: !isProduction,
    host: '0.0.0.0',
    publicPath: '/',
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      },
    },
  },
};
