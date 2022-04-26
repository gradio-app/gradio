<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";

	export let value: Array<[string, string]>;
	export let style: string = "";

	let div: HTMLDivElement;
	let autoscroll: Boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	beforeUpdate(() => {
		autoscroll =
			div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight);
	});

	$: value && dispatch("change");
</script>

<div class="overflow-y-auto h-[40vh]" bind:this={div}>
	<div class="flex flex-col items-end space-y-4 p-3">
		{#each value as message}
			<div
				data-testid="bot"
				class="px-3 py-2 rounded-[22px] rounded-br-none bg-orange-500 text-white ml-7 text-sm"
			>
				{message[0]}
			</div>
			<div
				data-testid="user"
				class="px-3 py-2 rounded-[22px] rounded-bl-none place-self-start bg-gray-200 mr-7 text-gray-800 text-sm"
			>
				{message[1]}
			</div>
		{/each}
	</div>
</div>
