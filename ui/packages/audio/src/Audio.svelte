<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { onDestroy, createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { Music } from "@gradio/icons";
	// @ts-ignore
	import Range from "svelte-range-slider-pips";

	import type { IMediaRecorder } from "extendable-media-recorder";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let show_label: boolean;
	export let name: string;
	export let source: "microphone" | "upload" | "none";
	export let pending: boolean = false;
	export let streaming: boolean = false;
	export let drop_text: string = "Drop an audio file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";

	// TODO: make use of this
	// export let type: "normal" | "numpy" = "normal";

	let recording = false;
	let recorder: IMediaRecorder;
	let mode = "";
	let header: Uint8Array | undefined = undefined;
	let pending_stream: Array<Uint8Array> = [];
	let player;
	let inited = false;
	let crop_values = [0, 100];
	const STREAM_TIMESLICE = 500;
	const NUM_HEADER_BYTES = 44;

	let module_promises:
		| [
				Promise<typeof import("extendable-media-recorder")>,
				Promise<typeof import("extendable-media-recorder-wav-encoder")>
		  ];

	function get_modules() {
		module_promises = [
			import("extendable-media-recorder"),
			import("extendable-media-recorder-wav-encoder")
		];
	}

	if (streaming) {
		get_modules();
	}

	const dispatch = createEventDispatcher<{
		change: AudioData;
		stream: AudioData;
		edit: AudioData;
		play: undefined;
		pause: undefined;
		ended: undefined;
		drag: boolean;
		error: string;
	}>();

	function blob_to_data_url(blob: Blob): Promise<string> {
		return new Promise((fulfill, reject) => {
			let reader = new FileReader();
			reader.onerror = reject;
			reader.onload = () => fulfill(reader.result as string);
			reader.readAsDataURL(blob);
		});
	}

	async function prepare_audio() {
		let stream: MediaStream | null;

		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				dispatch(
					"error",
					"Please allow access to the microphone for recording."
				);
				return;
			} else {
				throw err;
			}
		}

		const [{ MediaRecorder, register }, { connect }] = await Promise.all(
			module_promises
		);

		if (stream == null) return;

		await register(await connect());

		recorder = new MediaRecorder(stream, { mimeType: "audio/wav" });
		recorder.addEventListener("dataavailable", async (event) => {
			let buffer = await event.data.arrayBuffer();
			let payload = new Uint8Array(buffer);
			if (!header) {
				header = new Uint8Array(buffer.slice(0, NUM_HEADER_BYTES));
				payload = new Uint8Array(buffer.slice(NUM_HEADER_BYTES));
			}
			if (pending) {
				pending_stream.push(payload);
			} else {
				let blobParts = [header].concat(pending_stream, [payload]);
				let blob = new Blob(blobParts, { type: "audio/wav" });
				value = {
					data: await blob_to_data_url(blob),
					name
				};
				pending_stream = [];
				if (streaming) {
					dispatch("stream", value);
				} else {
					recording = false;
					dispatch("change", value);
				}
			}
		});
		inited = true;
	}

	async function record() {
		recording = true;

		if (!inited) await prepare_audio();
		header = undefined;
		if (streaming) {
			recorder.start(STREAM_TIMESLICE);
		} else {
			recorder.start();
		}
	}

	onDestroy(() => {
		if (recorder && recorder.state !== "inactive") {
			recorder.stop();
		}
	});

	const stop = () => {
		recorder.stop();
		if (streaming) {
			recording = false;
		}
	};

	function clear() {
		dispatch("change");
		mode = "";
		value = null;
	}

	function loaded(node: HTMLAudioElement) {
		function clamp_playback() {
			const start_time = (crop_values[0] / 100) * node.duration;
			const end_time = (crop_values[1] / 100) * node.duration;
			if (node.currentTime < start_time) {
				node.currentTime = start_time;
			}

			if (node.currentTime > end_time) {
				node.currentTime = start_time;
				node.pause();
			}
		}

		node.addEventListener("timeupdate", clamp_playback);

		return {
			destroy: () => node.removeEventListener("timeupdate", clamp_playback)
		};
	}

	function handle_change({
		detail: { values }
	}: {
		detail: { values: [number, number] };
	}) {
		if (!value) return;

		dispatch("change", {
			data: value.data,
			name,
			crop_min: values[0],
			crop_max: values[1]
		});

		dispatch("edit");
	}

	function handle_load({
		detail
	}: {
		detail: { data: string; name: string; size: number; is_example: boolean };
	}) {
		value = detail;
		dispatch("change", { data: detail.data, name: detail.name });
	}

	export let dragging = false;
	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={Music} label={label || "Audio"} />
{#if value === null || streaming}
	{#if source === "microphone"}
		<div class="mt-6 p-2">
			{#if recording}
				<button class="gr-button !bg-red-500/10" on:click={stop}>
					<span class="flex h-1.5 w-1.5 relative mr-2 ">
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
						/>
						<span
							class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"
						/>
					</span>
					<div class="whitespace-nowrap text-red-500">Stop recording</div>
				</button>
			{:else}
				<button class="gr-button text-gray-800" on:click={record}>
					<span class="flex h-1.5 w-1.5 relative mr-2">
						<span
							class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"
						/>
					</span>
					<div class="whitespace-nowrap">Record from microphone</div>
				</button>
			{/if}
		</div>
	{:else if source === "upload"}
		<Upload filetype="audio/*" on:load={handle_load} bind:dragging>
			<div class="flex flex-col">
				{drop_text}
				<span class="text-gray-300">- {or_text} -</span>
				{upload_text}
			</div>
		</Upload>
	{/if}
{:else}
	<ModifyUpload
		on:clear={clear}
		on:edit={() => (mode = "edit")}
		editable
		absolute={false}
	/>

	<audio
		use:loaded
		class="w-full h-14 p-2"
		controls
		bind:this={player}
		preload="metadata"
		src={value.data}
		on:play
		on:pause
		on:ended
	/>

	{#if mode === "edit" && player?.duration}
		<Range
			bind:values={crop_values}
			range
			min={0}
			max={100}
			step={1}
			on:change={handle_change}
		/>
	{/if}
{/if}
