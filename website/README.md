# The Gradio Website

The Gradio website ([https://gradio.app](https://gradio.app)) is built from the contents of this folder. The website is tightly coupled with the rest of the repository through several ways:

- The gradio library used to run the demos throughout the website is built from the library in the gradio folder of this repository
- The demos are loaded from the `gradio/demo` folder
- The guide pages are loaded from the `gradio/guides` folder
- The documentation is loaded from the docstrings in the library itself.

The website is launched through the `docker-compose.yml` file in this directory. 

You can run the entire website by:
- Installing nginx
- Copying gradio.nginx.conf from this folder to /etc/nginx/conf.d/gradio.nginx.conf 
- Running `docker-compose build && docker-compose up`
- (Re)starting nginx

This will serve the website on port 80 (you can change the port from the gradio.nginx.conf file)

Alternatively, for development, read the `homepage` section below:

## The `homepage` docker

The homepage folder builds the static content of the website into standalone files, served by nginx in docker. For development purposes, instead of running docker to test changes, follow these steps in the `gradio/website/homepage` folder.

- `npm install`
- `npm run build` (or `npm run build-mac` on Mac OSX)

The website will be built in the `gradio/website/homepage/build` directory. You can run a development server from this directory to launch the homepage, e.g. `python -m http.server`. See `gradio/website/homepage/package.json` for build steps.

## The `demos` docker

The demos folder launches all the demos embedded inside the website. The demos are loaded from the `gradio/demo` folder.

## Auto-Reloading

The website is built from the main branch and automatically reloads on commits to main.
