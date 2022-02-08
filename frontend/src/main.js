import App from './App.svelte';
import Login from "./Login.svelte";
import { fn } from "./api";

window.launchGradio = (config, element_query) => {
  let target = document.querySelector(element_query);
  if (config.root === undefined) {
    config.root = "BACKEND_URL";
  }
  if (window.gradio_mode === "app") {
    config.static_src = ".";
  } else if (window.gradio_mode === "website") {
    config.static_src = "/gradio_static";
  } else {
    config.static_src = "https://gradio.s3-us-west-2.amazonaws.com/PIP_VERSION";
  }
  if (config.css) {
    document.querySelector("style").innerHTML = config.css;
  }
  if (config.detail === "Not authenticated") {
    new Login({
      target: target,
      props: config
    });
  } else {
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
    config.fn = fn.bind(null, config.root + "api/");
    new App({
      target: target,
      props: config
    });
  }
}

window.launchGradioFromSpaces = async (space, target) => {
  const space_url = `https://huggingface.co/gradioiframe/${space}/+/`;
  let config = await fetch(space_url + "config");
  config = await config.json();
  config.root = space_url;
  config.space = space;
  launchGradio(config, target);
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