<script lang="ts">
	import { getContext, onMount, createEventDispatcher, tick } from "svelte";
	import { TABS } from "./Tabs.svelte";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let name: string;
	export let id: string | number | object | false = {};

	const dispatch = createEventDispatcher<{ select: undefined }>();

	const { register_tab, unregister_tab, selected_tab } = getContext(TABS);

	id = id === false ? {} : id;

	register_tab({ name, id });

	onMount(() => {
		return () => unregister_tab({ name, id });
	});

	$: $selected_tab === id && tick().then(() => dispatch("select"));
</script>

{#if $selected_tab === id}
	<div
		id={elem_id}
		class="tabitem p-2 border-2 border-t-0 border-gray-200 relative flex"
		class:!hidden={!visible}
	>
		<div
			class="flex flex-col gr-gap gr-form-gap relative col overflow-auto flex-1"
		>
			<slot />
		</div>
	</div>
{/if}
