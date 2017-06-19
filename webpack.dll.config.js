const webpack = require('webpack');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

const {
  uglifyJsConfig,
  buildPath,
  ckeditorPath,
  ckeditorCustomPluginsPath,
  vendor,
  isProduction,
} = require('./webpack.common.config');

module.exports = {
  name: 'vendor',
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader?minimize',
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: false,
                plugins: [
                  autoprefixer({
                    browsers: [
                      'last 3 version',
                      'ie >= 10',
                    ],
                  }),
                ],
              },
            },
            'sass-loader',
          ],
        }),
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?name=vendor-[name].[ext]',
      },
      {
        test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'file-loader?name=vendor-[name].[ext]',
      },
    ],
  },
  entry: {
    vendor,
    vendorCss: ['./src/scss/vendor.scss'],
  },
  output: {
    path: buildPath,
    filename: '[name].dll.js',
    library: '[name]_[hash]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(buildPath, '[name]-manifest.json'),
      name: '[name]_[hash]',
    }),
    ...(isProduction ? [new webpack.optimize.UglifyJsPlugin(uglifyJsConfig)] : []),
    new ExtractTextPlugin('vendor-[hash].css'),
    // new CopyWebpackPlugin([
    //   {
    //     from: ckeditorPath,
    //     to: 'ckeditor',
    //     toType: 'dir',
    //   },
    //   {
    //     from: ckeditorCustomPluginsPath,
    //     to: 'ckeditor/plugins',
    //     toType: 'dir',
    //   },
    // ]),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_BASE: JSON.stringify(process.env.API_BASE || 'http://localhost:3000'),
      },
    }),
  ],
  resolve: {
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    alias: {
      'react-addons-css-transition-group': 'react-transition-group/CSSTransitionGroup',
      'react-addons-transition-group': 'react-transition-group/TransitionGroup',
    },
  },
};
