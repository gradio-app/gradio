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
		<div class="button-wrap">
			<button
				on:click={mode === "image" ? take_picture : take_recording}
				aria-label={mode === "image" ? "capture photo" : "start recording"}
			>
				{#if mode === "video"}
					{#if recording}
						<div class="icon red" title="stop recording">
							<Square />
						</div>
					{:else}
						<div class="icon red" title="start recording">
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
				</button>
			{/if}
		</div>
		{#if options_open}
			<select
				class="select-wrap"
				aria-label="select source"
				use:click_outside={handle_click_outside}
			>
				<button
					class="inset-icon"
					on:click|stopPropagation={() => (options_open = false)}
				>
					<DropdownArrow />
				</button>
				{#if video_sources.length === 0}
					<option value="">{i18n("common.no_devices")}</option>
				{:else}
					{#each video_sources as source}
						<option on:click={() => selectVideoSource(source.deviceId)}>
							{source.label}
						</option>
					{/each}
				{/if}
			</select>
		{/if}
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
	}

	video {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: cover;
	}

	.button-wrap {
		position: absolute;
		background-color: var(--block-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-xl);
		padding: var(--size-1-5);
		display: flex;
		bottom: var(--size-2);
		left: 50%;
		transform: translate(-50%, 0);
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-xl);
		line-height: var(--size-3);
		color: var(--button-secondary-text-color);
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
		width: 18px;
		height: 18px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.red {
		fill: red;
		stroke: red;
	}

	.flip {
		transform: scaleX(-1);
	}

	.select-wrap {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		color: var(--button-secondary-text-color);
		background-color: transparent;
		width: 95%;
		font-size: var(--text-md);
		position: absolute;
		bottom: var(--size-2);
		background-color: var(--block-background-fill);
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-xl);
		z-index: var(--layer-top);
		border: 1px solid var(--border-color-primary);
		text-align: left;
		line-height: var(--size-4);
		white-space: nowrap;
		text-overflow: ellipsis;
		left: 50%;
		transform: translate(-50%, 0);
		max-width: var(--size-52);
	}

	.select-wrap > option {
		padding: 0.25rem 0.5rem;
		border-bottom: 1px solid var(--border-color-accent);
		padding-right: var(--size-8);
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.select-wrap > option:hover {
		background-color: var(--color-accent);
	}

	.select-wrap > option:last-child {
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
