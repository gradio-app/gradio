# `@gradio/dropdown`

```html
<script>
	import { BaseDropdown, BaseMultiselect, BaseExample } from "@gradio/dropdown";
</script>
```

BaseDropdown

```javascript
	export let label: string;
	export let info: string | undefined = undefined;
	export let value: string | number | (string | number)[] | undefined = [];
	export let value_is_output = false;
	export let choices: [string, string | number][];
	export let disabled = false;
	export let show_label: boolean;
	export let container = true;
	export let allow_custom_value = false;
	export let filterable = true;
	export let max_values_shown: number | null = 100; // Limits rendered matches; null renders all matches.
```

BaseMultiselect

```javascript
	export let label: string;
	export let info: string | undefined = undefined;
	export let value: string | number | (string | number)[] | undefined = [];
	export let value_is_output = false;
	export let max_choices: number | null = null;
	export let choices: [string, string | number][];
	export let disabled = false;
	export let show_label: boolean;
	export let container = true;
	export let allow_custom_value = false;
	export let filterable = true;
	export let max_values_shown: number | null = 100; // Limits rendered matches; null renders all matches.
	export let i18n: I18nFormatter;
```

BaseExample

```javascript
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
```
