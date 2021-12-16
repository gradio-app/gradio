# Contributing to Gradio
You can start by forking or cloning the repo (https://github.com/gradio-app/gradio.git) and creating your own branch to work from. All PRs must pass the continuous integration 
tests and receive approval from a member of the Gradio development team before they will be merged.

### Structure of the Repository

It's helpful to know the overall structure of the repository so that you can focus on the part of the source code you'd like to contribute to

* `/gradio`: contains the source code for the actual Python library
   * `/gradio/interface.py`: contains the source code for the core `Interface` class 
* `/test`: contains unit tests for the Python library

* `/website`: contains the code for the Gradio website (www.gradio.app). See the README in the `/website` folder for more details
 

### Continuous Integration and Testing
All PRs must pass the continuous integration tests before merging. To test locally, you can run `python3 -m unittest`.

### Submitting PRs

All PRs should be against `master`. Direct commits to master are blocked, and PRs require an approving review
to merge into master. By convention, the Gradio maintainers will review PRs when:
  * An initial review has been requested, and
  * A maintainer (@abidlabs, @aliabid94, @aliabd, @AK391, or @dawoodkhan82) is tagged in the PR comments and asked to complete a review

We ask that you make sure initial CI checks are passing before requesting a review.
One of the Gradio maintainers will merge the PR when all the checks are passing.
