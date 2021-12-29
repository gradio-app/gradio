# Contributing to Gradio
You can start by forking or cloning the repo (https://github.com/gradio-app/gradio.git) and creating your own branch to work from.

Next, to install the local development version of Gradio:
  * Navigate to the `/gradio` subfolder and run `pip install -e .`.

When installing locally, you may also need to build the front end:
  * Navigate to the `/frontend` subfolder and run `npm install`.
  * Then run `npm run build`.
  * Then you can run `npm run start` to start a local development server (on port 3000) that responds to any changes in the frontend

### Structure of the Repository

It's helpful to know the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to

* `/gradio`: contains the source code for the actual Python library
   * `/gradio/interface.py`: contains the source code for the core `Interface` class 
* `/test`: contains unit tests for the Python library

* `/website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/website` folder for more details
 

### Continuous Integration and Testing
All PRs must pass the continuous integration tests before merging. To test locally, you can run `python -m unittest` from the `/gradio` subfolder.

### Submitting PRs

All PRs should be against `master`. Direct commits to master are blocked, and PRs require an approving review
to merge into master. By convention, the Gradio maintainers will review PRs when:
  * An initial review has been requested, and
  * A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, or @dawoodkhan82) is tagged in the PR comments and asked to complete a review

We ask that you make sure initial CI checks are passing before requesting a review.
One of the Gradio maintainers will merge the PR when all the checks are passing.

*Could these guidelines be clearer? Feel free to open a PR to help us faciltiate open-source contributions!*
