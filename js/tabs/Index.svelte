<script context="module" lang="ts">
	export { default as BaseTabs, TABS } from "./shared/Tabs.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import Tabs from "./shared/Tabs.svelte";

	const dispatch = createEventDispatcher();

	interface Tab {
		name: string;
		id: string | number;
		elem_id: string | undefined;
		visible: boolean;
		interactive: boolean;
	}

	export let visible = true;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let selected: number | string;
	export let inital_tabs: Tab[];
	export let gradio: Gradio<{
		change: never;
		select: SelectData;
	}>;

	$: dispatch("prop_change", { selected });
</script>

<Tabs
	{visible}
	{elem_id}
	{elem_classes}
	bind:selected
	on:change={() => gradio.dispatch("change")}
	on:select={(e) => gradio.dispatch("select", e.detail)}
	{inital_tabs}
>
	<slot />
</Tabs>
