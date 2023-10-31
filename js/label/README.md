# `@gradio/label`

```html
<script>
	import { BaseLabel } from "@gradio/label";
</script>
```

BaseLabel
```javascript
	export let value: {
		label?: string;
		confidences?: { label: string; confidence: number }[];
	};
	export let color: string | undefined = undefined;
	export let selectable = false;
```
