# `@gradio/tootils`

Unit testing utilities for Gradio Svelte components. Built on top of `@testing-library/dom` and `vitest`.

## `render`

Mounts a Gradio component into the DOM with all required shared props (dispatcher, i18n, theme, etc.) pre-configured. Returns query helpers, event utilities, and lifecycle controls.

```ts
import { render } from "@self/tootils";
import MyComponent from "./Index.svelte";

const result = await render(MyComponent, {
  value: "hello",
  label: "My input"
});
```

### Signature

```ts
function render(
  Component,
  props?,
  options?: { container?: HTMLElement }
): Promise<RenderResult>
```

#### `Component`

The Svelte component to mount. Accepts either a component constructor directly or a module with a `default` export.

#### `props`

Component props, excluding `gradio` and `loading_status` (which are provided automatically). You can override `loading_status` if needed:

```ts
await render(MyComponent, {
  value: "hello",
  loading_status: { status: "pending", /* ... */ }
});
```

Props listed in `allowed_shared_props` (from `@gradio/utils`) are separated out and passed via `shared_props`. All other props are passed as component-level props.

#### `options.container`

The parent DOM element to mount into. Defaults to `document.body`.

### Return value

`render` returns a promise that resolves to an object combining `@testing-library/dom` query helpers with Gradio-specific utilities:

#### DOM queries

All `@testing-library/dom` query functions are bound to the container and available directly on the result:

```ts
const { getByText, getByLabelText, queryByRole } = await render(MyComponent, {
  label: "Name"
});

const input = getByLabelText("Name");
```

See the [@testing-library/dom docs](https://testing-library.com/docs/queries/about) for the full list.

#### `container`

The root DOM element the component was mounted into.

#### `component`

The mounted Svelte component instance.

#### `listen`

Creates a `vi.fn()` mock that records all dispatched events for a given event name.

```ts
const { listen } = await render(MyComponent, { value: "" });

const change = listen("change");

// interact with the component...

expect(change).toHaveBeenCalledTimes(1);
expect(change).toHaveBeenCalledWith("new value");
```

##### Retrospective mode

By default, `listen` only captures events dispatched **after** it is called. If a component emits events during mount (before `listen` can be called), pass `{ retrospective: true }` to replay all buffered events onto the mock:

```ts
const { listen } = await render(MyComponent, { value: "hi" });

// "change" may have fired during mount — retrospective replays it
const change = listen("change", { retrospective: true });

expect(change).toHaveBeenCalledWith("hi");
```

All dispatched events are buffered from the moment the dispatcher is created (before mount), so retrospective mode has access to the complete event history.

#### `set_data`

Simulates the Gradio server sending new data to the component (as if via a backend update). Waits for two Svelte ticks to allow all reactive updates and side-effect events to settle before returning:

```ts
const { set_data, listen } = await render(MyComponent, { value: "" });

const change = listen("change");
await set_data({ value: "updated" });

expect(change).toHaveBeenCalledWith("updated");
```

#### `get_data`

Retrieves the component's current data as reported by its internal `get_data` handler:

```ts
const { get_data } = await render(MyComponent, { value: "hello" });

const data = await get_data();
expect(data.value).toBe("hello");
```

#### `debug`

Prints a pretty-formatted DOM tree of the container (or a specific element) to the console. Useful for debugging test failures:

```ts
const result = await render(MyComponent, { value: "hello" });

result.debug(); // prints full container
result.debug(someElement); // prints specific element
```

#### `unmount`

Removes the component from the DOM:

```ts
const { unmount } = await render(MyComponent, { value: "hello" });

// ...assertions...

unmount();
```

## `cleanup`

Unmounts all components mounted via `render` and removes their DOM nodes. Call this in an `afterEach` hook to prevent test pollution:

```ts
import { cleanup } from "@self/tootils";

afterEach(() => {
  cleanup();
});
```

## `fireEvent`

An async wrapper around `@testing-library/dom`'s `fireEvent`. Each event method waits for two Svelte ticks after firing, ensuring reactive state updates and any resulting event emissions have settled before your assertions run:

```ts
import { render, fireEvent } from "@self/tootils";

const { getByRole } = await render(MyComponent, { value: "" });

const input = getByRole("textbox");
await fireEvent.input(input, { target: { value: "hello" } });
await fireEvent.blur(input);

// state has settled — safe to assert
```

All standard DOM event methods are available (`click`, `input`, `change`, `focus`, `blur`, `keyDown`, etc.).

## `download_file`

Clicks an element and captures the resulting file download. This triggers a real browser download via Playwright's download event API — the file is actually downloaded and its content is readable.

Works with both download patterns used in Gradio components:
- Static `<a download href="...">` links (DownloadLink, FilePreview, etc.)
- Programmatic downloads that create an anchor, set `.href`/`.download`, and call `.click()` (DownloadButton, Gallery, Code, etc.)

```ts
import { render, download_file } from "@self/tootils/render";

const { container } = await render(FileComponent, {
  value: { url: "/files/data.csv", orig_name: "data.csv" }
});

const { suggested_filename, content } = await download_file("a[download]");

expect(suggested_filename).toBe("data.csv");
expect(content).toContain("col1,col2");
```

### Signature

```ts
function download_file(
  selector: string,
  options?: { timeout?: number }
): Promise<{ suggested_filename: string; content: string | null }>
```

#### `selector`

A CSS selector for the element to click. The click triggers the download.

#### `options.timeout`

How long to wait for the download event (default 5000ms). If no download is triggered within this window, the promise rejects.

#### Return value

- `suggested_filename` — the filename the browser would save the file as (from the `download` attribute or `Content-Disposition` header)
- `content` — the text content of the downloaded file, or `null` if the file couldn't be read

### How it works

This utility uses a [Vitest browser command](https://vitest.dev/guide/browser/commands) that runs server-side with access to the Playwright `Page` object. It sets up `page.waitForEvent("download")` **before** clicking the element, so the download event is never missed regardless of timing. The downloaded file is saved to a temp path by Playwright and its content is read back.

## Re-exports

Everything from `@testing-library/dom` is re-exported, so you can import query utilities, `screen`, `within`, etc. directly:

```ts
import { screen, within } from "@self/tootils";
```
