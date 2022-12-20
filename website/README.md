# The Gradio Website

The Gradio website ([https://gradio.app](https://gradio.app)) is built from the contents of this folder. The website is tightly coupled with the rest of the repository through several ways:

- The documentation loaded from the docstrings of the objects themselves, and is generated using the gradio library in the gradio folder of this repository. If you want to see changes you made to the docstrings in the library, please install an editable version of the library from root of the directory: `pip install gradio -e .`
- The demos are loaded from the `gradio/demo` folder, hosted on spaces, and linked to the documentation in the docstrings of the documented object. 
- The guide pages are loaded from the `gradio/guides` folder

The website is launched through the `docker-compose.yml` file in this directory. 

You can run the entire website by:
- Installing nginx
- Copying gradio.nginx.conf from this folder to /etc/nginx/conf.d/gradio.nginx.conf 
- Running `docker-compose build && docker-compose up`
- (Re)starting nginx

This will serve the website on port 80 (you can change the port from the gradio.nginx.conf file)

Alternatively, for development, read the `homepage` section below:

## The `homepage` docker

The homepage folder builds the static content of the website into standalone files, served by nginx in docker. For development purposes, instead of running docker to test changes, just run `sh scripts/launch_website.sh` from the root of the repo. The steps in that script are the following: 

- `npm install`
- `npm run build --url=https://gradio-main-build.s3.amazonaws.com/XXX/`

Note that the url arg above is required but, when running locally and without docker, it's only used for the install instructions on `/docs/main`. 

The website will be built in the `gradio/website/homepage/build` directory. You can run a development server from this directory to launch the homepage, e.g. `python -m http.server`. See `gradio/website/homepage/package.json` for build steps.

## Auto-Reloading

The website is built from the main branch and automatically reloads on commits to main.
