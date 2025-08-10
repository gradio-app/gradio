@gradio/dataframe
================================

Standalone Svelte component that brings Gradio's Dataframe UI to any Svelte/SvelteKit project. 

Install
-------

```
npm i @gradio/dataframe
# or
pnpm add @gradio/dataframe
```

Usage (Svelte/SvelteKit)
------------------------

```svelte
<script lang="ts">
  import Dataframe from "@gradio/dataframe";

  const data = [
    ["Alice", 25, true],
    ["Bob", 30, false]
  ];

  const headers = ["Name", "Age", "Active"];
  const datatype = ["str", "number", "bool"];

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
  value={data}
  {headers}
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

Props
-----

| Prop                    | Type                                   | Default   | Description                                                |
|-------------------------|----------------------------------------|-----------|------------------------------------------------------------|
| `value`                 | `(string \| number \| boolean)[][]`      | —         | Table data as rows x columns.                              |
| `headers`               | `string[]`                              | `[]` or inferred | Column headers.                                      |
| `datatype`              | `string[] \| string`                   | `"str"`   | Per-column or global: `"str"`, `"number"`, `"bool"`, `"date"`, `"markdown"`, `"html"`. |
| `editable`              | `boolean`                               | `false`   | Enable cell editing.                                       |
| `show_row_numbers`      | `boolean`                               | `false`   | Show a row-number column.                                  |
| `max_height`            | `number`                                | —         | Max table height (px); scrolls when exceeded.              |
| `show_search`           | `"none" \| "search" \| "filter"`       | `"none"`  | Show search input (and filter UI when `"filter"`).         |
| `show_copy_button`      | `boolean`                               | `false`   | Show copy-to-clipboard button.                             |
| `show_fullscreen_button`| `boolean`                               | `false`   | Show fullscreen toggle button.                             |
| `wrap`                  | `boolean`                               | `false`   | Wrap cell text (otherwise may scroll horizontally).        |
| `line_breaks`           | `boolean`                               | `true`    | Enable GFM line breaks in markdown cells.                  |
| `column_widths`         | `string[]`                              | —         | Width per column, e.g. `"120px"` or `"15%"`.               |
| `max_chars`             | `number`                                | —         | Truncate cell display after N characters.                  |
| `pinned_columns`        | `number`                                | `0`       | Pin N columns from the left.                               |
| `static_columns`        | `(string \| number)[]`                 | `[]`      | Disable edits/structure for these columns.                 |
| `fullscreen`            | `boolean`                               | `false`   | Control fullscreen state externally.                       |
| `label`                 | `string \| null`                       | `null`    | Accessible caption for the table.                          |
| `show_label`            | `boolean`                               | `true`    | Show/hide the label visually.                              |

Events
------

The component emits the following events:

| Event   | Trigger                                      | Return type                                                   |
|---------|-----------------------------------------------------|---------------------------------------------------------------|
| change  | Table data changes             | `{ data: (string \| number \| boolean)[][], headers: string[], metadata: null }` |
| select  | Cell selection change                              | `{ index: number[], value: any, selected: boolean }`          |
| input   | User input | `string \| null`                                              |


Example:

```svelte
<Dataframe
  on:change={(e) => console.log('data', e.detail)}
  on:input={(e) => console.log('input', e.detail)}
  on:select={(e) => console.log('select', e.detail)}
/>
```

TypeScript
----------

The package publishes `types.d.ts` with `DataframeProps` module declarations.

Custom Styling
--------------

The package publishes `dataframe.css` with the default styles. You can override the styles by adding your own CSS.

Option 1: Override the internal design tokens

```svelte
  <div class="df-theme">
      <Dataframe ... />
    </div>

    <style>
      .df-theme {
        --border-color-primary: #7c3aed;
        --radius-md: 10px;
        --background-fill-primary: #0b1020;
        --table-even-background-fill: #121936;
        --table-odd-background-fill: #0e1530;
        --body-text-color: #e5e7eb;
        --input-text-size: 14px;
      }
    </style>
```

Option 2: Override the internal styles

```svelte
    <div class="df-override">
      <Dataframe ... />
    </div>

    <style>
      /* Border only wraps the actual table */
      .df-override :global(.table-wrap) {
        border: 1px solid #7c3aed;
        border-radius: 10px;
        overflow: hidden;
      }

      /* Header/row styling */
      .df-override :global(.thead th) {
        background: #1f2937;
        color: #fff;
      }

      .df-override :global(.tbody td) {
        padding: 8px 10px;
      }

      /* Pinned column divider */
      .df-override :global(td.last-pinned),
      .df-override :global(th.last-pinned) {
        border-right: 1px solid #7c3aed;
      }
    </style>
```

License
-------

MIT

