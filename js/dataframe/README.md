# @gradio/dataframe

Standalone Svelte component that brings Gradio's Dataframe UI to any Svelte/SvelteKit project.

This component is lightweight, virtualized for efficient rendering of large datasets, and offers features like column freezing, and customizable styling via CSS variables. Use this component when you need a highly interactive, accessible, and easily themeable table for user-facing applications, especially where seamless Svelte/SvelteKit integration is important.

## Install

With `npm`:

```shell
npm i @gradio/dataframe
```

With `pnpm`:

```shell
pnpm add @gradio/dataframe
```

**[View on npm](https://www.npmjs.com/package/@gradio/dataframe)**

## Usage (Svelte/SvelteKit)

```svelte
<script lang="ts">
  import Dataframe from "@gradio/dataframe";

  let value = {
    data: [
      ["Alice", 25, true],
      ["Bob", 30, false]
    ],
    headers: ["Name", "Age", "Active"],
  };

  function handle_change(e: any) {
    console.log("changed", e.detail);
  }

  function handle_select(e: any) {
    console.log("selected", e.detail);
  }

  function handle_input(e: any) {
    console.log("input", e.detail);
  }
</script>

<Dataframe
  bind:value
  {datatype}
  show_search="search"
  show_row_numbers={true}
  show_copy_button={true}
  show_fullscreen_button={true}
  editable={true}
  on:change={handle_change}
  on:select={handle_select}
  on:input={handle_input}
  />
```

## Props

```typescript
interface DataframeProps {
	/**
	 * The value object containing the table data, headers, and optional metadata.
	 * Example: { data: [...], headers: [...], metadata?: any }
	 * Default: { data: [[]], headers: [] }
	 */
	value: {
		data: (string | number | boolean)[][];
		headers: string[];
		metadata?: any;
	};

	/**
	 * Array of data types per column. Supported: "str", "number", "bool", "date", "markdown", "html".
	 * Default: []
	 */
	datatype?: string[];

	/**
	 * Enable or disable cell editing.
	 * Default: true
	 */
	editable?: boolean;

	/**
	 * Show or hide the row number column.
	 * Default: true
	 */
	show_row_numbers?: boolean;

	/**
	 * Show search input. Can be "search", "filter", or "none.
	 * Default: "none"
	 */
	show_search?: "none" | "search" | "filter" | boolean;

	/**
	 * Show or hide the copy to clipboard button.
	 * Default: true
	 */
	show_copy_button?: boolean;

	/**
	 * Show or hide the fullscreen toggle button.
	 * Default: true
	 */
	show_fullscreen_button?: boolean;

	/**
	 * Accessible caption for the table.
	 * Default: null
	 */
	label?: string | null;

	/**
	 * Show or hide the dataframe label.
	 * Default: true
	 */
	show_label?: boolean;

	/**
	 * (Optional) Set column widths in CSS units (e.g. ["100px", "20%", ...]).
	 */
	column_widths?: string[];

	/**
	 * (Optional) Set the maximum height of the table in pixels.
	 * Default: 500
	 */
	max_height?: number;

	/**
	 * (Optional) Set the maximum number of characters per cell.
	 */
	max_chars?: number;

	/**
	 * (Optional) Enable or disable line breaks in cells.
	 * Default: true
	 */
	line_breaks?: boolean;

	/**
	 * (Optional) Enable or disable text wrapping in cells.
	 * Default: false
	 */
	wrap?: boolean;
}
```

## Events

The component emits the following events:

```ts
// Fired when table data changes
on:change={(e: CustomEvent<{ data: (string | number | boolean)[][]; headers: string[]; metadata: any }>) => void}

// Fired when a cell is selected
on:select={(e: CustomEvent<{ index: number[]; value: any; selected: boolean }>) => void}

// Fired on user input (search/filter)
on:input={(e: CustomEvent<string | null>) => void}
```

Example:

```svelte
<Dataframe
  on:change={(e) => console.log('data', e.detail)}
  on:input={(e) => console.log('input', e.detail)}
  on:select={(e) => console.log('select', e.detail)}
/>
```

## TypeScript

The package publishes `types.d.ts` with `DataframeProps` module declarations.

## Custom Styling

The standalone package exposes a small set of public CSS variables you can use to theme the Dataframe. These variables are namespaced with `--gr-df-*` and are the recommended way to override the default styling.

**Color Variables**

- `--gr-df-table-bg-even` — background for even rows
- `--gr-df-table-bg-odd` — background for odd rows
- `--gr-df-copied-cell-color` - background for copied cells
- `--gr-df-table-border` — table border color
- `--gr-df-table-text` — table text color
- `--gr-df-accent` — primary accent color
- `--gr-df-accent-soft` — soft/pale accent color

**Font Variables**

- `--gr-df-font-size` — table body font-size
- `--gr-df-font-mono` — monospace font family
- `--gr-df-font-sans` — sans serif font family

**Border/Radius Variables**

- `--gr-df-table-radius` — table corner radius

Example:

```svelte
<div class="df-theme">
  <Dataframe ... />
</div>

<style>
  .df-theme {
    --gr-df-accent: #7c3aed;
  }
</style>
```

Alternatively, you can target internal classes within the Dataframe using a global override.

```css
.df-theme :global(.cell-wrap) {
	background-color: #7c3aed;
}
```

**Note:** This standalone component does **not** currently support the file upload functionality (e.g. drag-and-dropping to populate the dataframe) that is available in the Gradio Dataframe component.

## License

MIT
