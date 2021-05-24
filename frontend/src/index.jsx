import React from 'react';
import ReactDOM from 'react-dom';
import GradioInterface from './gradio';

let fn = async (data, action) => {
  const output = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/" + action + "/", {
    method: "POST",
    body: JSON.stringify({ "data": data }),
    headers: {
      'Content-Type': 'application/json',
    }
  });
  return await output.json();
}

if (process.env.REACT_APP_BACKEND_URL) { // dev mode
  fetch(process.env.REACT_APP_BACKEND_URL + "/config")
    .then(config => config.json())
    .then(config => {
      ReactDOM.render(
        <GradioInterface {...config} fn={fn} />,
        document.getElementById('root')
      );
    })
} else { // prod mode
  ReactDOM.render(
    <GradioInterface {...window.config} fn={fn} />,
    document.getElementById('root')
  );
}