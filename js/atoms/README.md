# `@gradio/atoms`

```html
<script lang="ts">
	import { Block, BlockTitle, BlockLabel, IconButton, Empty, Info, ShareButton, UploadText} from "@gradio/atoms";
</script>
```

Block:
```javascript
	export let height: number | undefined = undefined;
	export let width: number | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let variant: "solid" | "dashed" | "none" = "solid";
	export let border_mode: "base" | "focus" = "base";
	export let padding = true;
	export let type: "normal" | "fieldset" = "normal";
	export let test_id: string | undefined = undefined;
	export let explicit_call = false;
	export let container = true;
	export let visible = true;
	export let allow_overflow = true;
	export let scale: number | null = null;
	export let min_width = 0;
```

BlockTitle:
```javascript
	export let show_label = true;
	export let info: string | undefined = undefined;
```

BlockLabel:
```javascript
	export let label: string | null = null;
	export let Icon: any;
	export let show_label = true;
	export let disable = false;
	export let float = true;
```

IconButton:
```javascript
	export let Icon: any;
	export let label = "";
	export let show_label = false;
	export let pending = false;
```

Empty:
```javascript
	export let size: "small" | "large" = "small";
	export let unpadded_box = false;
```

ShareButton:
```javascript
	export let formatter: (arg0: any) => Promise<string>;
	export let value: any;
	export let i18n: I18nFormatter;
```

UploadText:
```javascript
	export let type: "video" | "image" | "audio" | "file" | "csv" = "file";
	export let i18n: I18nFormatter;
```