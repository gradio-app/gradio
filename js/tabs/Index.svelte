<script context="module" lang="ts">
	export { default as BaseTabs, TABS, type Tab } from "./shared/Tabs.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import Tabs from "./shared/Tabs.svelte";
	import Walkthrough from "./shared/Walkthrough.svelte";
	import type { TabsProps, TabsEvents } from "./types";
	import { tick, untrack } from "svelte";

	let props = $props();
	const gradio = new Gradio<TabsEvents, TabsProps>(props);

	$effect(() => {
		if (gradio.props.selected) {
			const selected = gradio.props.selected;
			const initial_tabs = untrack(() => gradio.props.initial_tabs);
			// Defer dispatch so downstream work (revealing previously hidden
			// tab content via render_previously_invisible_children) doesn't
			// race with the selected-prop propagation to the shared Tabs
			// component; synchronous state mutations here leave the tab UI
			// stuck on the previous selection.
			tick().then(() => {
				const i = initial_tabs.findIndex((t) => t.id === selected);
				if (i === -1) return;
				gradio.dispatch("gradio_tab_select", {
					value: initial_tabs[i].label,
					index: i,
					id: initial_tabs[i].id,
					component_id: initial_tabs[i].component_id
				});
			});
		}
	});
</script>

{#if gradio.props.name === "walkthrough"}
	<Walkthrough
		visible={gradio.shared.visible}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		bind:selected={gradio.props.selected}
		on:change={() => gradio.dispatch("change")}
		on:select={(e) => {
			gradio.dispatch("select", e.detail);
			// gradio_tab_select is dispatched via the $effect above, which
			// waits until the selected-prop propagation to the shared Tabs
			// has flushed. Dispatching synchronously here races with that
			// propagation and can stall reactive updates.
		}}
		initial_tabs={gradio.props.initial_tabs}
	>
		<slot />
	</Walkthrough>
{:else}
	<Tabs
		visible={gradio.shared.visible}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		bind:selected={gradio.props.selected}
		on:change={() => gradio.dispatch("change")}
		on:select={(e) => {
			gradio.dispatch("select", e.detail);
			// gradio_tab_select is dispatched via the $effect above, which
			// waits until the selected-prop propagation to the shared Tabs
			// has flushed. Dispatching synchronously here races with that
			// propagation and can stall reactive updates.
		}}
		initial_tabs={gradio.props.initial_tabs}
	>
		<slot />
	</Tabs>
{/if}
