if (window.gradio_mode === "app") {
  __webpack_public_path__ = "";
} else if (window.gradio_mode === "website") {
  __webpack_public_path__ = "/gradio_static/";
} else {
  __webpack_public_path__ =
    "https://gradio.s3-us-west-2.amazonaws.com/" +
    process.env.REACT_APP_VERSION +
    "/";
}
