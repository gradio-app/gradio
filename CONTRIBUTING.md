# Contributing to Gradio

Prequisites:

* Python 3.7+
* Node 16.0+ (optional for backend-only changes, but needed for any frontend changes)

More than 30 awesome developers have contributed to the `gradio` library, and we'd be thrilled if you would like be the next `gradio` contributor! You can start by forking or cloning the
repo (https://github.com/gradio-app/gradio.git) and creating your own branch to work from.

Next, to install the local development version of Gradio:

* Navigate to the repo folder and run

```bash
bash scripts/install_test_requirements.sh
```

When installing locally, you may also need to build the front end:

* Navigate to the `/frontend` subfolder and run `npm install`.
* Then run `npm run build` (or `npm run build:win` on Windows).
* Then you can run `npm run start` to start a local development server (on port 3000 by default) that responds to any changes in the frontend

### Structure of the Repository

It's helpful to know the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to

* `/gradio`: contains the Python source code for the library
    * `/gradio/interface.py`: contains the Python source code for the core `Interface` class (**start HERE!**)
* `/frontend`: contains the HTML/JS/CSS source code for the library
* `/test`: contains Python unit tests for the library
* `/demo`: contains demos that are used in the documentation as well as for integration tests
* `/website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/website` folder for more details

### Continuous Integration and Testing

All PRs must pass the continuous integration tests before merging. To test locally, you can run `python -m unittest` from `/` (the directory where you cloned this repo).

## Submitting PRs

All PRs should be against `master`. Direct commits to master are blocked, and PRs require an approving review to merge into master. By convention, the Gradio maintainers will review PRs when:

* An initial review has been requested, and
* A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, or @dawoodkhan82) is tagged in the PR comments and asked to complete a review

We ask that you make sure initial CI checks are passing before requesting a review. One of the Gradio maintainers will merge the PR when all the checks are passing.

*Could these guidelines be clearer? Feel free to open a PR to help us faciltiate open-source contributions!*
