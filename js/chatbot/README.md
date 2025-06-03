# `@gradio/chatbot`

```html
<script>
	import { BaseChatBot } from "@gradio/chatbot";
</script>
```


BaseChatBot
```javascript
	export let value:
		| [
				string | { file: FileData; alt_text: string | null } | null,
				string | { file: FileData; alt_text: string | null } | null
		  ][]
		| null;
	let old_value:
		| [
				string | { file: FileData; alt_text: string | null } | null,
				string | { file: FileData; alt_text: string | null } | null
		  ][]
		| null = null;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let pending_message = false;
	export let selectable = false;
	export let likeable = false;
	export let show_share_button = false;
	export let rtl = false;
	export let show_copy_button = false;
	export let avatar_images: [string | null, string | null] = [null, null];
	export let sanitize_html = true;
	export let bubble_full_width = true;
	export let render_markdown = true;
	export let line_breaks = true;
	export let root: string;
	export let root_url: null | string;
	export let i18n: I18nFormatter;
	export let layout: "bubble" | "panel" = "bubble";
```
