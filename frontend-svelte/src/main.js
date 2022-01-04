import App from './App.svelte';

window.launchGradio = (config, element_query) => {
  let target = document.querySelector(element_query);
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