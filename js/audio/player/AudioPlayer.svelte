<script lang="ts">
	import { onMount } from "svelte";
	import { Music } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import { skipAudio, process_audio } from "../shared/utils";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import { Empty } from "@gradio/atoms";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";
	import type { FileData } from "@gradio/client";
	import type { WaveformOptions } from "../shared/types";
	import { createEventDispatcher } from "svelte";

	export let value: null | FileData = null;
	$: url = value?.url;
	export let label: string;
	export let i18n: I18nFormatter;
	export let dispatch_blob: (
		blobs: Uint8Array[] | Blob[],
		event: "stream" | "change" | "stop_recording"
	) => Promise<void> = () => Promise.resolve();
	export let interactive = false;
	export let trim_region_settings = {};
	export let waveform_settings: Record<string, any>;
	export let waveform_options: WaveformOptions;
	export let mode = "";
	export let handle_reset_value: () => void = () => {};

	let container: HTMLDivElement;
	let waveform: WaveSurfer | undefined;
	let playing = false;

	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audioDuration: number;

	let trimDuration = 0;

	let show_volume_slider = false;

	const dispatch = createEventDispatcher<{
		stop: undefined;
		play: undefined;
		pause: undefined;
		edit: undefined;
		end: undefined;
	}>();

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secondsRemainder = Math.round(seconds) % 60;
		const paddedSeconds = `0${secondsRemainder}`.slice(-2);
		return `${minutes}:${paddedSeconds}`;
	};

	const create_waveform = (): void => {
		waveform = WaveSurfer.create({
			container: container,
			url: value?.url,
			...waveform_settings
		});
	};

	$: if (container !== undefined) {
		if (waveform !== undefined) waveform.destroy();
		container.innerHTML = "";
		create_waveform();
		playing = false;
	}

	$: waveform?.on("decode", (duration: any) => {
		audioDuration = duration;
		durationRef && (durationRef.textContent = formatTime(duration));
	});

	$: waveform?.on(
		"timeupdate",
		(currentTime: any) =>
			timeRef && (timeRef.textContent = formatTime(currentTime))
	);

	$: waveform?.on("ready", () => {
		if (!waveform_settings.autoplay) {
			waveform?.stop();
		} else {
			waveform?.play();
		}
	});

	$: waveform?.on("finish", () => {
		playing = false;
		dispatch("stop");
	});
	$: waveform?.on("pause", () => {
		playing = false;
		dispatch("pause");
	});
	$: waveform?.on("play", () => {
		playing = true;
		dispatch("play");
	});

	const handle_trim_audio = async (
		start: number,
		end: number
	): Promise<void> => {
		mode = "";
		const decodedData = waveform?.getDecodedData();
		if (decodedData)
			await process_audio(decodedData, start, end).then(
				async (trimmedBlob: Uint8Array) => {
					await dispatch_blob([trimmedBlob], "change");
					waveform?.destroy();
					create_waveform();
				}
			);
		dispatch("edit");
	};

	async function load_audio(data: string): Promise<void> {
		await resolve_wasm_src(data).then((resolved_src) => {
			if (!resolved_src || value?.is_stream) return;
			return waveform?.load(resolved_src);
		});
	}

	$: url && load_audio(url);

	onMount(() => {
		window.addEventListener("keydown", (e) => {
			if (!waveform || show_volume_slider) return;
			if (e.key === "ArrowRight" && mode !== "edit") {
				skipAudio(waveform, 0.1);
			} else if (e.key === "ArrowLeft" && mode !== "edit") {
				skipAudio(waveform, -0.1);
			}
		});
	});
</script>

{#if value === null}
	<Empty size="small">
		<Music />
	</Empty>
{:else if value.is_stream}
	<audio
		class="standard-player"
		src={value.url}
		controls
		autoplay={waveform_settings.autoplay}
	/>
{:else}
	<div
		class="component-wrapper"
		data-testid={label ? "waveform-" + label : "unlabelled-audio"}
	>
		<div class="waveform-container">
			<div id="waveform" bind:this={container} />
		</div>

		<div class="timestamps">
			<time bind:this={timeRef} id="time">0:00</time>
			<div>
				{#if mode === "edit" && trimDuration > 0}
					<time id="trim-duration">{formatTime(trimDuration)}</time>
				{/if}
				<time bind:this={durationRef} id="duration">0:00</time>
			</div>
		</div>

		{#if waveform}
			<WaveformControls
				{container}
				{waveform}
				{playing}
				{audioDuration}
				{i18n}
				{interactive}
				{handle_trim_audio}
				bind:mode
				bind:trimDuration
				bind:show_volume_slider
				showRedo={interactive}
				{handle_reset_value}
				{waveform_options}
				{trim_region_settings}
			/>
		{/if}
	</div>
{/if}

<style>
	.component-wrapper {
		padding: var(--size-3);
	}

	.timestamps {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: var(--size-1) 0;
	}

	#time {
		color: var(--neutral-400);
	}

	#duration {
		color: var(--neutral-400);
	}

	#trim-duration {
		color: var(--color-accent);
		margin-right: var(--spacing-sm);
	}
	.waveform-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-full);
	}

	#waveform {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.standard-player {
		width: 100%;
		padding: var(--size-2);
	}
</style>
