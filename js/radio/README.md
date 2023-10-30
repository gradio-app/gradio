# `@gradio/radio`

```html
<script>
    import { BaseRadio, BaseExample } from "@gradio/radio"; 
</script>
```

BaseRadio
```javascript
	export let display_value: string;
	export let internal_value: string | number;
	export let disabled = false;
	export let elem_id = "";
	export let selected: string | number | null = null;
```

BaseExample
```javascript
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
```