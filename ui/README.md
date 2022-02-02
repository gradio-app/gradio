# gradio-ui

This folder contains all of the Gradio UI and component source code.

## set up

This folder is managed as 'monorepo' a multi-package repository which make dependency management very simple. In order to do this we use `pnpm` as our package manager.

Make sure [`pnpm`](https://pnpm.io/) is installed by [following the installation instructions for your system](https://pnpm.io/installation).

You will also need `node` which you probably already have

## running the application

Install all dependencies from the `ui` folder:

```bash
cd ui
pnpm i
```

This will install the dependencies for all packages within the `ui` folder and link any local packages

## local development

To develop locally, open two browser tabs from the root of the repository.

Run the python test server:

```bash
cd demo/kitchen_sink
python run.py
```

This will start a development server on port `7863` that the web app is expecting.

Run the web app:

```bash
cd ui
pnpm dev
```

## building for production

From the `ui` folder run the build.

```bash
cd ui
pnpm build
```

This will create the necessary files in `ui/app/public` and also in `gradio/templates/frontend`.
