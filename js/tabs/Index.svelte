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
			// defer dispatch to avoid race with selected-prop propagation
			// to the shared tabs component
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
		}}
		initial_tabs={gradio.props.initial_tabs}
	>
		{@render props.children?.()}
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
		}}
		initial_tabs={gradio.props.initial_tabs}
	>
		{@render props.children?.()}
	</Tabs>
{/if}
