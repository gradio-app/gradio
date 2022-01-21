import App from './App.svelte';
import { fn } from "./api";

window.launchGradio = (config, element_query) => {
  let target = document.querySelector(element_query);
  let url = new URL(window.location.toString());
  if (config.theme !== null && config.theme.startsWith("dark")) {
    target.classList.add("dark");
    config.dark = true;
    if (config.theme === "dark") {
      config.theme = "default";
    } else {
      config.theme = config.theme.substring(5);
    }
  } else if (url.searchParams.get("__dark-theme") === "true") {
    config.dark = true;
    target.classList.add("dark");
  }
  if (config.root === undefined) {
    config.root = "BACKEND_URL";
  }
  config.fn = fn.bind(null, config.root + "api/");
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