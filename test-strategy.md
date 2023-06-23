# Test Strategy

Very brief, mildly aspirational test strategy document. This isn't where we are but it is where we want to get to.

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

- The documented Gradio API (that's the bit that user interact with via python) should be tested thoroughly. (1)
- Additional gradio components that are both publicly available and used internally (such as the Python and JS client libraries) should be tested thoroughly. (1)
- Additional gradio components that are publicly available should be tested as throughly as is reasonable (this could be things like demos/the graido CLI/ other tooling). The importance of each individual component. and the appropriate investment of effort, needs to assessed on a case-by-case basis. (1)
- Component boundaries should be tested where there is reasonable cause to do so (e.g. config generation) (1)
- Implementation details should only be tested where there is sufficient complexity to warrant it. (1)
- Bug fixes should be accompanied by tests wherever is reasonably possible. (3)

## Types of testing

Our tests will broadly fall into one of three categories:

- Static Quality checks
- Dynamic 'Code' tests
- Dynamic Functional tests

### Static Quality checks

Static quality check are generally very fast to run and do not require building the code base. They also provide the least value. These tests would be things like linting, typechecking, and formatting.

While they offer little in terms of testing functionality they align very closely with objective (4, 5) as they generally help to keep the codebase in good shape and offer very fast feedback. Such check are almost free from an authoring point of view as fixes can be mostly automated (either via scripts or editor integrations).

### Dynamic code tests

These tests gebnerally test either isolated pieces of code or test the relationship between parts of the code base. They sometimes test functionality or give indications of working functionality but never offer enough confidence to rely on them solely.

These test are usually either unit or integration tests. They are generally pretty quick to write (especially unit tests) and run and offer a moderate amount of confidence. They align closely with Objectives 2 and 3 and a little bit of 1.

This kind of tests should probably make up the bulk of our handwritten tests.

### Dynamic functional tests

These tests give by far the most confidence as they are testing only the functionality of the software and do so by running the entire software itself, exactly as a user would.

This aligns very closely with objective 1 but significantly impacts objective 5, as these code are cosly to bothj write and run. Despite the value, due tot he downside we should try to get as much out of other tests types as we can, reserving functional testing for complex use-cases and end to end journey.

Tests in this category could be browser-based end-to-end tests, accessibility tests, or performance tests. They are sometimes call acceptance tests.


## Testing tools

We currently use the following tools:

### Static quality checks

- Python types-checking (python) ???
- Black linting (python)
- ruff formatting (python)
- prettier formatting (javascript/svelte)
- TypeScript type-checking (javascript/svelte)
- eslint linting (javascript/svelte)

### Dynamic code tests

- pytest (python) ???
- vitest
- playwright

### function/acceptance tests

- playwright
- chromatic
- ???

## execution

- ci
- fast feedback

## managing defects

- every bugfix should have a test (where possible)



