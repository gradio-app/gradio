<script lang="ts">
	import { setContext } from "svelte";
	import { writable } from "svelte/store";
	import { TABS } from "@gradio/tabs";
	import { BaseTabItem } from "./Index.svelte";

	let all = $props();
	const cfg = (all as any).props ?? {};

	const selected_tab = writable<string | number | false>(
		cfg.tab_selected ?? "t1"
	);
	const selected_tab_index = writable<number>(cfg.tab_selected_index ?? 0);

	setContext(TABS, {
		register_tab: (_tab: any, order: number) => order,
		unregister_tab: () => {},
		selected_tab,
		selected_tab_index
	});
</script>

<BaseTabItem
	label="First Tab"
	id="t1"
	order={0}
	visible={cfg.tab_visible ?? true}
	interactive={true}
	scale={0}
	component_id={1}
	on:select={(e) => cfg.on_tab_select?.(e.detail)}
>
	<div data-testid="tab-content">tab panel content</div>
</BaseTabItem>
