import "./public-path";
import React from "react";
import ReactDOM from "react-dom";
import { GradioPage } from "./gradio";
import Login from "./login";

function delay(n) {
  return new Promise(function (resolve) {
    setTimeout(resolve, n * 1000);
  });
}

let postData = async (url, body) => {
  const output = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
  return output;
};

let fn = async (api_endpoint, data, action, queue, queue_callback) => {
  if (queue && ["predict", "interpret"].includes(action)) {
    data["action"] = action;
    const output = await postData(api_endpoint + "queue/push/", data);
    const output_json = await output.json();
    let [hash, queue_position] = [
      output_json["hash"],
      output_json["queue_position"]
    ];
    queue_callback(queue_position, /*is_initial=*/ true);
    let status = "UNKNOWN";
    while (status != "COMPLETE" && status != "FAILED") {
      if (status != "UNKNOWN") {
        await delay(1);
      }
      const status_response = await postData(api_endpoint + "queue/status/", {
        hash: hash
      });
      var status_obj = await status_response.json();
      status = status_obj["status"];
      if (status === "QUEUED") {
        queue_callback(status_obj["data"]);
      } else if (status === "PENDING") {
        queue_callback(null);
      }
    }
    if (status == "FAILED") {
      throw new Error(status);
    } else {
      return status_obj["data"];
    }
  } else {
    const output = await postData(api_endpoint + action + "/", data);
    return await output.json();
  }
};

window.launchGradio = (config, element_query, space) => {
  let target = document.querySelector(element_query);
  target.classList.add("gradio_app");
  if (config.auth_required) {
    ReactDOM.render(
      <div
        class="gradio_wrapper"
        style={{ height: window.gradio_mode === "app" ? "100%" : "auto" }}
      >
        <Login {...config} />
      </div>,
      target
    );
  } else {
    if (config.css !== null) {
      var head = document.head || document.getElementsByTagName("head")[0],
        style = document.createElement("style");
      head.appendChild(style);
      style.appendChild(document.createTextNode(config.css));
    }
    let url = new URL(window.location.toString());
    if (config.theme !== null && config.theme.startsWith("dark")) {
      target.classList.add("dark");
      if (config.theme === "dark") {
        config.theme = "default";
      } else {
        config.theme = config.theme.substring(5);
      }
    } else if (url.searchParams.get("__dark-theme") === "true") {
      target.classList.add("dark");
    }
    if (!config.root) {
      config.root = process.env.REACT_APP_BACKEND_URL;
    }
    ReactDOM.render(
      <div
        class="gradio_wrapper"
        style={{ height: window.gradio_mode === "app" ? "100%" : "auto" }}
      >
        <GradioPage
          {...config}
          space={space}
          fn={fn.bind(null, config.root + "api/")}
        />
      </div>,
      target
    );
  }
};

window.launchGradioFromSpaces = async (space, target) => {
  const space_url = `https://huggingface.co/gradioiframe/${space}/+/`;
  let config = await fetch(space_url + "config");
  config = await config.json();
  config.root = space_url;
  launchGradio(config, target, space);
};

async function get_config() {
  if (process.env.REACT_APP_BACKEND_URL) {
    // dev mode
    let config = await fetch(process.env.REACT_APP_BACKEND_URL + "config");
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
