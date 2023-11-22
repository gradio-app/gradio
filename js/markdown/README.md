# `@gradio/markdown`

```html
<script>
    import { BaseMarkdown, MarkdownCode, BaseExample } from `@gradio/markdown`;
</script>
```

BaseMarkdown
```javascript
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let min_height = false;
	export let rtl = false;
	export let sanitize_html = true;
	export let line_breaks = false;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
```

MarkdownCode
```javascript
	export let chatbot = true;
	export let message: string;
	export let sanitize_html = true;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[] = [];
	export let render_markdown = true;
	export let line_breaks = true;
```

BaseExample
```javascript
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
	export let sanitize_html: boolean;
	export let line_breaks: boolean;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
```