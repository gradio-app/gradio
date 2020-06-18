# Contributing to Gradio UI
You can start by forking or cloning the repo (https://github.com/gradio-app/gradio-UI.git) and creating your own branch to work from. All PRs must pass the continuous integration 
tests and receive approval from a member of the Gradio UI development team before they will be merged.

### Docstrings

We expect all PRs to add or update API documentation for any affected pieces of code.
We use [NumPy style docstrings](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_numpy.html), and enforce style compliance with pydocstyle as indicated above.
Docstrings can be cumbersome to write, so we encourage people to use tooling to speed up the process.
For VSCode, we like [autoDocstring](https://marketplace.visualstudio.com/items?itemName=njpwerner.autodocstring).
Just install the extension and add the following configuration to the `settings.json` example above.
Note that we use PEP 484 type hints, so parameter types should be removed from the docstring (although note that return types should still be included).

```json
{
    "autoDocstring.docstringFormat": "numpy",
    "autoDocstring.guessTypes": false
}
```


### Continuous Integration and Testing
All PRs must pass the continuous integration tests before merging. To test locally, you can run python3 -m unittest.


### Submitting PRs

All PRs should be against `master`. Direct commits to master are blocked, and PRs require an approving review
to merge into master. By convention, the Gradio UI maintainers will review PRs when:
  * An initial review has been requested
  * A maintainer is tagged in the PR comments and asked to complete a review

We ask that you make sure initial CI checks are passing before requesting a review.
One of the Gradio UI maintainers will merge the PR when all the checks are passing.
