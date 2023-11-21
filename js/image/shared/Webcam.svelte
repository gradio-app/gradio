<script lang="ts">
	import { createEventDispatcher, onMount, tick } from "svelte";
	import { Camera, Circle, Square, DropdownArrow } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";

	let video_source: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	export let streaming = false;
	export let pending = false;

	export let mode: "image" | "video" = "image";
	export let mirror_webcam: boolean;
	export let include_audio: boolean;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{
		stream: undefined;
		capture: Blob;
		error: string;
		start_recording: undefined;
		stop_recording: undefined;
	}>();

	onMount(() => (canvas = document.createElement("canvas")));
	const size = {
		width: { ideal: 1920 },
		height: { ideal: 1440 }
	};
	async function access_webcam(device_id?: string): Promise<void> {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			dispatch("error", i18n("image.no_webcam_support"));
			return;
		}
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: device_id ? { deviceId: { exact: device_id }, ...size } : size,
				audio: include_audio
			});
			video_source.srcObject = stream;
			video_source.muted = true;
			video_source.play();
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				dispatch("error", i18n("image.allow_webcam_access"));
			} else {
				throw err;
			}
		}
	}

	function take_picture(): void {
		var context = canvas.getContext("2d")!;

		if (video_source.videoWidth && video_source.videoHeight) {
			canvas.width = video_source.videoWidth;
			canvas.height = video_source.videoHeight;
			context.drawImage(
				video_source,
				0,
				0,
				video_source.videoWidth,
				video_source.videoHeight
			);

			if (mirror_webcam) {
				context.scale(-1, 1);
				context.drawImage(video_source, -video_source.videoWidth, 0);
			}

			canvas.toBlob(
				(blob) => {
					dispatch(streaming ? "stream" : "capture", blob);
				},
				"image/png",
				0.8
			);
		}
	}

	let recording = false;
	let recorded_blobs: BlobPart[] = [];
	let stream: MediaStream;
	let mimeType: string;
	let media_recorder: MediaRecorder;

	function take_recording(): void {
		if (recording) {
			media_recorder.stop();
			let video_blob = new Blob(recorded_blobs, { type: mimeType });
			let ReaderObj = new FileReader();
			ReaderObj.onload = function (e): void {
				if (e.target) {
					dispatch("capture", {
						//@ts-ignore
						data: e.target.result,
						name: "sample." + mimeType.substring(6),
						is_example: false,
						is_file: false
					});
					dispatch("stop_recording");
				}
			};
			ReaderObj.readAsDataURL(video_blob);
		} else {
			dispatch("start_recording");
			recorded_blobs = [];
			let validMimeTypes = ["video/webm", "video/mp4"];
			for (let validMimeType of validMimeTypes) {
				if (MediaRecorder.isTypeSupported(validMimeType)) {
					mimeType = validMimeType;
					break;
				}
			}
			if (mimeType === null) {
				console.error("No supported MediaRecorder mimeType");
				return;
			}
			media_recorder = new MediaRecorder(stream, {
				mimeType: mimeType
			});
			media_recorder.addEventListener("dataavailable", function (e) {
				recorded_blobs.push(e.data);
			});
			media_recorder.start(200);
		}
		recording = !recording;
	}

	access_webcam();

	if (streaming && mode === "image") {
		window.setInterval(() => {
			if (video_source && !pending) {
				take_picture();
			}
		}, 500);
	}

	async function select_source(): Promise<void> {
		const devices = await navigator.mediaDevices.enumerateDevices();
		video_sources = devices.filter((device) => device.kind === "videoinput");
		options_open = true;
	}

	let video_sources: MediaDeviceInfo[] = [];
	async function selectVideoSource(device_id: string): Promise<void> {
		await access_webcam(device_id);
		options_open = false;
	}

	let options_open = false;

	export function click_outside(node: Node, cb: any): any {
		const handle_click = (event: MouseEvent): void => {
			if (
				node &&
				!node.contains(event.target as Node) &&
				!event.defaultPrevented
			) {
				cb(event);
			}
		};

		document.addEventListener("click", handle_click, true);

		return {
			destroy() {
				document.removeEventListener("click", handle_click, true);
			}
		};
	}

	function handle_click_outside(event: MouseEvent): void {
		event.preventDefault();
		event.stopPropagation();
		options_open = false;
	}
</script>

<div class="wrap">
	<!-- svelte-ignore a11y-media-has-caption -->
	<!-- need to suppress for video streaming https://github.com/sveltejs/svelte/issues/5967 -->
	<video bind:this={video_source} class:flip={mirror_webcam} />
	{#if !streaming}
		<div class:capture={!recording} class="button-wrap">
			<button
				on:click={mode === "image" ? take_picture : take_recording}
				aria-label={mode === "image" ? "capture photo" : "start recording"}
			>
				{#if mode === "video"}
					{#if recording}
						<div class="icon" title="stop recording">
							<Square />
						</div>
					{:else}
						<div class="icon" title="start recording">
							<Circle />
						</div>
					{/if}
				{:else}
					<div class="icon" title="capture photo">
						<Camera />
					</div>
				{/if}
			</button>

			{#if !recording}
				<button
					on:click={select_source}
					aria-label={mode === "image" ? "capture photo" : "start recording"}
				>
					<div class="icon" title="select video source">
						<DropdownArrow />
					</div>

					{#if options_open}
						<div class="select-wrap" use:click_outside={handle_click_outside}>
							<!-- svelte-ignore a11y-click-events-have-key-events-->
							<!-- svelte-ignore a11y-no-static-element-interactions-->
							<span
								class="inset-icon"
								on:click|stopPropagation={() => (options_open = false)}
							>
								<DropdownArrow />
							</span>
							{#each video_sources as source}
								<!-- svelte-ignore a11y-click-events-have-key-events-->
								<!-- svelte-ignore a11y-no-static-element-interactions-->
								<div on:click={() => selectVideoSource(source.deviceId)}>
									{source.label}
								</div>
							{/each}
						</div>
					{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
		min-height: var(--size-60);
	}

	video {
		width: var(--size-full);
		height: var(--size-full);
	}

	.button-wrap {
		display: flex;
		position: absolute;
		right: 0px;
		bottom: var(--size-2);
		left: 0px;
		justify-content: center;
		align-items: center;
		margin: auto;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-xl);
		background-color: rgba(0, 0, 0, 0.9);
		width: var(--size-10);
		height: var(--size-8);
		padding: var(--size-2-5);
		padding-right: var(--size-1);
		z-index: var(--layer-3);
	}

	.capture {
		width: var(--size-14);
		transform: translateX(var(--size-2-5));
	}

	@media (--screen-md) {
		button {
			bottom: var(--size-4);
		}
	}

	@media (--screen-xl) {
		button {
			bottom: var(--size-8);
		}
	}

	.icon {
		opacity: 0.8;
		width: 100%;
		height: 100%;
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.flip {
		transform: scaleX(-1);
	}

	.select-wrap {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background-color: transparent;
		border: none;
		width: auto;
		font-size: 1rem;
		/* padding: 0.5rem; */
		width: max-content;
		position: absolute;
		top: 0;
		right: 0;
		background-color: var(--block-background-fill);
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-xl);
		z-index: var(--layer-top);
		border: 1px solid var(--border-color-accent);
		text-align: left;
		overflow: hidden;
	}

	.select-wrap > div {
		padding: 0.25rem 0.5rem;
		border-bottom: 1px solid var(--border-color-accent);
		padding-right: var(--size-8);
	}

	.select-wrap > div:hover {
		background-color: var(--color-accent);
	}

	.select-wrap > div:last-child {
		border: none;
	}

	.inset-icon {
		position: absolute;
		top: 5px;
		right: -6.5px;
		width: var(--size-10);
		height: var(--size-5);
		opacity: 0.8;
	}
</style>
