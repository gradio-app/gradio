<script lang="ts">
	import type { Value } from "./types";

	import { onDestroy } from "svelte";
	import Upload from "../../utils/Upload.svelte";
	import ModifyUpload from "../../utils/ModifyUpload.svelte";
	//@ts-ignore
	import Range from "svelte-range-slider-pips";
	import { _ } from "svelte-i18n";

	export let value: null | Value;
	export let live: boolean;
	export let setValue: (val: typeof value) => typeof value;
	export let theme: string;
	export let name: string;
	export let static_src: string;
	export let is_example: boolean = false;
	export let source: "microphone" | "upload";

	let recording = false;
	let recorder: MediaRecorder;
	let mode = "";
	let audio_chunks: Array<Blob> = [];
	let chunks_at_submit: number = 0;
	let audio_blob;
	let player;
	let inited = false;
	let crop_values = [0, 100];
	let submitting_data = false;
	let record_interval;

	async function generate_data(): Promise<{
		data: string;
		name: string;
		is_example: boolean;
	}> {
		function blob_to_data_url(blob: Blob): Promise<string> {
			return new Promise((fulfill, reject) => {
				let reader = new FileReader();
				reader.onerror = reject;
				reader.onload = (e) => fulfill(reader.result as string);
				reader.readAsDataURL(blob);
			});
		}
		audio_blob = new Blob(audio_chunks, { type: "audio/wav" });
		return {
			data: await blob_to_data_url(audio_blob),
			name,
			is_example
		};
	}

	async function prepare_audio() {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		recorder = new MediaRecorder(stream);

		recorder.addEventListener("dataavailable", async (event) => {
			audio_chunks.push(event.data);
			if (live && !submitting_data) {
				submitting_data = true;
				chunks_at_submit = audio_chunks.length;
				await setValue(await generate_data());
				submitting_data = false;
				audio_chunks = audio_chunks.slice(chunks_at_submit);
			}
		});

		recorder.addEventListener("stop", async () => {
			if (!live) {
				setValue(await generate_data());
			}
		});
	}

	async function record() {
		recording = true;
		audio_chunks = [];

		if (!inited) await prepare_audio();

		recorder.start();
		if (live) {
			record_interval = setInterval(() => {
				recorder.stop();
				recorder.start();
			}, 1000);
		}
	}

	onDestroy(() => {
		if (recorder) {
			recorder.stop();
		}
	});

	const stop = () => {
		recording = false;
		recorder.stop();
		if (live) {
			clearInterval(record_interval);
		}
	};

	function clear() {
		setValue(null);
		mode = "";
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
		if (!value?.data) return;

		setValue({
			data: value.data,
			name,
			is_example,
			crop_min: values[0],
			crop_max: values[1]
		});
	}
</script>

<div class="input-audio">
	{#if value === null || (source === "microphone" && live)}
		{#if source === "microphone"}
			{#if recording}
				<button
					class="p-2 rounded font-semibold bg-red-200 text-red-500 dark:bg-red-600 dark:text-red-100 shadow transition hover:shadow-md"
					on:click={stop}
				>
					Stop Recording
				</button>
			{:else}
				<button
					class="p-2 rounded font-semibold bg-white dark:bg-gray-600 shadow transition hover:shadow-md bg-white dark:bg-gray-800"
					on:click={record}
				>
					Record
				</button>
			{/if}
		{:else if source === "upload"}
			<Upload filetype="audio/*" load={setValue} {theme}>
				{$_("interface.drop_audio")}
				<br />- {$_("interface.or")} -<br />
				{$_("interface.click_to_upload")}
			</Upload>
		{/if}
	{:else}
		<ModifyUpload
			{clear}
			edit={() => (mode = "edit")}
			absolute={false}
			{theme}
			{static_src}
		/>

		<audio
			use:loaded
			class="w-full"
			controls
			bind:this={player}
			preload="metadata"
			src={value.data}
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
</div>

<style lang="postcss">
</style>
