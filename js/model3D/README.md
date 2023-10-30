# `gradio/model3d`

```html
<script>
    import {BaseModel3D, BaseModel3DUpload, BaseExample } from `@gradio/model3d`;
</script>
```

BaseModel3D
```javascript
	export let value: FileData | null;
	export let clear_color: [number, number, number, number] = [0, 0, 0, 0];
	export let label = "";
	export let show_label: boolean;
	export let i18n: I18nFormatter;
	export let zoom_speed = 1;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];
```

BaseModel3DUpload
```javascript
	export let value: null | FileData;
	export let clear_color: [number, number, number, number] = [0, 0, 0, 0];
	export let label = "";
	export let show_label: boolean;
	export let root: string;
	export let i18n: I18nFormatter;
	export let zoom_speed = 1;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];
```

BaseExample
```javascript
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
```