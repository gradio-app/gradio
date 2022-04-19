<script lang="ts">
	import { getContext, onDestroy } from "svelte";
	import { TABS } from "./Tabs.svelte";

	export let name: string;
	const id = {};

	const { register_tab, unregister_tab, selected_tab } = getContext(TABS);

	register_tab({ name, id });

	onDestroy(() => {
		unregister_tab({ name, id });
	});
</script>

{#if $selected_tab === id}
	<div class="p-2 border-2 border-t-0 border-gray-200 relative">
		<slot />
	</div>
{/if}
