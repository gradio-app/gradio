<script context="module" lang="ts">
	export { default as BaseTabs, TABS, type Tab } from "./shared/Tabs.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import Tabs, { type Tab } from "./shared/Tabs.svelte";
	import Walkthrough from "./shared/Walkthrough.svelte";

	const dispatch = createEventDispatcher();

	export let visible = true;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let selected: number | string;
	export let initial_tabs: Tab[] = [];
	export let name: "tabs" | "walkthrough" = "tabs";
	export let gradio:
		| Gradio<{
				change: never;
				select: SelectData;
		  }>
		| undefined;

	$: dispatch("prop_change", { selected });
</script>

{#if name === "walkthrough"}
	<Walkthrough
		{visible}
		{elem_id}
		{elem_classes}
		bind:selected
		on:change={() => gradio?.dispatch("change")}
		on:select={(e) => gradio?.dispatch("select", e.detail)}
		{initial_tabs}
	>
		<slot />
	</Walkthrough>
{:else}
	<Tabs
		{visible}
		{elem_id}
		{elem_classes}
		bind:selected
		on:change={() => gradio?.dispatch("change")}
		on:select={(e) => gradio?.dispatch("select", e.detail)}
		{initial_tabs}
	>
		<slot />
	</Tabs>
{/if}
