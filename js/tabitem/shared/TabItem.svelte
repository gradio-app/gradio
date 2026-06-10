<script lang="ts">
	import { getContext, tick, untrack } from "svelte";
	import { TABS } from "@gradio/tabs";
	import { BaseColumn } from "@gradio/column";
	import type { SelectData } from "@gradio/utils";

	let {
		elem_id = "",
		elem_classes = [],
		label,
		id,
		visible,
		interactive,
		order,
		scale,
		component_id,
		onselect
	}: {
		elem_id?: string;
		elem_classes?: string[];
		label: string;
		id?: string | number | null;
		visible: boolean | "hidden";
		interactive: boolean;
		order: number;
		scale: number;
		component_id: number;
		onselect?: (data: SelectData) => void;
	} = $props();

	const { register_tab, unregister_tab, selected_tab, selected_tab_index } =
		getContext(TABS) as any;

	let tab_index = $state<number | undefined>(undefined);

	function _register_tab(obj: string, order: number): number {
		obj = JSON.parse(obj);
		return register_tab(obj, order);
	}

	let tab_id = $derived(id ?? component_id);

	let props_json = $derived(
		JSON.stringify({
			label,
			id: tab_id,
			elem_id,
			visible,
			interactive,
			scale,
			component_id
		})
	);

	$effect(() => {
		const tab_props = props_json;
		tab_index = untrack(() => _register_tab(tab_props, order));
	});

	$effect(() => {
		return (): void => unregister_tab({ label, id: tab_id, elem_id }, order);
	});

	$effect(() => {
		const index = tab_index;
		if (index !== undefined && $selected_tab_index === index) {
			tick().then(() => onselect?.({ value: label, index }));
		}
	});
</script>

<div
	id={elem_id}
	class="tabitem {elem_classes.join(' ')}"
	class:grow-children={scale >= 1}
	style:display={$selected_tab === tab_id && visible !== false
		? "flex"
		: "none"}
	style:flex-grow={scale}
	role="tabpanel"
>
	<BaseColumn scale={scale >= 1 ? scale : null}>
		<slot />
	</BaseColumn>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		position: relative;
		border: none;
		border-radius: var(--radius-sm);
		width: 100%;
		box-sizing: border-box;
	}
	.grow-children > :global(.column > .column) {
		flex-grow: 1;
	}
</style>
