# Quality Strategy

Very brief, mildly aspirational quality strategy document. This isn't where we are but it is where we want to get to.

This document does not detail how to setup an environment or how to run the tests locally nor does it contain any best practices that we try to follow when writing tests, that information exists in the [contributing guide](https://github.com/gradio-app/gradio/blob/main/CONTRIBUTING.md).

## Objectives

The purposes of all testing activities on Gradio fit one of the following objectives:

1. Ensure that the Gradio library functions as we expect it to.
2. Enable the maintenance team to quickly identify both the presence and source of defects.
3. Prevent regressions, i.e. if we fix something it should stay fixed.
4. Improve the quality of the codebase in order to ease maintenance efforts.
5. Reduce the amount of manual testing required.

## Scope

Testing is always a tradeoff. We can't cover everything unless we want to spend all of our time writing and running tests. We should focus on a few keys areas.

We should not focus on code coverage but on test coverage following the below criteria:

- The documented Gradio API (that's the bit that users interact with via python) should be tested thoroughly. (1)
- Additional gradio elements that are both publicly available and used internally (such as the Python and JS client libraries) should be tested thoroughly. (1)
- Additional gradio elements that are publicly available should be tested as thoroughly as is reasonable (this could be things like demos/the gradio CLI/ other tooling). The importance of each individual component, and the appropriate investment of effort, needs to be assessed on a case-by-case basis. (1)
- Element boundaries should be tested where there is reasonable cause to do so (e.g. config generation) (1)
- Implementation details should only be tested where there is sufficient complexity to warrant it. (1)
- Bug fixes should be accompanied by tests wherever is reasonably possible. (3)

## Types of testing

Our tests will broadly fall into one of three categories:

- Static Quality checks
- Dynamic 'Code' tests
- Dynamic Functional tests

### Static Quality checks

Static quality checks are generally very fast to run and do not require building the code base. They also provide the least value. These tests would be things like linting, typechecking, and formatting.

While they offer little in terms of testing functionality they align very closely with objective (4, 5) as they generally help to keep the codebase in good shape and offer very fast feedback. Such check are almost free from an authoring point of view as fixes can be mostly automated (either via scripts or editor integrations).

### Dynamic code tests

These tests generally test either isolated pieces of code or test the relationship between parts of the code base. They sometimes test functionality or give indications of working functionality but never offer enough confidence to rely on them solely.

These test are usually either unit or integration tests. They are generally pretty quick to write (especially unit tests) and run and offer a moderate amount of confidence. They align closely with Objectives 2 and 3 and a little bit of 1.

These kind of tests should probably make up the bulk of our handwritten tests.

### Dynamic functional tests

These tests give by far the most confidence as they are testing only the functionality of the software and do so by running the entire software itself, exactly as a user would.

This aligns very closely with objective 1 but significantly impacts objective 5, as these tests are costly to both write and run. Despite the value, due to the downside we should try to get as much out of other tests types as we can, reserving functional testing for complex use cases and end-to-end journey.

Tests in this category could be browser-based end-to-end tests, accessibility tests, or performance tests. They are sometimes called acceptance tests.

## Testing tools

We currently use the following tools:

### Static quality checks

- ruff formatting (python)
- ruff linting (python)
- pyright type-checking (python)
- prettier formatting (javascript/svelte)
- eslint linting (javascript/svelte)
- TypeScript type-checking (javascript/svelte)

### Dynamic code tests

- pytest (python unit and integration tests)
- vitest (node-based unit and integration tests)
- playwright (browser-based unit and integration tests)

### Functional/acceptance tests

- playwright (full end to end testing)
- chromatic (visual testing)
- Accessibility testing [to do]

## Supported environments and versions

All operating systems refer to the current runner variants supported by GitHub actions.

All unspecified version segments (`x`) refer to latest.

| Software | Version(s)            | Operating System(s)               |
| -------- | --------------------- | --------------------------------- |
| Python   | `3.10.x`              | `ubuntu-latest`, `windows-latest` |
| Node     | `18.x.x`              | `ubuntu-latest`                   |
| Browser  | `playwright-chrome-x` | `ubuntu-latest`                   |

## Test execution

Tests need to be executed in a number of environments and at different stages of the development cycle in order to be useful. The requirements for tests are as follows:

- **Locally**: it is important that developers can easily run most tests locally to ensure a passing suite before making a PR. There are some exceptions to this, certain tests may require access to secret values which we cannot make available to all possible contributors for practical security reasons. It is reasonable that it isn't possible to run these tests but they should be disabled by default when running locally.
- **CI** - It is _critical_ that all tests run successfully in CI with no exceptions. Not every test is required to pass to satisfy CI checks for practical reasons but it is required that all tests should run in CI and notify us if something unexpected happens in order for the development team to take appropriate action.

For instructions on how to write and run tests see the [contributing guide](https://github.com/gradio-app/gradio/blob/main/CONTRIBUTING.md).

## Managing defects

As we formalise our testing strategy and bring / keep our test up to standard, it is important that we have some principles on managing defects as they occur/ are reported. For now we can have one very simple rule:

- Every bug fix should be accompanied by a test that failed before the fix and passes afterwards. This test should _typically_ be a dynamic code test but it could be a linting rule or new type if that is appropriate. There are always exceptions but we should think very carefully before ignoring this rule.
