<script module lang="ts">
	export { default as BaseColumn } from "./BaseColumn.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import BaseColumn from "./BaseColumn.svelte";

	let props = $props();

	const gradio = new Gradio<{}, {}>(props);
</script>

<BaseColumn {...gradio.shared} {...gradio.props}>
	{@render props.children?.()}
</BaseColumn>
