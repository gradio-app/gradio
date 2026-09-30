<script module lang="ts">
	export { default as BaseTabItem } from "./shared/TabItem.svelte";
</script>

<script lang="ts">
	import { Gradio, css_units } from "@gradio/utils";
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
	alignment={gradio.props.alignment}
	scale={gradio.shared.scale}
	height={gradio.props.height != null
		? css_units(gradio.props.height)
		: undefined}
	max_height={gradio.props.max_height != null
		? css_units(gradio.props.max_height)
		: undefined}
	component_id={gradio.props.component_id}
	onselect={(data) => gradio.dispatch("select", data)}
>
	{@render props.children?.()}
</TabItem>
