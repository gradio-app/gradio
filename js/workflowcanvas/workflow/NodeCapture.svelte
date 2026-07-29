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

	function stop_stream(): void {
		recorder?.state === "recording" && recorder.stop();
		recorder = null;
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
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
			const type = recorder?.mimeType || "audio/webm";
			const ext = type.includes("ogg") ? "ogg" : "webm";
			onfile(new File(chunks, `recording.${ext}`, { type }));
			stop_stream();
		};
		recorder.start();
		recording = true;
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
			{recording ? "Recording…" : ready ? "Ready" : "Opening mic…"}
		</div>
	{/if}

	<div class="capture-actions">
		{#if !error}
			{#if kind === "image"}
				<button class="capture-btn" disabled={!ready} onclick={snapshot}>
					Capture
				</button>
			{:else}
				<button
					class="capture-btn"
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
		height: 44px;
		border: 1px dashed #2a2b38;
		border-radius: 6px;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #8a8c98;
	}

	.capture-audio.live {
		border-color: #ef4444;
		color: #fca5a5;
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
</style>
