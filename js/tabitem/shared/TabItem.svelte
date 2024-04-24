<script lang="ts">
	import { getContext, onMount, createEventDispatcher, tick } from "svelte";
	import { TABS } from "@gradio/tabs";
	import Column from "@gradio/column";
	import type { SelectData } from "@gradio/utils";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let name: string;
	export let id: string | number | object = {};
	export let visible: boolean;
	export let interactive: boolean;

	const dispatch = createEventDispatcher<{ select: SelectData }>();

	const { register_tab, unregister_tab, selected_tab, selected_tab_index } =
		getContext(TABS) as any;

	let tab_index: number;

	$: tab_index = register_tab({ name, id, elem_id, visible, interactive });

	onMount(() => {
		return (): void => unregister_tab({ name, id, elem_id });
	});

	$: $selected_tab_index === tab_index &&
		tick().then(() => dispatch("select", { value: name, index: tab_index }));
</script>

<div
	id={elem_id}
	class="tabitem {elem_classes.join(' ')}"
	style:display={$selected_tab === id && visible ? "block" : "none"}
	role="tabpanel"
>
	<Column>
		<slot />
	</Column>
</div>

<style>
	div {
		display: flex;
		position: relative;
		border: 1px solid var(--border-color-primary);
		border-top: none;
		border-bottom-right-radius: var(--container-radius);
		border-bottom-left-radius: var(--container-radius);
		padding: var(--block-padding);
	}
</style>
