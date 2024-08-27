# `@gradio/textbox`

```html
<script>
    import { BaseTextbox, BaseExample } from "@gradio/textbox";
</script>
```

BaseTextbox
```javascript
	export let value = "";
	export let value_is_output = false;
	export let lines = 1;
	export let placeholder = "Type here...";
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label = true;
	export let container = true;
	export let max_lines: number;
	export let type: "text" | "password" | "email" = "text";
	export let show_copy_button = false;
	export let rtl = false;
	export let autofocus = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autoscroll = true;
	export let max_length: number | undefined = undefined;
```

BaseExample
```javascript
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
```