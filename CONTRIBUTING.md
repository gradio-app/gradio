# Contributing to Gradio

Prequisites:

* Python 3.7+
* Node 16.0+ (optional for backend-only changes, but needed for any frontend changes)

More than 30 awesome developers have contributed to the `gradio` library, and we'd be thrilled if you would like be the next `gradio` contributor! You can start by forking or cloning the
repo (https://github.com/gradio-app/gradio.git) and creating your own branch to work from.

### To install Gradio from the `master` branch

* Navigate to the repo folder and run

```bash
bash scripts/install_gradio.sh
```

### To install development and testing requirements

* Navigate to the repo folder and install test requirements (note that it is highly recommended to use a virtual environment since the versions are pinned)

```
bash scripts/install_test_requirements.sh
```

* Install chrome driver and chrome for selenium (necessary for tests)

```
https://sites.google.com/chromium.org/driver/
```

```
https://www.google.com/chrome/
```

* Build the front end

```
bash scripts/build_frontend.sh
```

* Run the tests

```
bash scripts/run_tests.sh
```

* You can also start a local frontend development server (on port 3000 by default) that responds to any changes in the frontend.

```
bash scripts/run_frontend.sh
```

### Structure of the Repository

It's helpful to know the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to

* `/gradio`: contains the Python source code for the library
    * `/gradio/interface.py`: contains the Python source code for the core `Interface` class (**start HERE!**)
* `/frontend`: contains the HTML/JS/CSS source code for the library
* `/test`: contains Python unit tests for the library
* `/demo`: contains demos that are used in the documentation as well as for integration tests
* `/website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/website` folder for more details

### Continuous Integration and Testing

All PRs must pass the continuous integration tests before merging. To test locally, you can run `python -m unittest` from the repo directory.

## Submitting PRs

All PRs should be against `master`. Direct commits to master are blocked, and PRs require an approving review to merge into master. By convention, the Gradio maintainers will review PRs when:

* An initial review has been requested, and
* A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, or @dawoodkhan82) is tagged in the PR comments and asked to complete a review

We ask that you make sure initial CI checks are passing before requesting a review. One of the Gradio maintainers will merge the PR when all the checks are passing.

*Could these guidelines be clearer? Feel free to open a PR to help us faciltiate open-source contributions!*
