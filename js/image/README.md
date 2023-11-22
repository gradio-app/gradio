# `@gradio/image`

```html
<script>
	import { BaseImageUploader, BaseStaticImage, Webcam, BaseExample } from "@gradio/image";
</script>
```

BaseImageUploader
```javascript
	export let sources: ("clipboard" | "webcam" | "upload")[] = [
		"upload",
		"clipboard",
		"webcam"
	];
	export let streaming = false;
	export let pending = false;
	export let mirror_webcam: boolean;
	export let selectable = false;
	export let root: string;
	export let i18n: I18nFormatter;
```

BaseStaticImage
```javascript
	export let value: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let show_download_button = true;
	export let selectable = false;
	export let show_share_button = false;
	export let root: string;
	export let i18n: I18nFormatter;
```

Webcam
```javascript
	export let streaming = false;
	export let pending = false;

	export let mode: "image" | "video" = "image";
	export let mirror_webcam: boolean;
	export let include_audio: boolean;
	export let i18n: I18nFormatter;
```

BaseExample
```javascript
	export let value: string;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected = false;
```