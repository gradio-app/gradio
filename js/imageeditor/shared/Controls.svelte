<script lang="ts">
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
	let {
		can_save = false,
		changeable = false,
		current_zoom = 1,
		tool,
		min_zoom = true,
		enable_download = false,
		can_undo,
		can_redo,
		onremove_image,
		onundo,
		onredo,
		onsave,
		onzoom_in,
		onzoom_out,
		onset_zoom,
		onpan,
		ondownload
	}: {
		can_save?: boolean;
		changeable?: boolean;
		current_zoom?: number;
		tool: string;
		min_zoom?: boolean;
		enable_download?: boolean;
		can_undo: boolean;
		can_redo: boolean;
		onremove_image?: () => void;
		onundo?: () => void;
		onredo?: () => void;
		onsave?: () => void;
		onzoom_in?: () => void;
		onzoom_out?: () => void;
		onset_zoom?: (zoom: number | "fit") => void;
		onpan?: () => void;
		ondownload?: () => void;
	} = $props();

	let show_zoom_popup = $state(false);

	function handle_zoom_click(e: MouseEvent): void {
		e.stopPropagation();
		show_zoom_popup = !show_zoom_popup;
	}

	function handle_zoom_change(zoom: number | "fit"): void {
		onset_zoom?.(zoom);
		show_zoom_popup = false;
	}

	function handle_zoom_keydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			handle_zoom_change(current_zoom);
		}
	}

	let formatted_zoom = $derived(Math.round(current_zoom * 100));
</script>

<IconButtonWrapper>
	{#if enable_download}
		<IconButton
			Icon={Download}
			label="Download"
			onclick={(event) => {
				ondownload?.();
				event.stopPropagation();
			}}
		/>
	{/if}

	<IconButton
		Icon={Pan}
		label="Pan"
		onclick={(e) => {
			e.stopPropagation();
			onpan?.();
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
		onclick={(event) => {
			onzoom_out?.();
			event.stopPropagation();
		}}
	/>
	<IconButton
		Icon={ZoomIn}
		label="Zoom in"
		onclick={(event) => {
			onzoom_in?.();
			event.stopPropagation();
		}}
	/>

	<div class="zoom-number">
		<span
			role="button"
			tabindex="0"
			onclick={handle_zoom_click}
			onkeydown={handle_zoom_keydown}>{formatted_zoom}%</span
		>
		{#if show_zoom_popup}
			<div class="zoom-controls">
				<ul>
					<li>
						<button
							onclick={(event) => {
								event.stopPropagation();
								handle_zoom_change("fit");
							}}
						>
							Fit to screen
						</button>
					</li>
					{#each [0.25, 0.5, 1, 2, 4] as zoom}
						<li>
							<button
								onclick={(event) => {
									event.stopPropagation();
									handle_zoom_change(zoom);
								}}
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

	<IconButton
		Icon={Undo}
		label="Undo"
		onclick={(event) => {
			onundo?.();
			event.stopPropagation();
		}}
		disabled={!can_undo}
	/>

	<IconButton
		Icon={Redo}
		label="Redo"
		onclick={(event) => {
			onredo?.();
			event.stopPropagation();
		}}
		disabled={!can_redo}
	/>

	{#if changeable}
		<IconButton
			disabled={!can_save}
			Icon={Check}
			label="Save changes"
			onclick={(event) => {
				onsave?.();
				event.stopPropagation();
			}}
			color="var(--color-accent)"
		/>
	{/if}

	<IconButton
		Icon={Trash}
		label="Clear canvas"
		onclick={(event) => {
			onremove_image?.();
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
