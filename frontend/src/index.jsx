import React from 'react';
import ReactDOM from 'react-dom';
import GradioInterface from './gradio';

fetch(process.env.REACT_APP_BACKEND_URL + "/config")
  .then(config => config.json())
  .then(config => {
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
    ReactDOM.render(
      <GradioInterface {...config} fn={fn} />,
      document.getElementById('root')
    );    
  })
