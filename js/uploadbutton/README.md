# `@gradio/uploadbutton`

```html
<script>
    import { BaseUploadButton } from "@gradio/uploadbutton";
</script>
```

BaseUploadButton
```javascript
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let label: string;
	export let value: null | FileData | FileData[];
	export let file_count: string;
	export let file_types: string[] = [];
	export let root: string;
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let disabled = false;
```