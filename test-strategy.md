# Test Strategy

Very brief, mildly aspirational test strategy document. This isn't where we are but it is where we want to get to.

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

- Python type-checking (python)
- Black linting (python)
- ruff formatting (python)
- prettier formatting (javascript/svelte)
- TypeScript type-checking (javascript/svelte)
- eslint linting (javascript/svelte) [in progress]

### Dynamic code tests

- pytest (python unit and integration tests)
- vitest (node-based unit and integration tests)
- playwright (browser-based unit and integration tests)

### Functional/acceptance tests

- playwright (full end to end testing)
- chromatic (visual testing) [in progress]
- Accessibility testing [to do]

## Supported environments and versions

All operating systems refer to the current runner variants supported by GitHub actions.

All unspecified version segments (`x`) refer to latest.

| Software | Version(s)            | Operating System(s)               |
| -------- | --------------------- | --------------------------------- |
| Python   | `3.8.x`               | `ubuntu-latest`, `windows-latest` |
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

## Playwright Tips

Gradio uses [playwright](https://playwright.dev/docs/intro) to interact with gradio applications programmatically to ensure that both the frontend and backend function as expected.
Playwright is very powerful but it can be a little intimidating if you haven't used it before.
No one on the team is a testing expert so don't be afraid to ask if you're unsure how to do something.
Likewise, if you learn something new about playwright, please share with the team! 

### Tip 1 - Retrying Assertions

Playwright tests are written imperitavely - first type into this textbox, then click this button, then check this textbox has this output.
This is nice because it matches how users interact with Gradio applications.
However, playwright carries out these steps much faster than any human can!
This can cause you to check whether a textbox has the correct output before the server is finished processing the request.

For this reason, playright ships with some [retrying assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions).
These assertions will retry until they pass or a timeout is reached, by default 5 seconds.
So even if playwright checks a DOM element before the server is done, it gives the server a chance to finish by retrying.


You can increase the timeout manually as well:

```js
// 5 seconds
await expect(page.getByText('Hidden text')).toBeAttached({timeout?: 5000});
```

Sometimes there may not be a retrying assertion for what you need to check.
In that case, you can retry any custom async function until it passes using `toPass` ([docs](https://playwright.dev/docs/test-assertions#expecttopass)).

```js
await expect(async () => {
  const response = await page.request.get('https://api.example.com');
  expect(response.status()).toBe(200);
}).toPass();
```

### Tip 2 - Don't rely on internal network calls to check if something is done
Internal network calls are not visible to the user, so they can be refactored whenever.
If we have tests that rely on a request to a given route finishing before moving on, for example, they will fail if we ever change the route name or some other implementation detail.

It's much better to use a retrying assertion that targets a visible DOM element with a larger timeout to check if some work is done.

### Tip 3 - Use the playwright trace viewer
Whenever a test fails locally, playwright will write out some details about the test to the `test-results` directory at the top level of the repo.

You can view the trace using the following command:

```bash
npx playwright show-trace test-results/<directory-name>/trace.zip
```

You can see a "video" of the failing test, a screenshot of when it failed, as well as all the network calls and console messages.

![local_trace_viewer](https://github.com/gradio-app/gradio/assets/41651716/31ed5fa8-e1d9-43a0-9757-469905678683)

If a test fails on CI, you can obtain the same trace by downloading the artifact from github actions.

1. From the failing Github Actions page, go to the `Summary` page
2. Scroll down to the bottom to where it says `Artifacts`
3. Click on `playwright-screenshots` to download a zip archive.
4. Unzip it and use the `show-trace` command.

![download_trace](https://github.com/gradio-app/gradio/assets/41651716/20c279a8-9a56-4dcf-8df0-c4711e305515)

### Tip 4 - Playwright can write the test for you

You can write the basic skeleton of the test automatically by just interacting with the UI!

First, start a gradio demo from the command line. Then use the following command and point it to the URL of the running demo:

```bash
npx playwright codegen <gradio-url>
```

This will open up a Chromium session where each interaction with the page will be converted into a playwright accessor.

NOTE: Only copy the `test("test-name", ....)` not the imports. For playwright to work when running in the gradio CI, `test` and `expect` need to be imported from `@gradio/tootils`.

![code_gen_demo](https://github.com/gradio-app/gradio/assets/41651716/96003fba-d17c-46b9-9c6d-35218fbdfb6f)
