import React from "react";
import ReactDOM from "react-dom";
import { GradioPage } from "./gradio";
import Login from "./login";

let fn = async (data, action) => {
  const output = await fetch(
    process.env.REACT_APP_BACKEND_URL + "api/" + action + "/",
    {
      method: "POST",
      body: JSON.stringify({ data: data }),
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return await output.json();
};

async function get_config() {
  if (process.env.REACT_APP_BACKEND_URL) {
    // dev mode
    let config = await fetch(process.env.REACT_APP_BACKEND_URL + "config");
    config = await config.json();
    return config;
  } else {
    return window.config;
  }
}

get_config().then((config) => {
  if (config.auth_required) {
    ReactDOM.render(<Login {...config} />, document.getElementById("root"));
  } else {
    if (config.css !== null) {
      var head = document.head || document.getElementsByTagName("head")[0],
        style = document.createElement("style");
      head.appendChild(style);
      style.appendChild(document.createTextNode(config.css));
    }
    ReactDOM.render(
      <GradioPage {...config} fn={fn} />,
      document.getElementById("root")
    );
  }
});
