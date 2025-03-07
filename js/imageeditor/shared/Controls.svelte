<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import {
		Undo,
		Redo,
		Check,
		Trash,
		ZoomIn,
		ZoomOut,
		Resize as ResizeIcon,
	} from "@gradio/icons";
	import type { Spring } from "svelte/motion";
	import Resize from "./Resize.svelte";
	import type { Anchor } from "./Resize.svelte";
	/**
	 * Can the current image be undone?
	 */
	export let can_undo = false;
	/**
	 * Can the current image be redone?
	 */
	export let can_redo = false;

	export let can_save = false;
	export let changeable = false;
	export let current_zoom = 1;
	export let dimensions: Spring<{ width: number; height: number }>;

	const dispatch = createEventDispatcher<{
		/**
		 * Remove the current image.
		 */
		remove_image: void;
		/**
		 * Undo the last action.
		 */
		undo: void;
		/**
		 * Redo the last action.
		 */
		redo: void;
		/**
		 * Save the current image.
		 */
		save: void;
		/**
		 * Zoom in.
		 */
		zoom_in: void;
		/**
		 * Zoom out.
		 */
		zoom_out: void;
		/**
		 * Set the zoom level.
		 */
		set_zoom: number | "fit";
		/**
		 * Resize the image.
		 */
		resize: { anchor: Anchor; scale: boolean; width: number; height: number };
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
	let show_resize_popup = false;

	$: console.log(dimensions);
</script>

<IconButtonWrapper>
	<IconButton
		Icon={ResizeIcon}
		label="Resize"
		on:click={(event) => {
			show_resize_popup = !show_resize_popup;
			event.stopPropagation();
		}}
	/>
	{#if show_resize_popup}
		<Resize
			{dimensions}
			on:change={(e) => {
				console.log(e.detail);
				dispatch("resize", e.detail);
			}}
		/>
	{/if}
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

	{#if changeable}
		<IconButton
			disabled={!can_save}
			Icon={Check}
			label="Save changes"
			on:click={(event) => {
				dispatch("save");
				event.stopPropagation();
			}}
			background={"var(--color-green-500)"}
			color={"#fff"}
		/>
	{/if}
	<IconButton
		disabled={!can_undo}
		Icon={Undo}
		label="Undo"
		on:click={(event) => {
			dispatch("undo");
			event.stopPropagation();
		}}
	/>
	<IconButton
		disabled={!can_redo}
		Icon={Redo}
		label="Redo"
		on:click={(event) => {
			dispatch("redo");
			event.stopPropagation();
		}}
	/>
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
	.zoom-number {
		position: relative;
		width: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.zoom-controls {
		position: absolute;
		top: calc(100% + var(--spacing-xxs) + 2px);
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
		padding: 0;
		margin: 0;
	}

	.zoom-controls ul li {
		padding: 0;
		margin: 0;
	}

	.zoom-controls ul li button {
		padding: var(--spacing-sm) var(--spacing-md);
		margin: 0;
		border: none;
		width: 100%;
		text-align: left;
		border-bottom: 1px solid var(--block-border-color);
	}

	.zoom-controls ul li:last-child button {
		border-bottom: none;
	}

	.zoom-controls ul li button:hover {
		color: var(--button-secondary-text-color-hover);
	}

	span {
		font-size: 12px;
		font-family: var(--font-mono);
		color: var(--color-gray-500);

		text-align: center;
		cursor: pointer;
	}
</style>
