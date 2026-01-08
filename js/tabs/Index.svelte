<script context="module" lang="ts">
	export { default as BaseTabs, TABS, type Tab } from "./shared/Tabs.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import Tabs from "./shared/Tabs.svelte";
	import Walkthrough from "./shared/Walkthrough.svelte";
	import type { TabsProps, TabsEvents } from "./types";
	import { untrack } from "svelte";

	let props = $props();
	const gradio = new Gradio<TabsEvents, TabsProps>(props);

	// let old_selected = $state(gradio.props.selected);

	$inspect("gradio.props.selected", gradio.props.selected);

	$effect(() => {
		// console.log("Selected tab changed effect triggered", "selected:", gradio.props.selected, "old_selected:", old_selected);
		// if (old_selected !== gradio.props.selected) {
		if (gradio.props.selected) {
			untrack(() => {
				console.log("Here");
				const i = gradio.props.initial_tabs.findIndex(
					(t) => t.id === gradio.props.selected
				);
				// old_selected = gradio.props.selected;
				// console.log("old_selected updated to", old_selected);
				gradio.dispatch("gradio_tab_select", {
					value: gradio.props.initial_tabs[i].label,
					index: i,
					id: gradio.props.initial_tabs[i].id,
					component_id: gradio.props.initial_tabs[i].component_id
				});
			});
		}

		// }
	});
</script>

{#if gradio.props.name === "walkthrough"}
	<Walkthrough
		visible={gradio.shared.visible}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		selected={gradio.props.selected}
		on:change={() => gradio.dispatch("change")}
		on:select={(e) => {
			gradio.dispatch("select", e.detail);
			gradio.dispatch("gradio_tab_select", e.detail);
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
			gradio.dispatch("gradio_tab_select", e.detail);
		}}
		initial_tabs={gradio.props.initial_tabs}
	>
		<slot />
	</Tabs>
{/if}
