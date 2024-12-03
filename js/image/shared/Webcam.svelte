<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import {
		Camera,
		Circle,
		Square,
		DropdownArrow,
		Spinner
	} from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { StreamingBar } from "@gradio/statustracker";
	import { type FileData, type Client, prepare_files } from "@gradio/client";
	import WebcamPermissions from "./WebcamPermissions.svelte";
	import { fade } from "svelte/transition";
	import {
		get_devices,
		get_video_stream,
		set_available_devices
	} from "./stream_utils";
	import type { Base64File } from "./types";
	import type { int } from "babylonjs";

	let video_source: HTMLVideoElement;
	let available_video_devices: MediaDeviceInfo[] = [];
	let selected_device: MediaDeviceInfo | null = null;
	let time_limit: number | null = null;
	let stream_state: "open" | "waiting" | "closed" = "closed";

	export const modify_stream: (state: "open" | "closed" | "waiting") => void = (
		state: "open" | "closed" | "waiting"
	) => {
		if (state === "closed") {
			time_limit = null;
			stream_state = "closed";
			value = null;
		} else if (state === "waiting") {
			stream_state = "waiting";
		} else {
			stream_state = "open";
		}
	};

	export const set_time_limit = (time: number): void => {
		if (recording) time_limit = time;
	};

	let canvas: HTMLCanvasElement;
	export let streaming = false;
	export let pending = false;
	export let root = "";
	export let stream_every = 1;

	export let mode: "image" | "video" = "image";
	export let mirror_webcam: boolean;
	export let include_audio: boolean;
	export let webcam_constraints: { [key: string]: any } | null = null;
	export let i18n: I18nFormatter;
	export let upload: Client["upload"];
	export let value: FileData | null | Base64File = null;

	const dispatch = createEventDispatcher<{
		stream: Blob | string;
		capture: FileData | Blob | null;
		error: string;
		start_recording: undefined;
		stop_recording: undefined;
		close_stream: undefined;
	}>();

	onMount(() => {
		canvas = document.createElement("canvas");
		if (streaming && mode === "image") {
			window.setInterval(() => {
				if (video_source && !pending) {
					take_picture();
				}
			}, stream_every * 1000);
		}
	});

	const handle_device_change = async (event: InputEvent): Promise<void> => {
		const target = event.target as HTMLInputElement;
		const device_id = target.value;

		await get_video_stream(
			include_audio,
			video_source,
			webcam_constraints,
			device_id
		).then(async (local_stream) => {
			stream = local_stream;
			selected_device =
				available_video_devices.find(
					(device) => device.deviceId === device_id
				) || null;
			options_open = false;
		});
	};

	async function access_webcam(): Promise<void> {
		try {
			get_video_stream(include_audio, video_source, webcam_constraints)
				.then(async (local_stream) => {
					webcam_accessed = true;
					available_video_devices = await get_devices();
					stream = local_stream;
				})
				.then(() => set_available_devices(available_video_devices))
				.then((devices) => {
					available_video_devices = devices;

					const used_devices = stream
						.getTracks()
						.map((track) => track.getSettings()?.deviceId)[0];

					selected_device = used_devices
						? devices.find((device) => device.deviceId === used_devices) ||
							available_video_devices[0]
						: available_video_devices[0];
				});

			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				dispatch("error", i18n("image.no_webcam_support"));
			}
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
		if (
			(!streaming || (streaming && recording)) &&
			video_source.videoWidth &&
			video_source.videoHeight
		) {
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

			if (streaming && (!recording || stream_state === "waiting")) {
				return;
			}
			if (streaming) {
				const image_data = canvas.toDataURL("image/jpeg");
				dispatch("stream", image_data);
				return;
			}

			canvas.toBlob(
				(blob) => {
					dispatch(streaming ? "stream" : "capture", blob);
				},
				`image/${streaming ? "jpeg" : "png"}`,
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
			ReaderObj.onload = async function (e): Promise<void> {
				if (e.target) {
					let _video_blob = new File(
						[video_blob],
						"sample." + mimeType.substring(6)
					);
					const val = await prepare_files([_video_blob]);
					let val_ = (
						(await upload(val, root))?.filter(Boolean) as FileData[]
					)[0];
					dispatch("capture", val_);
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

	let webcam_accessed = false;

	function record_video_or_photo(): void {
		if (mode === "image" && streaming) {
			recording = !recording;
		}
		if (mode === "image") {
			take_picture();
		} else {
			take_recording();
		}
		if (!recording && stream) {
			dispatch("close_stream");
			stream.getTracks().forEach((track) => track.stop());
			video_source.srcObject = null;
			webcam_accessed = false;
			window.setTimeout(() => {
				value = null;
			}, 500);
			value = null;
		}
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
	<StreamingBar {time_limit} />
	<!-- svelte-ignore a11y-media-has-caption -->
	<!-- need to suppress for video streaming https://github.com/sveltejs/svelte/issues/5967 -->
	<video
		bind:this={video_source}
		class:flip={mirror_webcam}
		class:hide={!webcam_accessed || (webcam_accessed && !!value)}
	/>
	<!-- svelte-ignore a11y-missing-attribute -->
	<img
		src={value?.url}
		class:hide={!webcam_accessed || (webcam_accessed && !value)}
	/>
	{#if !webcam_accessed}
		<div
			in:fade={{ delay: 100, duration: 200 }}
			title="grant webcam access"
			style="height: 100%"
		>
			<WebcamPermissions on:click={async () => access_webcam()} />
		</div>
	{:else}
		<div class="button-wrap">
			<button
				on:click={record_video_or_photo}
				aria-label={mode === "image" ? "capture photo" : "start recording"}
			>
				{#if mode === "video" || streaming}
					{#if streaming && stream_state === "waiting"}
						<div class="icon-with-text" style="width:var(--size-24);">
							<div class="icon color-primary" title="spinner">
								<Spinner />
							</div>
							{i18n("audio.waiting")}
						</div>
					{:else if (streaming && stream_state === "open") || (!streaming && recording)}
						<div class="icon-with-text">
							<div class="icon color-primary" title="stop recording">
								<Square />
							</div>
							{i18n("audio.stop")}
						</div>
					{:else}
						<div class="icon-with-text">
							<div class="icon color-primary" title="start recording">
								<Circle />
							</div>
							{i18n("audio.record")}
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
					class="icon"
					on:click={() => (options_open = true)}
					aria-label="select input source"
				>
					<DropdownArrow />
				</button>
			{/if}
		</div>
		{#if options_open && selected_device}
			<select
				class="select-wrap"
				aria-label="select source"
				use:click_outside={handle_click_outside}
				on:change={handle_device_change}
			>
				<button
					class="inset-icon"
					on:click|stopPropagation={() => (options_open = false)}
				>
					<DropdownArrow />
				</button>
				{#if available_video_devices.length === 0}
					<option value="">{i18n("common.no_devices")}</option>
				{:else}
					{#each available_video_devices as device}
						<option
							value={device.deviceId}
							selected={selected_device.deviceId === device.deviceId}
						>
							{device.label}
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

	.hide {
		display: none;
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

	.icon-with-text {
		width: var(--size-20);
		align-items: center;
		margin: 0 var(--spacing-xl);
		display: flex;
		justify-content: space-evenly;
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
		width: 18px;
		height: 18px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.color-primary {
		fill: var(--primary-600);
		stroke: var(--primary-600);
		color: var(--primary-600);
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

	@media (--screen-md) {
		.wrap {
			font-size: var(--text-lg);
		}
	}
</style>
