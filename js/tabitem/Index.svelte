<script context="module" lang="ts">
	export { default as BaseTabItem } from "./shared/TabItem.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import TabItem from "./shared/TabItem.svelte";
	import type { TabItemProps, TabItemEvents } from "./types";

	let props = $props();

	const gradio = new Gradio<TabItemEvents, TabItemProps>(props);
</script>

<TabItem
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	label={gradio.shared.label}
	visible={gradio.shared.visible}
	interactive={gradio.shared.interactive}
	id={gradio.props.id}
	order={gradio.props.order}
	scale={gradio.props.scale}
	on:select={({ detail }) => gradio.dispatch("select", detail)}
>
	<slot />
</TabItem>
