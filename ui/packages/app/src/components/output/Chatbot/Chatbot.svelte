<script lang="ts">
	import { beforeUpdate, afterUpdate } from "svelte";
	import Html from "../Html/Html.svelte";
	export let value: Array<string>;
	let div: HTMLDivElement;
	let autoscroll: Boolean;

	beforeUpdate(() => {
		autoscroll =
			div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight);
	});
</script>

<div
	class="overflow-y-auto h-64 border border-b-0 rounded-t-lg leading-tight"
	bind:this={div}
>
	<div class="flex flex-col items-end space-y-4 p-3">
		{#each value as message}
			<div
				class="px-3 py-2 rounded-2xl place-self-start bg-gray-300 dark:bg-gray-850 dark:text-gray-200 mr-7"
			>
				{message[1]}
			</div>
			<div class="px-3 py-2 rounded-2xl bg-yellow-500 text-white ml-7">
				{message[0]}
			</div>
		{/each}
	</div>
</div>
