/**
 * Configs file for bundling
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var pkg = require('./package.json');
var webpack = require('webpack');

var SafeUmdPlugin = require('safe-umd-webpack-plugin');

var isProduction = process.argv.indexOf('--production') >= 0;

var FILENAME = pkg.name + (isProduction ? '.min.js' : '.js');
var BANNER = [
    FILENAME,
    '@version ' + pkg.version,
    '@author ' + pkg.author,
    '@license ' + pkg.license
].join('\n');

var config = {
    eslint: {
        failOnError: isProduction
    },
    entry: './src/js/index.js',
    output: {
        library: ['tui', 'util'],
        libraryTarget: 'umd',
        path: 'dist',
        publicPath: 'dist',
        filename: FILENAME
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /(bower_components|node_modules)/,
                loader: 'eslint-loader'
            }
        ]
    },
    plugins: [
        new SafeUmdPlugin(),
        new webpack.BannerPlugin(BANNER)
    ]
};

if (isProduction) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            'screw_ie8': false
        }
    }));
}

module.exports = config;
