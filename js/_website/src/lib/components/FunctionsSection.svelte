<script lang="ts">
	import EventListeners from "$lib/components/EventListeners.svelte";
	import FunctionDoc from "$lib/components/FunctionDoc.svelte";
	let { fns = [] as any[], event_listeners = false } = $props();
</script>

{#if event_listeners}
	{#if fns && fns.length > 0}
		<div class="flex flex-col pl-12">
			<EventListeners {fns} />
			<div class="ml-12" />
		</div>
	{/if}
{:else}
	<div class="flex flex-col pl-12">
		{#each fns as fn}
			<FunctionDoc {fn} />
		{/each}
		<div class="ml-12" />
	</div>
{/if}
