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

  const value = {
    data: [
      ["Alice", 25, true],
      ["Bob", 30, false]
    ],
    headers: ["Name", "Age", "Active"],
    metadata: null
  };

  const datatype = ["str", "number", "bool"]; // Optional

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
  {value}
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
| `value`                 | `object`                               | —         | Object containing `data` (array of rows), `headers` (array of column names), and `metadata` |
| `datatype`              | `string[]`                             | `[]`      | Array of data types for each column: `"str"`, `"number"`, `"bool"`, `"date"`, `"markdown"`, `"html"` |
| `i18n`                  | `object`                               | `{}`      | Internationalization object for translations               |
| `editable`              | `boolean`                               | `true`    | Enable cell editing                                        |
| `show_row_numbers`      | `boolean`                               | `true`    | Show a row-number column                                   |
| `show_search`           | `string \| boolean`                     | `"search"` | Show search input. Can be `true`, `false`, or custom text |
| `show_copy_button`      | `boolean`                               | `true`    | Show copy-to-clipboard button                              |
| `show_fullscreen_button`| `boolean`                               | `true`    | Show fullscreen toggle button                              |
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

Override the internal design tokens

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

License
-------

MIT

