---
name: "frontend-unit-testing"
description: "Write comprehensive, behaviour-driven unit tests for Gradio frontend Svelte components using Vitest browser mode, Playwright, and the @self/tootils test utilities."
---

# Frontend Unit Testing Skill

You are an expert at writing unit tests for Gradio's Svelte frontend components. Follow these instructions precisely.

## Core Principles (Non-Negotiable)

1. **Test everything.** Unit tests are cheap. Having too many is a problem we want to have. When in doubt, write the test. Multiple tests per feature/argument is fine and encouraged.

2. **Test behaviour, not implementation.** Never assert on implementation details like CSS class names, internal state, or DOM structure for its own sake. Instead, test observable behaviour.
   - BAD: assert that an input has a `step` attribute set to `5`
   - GOOD: type a value, click the increment button, and assert the value increased by `5`
   - BAD: assert that a container has class `hidden`
   - GOOD: assert that the element is not visible with `toBeVisible()`

3. **Test Gradio-specific functionality.** Every component has `get_data`, `set_data`, and dispatches events. These must be tested, including their interactions with props.
   - `set_data` -> verify the DOM reflects the change
   - `get_data` -> verify it returns the current state
   - `set_data` -> `get_data` round-trips
   - User interaction -> `get_data` reflects it
   - Events: `change`, `input`, `submit`, `blur`, `focus`, `clear`, `upload`, `select`, `custom_button_click`, etc.

4. **Real browser environment.** Tests run in Vitest browser mode with a Playwright provider. This is a real browser, not jsdom. **Do not mock or stub** unless absolutely unavoidable (e.g., `navigator.clipboard`, `MediaStream`). If you must mock, explain why in a comment.

5. **Test sub-components in isolation** when they have meaningful standalone logic (e.g., a utility function, a shared inner component). These tests are *in addition to* full `Index.svelte` integration tests.

6. **Never refactor production code for testability** without explicit user approval. If a refactor would help, recommend it and wait for a go-ahead.

7. **Visual-only props get `test.todo` placeholders.** If a prop or argument results in a purely visual change (colours, spacing, fonts, border styles, shadows, etc.) that cannot be meaningfully asserted with behavioural queries, do NOT skip it silently. Instead:
   - Add a `test.todo("description")` explaining that it needs a visual regression test
   - The description should state what prop/value is being tested and what the expected visual outcome is
   - This ensures visual-only behaviour is tracked and not forgotten

   ```ts
   test.todo(
     "VISUAL: container_color='red' applies a red background to the component wrapper — needs Playwright visual regression screenshot comparison"
   );
   ```

8. **No useless comments.** Comments should be used exceptionally, only when clarification of the code is essential. Do NOT create comments to describe types of tests (`describe` blocks do that). Do NOT add comments explaining the flow of the code (the code does that). Only add comments when something is confusing or complex, adds useful context (i.e. giving more detail on the failure case it is guarding against), or goes against our principles (this requires a comment + rationale).

## Test Environment & Utilities

All test utilities come from `@self/tootils/render`. Never import from `@testing-library/svelte` directly.

### `render(Component, props?, options?)`

Mounts a Gradio component with the full shared prop infrastructure (loading_status, dispatcher, i18n, etc.).

Returns:
- `container` — the root DOM element
- `listen(event_name, opts?)` — returns a `vi.fn()` mock that records dispatched Gradio events. By default only captures events fired *after* the call. **Use `{ retrospective: true }` when testing mount-time events** — this replays any events that were buffered during render before `listen` was called. Without this flag, mount-time events are invisible.
- `set_data(data)` — programmatically set component data (simulates backend push). Automatically ticks.
- `get_data()` — read current component data.
- All `@testing-library/dom` query functions (`getByRole`, `getByText`, `getByDisplayValue`, `queryByRole`, etc.)
- `debug()` — prints pretty DOM to console.
- `unmount()` — teardown.

Props are split automatically: keys in `allowed_shared_props` go to `shared_props`, everything else goes to `props`.

### `fireEvent`

Re-exported from `@testing-library/dom` but wrapped to `await tick()` twice after each event (to let Svelte reactivity settle). Always `await` fireEvent calls.

### `cleanup()`

Call in `afterEach` to unmount all rendered components.

### `run_shared_prop_tests(config)` (MANDATORY)

Runs a standard suite of shared prop tests (`elem_id`, `elem_classes`, `visible`, `label`, `show_label`, `validation_error`). **Every component test file MUST call this.** Never manually re-implement these tests.

```ts
run_shared_prop_tests({
  component: MyComponent,
  name: "MyComponent",
  base_props: { /* minimum props to render */ },
  has_label: true,        // default true; false for label-less components
  has_validation_error: true  // default true
});
```

**When a shared test doesn't apply to a component** (e.g., the component has no label), use the config flags to disable that specific test — do NOT skip `run_shared_prop_tests` entirely and rewrite everything by hand:

```ts
// Accordion has no label — disable label tests, keep everything else
run_shared_prop_tests({
  component: Accordion,
  name: "Accordion",
  base_props: { label: "Section", open: true },
  has_label: false,
  has_validation_error: false
});
```

If a shared test fails for a component-specific reason that the flags don't cover, the correct response is to:
1. Still call `run_shared_prop_tests` with appropriate flags to cover what it can
2. Write a targeted custom test for the specific behaviour that differs
3. Explain why the shared test doesn't apply in a comment

### File utilities

- `upload_file(fixture, selector?)` — sets files on a file input using real fixtures
- `drop_file(fixture, selector)` — simulates drag-and-drop with real files
- `download_file(selector)` — clicks an element and captures the download
- `mock_client()` — returns a mock client for components that use file uploads (the upload mock echoes input unchanged)

### Fixtures

Pre-built `FileData` objects pointing to real test files:
- `TEST_TXT`, `TEST_JPG`, `TEST_PNG`, `TEST_MP4`, `TEST_WAV`, `TEST_PDF`

### User events

For keyboard/typing interactions, import `@testing-library/user-event`:

```ts
import event from "@testing-library/user-event";

el.focus();
await event.keyboard("some text");
await event.type(el, "123");
await event.clear(el);
```

## Running Tests

**Always use `pnpm test:run`.** Never use `pnpm test` — it starts in watch mode and never exits.

All commands are run from the repo root.

```bash
# Run all unit tests
pnpm test:run

# Run a specific test file (match by filename)
pnpm test:run Textbox.test.ts

# Run all tests within a folder (match by path segment)
pnpm test:run dataframe

# Filter by test name with -t
pnpm test:run -t elem_id

# Combine file/folder filter with test name filter
pnpm test:run accordion -t elem_id
```

After writing or modifying tests, always run them to verify they pass.

## Test File Structure

```ts
import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Component from "./Index.svelte";

const default_props = {
  // Minimum props for a working render, always including:
  label: "Component Name",
  show_label: true,
  interactive: true,
  // ...component-specific props
};

// 1. Shared prop tests
run_shared_prop_tests({
  component: Component,
  name: "ComponentName",
  base_props: { /* ... */ }
});

// 2. Describe blocks grouped by prop, feature, or concern
describe("ComponentName", () => {
  afterEach(() => cleanup());
  // General rendering and basic behaviour
});

describe("Props: propName", () => {
  afterEach(() => cleanup());
  // Tests for each meaningful prop value
});

describe("Events", () => {
  afterEach(() => cleanup());
  // change, input, submit, blur, focus, clear, etc.
});

describe("get_data / set_data", () => {
  afterEach(() => cleanup());
  // Round-trip, DOM reflection, interaction flow
});

describe("Edge cases", () => {
  afterEach(() => cleanup());
  // Null/undefined handling, deduplication, mount-time behaviour
});
```

### Naming conventions

- **Describe blocks**: Group by `Props: <name>`, `Events`, `Events: <name>`, `get_data / set_data`, `Edge cases`, or component area.
- **Test names**: Declarative sentences describing what should happen. e.g., `"lines > 1 renders a textarea with correct rows"`, `"change: emitted when value changes from outside"`.

## Two Modes of Operation

### Mode 1: Targeted tests (for a specific feature or regression)

When asked to write tests for a specific feature, prop, or bug fix:
- Read the relevant component source to understand the behaviour
- Write focused tests covering the specific area
- Include edge cases related to that feature
- Proceed directly — no plan needed unless the scope is ambiguous

### Mode 2: Full component test battery

When asked to write or rewrite tests for an entire component:

**You MUST follow this process:**

1. **Research phase** — Read thoroughly:
   - The component's `Index.svelte` (the main entry point)
   - Any shared sub-components in the component's `shared/` directory
   - The Python component definition in `gradio/components/` to understand all props, events, and data types
   - Any existing tests for the component
   - The component's demo files in `demo/` if they exist

2. **Analysis phase** — Identify every testable surface:
   - Every prop and its meaningful values (including defaults, edge cases, combinations)
   - Every event the component dispatches
   - `get_data` / `set_data` behaviour
   - Interactive vs non-interactive behaviour
   - Sub-components with standalone testable logic
   - Accessibility-relevant behaviour (labels, ARIA attributes as they affect user behaviour)
   - Edge cases: null/undefined values, empty strings, boundary values, mount-time behaviour, event deduplication
   - Visual-only props: identify props that only affect appearance and flag them for `test.todo` with visual regression notes

3. **Plan phase** — Present a structured testing plan:
   - Organised by describe block
   - Each test listed with: name, what it verifies, key assertion
   - Call out any tests that might need mocking (and why)
   - Call out any sub-components worth testing in isolation
   - Call out any visual-only props that need `test.todo` placeholders for visual regression testing
   - Note any refactoring that would improve testability (but don't do it)

4. **Wait for approval** — Present the plan and ask for feedback before writing code.

5. **Implementation phase** — Write the tests following the plan.

## Assertion Patterns

### Query priority (strict)

Always use the query utilities returned by `render()`. **Never use `container.querySelector` unless every option below has been exhausted.** Follow this priority order:

1. **Semantic role queries** (best — reflects how users and assistive tech see the component):
   ```ts
   getByRole("textbox")
   getByRole("button", { name: "Submit" })
   getByRole("slider")
   ```

2. **Label and text queries** (good — reflects visible content):
   ```ts
   getByLabelText("Upload file")
   getByText("Submit")
   getByDisplayValue("hello")
   getByPlaceholderText("Enter text...")
   ```

3. **Test ID queries** (required fallback — when no semantic/text query works):
   ```ts
   getByTestId("source-select")
   getByTestId("password")
   ```
   If the element lacks a `data-testid`, **add one to the component source**. This is always the right move. `container.querySelector` is never acceptable — adding a `data-testid` is cheap, explicit, and keeps test intent clear.

Use `queryBy*` variants (which return `null` instead of throwing) when asserting something is **not** in the DOM:
```ts
expect(queryByRole("button")).not.toBeInTheDocument();
expect(queryByLabelText("Upload file")).not.toBeInTheDocument();
```

### Common assertion patterns

```ts
// Visibility
expect(el).toBeVisible();
expect(el).not.toBeVisible();

// Presence
expect(queryByRole("button")).not.toBeInTheDocument();  // not in DOM
expect(getByRole("button")).toBeInTheDocument();        // in DOM

// Values
expect(el).toHaveValue("hello");
expect(el).toHaveAttribute("type", "password");

// State
expect(el).toBeDisabled();
expect(el).toBeEnabled();
expect(el).toHaveFocus();

// Events
const change = listen("change");
await set_data({ value: "new" });
expect(change).toHaveBeenCalledTimes(1);
expect(change).toHaveBeenCalledWith("new");

// Mount-time events — use { retrospective: true }
// listen() only captures events fired AFTER it is called. Since render()
// is awaited before listen() runs, any events fired during mount are missed.
// Pass { retrospective: true } to also replay events from the buffer.
//
// Use this whenever you need to assert about mount-time behaviour:
//   - "no spurious change event on mount"
//   - "component fires 'load' on mount"
//   - "initial value triggers change on mount" (or doesn't)
const change = listen("change", { retrospective: true });
expect(change).not.toHaveBeenCalled();  // no spurious mount event

// If you expect an event WAS fired on mount:
const load = listen("load", { retrospective: true });
expect(load).toHaveBeenCalledTimes(1);

// Event deduplication
await set_data({ value: "x" });
await set_data({ value: "x" });
expect(change).toHaveBeenCalledTimes(1);

// Async operations (uploads, etc.)
await waitFor(() => {
  expect(upload).toHaveBeenCalledTimes(1);
});
```

## What NOT to Do

- **Never use `container.querySelector`**. It is unconditionally banned. Use `getByRole`, `getByText`, `getByLabelText`, `getByDisplayValue`, `getByPlaceholderText`, or `getByTestId`. If none of those work, add a `data-testid` attribute to the component source — this is always the correct solution.
- **Don't mock Svelte internals**, the DOM, or browser APIs that work natively.
- **Don't unit-test purely visual styling** (colours, spacing, fonts, shadows). Instead, add `test.todo` placeholders recommending Playwright visual regression tests. Do test behavioural *effects* of styling (visibility, disabled state).
- **Don't assert on internal class names** unless they are the mechanism by which a behaviour is expressed and there's no semantic alternative (e.g., `.sr-only` for screen-reader-only labels).
- **Don't manually rewrite shared prop tests.** `run_shared_prop_tests` handles `elem_id`, `elem_classes`, `visible`, `label`, `show_label`, `validation_error`. Always call it. If a specific test doesn't apply, use the config flags (`has_label: false`, `has_validation_error: false`) — never skip the utility and hand-roll the tests instead.
- **Don't use `toBeTruthy()` or `toBeFalsy()`.** These are too vague and hide intent. Use the most specific matcher for the value being checked:
  - Element in DOM → `toBeInTheDocument()` / `.not.toBeInTheDocument()`
  - Element visible → `toBeVisible()` / `.not.toBeVisible()`
  - Element has value → `toHaveValue("x")`
  - Element checked → `toBeChecked()`
  - Element disabled → `toBeDisabled()` / `toBeEnabled()`
  - Boolean variable → `toBe(true)` / `toBe(false)`
  - Array non-empty → `toHaveLength(n)` or `expect(arr.length).toBeGreaterThan(0)`
  - Non-DOM null/undefined → `toBeNull()` / `toBeDefined()` / `toBeUndefined()`
- **Don't add `setTimeout` or artificial delays.** Use `await tick()`, `await fireEvent.x()`, or `await waitFor()`.
- **Don't write snapshot tests.** They test implementation, not behaviour.
- **Don't import from `@testing-library/svelte`** — always use `@self/tootils/render`.

## Reference: Exemplar Test Files

Study these files for patterns and quality bar:
- `js/textbox/Textbox.test.ts` — comprehensive prop, event, and edge case testing
- `js/image/Image.test.ts` — file upload/drop, sub-component isolation (`get_coordinates_of_clicked_image`), interactive vs static modes, custom buttons
