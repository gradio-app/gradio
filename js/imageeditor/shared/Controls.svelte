<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import {
		Check,
		Trash,
		ZoomIn,
		ZoomOut,
		Resize as ResizeIcon,
	} from "@gradio/icons";
	import type { Spring } from "svelte/motion";
	import Resize from "./Resize.svelte";
	import type { Position } from "./Resize.svelte";
	import { Pan } from "@gradio/icons";
	/**
	 * Can the current image be undone?
	 */
	// export let can_undo = false;
	/**
	 * Can the current image be redone?
	 */
	// export let can_redo = false;

	export let can_save = false;
	export let changeable = false;
	export let current_zoom = 1;
	export let dimensions: Spring<{ width: number; height: number }>;
	export let tool: string;
	export let min_zoom = true;
	export let fixed_canvas = false;

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
		resize: { anchor: Position; scale: boolean; width: number; height: number };
		/**
		 * Pan the image.
		 */
		pan: void;
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
</script>

<IconButtonWrapper>
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

	{#if !fixed_canvas}
		<IconButton
			Icon={ResizeIcon}
			label="Resize"
			on:click={(event) => {
				show_resize_popup = !show_resize_popup;
				event.stopPropagation();
			}}
		/>
	{/if}
	{#if show_resize_popup}
		<Resize
			{dimensions}
			on:change={(e) => {
				dispatch("resize", e.detail);
			}}
		/>
	{/if}

	<div class="separator"></div>

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
</style>
