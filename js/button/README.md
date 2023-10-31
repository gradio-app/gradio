# `@gradio/button`

```javascript
<script>
	import { BaseButton } from "@gradio/button";
	import { createEventDispatcher, tick, getContext } from "svelte";
	const dispatch = createEventDispatcher();
</script>

<BaseButton
	{value}
	{variant}
	{elem_id}
	{elem_classes}
	{size}
	{scale}
	{link}
	{icon}
	{min_width}
	{visible}
	{root}
	{root_url}
	on:click={() => dispatch("click")}
>
	{"My Button"}
</Button>
```
