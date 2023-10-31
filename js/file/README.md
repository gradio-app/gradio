# `@gradio/file`

```html
<script>
	import { BaseFile, BaseFileUpload, FilePreview, BaseExample } from "@gradio/file";
</script>
```

BaseFile
```javascript
	export let value: FileData | FileData[] | null = null;
	export let label: string;
	export let show_label = true;
	export let selectable = false;
	export let height: number | undefined = undefined;
	export let i18n: I18nFormatter;
```

BaseFileUpload
```javascript
	export let value: null | FileData | FileData[];
	export let label: string;
	export let show_label = true;
	export let file_count = "single";
	export let file_types: string[] | null = null;
	export let selectable = false;
	export let root: string;
	export let height: number | undefined = undefined;
	export let i18n: I18nFormatter;
```

FilePreview
```javascript
	export let value: FileData | FileData[];
	export let selectable = false;
	export let height: number | undefined = undefined;
	export let i18n: I18nFormatter;
```

BaseExample
```javascript
	export let value: FileData;
	export let type: "gallery" | "table";
	export let selected = false;
```