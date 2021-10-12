# Gradio Frontend

This directory contains a React App that renders the frontend of the gradio framework.

## Development Setup

To make changes to the gradio frontend, you will need to have the following installed
- npm / node
- python3
- gradio

Once node is installed, make sure to run `npm install` in this directory to install the node packages.

Because this is only the frontend of the library, you must first launch a Gradio interface running on port 7860, which will be used as a backend. You can use any of the demo projects in the gradio/demo folder to serve this backend role, but make sure that the port is set to 7860. Then you launch the development frontend by running `npm run start`. Once this is run, the frontend development will launch on port 3000. It will connect with port 7860 to load the initial configuration and make API calls on submit. 

As a Create-React-App, any changes you make in the code will automatically reflect in the development frontend.

## Committing Changes

In production, the frontend is compiled and stored in the gradio/gradio/frontend directory. (This readme is in gradio/frontend, a different directory outside the python package). To compile, run `npm run build`. At the end of the process, you should see the message "Compiled successfully" - there may be an warning or error thrown about not being able to find bundle.css which you can ignore. To include the compiled js into your local python version of gradio, run `python3 setup.py install` and then launch a gradio interface. Your changes should be visible on port 7860.
