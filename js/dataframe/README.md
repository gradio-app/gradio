# `@gradio/dataframe`

```html
<script>
    import { BaseDataFrame, BaseExample } from "@gradio/dataframe";
</script>
```

BaseDataFrame
```javascript
	export let datatype: Datatype | Datatype[];
	export let label: string | null = null;
	export let headers: Headers = [];
	let values: (string | number)[][];
	export let value: { data: Data; headers: Headers; metadata: Metadata } | null;
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];

	export let editable = true;
	export let wrap = false;
	export let root: string;
	export let i18n: I18nFormatter;

	export let height = 500;
	export let line_breaks = true;
	export let column_widths: string[] = [];
```

BaseExample
```javascript
	export let gradio: Gradio;
	export let value: (string | number)[][] | string;
	export let type: "gallery" | "table";
	export let selected = false;
	export let index: number;
```