<script lang="ts">
	import { getContext, onMount, createEventDispatcher, tick } from "svelte";
	import { TABS } from "./Tabs.svelte";

	export let name: string;

	const dispatch = createEventDispatcher<{ select: undefined }>();
	const id = {};

	const { register_tab, unregister_tab, selected_tab } = getContext(TABS);

	register_tab({ name, id });

	onMount(() => {
		return () => unregister_tab({ name, id });
	});

	$: $selected_tab === id && tick().then(() => dispatch("select"));
</script>

{#if $selected_tab === id}
	<div class="tabitem p-2 border-2 border-t-0 border-gray-200 relative flex">
		<slot />
	</div>
{/if}
