# `@gradio/gallery`

```html
<script>
	import { BaseGallery } from "@gradio/gallery";
</script>
```

BaseGallery
```javascript
	export let show_label = true;
	export let label: string;
	export let root = "";
	export let root_url: null | string = null;
	export let value: { image: FileData; caption: string | null }[] | null = null;
	export let columns: number | number[] | undefined = [2];
	export let rows: number | number[] | undefined = undefined;
	export let height: number | "auto" = "auto";
	export let preview: boolean;
	export let allow_preview = true;
	export let object_fit: "contain" | "cover" | "fill" | "none" | "scale-down" =
		"cover";
	export let show_share_button = false;
	export let show_download_button = false;
	export let i18n: I18nFormatter;
	export let selected_index: number | null = null;
```