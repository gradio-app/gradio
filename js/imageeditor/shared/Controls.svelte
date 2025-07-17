<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import {
		Check,
		Trash,
		ZoomIn,
		ZoomOut,
		Pan,
		Download,
		Undo,
		Redo
	} from "@gradio/icons";
	import type { Writable } from "svelte/store";

	export let can_save = false;
	export let changeable = false;
	export let current_zoom = 1;
	export let tool: string;
	export let min_zoom = true;
	export let enable_download = false;
	export let can_undo: boolean;
	export let can_redo: boolean;

	const dispatch = createEventDispatcher<{
		remove_image: void;
		undo: void;
		redo: void;
		save: void;
		zoom_in: void;
		zoom_out: void;
		set_zoom: number | "fit";
		pan: void;
		download: void;
	}>();

	let show_zoom_popup = false;

	function handle_zoom_click(e: MouseEvent): void {
		e.stopPropagation();
		show_zoom_popup = !show_zoom_popup;
	}

	function handle_zoom_change(zoom: number | "fit"): void {
		dispatch("set_zoom", zoom);
		show_zoom_popup = false;
	}

	function handle_zoom_keydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			handle_zoom_change(current_zoom);
		}
	}

	$: formatted_zoom = Math.round(current_zoom * 100);
</script>

<IconButtonWrapper>
	{#if enable_download}
		<IconButton
			Icon={Download}
			label="Download"
			on:click={(event) => {
				dispatch("download");
				event.stopPropagation();
			}}
		/>
	{/if}

	<IconButton
		Icon={Pan}
		label="Pan"
		on:click={(e) => {
			e.stopPropagation();
			dispatch("pan");
		}}
		highlight={tool === "pan"}
		size="small"
		padded={false}
		transparent={true}
		disabled={min_zoom}
	/>

	<IconButton
		Icon={ZoomOut}
		label="Zoom out"
		on:click={(event) => {
			dispatch("zoom_out");
			event.stopPropagation();
		}}
	/>
	<IconButton
		Icon={ZoomIn}
		label="Zoom in"
		on:click={(event) => {
			dispatch("zoom_in");
			event.stopPropagation();
		}}
	/>

	<div class="zoom-number">
		<span
			role="button"
			tabindex="0"
			on:click={handle_zoom_click}
			on:keydown={handle_zoom_keydown}>{formatted_zoom}%</span
		>
		{#if show_zoom_popup}
			<div class="zoom-controls">
				<ul>
					<li>
						<button on:click|stopPropagation={() => handle_zoom_change("fit")}>
							Fit to screen
						</button>
					</li>
					{#each [0.25, 0.5, 1, 2, 4] as zoom}
						<li>
							<button on:click|stopPropagation={() => handle_zoom_change(zoom)}>
								{zoom * 100}%
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
	<div class="separator"></div>

	<IconButton
		Icon={Undo}
		label="Undo"
		on:click={(event) => {
			dispatch("undo");
			event.stopPropagation();
		}}
		disabled={!can_undo}
	/>

	<IconButton
		Icon={Redo}
		label="Redo"
		on:click={(event) => {
			dispatch("redo");
			event.stopPropagation();
		}}
		disabled={!can_redo}
	/>

	{#if changeable}
		<IconButton
			disabled={!can_save}
			Icon={Check}
			label="Save changes"
			on:click={(event) => {
				dispatch("save");
				event.stopPropagation();
			}}
			color="var(--color-accent)"
		/>
	{/if}

	<IconButton
		Icon={Trash}
		label="Clear canvas"
		on:click={(event) => {
			dispatch("remove_image");
			event.stopPropagation();
		}}
	/>
</IconButtonWrapper>

<style>
	.separator {
		width: 1px;
		height: 10px;
		background-color: var(--border-color-primary);
	}

	.zoom-number {
		position: relative;
		width: 30px;
		padding-left: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.zoom-number span {
		cursor: pointer;
		font-size: var(--text-sm);
		transition: color 0.15s ease;
	}

	.zoom-number span:hover {
		color: var(--color-accent);
	}

	.zoom-controls {
		position: absolute;
		top: calc(100% + var(--spacing-xxs) + 3px);
		left: -2px;
		background: var(--block-background-fill);
		border: 1px solid var(--color-gray-200);
		border-radius: var(--radius-sm);
		padding: var(--spacing-xxs);
		box-shadow: var(--shadow-drop);
		font-size: 12px;
		z-index: var(--layer-2);
		width: max-content;
		color: var(--block-label-text-color);
		border: 1px solid var(--block-border-color);
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.zoom-controls ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.zoom-controls li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: background-color 0.15s ease;
		border-bottom: 1px solid var(--border-color-primary);
	}

	.zoom-controls li:last-child {
		border-bottom: none;
	}

	.zoom-controls li:hover {
		background-color: var(--background-fill-secondary);
	}

	.zoom-controls button {
		width: 100%;
		text-align: left;
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--text-sm);
		line-height: var(--line-sm);
		transition: all 0.15s ease;
		border-radius: var(--radius-sm);
	}

	.zoom-controls button:hover {
		color: var(--color-accent);
	}
</style>
