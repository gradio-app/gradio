<script lang="ts">
	import type { Spring } from "svelte/motion";
	import { click_outside } from "./utils/events";
	import { Resize as ResizeIcon, ZoomOut, ZoomIn } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";
	import { createEventDispatcher } from "svelte";
	import type { Writable } from "svelte/store";
	import Layers from "./Layers.svelte";
	import Resize from "./Resize.svelte";
	import type { Position } from "./Resize.svelte";

	const dispatch = createEventDispatcher<{
		new_layer: void;
		change_layer: string;
		move_layer: { id: string; direction: "up" | "down" };
		delete_layer: string;
		zoom_out: void;
		zoom_in: void;
		set_zoom: number | "fit";
		resize: { width: number; height: number; anchor: Position; scale: boolean };
	}>();

	export let layers: Writable<{
		active_layer: string;
		layers: { name: string; id: string; user_created: boolean }[];
	}>;

	export let enable_additional_layers = true;
	export let enable_layers = true;
	export let show_layers = false;

	export let current_zoom = 1;
	export let dimensions: Spring<{ width: number; height: number }>;
	// export let tool: string;
	// export let min_zoom = true;
	// export let fixed_canvas = false;

	let can_undo = true;
	let can_redo = true;

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

<div class="toolbar-wrap-wrap">
	<div class="toolbar-wrap">
		<div class="tool-wrap" use:click_outside={() => (show_zoom_popup = false)}>
			<div class="tool-min" class:expanded={show_zoom_popup}>
				<div class="zoom-number">
					<span
						role="button"
						tabindex="0"
						on:click={handle_zoom_click}
						on:keydown={handle_zoom_keydown}
						>{show_zoom_popup ? "Zoom" : formatted_zoom + "%"}</span
					>
				</div>
				<div class="icons">
					<IconButton
						Icon={ZoomOut}
						label="Zoom out"
						on:click={(event) => {
							dispatch("zoom_out");
							event.stopPropagation();
						}}
						size="small"
						color="var(--body-text-color)"
					/>
					<IconButton
						Icon={ZoomIn}
						label="Zoom in"
						on:click={(event) => {
							dispatch("zoom_in");
							event.stopPropagation();
						}}
						size="small"
						color="var(--body-text-color)"
					/>
				</div>
			</div>
			{#if show_zoom_popup}
				<div class="zoom-controls">
					<ul>
						<li>
							<button
								on:click|stopPropagation={() => handle_zoom_change("fit")}
							>
								Fit to screen
							</button>
						</li>
						{#each [0.25, 0.5, 1, 2, 4] as zoom}
							<li>
								<button
									on:click|stopPropagation={() => handle_zoom_change(zoom)}
								>
									{zoom * 100}%
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<div class="separator"></div>

		<div
			class="tool-wrap"
			use:click_outside={() => (show_resize_popup = false)}
		>
			<div
				role="button"
				tabindex="0"
				class="tool-min"
				class:expanded={show_resize_popup}
				on:click={(event) => {
					show_resize_popup = !show_resize_popup;
					event.stopPropagation();
				}}
				on:keydown={(event) => {
					if (event.key === "Enter") {
						show_resize_popup = !show_resize_popup;
					}
				}}
			>
				<span>Resize</span>
				<div class="icons">
					<IconButton Icon={ResizeIcon} label="Resize" />
				</div>
			</div>

			{#if show_resize_popup}
				<Resize
					{dimensions}
					on:change={(e) => {
						dispatch("resize", e.detail);
						show_resize_popup = false;
					}}
				/>
			{/if}
		</div>
		<div class="separator"></div>

		{#if enable_layers}
			<Layers
				{layers}
				{enable_additional_layers}
				{enable_layers}
				{show_layers}
				on:new_layer
				on:change_layer
				on:move_layer
				on:delete_layer
			/>
		{/if}
	</div>
</div>

<style>
	.toolbar-wrap-wrap {
		position: absolute;
		right: 0;
		bottom: 0;
		width: fit-content;
		max-height: 100%;
		overflow-y: auto;
		display: flex;
		flex-direction: column-reverse;
	}

	.toolbar-wrap {
		min-width: 110px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		/* left: 15px; */
		right: 0;
		bottom: 0;
		/* top: 30%; */
		/* transform: translateY(-50%); */
		/* width: 30px; */
		border: 1px solid var(--block-border-color);
		border-radius: 0;

		border-top-left-radius: var(--radius-md);
		border-right: none;
		border-bottom: none;
		z-index: 1000;
		background-color: var(--block-background-fill);
	}

	.tool-min {
		display: flex;
		justify-content: space-between;
		align-self: start;
		/* flex-direction: column; */
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		font-size: 12px;
		z-index: var(--layer-2);
		width: 100%;
		color: var(--body-text-color);
	}

	.tool-min.expanded {
		border-bottom: 1px solid var(--border-color-primary);
	}
	.icons {
		display: flex;
		gap: var(--spacing-sm);
	}
	.tool-wrap {
		width: 100%;
	}

	.separator {
		width: 100%;
		height: 1px;
		background-color: var(--border-color-primary);
	}

	.zoom-number {
		position: relative;
		width: 30px;

		display: flex;
		align-items: center;
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
		padding: var(--spacing-md) var(--spacing-md);
		font-size: 12px;
		z-index: var(--layer-2);
		width: 100%;
		color: var(--block-label-text-color);
	}

	.zoom-controls ul {
		list-style: none;
		margin: 0;
		padding: 0;
		width: 100%;
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
