const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  webpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      }),
      new MiniCssExtractPlugin({
        filename: "static/bundle.css",
        chunkFilename: "static/css/[name].chunk.css"
      })
    ],
    eslint: {
      enable: true /* (default value) */,
      mode: "extends" /* (default value) */ || "file"
    },
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.optimization = {
        splitChunks: {
          cacheGroups: {
            default: false
          }
        },
        runtimeChunk: false
      };
      webpackConfig.entry = "./src/index";
      webpackConfig.output = {
        publicPath: "",
        path: path.resolve(__dirname, "../gradio/templates/frontend"),
        filename: "static/bundle.js",
        chunkFilename: "static/js/[name].chunk.js"
      };
      paths.appBuild = webpackConfig.output.path;
      return webpackConfig;
    }
  },
  style: {
    postcss: {
      plugins: [require("postcss-prefixwrap")(".gradio_app"), require("tailwindcss"), require("autoprefixer")]
    }
  }
};
