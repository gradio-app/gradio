<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import { colors } from "@gradio/theme";
	import type { Styles } from "@gradio/utils";

	export let value: Array<[string, string]>;
	export let style: Styles = {};

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

	$: _colors = get_colors();

	function get_color(c: string) {
		if (c in colors) {
			return colors[c as keyof typeof colors].primary;
		} else {
			return c;
		}
	}

	function get_colors() {
		if (!style.color_map) {
			return ["#fb923c", "#9ca3af"];
		} else {
			return [get_color(style.color_map[0]), get_color(style.color_map[1])];
		}
	}
</script>

<div class="overflow-y-auto h-[40vh]" bind:this={div}>
	<div class="flex flex-col items-end space-y-4 p-3">
		{#each value as message}
			<div
				data-testid="user"
				class="px-3 py-2 rounded-[22px] rounded-br-none text-white text-sm"
				style={"background-color:" + _colors[0]}
			>
				{message[0]}
			</div>
			<div
				data-testid="bot"
				class="px-3 py-2 rounded-[22px] rounded-bl-none place-self-start text-white text-sm"
				style={"background-color:" + _colors[1]}
			>
				{message[1]}
			</div>
		{/each}
	</div>
</div>
