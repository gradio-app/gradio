# Contributing to Gradio

Prerequisites:

- [Python 3.7+](https://www.python.org/downloads/)
- [Node.js v16.14+](https://nodejs.dev/en/download/package-manager/) (only needed if you are making changes to the frontend)
- [pnpm 8.1+](https://pnpm.io/8.x/installation) (only needed if you are making changes to the frontend)

More than 80 awesome developers have contributed to the `gradio` library, and we'd be thrilled if you would like be the next `gradio` contributor! Start by cloning this repo and installing Gradio locally:

### Install Gradio locally from the `main` branch

- Clone this repo
- Navigate to the repo folder and run

```bash
bash scripts/install_gradio.sh
```

- Build the front end

```
bash scripts/build_frontend.sh
```

### Install development requirements

In order to be able to run the Python linter, formatter, and unit tests, do the following:

- Navigate to the repo folder and install test requirements (note that it is highly recommended to use a virtual environment running **Python 3.9** since the versions are pinned)

```
bash scripts/install_test_requirements.sh
```

- If you have a different Python version and conflicting packages during the installation, please first run:

```
bash scripts/create_test_requirements.sh
```

### Using dev containers

Instead of the above steps, you can alternatively use dev containers. This is supported on all platforms (macOS/Windows/Linux).

Prerequisites:

- An editor which supports dev containers, like VS Code
- Docker support on the host computer:
  - macOS: [Docker Desktop 2.0+](https://www.docker.com/products/docker-desktop/)
  - Windows: [Docker Desktop 2.0+](https://www.docker.com/products/docker-desktop/)
  - Linux: [Docker CE/EE 18.06+](https://docs.docker.com/get-docker/) and [Docker Compose 1.21+](https://docs.docker.com/compose/install/)
- If using VS Code, the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

Steps:

- Clone repository
- Open it in editor
- For VS Code, execute `Dev Containers: Reopen in container` command

For detailed instructions, please see the [Dev Containers tutorial](https://code.visualstudio.com/docs/devcontainers/tutorial).

### Extra tidbits

- You can run gradio scripts in reload mode which will watch for changes in the `gradio` folder and reload the app if changes are made.

```
gradio app.py
```

- To develop the frontend app, you should also follow [js/README.md](js/README.md).

- To run all of the tests, do:

```
bash scripts/run_all_tests.sh
```

### Structure of the Repository

It's helpful to know the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to

- `/gradio`: contains the Python source code for the library
  - `/gradio/interface.py`: contains the Python source code for the core `Interface` class
  - `/gradio/blocks.py`: contains the Python source code for the core `Blocks` class
  - `/gradio/components.py`: contains the Python source code for the `components`, you can add your custom components here.
- `/js`: contains the HTML/JS/CSS source code for the library ([start here for frontend changes](/js/README.md))
- `/test`: contains Python unit tests for the library
- `/demo`: contains demos that are used in the documentation, you can find `Gradio` examples over here.
- `/website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/website` folder for more details

### Continuous Integration and Testing

All PRs must pass the continuous integration tests before merging. To test locally, you can run `python -m unittest` from the repo directory.

## Submitting PRs

All PRs should be against `main`. Direct commits to main are blocked, and PRs require an approving review to merge into main. By convention, the Gradio maintainers will review PRs when:

- An initial review has been requested, and
- A description of the change (with a link to the GitHub PR) has been added to CHANGELOG.md, and
- A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, @dawoodkhan82, @pngwn, @freddyaboulton) is tagged in the PR comments and asked to complete a review

We ask that you make sure initial CI checks are passing before requesting a review. One of the Gradio maintainers will merge the PR when all the checks are passing.

Do not forget the format the backend before pushing.

```
bash scripts/format_backend.sh
```

```
bash scripts/format_frontend.sh
```

## CI checks

Currently the following checks are run in CI:

### Gradio library (`gradio` package)

```
bash scripts/lint_backend.sh
bash scripts/type_check_backend.sh
python -m pytest -m "not flaky" --ignore=client
python -m pytest -m "flaky" --ignore=client
```

### Gradio client (`gradio_client` package)

```
cd client/python
bash scripts/lint.sh
python -m pytest -m "not flaky"
python -m pytest -m "flaky"
```

_Could these guidelines be clearer? Feel free to open a PR to help us faciltiate open-source contributions!_
