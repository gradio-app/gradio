# The Gradio Website

The Gradio website ([https://gradio.app](https://gradio.app)) is built from the contents of this folder. The website is tightly coupled with the rest of the repository through several ways:

- The gradio library used to run the demos throughout the website is built from the library in the gradio folder of this repository
- The demos are loaded from the `gradio/demo` folder
- The guide pages are loaded from the `gradio/guides` folder
- The documentation is loaded from the docstrings in the library itself.

The website is launched through the `docker-compose.yml` file in this directory. 

## The `homepage` docker

The homepage folder builds the static content of the website into standalone files, served by nginx in docker. For development purposes, instead of running docker to test changes, follow these steps in the `gradio/website/homepage` folder.

- `npm install`
- `npm run build` (or `npm run start` for automatic reload on change). 

The website will be built in the `gradio/website/homepage/dist` directory. You can run a development server from this directory to launch the homepage, e.g. `python -m http.server`. See `gradio/website/homepage/package.json` for build steps.

## The `demos` docker

The demos folder launches all the demos embedded inside the website. The demos are loaded from the `gradio/demo` folder.

## The `upload_notebooks` folder

The upload_notebooks folder runs a script that uploads the demos within `gradio/demo` to Google Colab. The links generated from uploading these files are then stored in the docker env file, which is then used by the `homepage` docker container to link to the Colab notebooks from the documentation.

## Auto-Reloading

The website is built from the master branch and automatically reloads on commits to master.
