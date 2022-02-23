<script lang="ts">
	import type { Value } from "./types";

	import { onDestroy, createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	//@ts-ignore
	import Range from "svelte-range-slider-pips";
	import { _ } from "svelte-i18n";

	// export let value: null | Value;
	export let src: null | string;
	export let setValue: (val: typeof value) => typeof value;
	export let theme: string;
	export let name: string;
	export let source: "microphone" | "upload";

	let recording = false;
	let recorder: MediaRecorder;
	let mode = "";
	let audio_chunks: Array<Blob> = [];
	let audio_blob;
	let player;
	let inited = false;
	let crop_values = [0, 100];

	const dispatch = createEventDispatcher();

	function blob_to_data_url(blob: Blob): Promise<string> {
		return new Promise((fulfill, reject) => {
			let reader = new FileReader();
			reader.onerror = reject;
			reader.onload = (e) => fulfill(reader.result as string);
			reader.readAsDataURL(blob);
		});
	}

	async function prepare_audio() {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		recorder = new MediaRecorder(stream);

		recorder.addEventListener("dataavailable", (event) => {
			audio_chunks.push(event.data);
		});

		recorder.addEventListener("stop", async () => {
			recording = false;
			audio_blob = new Blob(audio_chunks, { type: "audio/wav" });

			dispatch("change", {
				data: await blob_to_data_url(audio_blob),
				name
			});
		});
	}

	async function record() {
		recording = true;
		audio_chunks = [];

		if (!inited) await prepare_audio();

		recorder.start();
	}

	onDestroy(() => {
		if (recorder) {
			recorder.stop();
		}
	});

	const stop = () => {
		recorder.stop();
	};

	function clear() {
		dispatch("change", { data: null, name: null });
		mode = "";
		src = "";
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

		dispatch("change", {
			data: src,
			name,
			crop_min: values[0],
			crop_max: values[1]
		});
	}
</script>

<div class="input-audio">
	{#if src === null}
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
					class="p-2 rounded font-semibold shadow transition hover:shadow-md bg-white dark:bg-gray-800"
					on:click={record}
				>
					Record
				</button>
			{/if}
		{:else if source === "upload"}
			<Upload
				filetype="audio/*"
				on:load={({ detail }) => (
					(src = detail), dispatch("change", { data: detail })
				)}
				{theme}
			>
				{$_("interface.drop_audio")}
				<br />- {$_("interface.or")} -<br />
				{$_("interface.click_to_upload")}
			</Upload>
		{/if}
	{:else}
		<ModifyUpload
			on:clear={clear}
			on:edit={() => (mode = "edit")}
			absolute={false}
			{theme}
		/>

		<audio
			use:loaded
			class="w-full"
			controls
			bind:this={player}
			preload="metadata"
			{src}
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
