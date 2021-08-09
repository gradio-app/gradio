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
    configure: {
      optimization: {
        splitChunks: {
          cacheGroups: {
            default: false
          }
        },
        runtimeChunk: false
      },
      entry: "./src/index",
      output: {
        publicPath: "",
        path: path.resolve(__dirname, "../gradio/frontend"),
        filename: "static/bundle.js",
        chunkFilename: "static/js/[name].chunk.js"
      }
    }
  },
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")]
    }
  }
};
