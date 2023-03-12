<script lang="ts">
	import { getContext, onMount, createEventDispatcher, tick } from "svelte";
	import { TABS } from "./Tabs.svelte";
	import { Component as Column } from "./../../app/src/components/Column";
	import type { SelectEvent } from "@gradio/utils";

	export let elem_id: string = "";
	export let name: string;
	export let id: string | number | object = {};
	export let tab_index: number;

	const dispatch = createEventDispatcher<{ select: SelectEvent }>();

	const { register_tab, unregister_tab, selected_tab } = getContext(TABS);

	register_tab({ name, id });

	onMount(() => {
		return () => unregister_tab({ name, id });
	});

	$: $selected_tab === id &&
		tick().then(() => dispatch("select", { value: id, index: tab_index }));
</script>

<div
	id={elem_id}
	class="tabitem"
	style:display={$selected_tab === id ? "block" : "none"}
>
	<Column>
		<slot />
	</Column>
</div>

<style>
	div {
		display: flex;
		position: relative;
		border: 1px solid var(--color-border-primary);
		border-top: none;
		border-bottom-right-radius: var(--container-radius);
		border-bottom-left-radius: var(--container-radius);
		padding: var(--block-padding);
	}
</style>
