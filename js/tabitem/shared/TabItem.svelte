<script lang="ts">
	import { getContext, onMount, createEventDispatcher, tick } from "svelte";
	import { TABS } from "@gradio/tabs";
	import Column from "@gradio/column";
	import type { SelectData } from "@gradio/utils";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let label: string;
	export let id: string | number | object = {};
	export let visible: boolean;
	export let interactive: boolean;
	export let order: number;
	export let scale: number;

	const dispatch = createEventDispatcher<{ select: SelectData }>();

	const { register_tab, unregister_tab, selected_tab, selected_tab_index } =
		getContext(TABS) as any;

	let tab_index: number;

	$: tab_index = register_tab(
		{ label, id, elem_id, visible, interactive, scale },
		order
	);

	onMount(() => {
		return (): void => unregister_tab({ label, id, elem_id }, order);
	});

	$: $selected_tab_index === tab_index &&
		tick().then(() => dispatch("select", { value: label, index: tab_index }));
</script>

{#if $selected_tab === id && visible}
	<div
		id={elem_id}
		class="tabitem {elem_classes.join(' ')}"
		class:grow-children={scale >= 1}
		style:display={$selected_tab === id && visible ? "flex" : "none"}
		style:flex-grow={scale}
		role="tabpanel"
	>
		<Column scale={scale >= 1 ? scale : null}>
			<slot />
		</Column>
	</div>
{/if}

<style>
	div {
		display: flex;
		flex-direction: column;
		position: relative;
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--block-padding);
		width: 100%;
		box-sizing: border-box;
	}
	.grow-children > :global(.column > .column) {
		flex-grow: 1;
	}
</style>
