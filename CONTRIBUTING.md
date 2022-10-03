# Contributing to Gradio

Prequisites:

* [Python 3.7+](https://www.python.org/downloads/)
* [pnpm version 7.x](https://pnpm.io/7.x/installation) (optional for backend-only changes, but needed for any frontend changes)

More than 80 awesome developers have contributed to the `gradio` library, and we'd be thrilled if you would like be the next `gradio` contributor! Start by cloning this repo and installing Gradio locally:

### Install Gradio locally from the `main` branch

* Clone this repo
* Navigate to the repo folder and run

```bash
bash scripts/install_gradio.sh
```

* Build the front end

```
bash scripts/build_frontend.sh
```


### Install testing requirements

In order to be able to run the Python unit tests, do the following:

* Navigate to the repo folder and install test requirements (note that it is highly recommended to use a virtual environment running **Python 3.9** since the versions are pinned)

```
bash scripts/install_test_requirements.sh
```
* If you have a different Python version and conflicting packages during the installation, please first run:

```
bash scripts/create_test_requirements.sh
```

### Extra tidbits

* You can run gradio scripts in reload mode which will watch for changes in the `gradio` folder and reload the app if changes are made.
```
gradio app.py
```

* You can also start a local frontend development server (on port 3000 by default) that responds to any changes in the frontend.

```
bash scripts/run_frontend.sh
```
* To run all of the tests, do:

```
bash scripts/run_all_tests.sh
```


### Structure of the Repository

It's helpful to know the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to

* `/gradio`: contains the Python source code for the library
    * `/gradio/interface.py`: contains the Python source code for the core `Interface` class
    * `/gradio/blocks.py`: contains the Python source code for the core `Blocks` class
    * `/gradio/components.py`: contains the Python source code for the `components`, you can add your custom components here.
* `/ui`: contains the HTML/JS/CSS source code for the library ([start here for frontend changes](/ui/README.md))
* `/test`: contains Python unit tests for the library
* `/demo`: contains demos that are used in the documentation, you can find `Gradio` examples over here.
* `/website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/website` folder for more details

### Continuous Integration and Testing

All PRs must pass the continuous integration tests before merging. To test locally, you can run `python -m unittest` from the repo directory.

## Submitting PRs

All PRs should be against `main`. Direct commits to main are blocked, and PRs require an approving review to merge into main. By convention, the Gradio maintainers will review PRs when:

* An initial review has been requested, and
* A description of the change (with a link to the GitHub PR) has been added to CHANGELOG.md, and
* A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, @dawoodkhan82, @pngwn, @freddyaboulton) is tagged in the PR comments and asked to complete a review

We ask that you make sure initial CI checks are passing before requesting a review. One of the Gradio maintainers will merge the PR when all the checks are passing.

Do not forget the format the backend before pushing.
```
bash scripts/format_backend.sh
```
```
bash scripts/format_frontend.sh
```
You can run the circleci checks locally as well. 
```
bash scripts/run_circleci.sh
```

*Could these guidelines be clearer? Feel free to open a PR to help us faciltiate open-source contributions!*
