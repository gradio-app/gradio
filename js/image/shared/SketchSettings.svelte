<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Brush, Color } from "@gradio/icons";

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

<div class="wrap">
	<span class="brush">
		<IconButton
			Icon={Brush}
			label="Use brush"
			on:click={() => (show_size = !show_size)}
		/>
		{#if show_size}
			<input
				aria-label="Brush radius"
				bind:value={brush_radius}
				type="range"
				min={0.5 * (img_width / width)}
				max={75 * (img_width / width)}
			/>
		{/if}
	</span>

	{#if mode !== "mask"}
		<span class="col">
			<IconButton
				Icon={Color}
				label="Select brush color"
				on:click={() => (show_col = !show_col)}
			/>
			{#if show_col}
				<input aria-label="Brush color" bind:value={brush_color} type="color" />
			{/if}
		</span>
	{/if}
</div>

<style>
	.wrap {
		display: flex;
		position: absolute;
		top: var(--size-10);
		right: var(--size-2);
		flex-direction: column;
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
	}
	.brush {
		top: 0;
		right: 0;
	}

	.brush input {
		position: absolute;
		top: 3px;
		right: calc(100% + 5px);
	}

	.col input {
		position: absolute;
		right: calc(100% + 5px);
		bottom: -4px;
	}
</style>
