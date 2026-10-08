<script module lang="ts">
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

	// Starts unset so the first run also dispatches: Tabs can mount with a
	// selection applied while it was hidden, and that tab's children are not
	// rendered until gradio_tab_select (internal, not a user select event)
	// asks for them.
	let old_selected: unknown = {};

	$effect(() => {
		const selected = gradio.props.selected;
		// Only dispatch on an actual change; otherwise a single set_data can
		// re-run this effect and fire gradio_tab_select more than once.
		if (old_selected === selected) return;
		old_selected = selected;

		const initial_tabs = untrack(() => gradio.props.initial_tabs);
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
	});
</script>

{#if gradio.props.name === "walkthrough"}
	<Walkthrough
		visible={gradio.shared.visible}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		bind:selected={gradio.props.selected}
		onchange={() => gradio.dispatch("change")}
		onselect={(data) => {
			gradio.dispatch("select", data);
			gradio.dispatch("gradio_tab_select", data);
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
		overflow_behavior={gradio.props.overflow_behavior}
		onchange={() => gradio.dispatch("change")}
		onselect={(data) => {
			gradio.dispatch("select", data);
			gradio.dispatch("gradio_tab_select", data);
		}}
		initial_tabs={gradio.props.initial_tabs}
	>
		{@render props.children?.()}
	</Tabs>
{/if}
