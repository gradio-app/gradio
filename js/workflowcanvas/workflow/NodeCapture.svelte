<script lang="ts">
	/**
	 * In-node webcam / microphone capture.
	 *
	 * Deliberately small rather than reusing Gradio's `Webcam` / audio recorder:
	 * a node body is ~200px wide, and everything downstream only needs a `File`
	 * (`adopt_file` in NodeWidget turns one into the node's value), so a full
	 * uploader's device pickers, waveforms and streaming modes have nowhere to
	 * go here. The stream is always released on teardown.
	 */
	import { onDestroy } from "svelte";

	interface Props {
		kind: "image" | "audio";
		onfile: (file: File) => void;
		oncancel: () => void;
	}

	let { kind, onfile, oncancel }: Props = $props();

	let videoEl: HTMLVideoElement | undefined = $state();
	let stream: MediaStream | null = null;
	let recorder: MediaRecorder | null = null;
	let recording = $state(false);
	let error = $state<string | null>(null);
	let ready = $state(false);
	let elapsed = $state(0);
	let ticker: ReturnType<typeof setInterval> | null = null;

	function stop_ticker(): void {
		if (ticker !== null) clearInterval(ticker);
		ticker = null;
	}

	function stop_stream(): void {
		recorder?.state === "recording" && recorder.stop();
		recorder = null;
		stop_ticker();
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
	}

	function clock(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${String(s).padStart(2, "0")}`;
	}

	onDestroy(stop_stream);

	let started = false;

	async function start(): Promise<void> {
		// Guarded rather than left to effect scheduling: opening the device twice
		// would leak a stream and leave the camera light on.
		if (started) return;
		started = true;
		try {
			stream = await navigator.mediaDevices.getUserMedia(
				kind === "image" ? { video: true } : { audio: true }
			);
			if (kind === "image" && videoEl) {
				videoEl.srcObject = stream;
				await videoEl.play().catch(() => {});
			}
			ready = true;
			// A mic has nothing to frame, so the click that opened it was already
			// the "record" click — waiting for a second one just loses audio. The
			// webcam does need framing, so it stops at a live preview.
			if (kind === "audio") toggle_recording();
		} catch (e) {
			error =
				e instanceof Error && e.name === "NotAllowedError"
					? "Permission denied"
					: `Could not open the ${kind === "image" ? "camera" : "microphone"}`;
		}
	}

	// Kick off as soon as the widget mounts — the user already opted in by
	// choosing capture over upload.
	$effect(() => {
		void start();
	});

	function snapshot(): void {
		if (!videoEl) return;
		const canvas = document.createElement("canvas");
		canvas.width = videoEl.videoWidth;
		canvas.height = videoEl.videoHeight;
		canvas.getContext("2d")?.drawImage(videoEl, 0, 0);
		canvas.toBlob((blob) => {
			if (!blob) return;
			onfile(new File([blob], "webcam.png", { type: "image/png" }));
			stop_stream();
		}, "image/png");
	}

	function toggle_recording(): void {
		if (!stream) return;
		if (recording) {
			recorder?.stop();
			return;
		}
		const chunks: BlobPart[] = [];
		recorder = new MediaRecorder(stream);
		recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
		recorder.onstop = () => {
			recording = false;
			stop_ticker();
			const type = recorder?.mimeType || "audio/webm";
			const ext = type.includes("ogg") ? "ogg" : "webm";
			onfile(new File(chunks, `recording.${ext}`, { type }));
			stop_stream();
		};
		recorder.start();
		recording = true;
		elapsed = 0;
		ticker = setInterval(() => (elapsed += 1), 1000);
	}

	function cancel(): void {
		stop_stream();
		oncancel();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="capture nodrag nopan"
	onpointerdown={(e) => e.stopPropagation()}
	onmousedown={(e) => e.stopPropagation()}
>
	{#if error}
		<div class="capture-error">{error}</div>
	{:else if kind === "image"}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video class="capture-video" bind:this={videoEl} muted playsinline></video>
	{:else}
		<div class="capture-audio" class:live={recording}>
			{#if recording}
				<span class="capture-dot"></span>
				<span class="capture-time">{clock(elapsed)}</span>
			{:else}
				<span>{ready ? "Ready" : "Opening mic…"}</span>
			{/if}
		</div>
	{/if}

	<div class="capture-actions">
		{#if !error}
			{#if kind === "image"}
				<button
					class="capture-btn capture-primary"
					disabled={!ready}
					onclick={snapshot}
				>
					Capture
				</button>
			{:else}
				<button
					class="capture-btn capture-primary"
					disabled={!ready}
					onclick={toggle_recording}
				>
					{recording ? "Stop" : "Record"}
				</button>
			{/if}
		{/if}
		<button class="capture-btn capture-cancel" onclick={cancel}>Cancel</button>
	</div>
</div>

<style>
	.capture {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 8px;
	}

	.capture-video {
		width: 100%;
		max-height: var(--preview-max-h, 320px);
		border-radius: 6px;
		background: #101118;
		object-fit: contain;
	}

	.capture-audio {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		height: 44px;
		border: 1px dashed #2a2b38;
		border-radius: 6px;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #8a8c98;
	}

	.capture-audio.live {
		border-style: solid;
		border-color: rgba(239, 68, 68, 0.5);
		background: rgba(239, 68, 68, 0.06);
		color: #fca5a5;
	}

	.capture-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #ef4444;
		animation: capture-pulse 1.2s ease-in-out infinite;
	}

	.capture-time {
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
	}

	@keyframes capture-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.25;
		}
	}

	.capture-error {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		line-height: 1.4;
		color: #fca5a5;
	}

	.capture-actions {
		display: flex;
		gap: 6px;
	}

	.capture-btn {
		flex: 1;
		padding: 4px 6px;
		border: 1px solid #2a2b38;
		border-radius: 5px;
		background: #16171f;
		color: #c5c7d0;
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 600;
		cursor: pointer;
	}

	.capture-btn:hover:not(:disabled) {
		background: #1a1b25;
		color: #e6e7ec;
	}

	.capture-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.capture-cancel {
		flex: 0 0 auto;
		color: #8a8c98;
	}

	.capture-primary:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* ─── Light mode ─── */
	:global(body:not(.dark)) .capture-video,
	:global(body:not(.dark)) .capture {
		background: transparent;
	}

	:global(body:not(.dark)) .capture-video {
		background: #eef0f5;
	}

	:global(body:not(.dark)) .capture-audio {
		border-color: #dfe1e9;
		color: #6b6e78;
	}

	:global(body:not(.dark)) .capture-audio.live {
		border-color: rgba(239, 68, 68, 0.45);
		color: #dc2626;
	}

	:global(body:not(.dark)) .capture-btn {
		background: #ffffff;
		border-color: #dfe1e9;
		color: #5c5e6a;
	}

	:global(body:not(.dark)) .capture-btn:hover:not(:disabled) {
		background: #f4f5f9;
		color: #1a1b25;
	}
</style>
