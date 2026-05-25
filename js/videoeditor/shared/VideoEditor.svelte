<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Brush, Clear } from "@gradio/icons";
	import MaskCanvas from "./MaskCanvas.svelte";

	interface Props {
		src?: string | null;
		brush_color?: string;
		brush_size?: number;
		interactive?: boolean;
		onerror?: (message: string) => void;
	}

	let {
		src = null,
		brush_color = "rgba(255, 0, 0, 0.5)",
		brush_size = 20,
		interactive = true,
		onerror
	}: Props = $props();

	let mask_canvas: MaskCanvas;
	let drawing_mode = $state(false);
	let video_el: HTMLVideoElement;
	let canvas_width = $state(0);
	let canvas_height = $state(0);
	let error_message = $state<string | null>(null);

	function update_canvas_size(): void {
		error_message = null;
		if (video_el.videoWidth && video_el.videoHeight) {
			canvas_width = video_el.videoWidth;
			canvas_height = video_el.videoHeight;
		}
	}

	function get_supported_formats(): string[] {
		const candidates = [
			{ label: "MP4", mime: "video/mp4" },
			{ label: "WebM", mime: "video/webm" },
			{ label: "OGG", mime: "video/ogg" }
		];
		return candidates
			.filter(({ mime }) => video_el.canPlayType(mime) !== "")
			.map(({ label }) => label);
	}

	function handle_video_error(): void {
		const supported = get_supported_formats();
		error_message = supported.length
			? `This video cannot be played in the browser. Supported formats: ${supported.join(", ")}.`
			: "This video cannot be played in the browser.";
		onerror?.(error_message);
	}

	export async function get_mask_blob(): Promise<Blob | null> {
		if (!mask_canvas || mask_canvas.is_empty()) return null;
		return await mask_canvas.get_blob();
	}

	export function clear_mask(): void {
		mask_canvas?.clear();
		drawing_mode = false;
	}
</script>

<div class="video-editor-wrap">
	{#if src}
		<div class="player-wrap">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				bind:this={video_el}
				{src}
				controls
				onloadedmetadata={update_canvas_size}
				onerror={handle_video_error}
				class="video-player"
			></video>
			{#if error_message}
				<div class="load-error" role="alert">{error_message}</div>
			{:else if interactive}
				<MaskCanvas
					bind:this={mask_canvas}
					width={canvas_width}
					height={canvas_height}
					{brush_color}
					{brush_size}
					active={drawing_mode}
				/>
			{/if}
		</div>

		{#if interactive}
			<div class="controls-bar">
				<IconButton
					Icon={Brush}
					label={drawing_mode ? "Drawing" : "Draw mask"}
					highlight={drawing_mode}
					onclick={() => (drawing_mode = !drawing_mode)}
				/>
				<IconButton Icon={Clear} label="Clear mask" onclick={clear_mask} />
			</div>
		{/if}
	{:else}
		<div class="empty">Upload a video to start</div>
	{/if}
</div>

<style>
	.video-editor-wrap {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.player-wrap {
		position: relative;
		width: 100%;
	}
	.video-player {
		width: 100%;
		display: block;
		background: var(--block-background-fill);
	}
	.controls-bar {
		display: flex;
		gap: var(--size-1);
		padding: var(--size-2);
		background: var(--background-fill-secondary);
		border-top: 1px solid var(--border-color-primary);
	}
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--size-40);
		color: var(--body-text-color-subdued);
	}
	.load-error {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--size-4);
		background: var(--error-background-fill);
		color: var(--error-text-color);
		text-align: center;
	}
</style>
