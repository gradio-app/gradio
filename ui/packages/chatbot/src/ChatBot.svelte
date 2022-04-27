<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";

	export let value: Array<[string, string]>;
	export let style: string = "";
	export let color_map: Array<[string, string]>;

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
	console.log("color_map ", color_map);
	if (!color_map) {
		color_map = ["rgb(251 146 60)", "rgb(156 163 175)"];
	}
	console.log("color_map ", color_map);
</script>

<div class="overflow-y-auto h-[40vh]" bind:this={div}>
	<div class="flex flex-col items-end space-y-4 p-3">
		{#each value as message}
			<div
				data-testid="user"
				class="px-3 py-2 rounded-[22px] rounded-br-none text-white ml-7 text-sm"
				style={"background-color:" + color_map[0]}
			>
				{message[0]}
			</div>
			<div
				data-testid="bot"
				class="px-3 py-2 rounded-[22px] rounded-bl-none place-self-start text-white ml-7 text-sm"
				style={"background-color:" + color_map[1]}
			>
				{message[1]}
			</div>
		{/each}
	</div>
</div>
