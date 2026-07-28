<script lang="ts">
	import { setContext } from "svelte";
	import { writable } from "svelte/store";
	import { TABS } from "@gradio/tabs";
	import TabItem, { BaseTabItem } from "./Index.svelte";

	let all = $props();
	const cfg = (all as any).props ?? {};

	const selected_tab = writable<string | number | false>(
		cfg.tab_selected ?? "t1"
	);
	const selected_tab_index = writable<number>(cfg.tab_selected_index ?? 0);

	setContext(TABS, {
		register_tab: (tab: any, order: number) => {
			cfg.on_register?.(tab);
			return order;
		},
		unregister_tab: () => {},
		selected_tab,
		selected_tab_index
	});
</script>

{#if cfg.use_index}
	<TabItem
		shared_props={{
			elem_id: "",
			elem_classes: [],
			label: "First Tab",
			visible: cfg.tab_visible ?? true,
			interactive: true,
			scale: cfg.tab_scale ?? 0
		}}
		props={{
			id: cfg.omit_id ? undefined : (cfg.tab_id ?? "t1"),
			order: 0,
			component_id: 1
		}}
	>
		<div data-testid="tab-content">tab panel content</div>
	</TabItem>
{:else}
	<BaseTabItem
		label="First Tab"
		id={cfg.omit_id ? undefined : (cfg.tab_id ?? "t1")}
		order={0}
		visible={cfg.tab_visible ?? true}
		interactive={true}
		scale={0}
		component_id={1}
		onselect={(data) => cfg.on_tab_select?.(data)}
	>
		<div data-testid="tab-content">tab panel content</div>
	</BaseTabItem>
{/if}
