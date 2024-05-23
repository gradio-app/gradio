# `@gradio/highlightedtext`

```html
<script>
    import { BaseStaticHighlightedText, BaseInteractiveHighlightedText } from `@gradio/highlightedtext`;
</script>
```


BaseStaticHighlightedText
```javascript
	export let value: {
		token: string;
		class_or_confidence: string | number | null;
	}[] = [];
	export let show_legend = false;
	export let show_inline_category = true;
	export let color_map: Record<string, string> = {};
	export let selectable = false;
```

BaseInteractiveHighlightedText
```javascript
	export let value: {
		token: string;
		class_or_confidence: string | number | null;
	}[] = [];
	export let show_legend = false;
	export let color_map: Record<string, string> = {};
	export let selectable = false;
```
