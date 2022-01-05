import App from './App.svelte';
import { fn } from "./api";

window.launchGradio = (config, element_query) => {
  let target = document.querySelector(element_query);
  if (config.dark_mode) {
    target.classList.add("dark");
  }
  config.fn = fn.bind(null, "BACKEND_URL" + "api/");
  const app = new App({
    target: target,
    props: config
  });
}

async function get_config() {
  if ('BUILD_MODE' === "dev") {
    let config = await fetch("BACKEND_URL" + "config");
    config = await config.json();
    return config;
  } else {
    return window.gradio_config;
  }
}

if (window.gradio_mode == "app") {
  get_config().then((config) => {
    launchGradio(config, "#root");
  });
}