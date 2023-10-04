# Contributing to Gradio

![GitHub issues by-label](https://img.shields.io/github/issues/gradio-app/gradio/good%20first%20issue?color=fe7c01&link=https%3A%2F%2Fgithub.com%2Fgradio-app%2Fgradio%2Fissues%3Fq%3Dis%253Aopen%2Bis%253Aissue%2Blabel%253A%2522good%2Bfirst%2Bissue%2522)


More than 200 awesome developers have contributed to the `gradio` library, and we'd be thrilled if you would like to be the next contributor! 

Prerequisites:

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js v16.14+](https://nodejs.dev/en/download/package-manager/) (only needed if you are making changes to the frontend)
- [pnpm 8.1+](https://pnpm.io/8.x/installation) (only needed if you are making changes to the frontend)
 
## 🏡 Setup for local development

There are a few ways to install and run Gradio.

### 🛠️ Install Gradio locally from `main`

- Clone this repo
- Navigate to the repo directory and run

```bash
bash scripts/install_gradio.sh
```

- Build the front end

```
bash scripts/build_frontend.sh
```

-  Install development requirements

(Note that it is highly recommended to use a virtual environment running **Python 3.9** since the versions are pinned)

```
bash scripts/install_test_requirements.sh
```

If you have a different Python version and conflicting packages during the installation, please first run:

```
bash scripts/create_test_requirements.sh
```

### 📦 Using dev containers

You can alternatively use dev containers. This is supported on all platforms (macOS/Windows/Linux).

Prerequisites:

- An editor which supports dev containers, like VS Code
- Docker support on the host computer:
  - macOS: [Docker Desktop 2.0+](https://www.docker.com/products/docker-desktop/)
  - Windows: [Docker Desktop 2.0+](https://www.docker.com/products/docker-desktop/)
  - Linux: [Docker CE/EE 18.06+](https://docs.docker.com/get-docker/) and [Docker Compose 1.21+](https://docs.docker.com/compose/install/)
- If using VS Code, the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

Steps:

- Clone repository
- Open it in your editor
- For VS Code, execute `Dev Containers: Reopen in container` command

For detailed instructions, please see the [Dev Containers tutorial](https://code.visualstudio.com/docs/devcontainers/tutorial).

### 🧱 Structure of the Repository

If you're a newcomer to Gradio, we recommend getting familiar with the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to.

- `/gradio`: contains the Python source code for the library
  - `/gradio/interface.py`: contains the Python source code for the core `Interface` class
  - `/gradio/blocks.py`: contains the Python source code for the core `Blocks` class
  - `/gradio/components.py`: contains the Python source code for the `components`, you can add your custom components here.
- `/js`: contains the HTML/JS/CSS source code for the library ([start here for frontend changes](/js/README.md))
- `/test`: contains Python unit tests for the library
- `/demo`: contains demos that are used in the documentation, you can find `Gradio` examples over here.
- `/website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/website` folder for more details

### 🪄 Extra tidbits

- You can run gradio scripts in reload mode which will watch for changes in the `gradio` folder and reload the app if changes are made.

```
gradio app.py
```

- To develop the frontend app, you should also follow [js/README.md](js/README.md).

### 🧪 Testing

- To run all Python tests:

```
bash scripts/run_all_tests.sh
```

- To run the frontend unit tests:

```
pnpm test
```

- To run the browser tests:

```
pnpm test:browser
```

#### 🕸️ Gradio Website

We also welcome any contributions to our [website](https://www.gradio.app). 

First, build the CDN:

```
pnpm build:cdn-local
```
and get it up and running:
```
pnpm preview:cdn-local
```

This will serve a build of `gradio.js` on port `4321`. You can then navigate to `js/_website/src/routes/+layout.svelte` and replace the source of the website buid from:
```
<script type="module" src="https://gradio.s3-us-west-2.amazonaws.com/{version}/gradio.js"></script>
```
to 
```
<script type="module" src="http://localhost:4321/gradio.js"></script>
```

You should now be able to view a local version of the website at `http://localhost:4321`. 
#### 📚 Component Storybook

If you would like to fix or contribute something to our Storybook, you can get Storybook running with:

```
pnpm storybook
```

## 📮 Submitting PRs

All PRs should be against `main`, and ideally should address an open issue, unless the change is small. Direct commits to main are blocked, and PRs require an approving review to merge into main. By convention, the Gradio maintainers will review PRs when:

- An initial review has been requested
- A clear, descriptive title has been assigned to the PR
- A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, @dawoodkhan82, @pngwn, @freddyaboulton, @hannahblair) is tagged in the PR comments and asked to complete a review

 🧹 We ask that you make sure initial CI checks are passing before requesting a review. One of the Gradio maintainers will merge the PR when all the checks are passing.  You can safely ignore the Vercel and Spaces checks, which only run under maintainers' pull requests.  

Don't forget the format the backend before pushing:

```
bash scripts/format_backend.sh
```

```
bash scripts/format_frontend.sh
```

Thank you for taking the time to contribute to our project! 
## ❓ Need help getting started?

- Browse issues with the "good first issue" label. These are issues we think are good for newcomers.
- Ask the Gradio community in our [Discord](https://discord.com/invite/feTf9x3ZSB)
- Raise an issue for a feature or a bug you want to tackle

_Could these guidelines be clearer? Feel free to open a PR to help us faciltiate open-source contributions!_
