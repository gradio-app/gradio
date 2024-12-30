# Contributing to Gradio

![GitHub issues by-label](https://img.shields.io/github/issues/gradio-app/gradio/good%20first%20issue?color=fe7c01&link=https%3A%2F%2Fgithub.com%2Fgradio-app%2Fgradio%2Fissues%3Fq%3Dis%253Aopen%2Bis%253Aissue%2Blabel%253A%2522good%2Bfirst%2Bissue%2522)


More than 300 awesome developers have contributed to the `gradio` library, and we'd be thrilled if you would like to be the next contributor! 

**Prerequisites**:

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js v16.14+](https://nodejs.dev/en/download/package-manager/) (only needed if you are making changes to the frontend)
- [pnpm 8.1+](https://pnpm.io/8.x/installation) (only needed if you are making changes to the frontend)

**Steps to Contribute**:

Generally speaking, contributing to Gradio involves four steps:

1. Identify a good issue to contribute to (such as any of the issues [tagged with "good first issue"]())
2. Setup Gradio locally
3. Understand the structure of the codebase & make the changes to the codebase locally
4. Open a pull request (PR) to upstream your changes to the Gradio repository

**Note:** We welcome meaningful contributions that solve real issues and improve the codebase. Please avoid opening PRs with content generated primarily by AI language models. All contributions should demonstrate clear understanding of the problem being solved and be consistent with the relevant sections of the Gradio codebase.

You can watch this short video walkthrough of how to contribute, or keep reading below:

<a href="https://www.youtube.com/watch?v=YTjwTe5Yurs&ab_channel=HuggingFace" target="_blank">
<img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/contributing-video-screenshot.png" style="width:100%">
</a>

## 🏡 Setup Gradio locally

There are a few ways to install and run Gradio.

### 🛠️ Install Gradio from `main`

- Clone this repo
- Navigate to the repo directory and run:
<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```bash
bash scripts/install_gradio.sh
```
  </td>
  <td>

```bash
scripts\install_gradio.bat
```
  </td>
  </tr>
</table>

- Run the frontend (only required if you are making changes to the frontend and would like to preview them)
<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```bash
bash scripts/run_frontend.sh
```
  </td>
  <td>
  
```bash
scripts\run_frontend.bat
```
  </td>
  </tr>
</table>

-  Install test requirements (only required if you want to run tests locally)

(Note that it is highly recommended to use a virtual environment running **Python 3.10** since the versions of Gradio's dependencies are pinned)

<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```bash
bash scripts/install_test_requirements.sh
```
  </td>
  <td>
  
```bash
scripts\install_test_requirements.bat
```
  </td>
  </tr>
</table>

If you have a different Python version and conflicting packages during the installation, please first run:

<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```bash
bash scripts/create_test_requirements.sh
```
  </td>
  <td>
  
```bash
scripts\create_test_requirements.bat
```
  </td>
  </tr>
</table>


### 📦 Using dev containers

Instead of installing Gradio locally, you can alternatively use dev containers. This is supported on all platforms (macOS/Windows/Linux), as well as on GitHub Codespaces. 

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

## 🧱 Structure of the Repository

If you're a newcomer to Gradio, we recommend getting familiar with the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to.

- `/gradio`: contains the Python source code for the library
  - `/gradio/interface.py`: contains the Python source code for the core `Interface` class
  - `/gradio/blocks.py`: contains the Python source code for the core `Blocks` class
  - `/gradio/components/`: the directory that contains the Python source code for all of the Gradio components.
- `/test`: contains Python unit tests for the library
- `/js`: contains the HTML/JS/CSS source code for the library, including the fronted code for each component in a separate directory
  - `/js/_website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/js/_website` folder for more details
- `/guides`: the written guides and tutorials that are found on Gradio's website.

## 🚀 Run a Gradio app

You can get started by creating an `app.py` file in the root:

```py
import gradio as gr

with gr.Blocks() as demo:
   gr.Button()
    
if __name__ == "__main__":
   demo.launch()
```

then run:

```
gradio app.py
```

This will start the backend server in reload mode, which will watch for changes in the `gradio` folder and reload the app if changes are made. By default, Gradio will launch on port 7860. You can also just use `python app.py`, but this won't automatically trigger updates. 

Note: if you have `gradio` installed elsewhere in your system, you may need to uninstall it or at least make sure your `PYTHONPATH` includes the directory where the Gradio repository is cloned, e.g.,
`export PYTHONPATH="./"`


If you're making frontend changes, start the frontend server:


<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```bash
bash scripts/run_frontend.sh
```
  </td>
  <td>
  
```bash
scripts\run_frontend.bat
```
  </td>
  </tr>
</table>

This will open a separate browser tab. By default, Gradio will launch this on port 9876. Any changes to the frontend will also reload automatically in the browser. For more information about developing in the frontend, you can refer to [js/README.md](js/README.md).

We also have demos of all our components in the `/gradio/demo` directory. To get our simple gradio Chatbot running locally:

```
gradio demo/chatbot_simple/run.py
```


## 🧪 Testing

We use Pytest, Playwright and Vitest to test our code. 

- The Python tests are located in `/test`. To run these tests:

<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```
bash scripts/run_backend_tests.sh
```
  </td>
  <td>
  
```bash
scripts\run_backend_tests.bat
```
  </td>
  </tr>
</table>

- The frontend unit tests are any defined with the filename `*.test.ts`. To run them:

```
pnpm test
```

- Browser tests are located in `js/spa/test` and are defined as `*spec.ts` files. To run browser tests:

```
pnpm test:browser
```

To build the frontend code before running browser tests:

```
pnpm test:browser:full
```

You can also run browser tests in the UI mode by adding the `--ui` flag: 

```
pnpm test:browser --ui
```

If you have made any significant visual changes to a component, we encourage you to add a new Storybook story or amend an existing one to reflect them. You can create a new story with a `*.stories.svelte` file. You can run the storybook locally:

```
pnpm storybook
```

## ✍️ Gradio Website & Docs 

We also welcome any contributions to our [website](https://www.gradio.app) and [docs](https://www.gradio.app/docs). 

### Building The Website

All of the website code lives in the `js/_website/` directory. 

To start the website on dev mode simply cd into this directory and run: 

```
pnpm i 
pnpm dev
```

This will serve the website on `http://localhost:5173/` (or the next available port). 

When you're done with changes and want to build the website you can run: 

```
pnpm build && pnpm preview 
```

This will serve the website on `http://localhost:4173/` (or the next available port). 

### Documentation
#### API Reference 

Gradio's [API reference](https://www.gradio.app/docs/gradio/interface) is built from templates written in [mdsvex](https://mdsvex.pngwn.io/). You can find all the templates in this directory: 

```
js/_website/src/lib/templates/gradio
```

The templates directory is structured as follows: 

```
├── gradio/
│   ├── 01_building-demos/
│   │   ├── 01_interface.svx
│   │   ├── 02_chatinterface.svx
│   │   ├── 03_tabbedinterface.svx
│   │   ├── 04_blocks.svx
│   ├── 02_blocks-layout/
│   ├── 03_components/
│   ├── 04_helpers/
│   ├── 05_modals/
│   ├── 06_routes/
│   ├── other/
```

This structure defines the pages' ordering. You can use a numeral prefix (XX_) before a name to dictate where a page is listed, but it's otherwise ignored in the url route. Note that the folder names (01_building-demos, etc) are only used for the navbar and are not in the url.

The mdsvex files use a combination of markdown and svelte. They also pull documentation directly from the source code. Adding a `@document()` wrapper around any class or function in the source code will make its docstrings available in the templates. 

Here's an example: the template for [Image docs](https://www.gradio.app/docs/gradio/image) is [here](https://github.com/gradio-app/gradio/blob/main/js/_website/src/lib/templates/gradio/03_components/image.svx). You can see the initialization section references `obj.parameters`. So to edit the description of a parameter you'll have to edit the docstring in the [source code](https://github.com/gradio-app/gradio/blob/main/gradio/components/image.py). But the page also includes a section titled 'GIF and SVG Image Formats' which is written in plain markdown and can be edited directly on the template. 

If you are making changes to docstrings and want to see them on the website you have to make sure you're on an editable install of the gradio library. Just run this command from root:

```
pip install -e . 
```

And then from the website directory: 

```
pnpm dev
```

#### Guides 

Guides like [Quickstart](https://www.gradio.app/guides/quickstart) are built from this directory: `/guides`. The directory follows the same structure as the API reference templates, with nested folders and numerical prefixes for ordering, but the files are standard markdown files. After adding a new guide, or editing an existing one, to see the changes on the website make sure you are on an editable install of the gradio library. Run this command from root: 

```
pip install -e . 
```

and then from the website directory: 

```
pnpm dev
```

#### Main vs. Released 

The website supports documentation for both the latest released version on pypi as well as the main build on github. You can switch between them on the website by using the toggle on any page or by prefixing '/main' before the route in the url. For example: https://www.gradio.app/main/guides/quickstart 

If you're making changes to documentation and are wondering why they're not showing up, make sure you're looking at the 'main' version of the page. Since they haven't been included in a release yet, they will only be visible there. 

## 🌎 Gradio-Lite

Gradio-Lite is a Pyodide-based library that lets you run Gradio serverless (in other words, directly in your browser).

You can start the development server by running:
<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```
bash scripts/run_lite.sh
```
  </td>
  <td>
  
```bash
scripts\run_lite.bat
```
  </td>
  </tr>
</table>

If you make changes to the Python code during development, you will need to rebuild the Python packages loaded to Graio-Lite. To do this, run:
```
pnpm --filter @gradio/lite pybuild
```

To generate the release build, run:
<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```
bash scripts/build_lite.sh
```
  </td>
  <td>
  
```bash
scripts\build_lite.bat
```
  </td>
  </tr>
</table>
The release build will be located in the `dist` directory in the `js/lite` project.
To test it, you can run a local server in the `js/lite` directory:
```
python -m http.server --directory js/lite
```
and navigate to `http://localhost:8000` in your browser. The demo page `index.html` located in the `js/lite` directory will be loaded.

## 📮 Submitting PRs

All PRs should be submitted against `main`, and ideally should address an open issue, unless the change is small. Direct commits to main are blocked, and PRs require an approving review to merge into main. By convention, the Gradio maintainers will review PRs when:

- An initial review has been requested
- A clear, descriptive title has been assigned to the PR
- A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, @dawoodkhan82, @pngwn, @freddyaboulton, @hannahblair, @hysts, @whitphx) is tagged in the PR comments and asked to complete a review

 🧹 We ask that you make sure initial CI checks are passing before requesting a review. One of the Gradio maintainers will merge the PR when all the checks are passing.  You can safely ignore the Vercel and Spaces checks, which only run under maintainers' pull requests.  

Don't forget to format your code before pushing:

<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```
bash scripts/format_backend.sh
```
  </td>
  <td>
  
```bash
scripts\format_backend.bat
```
  </td>
  </tr>
</table>

And if you made changes to the frontend: 


<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```
bash scripts/format_frontend.sh
```
  </td>
  <td>
  
```bash
scripts\format_frontend.bat
```
  </td>
  </tr>
</table>

Thank you for taking the time to contribute to Gradio! 


## ❓ Need help getting started?

- Browse [issues](https://github.com/gradio-app/gradio/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) with the "good first issue" label. These are issues we think are good for newcomers.
- Ask the Gradio community in our [Discord](https://discord.com/invite/feTf9x3ZSB)
- Raise an issue for a feature or a bug you want to tackle

## 🚧 Troubleshooting
`ERROR: Error loading ASGI app. Could not import module "<filename>"`

Verify that you've used the correct filename of your gradio app, and that you're in the directory of the file. 

---

```ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL @self/spa@1.0.0 build:local: vite build --mode production:local --emptyOutDir "--emptyOutDir"```

Delete `/node_modules` and `pnpm-lock.yaml`:

```
rm -rf node_modules/
rm pnpm-lock.yaml
```

and run the install scripts:


<table>
  <tr>
  <th>MacOS / Linux</th>
  <th>Windows</th>
  </tr>
  <tr>
  <td>

```
bash scripts/install_gradio.sh
bash scripts/build_frontend.sh
```
  </td>
  <td>
  
```bash
scripts\install_gradio.bat
scripts\build_frontend.bat
```
  </td>
  </tr>
</table>
---

```FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory``` when running `scripts/build_frontend.sh`.

Run `scripts/build_frontend.sh` with the environment variable `NODE_OPTIONS=--max_old_space_size=2048` to increase the heap size.

---

In the case of:
- Unexpected exceptions being thrown, or
- The following warning:
`IMPORTANT: You are using gradio version <earlier version>, however version <later version> is available, please upgrade.`

ensure your `PYTHONPATH` includes the directory where the Gradio repository is cloned, e.g.:

```export PYTHONPATH="./"```

This ensures that when `gradio` is imported in a python program, it is this current version from this repository.

---

_Could these guidelines be clearer? Feel free to open a PR to help us facilitate open-source contributions!_

