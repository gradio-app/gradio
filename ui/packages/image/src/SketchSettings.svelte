<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Brush, Color } from "@gradio/icons";

	const dispatch = createEventDispatcher();

	let show_size = false;
	let show_col = false;

	export let brush_radius = 20;
	export let brush_color = "#000";
	export let container_height: number;
	export let img_width: number;
	export let img_height: number;
	export let mode: "mask" | "other" = "other";

	$: width = container_height * (img_width / img_height);
</script>

<div class="z-50 top-10 right-2 justify-end flex gap-1 absolute">
	<!-- <IconButton Icon={Undo} on:click={() => dispatch("undo")} /> -->

	<span class="absolute top-0 right-0">
		<IconButton Icon={Brush} on:click={() => (show_size = !show_size)} />
		{#if show_size}
			<input
				bind:value={brush_radius}
				class="absolute top-[2px] right-6"
				type="range"
				min={0.5 * (img_width / width)}
				max={75 * (img_width / width)}
			/>
		{/if}
	</span>

	{#if mode !== "mask"}
		<span class="absolute top-6 right-0">
			<IconButton Icon={Color} on:click={() => (show_col = !show_col)} />
			{#if show_col}
				<input
					bind:value={brush_color}
					class="absolute top-[-3px] right-6"
					type="color"
				/>
			{/if}
		</span>
	{/if}
</div>
