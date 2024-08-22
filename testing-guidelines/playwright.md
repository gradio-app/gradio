## Playwright Tips

Gradio uses [playwright](https://playwright.dev/docs/intro) to interact with gradio applications programmatically to ensure that both the frontend and backend function as expected.
Playwright is very powerful but it can be a little intimidating if you haven't used it before.
No one on the team is a testing expert so don't be afraid to ask if you're unsure how to do something.
Likewise, if you learn something new about playwright, please share with the team!

### Tip 1 - Retrying Assertions

Playwright tests are written imperatively - first type into this textbox, then click this button, then check this textbox has this output.
This is nice because it matches how users interact with Gradio applications.
However, playwright carries out these steps much faster than any human can!
This can cause you to check whether a textbox has the correct output before the server is finished processing the request.

For this reason, playwright ships with some [retrying assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions).
These assertions will retry until they pass or a timeout is reached, by default 5 seconds.
So even if playwright checks a DOM element before the server is done, it gives the server a chance to finish by retrying.

An example of a retrying assertion is `toBeChecked`. Note that you can manually increase the timeout as well:

```js
// 5 seconds
await expect(page.getByTestId('checkbox')).toBeChecked({timeout?: 5000});
```

An example of a non-retrying assertion is `isChecked`:

```js
await expect(page.getByTestId("checkbox").isChecked());
```

Sometimes there may not be a retrying assertion for what you need to check.
In that case, you can retry any custom async function until it passes using `toPass` ([docs](https://playwright.dev/docs/test-assertions#expecttopass)).

```js
await expect(async () => {
	const response = await page.request.get("https://api.example.com");
	expect(response.status()).toBe(200);
}).toPass();
```

### Tip 2 - Don't rely on internal network calls to check if something is done

Internal network calls are not visible to the user, so they can be refactored whenever.
If we have tests that rely on a request to a given route finishing before moving on, for example, they will fail if we ever change the route name or some other implementation detail.

It's much better to use a retrying assertion that targets a visible DOM element with a larger timeout to check if some work is done.

Avoid this:

```js
const uploadButton = page...
await uploadButton.click();
await page.waitForRequest("**/upload?*");
await expect(page.getByTestId("file-component")).toHaveValue(...)
```

Do This:

```js
const uploadButton = page...
await uploadButton.click();
await expect(page.getByTestId("file-component")).toHaveValue(..., {timeout?: 5000});
```

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
npx playwright codegen <url>
```

This will open up a Chromium session where each interaction with the page will be converted into a playwright accessor.

NOTE: Only copy the `test("test-name", ....)` not the imports. For playwright to work when running in the gradio CI, `test` and `expect` need to be imported from `@self/tootils`.

![code_gen_demo](https://github.com/gradio-app/gradio/assets/41651716/96003fba-d17c-46b9-9c6d-35218fbdfb6f)
