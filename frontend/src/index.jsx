import React from "react";
import ReactDOM from "react-dom";
import { GradioPage } from "./gradio";
import Login from "./login";

function delay(n) {
  return new Promise(function(resolve){
      setTimeout(resolve,n*1000);
  });
}

let postData = async (url, body) => {
  const output = await fetch(
    process.env.REACT_APP_BACKEND_URL + url,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {"Content-Type": "application/json"}
    }
  );
  return output;
}

let fn = async (queue, data, action, queue_callback) => {
  if (queue && ["predict", "interpret"].includes(action)) {
    const output = await postData(
      "api/queue/push/", { data: data, action:action },
    );
    let hash = await output.text();
    let status = "UNKNOWN";
    while (status != "COMPLETE" && status != "FAILED") {
      if (status != "UNKNOWN") {
        await delay(1);
      }
      const status_response = await postData(
        "api/queue/status/", { hash: hash },
      );
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
    const output = await postData(
      "api/" + action + "/", { data: data },
    );
    return await output.json();  
  }
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
      <GradioPage {...config} fn={fn.bind(null, config.queue)} />,
      document.getElementById("root")
    );
  }
});
