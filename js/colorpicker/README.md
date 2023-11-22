# `@gradio/colorpicker`

```html
<script>
    import { BaseColorPicker, BaseExample } from "@gradio/colorpicker";
</script>
```

BaseColorPicker
```javascript
	export let value = "#000000";
	export let value_is_output = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label = true;
```

BaseExample
```javascript
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
```