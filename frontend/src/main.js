import App from './App.svelte';
import Page from './Page.svelte';
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
    let style = document.createElement("style");
    style.innerHTML = config.css;
    document.head.appendChild(style);
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
    if (url.searchParams.get("page") === "1") {
      config = {
        ...config,
        components: [
          { id: 1, name: "markdown", type: "static", props: {content: "<h1 style='font-weight: bold; font-size: 2rem; margin-bottom: 0.5rem'>Detect Disease ...</h1>"}},
          { id: 2, name: "checkboxgroup", type: "input", props: {choices: ["Covid", "Malaria", "Lung Cancer"], label: "Disease to Scan For", default: []}},
          { id: 3, name: "markdown", type: "static", props: {content: "<p>Upload an X-ray Image</p>"}},
          { id: 4, name: "image", type: "input" },
          { id: 5, name: "json", type: "output" },
          { id: 6, name: "button", type: "static", props: {label: "Run"}},
          { id: 7, name: "markdown", type: "static", props: {content: "<p>Upload a CT Scan</p>"}},
          { id: 8, name: "image", type: "input" },
          { id: 9, name: "json", type: "output" },
          { id: 10, name: "button", type: "static", props: {label: "Run"}},
          { id: 11, name: "textbox", type: "output" },
        ],
        layout: {
          type: "column",
          children: [
            1, 2,
            {
              type: "tabset",
              children: [{
                type: "column",
                name: "X-ray",
                children: [
                  3,
                  {
                    type: "row",
                    children: [4, 5],
                  },
                  6
                ]
              },
              {
                type: "column",
                name: "CT Scan",
                children: [
                  7,
                  {
                    type: "row",
                    children: [8, 9]
                  },
                  10
                ]
              },]
            },
            11
          ]
        },
        dependencies: [
          { trigger: "click", targets: [6], inputs: [2, 4], outputs: [5] },
          { trigger: "click", targets: [10], inputs: [2, 8], outputs: [9] },
          { trigger: "change", targets: [5, 9], inputs: [5, 9], outputs: [11] },
        ]
      }
      config.fn = async (fn_index, inputs) => {
        let result = {};
        for (let disease of inputs[0]) {
          result[disease] = Math.random();
        }
        return [result];
      }
      new Page({
        target: target,
        props: config
      });
    } else {
      new App({
        target: target,
        props: config
      });
    }
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