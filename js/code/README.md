# `@gradio/code`

```html
<script>
    import { BaseCode, BaseCopy, BaseDownload, BaseWidget, BaseExample} from "gradio/code";
</script>
```

BaseCode
```javascript
	export let class_names = "";
	export let value = "";
	export let dark_mode: boolean;
	export let basic = true;
	export let language: string;
	export let lines = 5;
	export let extensions: Extension[] = [];
	export let use_tab = true;
	export let readonly = false;
	export let placeholder: string | HTMLElement | null | undefined = undefined;
```

BaseCopy
```javascript
	export let value: string;
```

BaseDownload
```javascript
	export let value: string;
	export let language: string;
```

BaseWidget
```javascript
	export let value: string;
	export let language: string;
```

BaseExample
```
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
```