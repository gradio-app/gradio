<script lang="ts">
	import { onMount } from "svelte";
	import { Music } from "@gradio/icons";
	import { format_time, type I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import { skip_audio, process_audio } from "../shared/utils";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import { Empty } from "@gradio/atoms";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";
	import type { FileData } from "@gradio/client";
	import type { WaveformOptions } from "../shared/types";
	import { createEventDispatcher } from "svelte";

	import Hls from "hls.js";

	export let value: null | FileData = null;
	export let subtitles: null | string = null;
	$: url = value?.url;
	export let label: string;
	export let i18n: I18nFormatter;
	export let dispatch_blob: (
		blobs: Uint8Array[] | Blob[],
		event: "stream" | "change" | "stop_recording"
	) => Promise<void> = () => Promise.resolve();
	export let interactive = false;
	export let editable = true;
	export let trim_region_settings = {};
	export let waveform_settings: Record<string, any>;
	export let waveform_options: WaveformOptions;
	export let mode = "";
	export let loop: boolean;
	export let handle_reset_value: () => void = () => {};

	let container: HTMLDivElement;
	let waveform: WaveSurfer | undefined;
	let playing = false;

	let subtitleContainer: HTMLDivElement;
	let audio_player: HTMLAudioElement;

	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audio_duration: number;

	let trimDuration = 0;

	let show_volume_slider = false;
	let stream_active = false;
	let subtitles_toggle = false;

	const dispatch = createEventDispatcher<{
		stop: undefined;
		play: undefined;
		pause: undefined;
		edit: undefined;
		end: undefined;
		load: undefined;
	}>();

	$: use_waveform =
		waveform_options.show_recording_waveform && !value?.is_stream;

	const create_waveform = (): void => {
		waveform = WaveSurfer.create({
			container: container,
			...waveform_settings
		});

		if (subtitles && waveform) {
			if (subtitles_toggle) {
				addSubtitlesToWaveform(waveform, subtitles);
			} else {
				hideSubtitles();
			}
		}

		resolve_wasm_src(value?.url).then((resolved_src) => {
			if (resolved_src && waveform) {
				return waveform.load(resolved_src);
			}
		});
	};

	$: if (use_waveform && container !== undefined && container !== null) {
		if (waveform !== undefined) waveform.destroy();
		container.innerHTML = "";
		create_waveform();
		playing = false;
	}

	$: waveform?.on("decode", (duration: any) => {
		audio_duration = duration;
		durationRef && (durationRef.textContent = format_time(duration));
	});

	$: waveform?.on(
		"timeupdate",
		(currentTime: any) =>
			timeRef && (timeRef.textContent = format_time(currentTime))
	);

	$: waveform?.on("ready", () => {
		if (!waveform_settings.autoplay) {
			waveform?.stop();
		} else {
			waveform?.play();
		}
	});

	$: waveform?.on("finish", () => {
		if (loop) {
			waveform?.play();
		} else {
			playing = false;
			dispatch("stop");
		}
	});
	$: waveform?.on("pause", () => {
		playing = false;
		dispatch("pause");
	});
	$: waveform?.on("play", () => {
		playing = true;
		dispatch("play");
	});

	$: waveform?.on("load", () => {
		dispatch("load");
	});

	const handle_trim_audio = async (
		start: number,
		end: number
	): Promise<void> => {
		mode = "";
		const decodedData = waveform?.getDecodedData();
		if (decodedData)
			await process_audio(
				decodedData,
				start,
				end,
				waveform_settings.sampleRate
			).then(async (trimmedBlob: Uint8Array) => {
				await dispatch_blob([trimmedBlob], "change");
				waveform?.destroy();
				container.innerHTML = "";
			});
		dispatch("edit");
	};

	async function load_audio(data: string): Promise<void> {
		stream_active = false;
		await resolve_wasm_src(data).then((resolved_src) => {
			if (!resolved_src || value?.is_stream) return;
			if (waveform_options.show_recording_waveform) {
				waveform?.load(resolved_src);
			} else if (audio_player) {
				audio_player.src = resolved_src;
			}
		});
	}

	$: url && load_audio(url);

	$: if (subtitles && waveform) {
		if (subtitles_toggle) {
			addSubtitlesToWaveform(waveform, subtitles);
		} else {
			hideSubtitles();
		}
	}

	function load_stream(value: FileData | null): void {
		if (!value || !value.is_stream || !value.url) return;

		if (Hls.isSupported() && !stream_active) {
			// Set config to start playback after 1 second of data received
			const hls = new Hls({
				maxBufferLength: 1,
				maxMaxBufferLength: 1,
				lowLatencyMode: true
			});
			hls.loadSource(value.url);
			hls.attachMedia(audio_player);
			hls.on(Hls.Events.MANIFEST_PARSED, function () {
				if (waveform_settings.autoplay) audio_player.play();
			});
			hls.on(Hls.Events.ERROR, function (event, data) {
				if (data.fatal) {
					switch (data.type) {
						case Hls.ErrorTypes.NETWORK_ERROR:
							hls.startLoad();
							break;
						case Hls.ErrorTypes.MEDIA_ERROR:
							hls.recoverMediaError();
							break;
						default:
							hls.destroy();
							break;
					}
				}
			});
			stream_active = true;
		} else if (!stream_active) {
			audio_player.src = value.url;
			if (waveform_settings.autoplay) audio_player.play();
			stream_active = true;
		}
	}

	$: if (audio_player && value?.is_stream) {
		load_stream(value);
	}

	onMount(() => {
		window.addEventListener("keydown", (e) => {
			if (!waveform || show_volume_slider) return;
			if (e.key === "ArrowRight" && mode !== "edit") {
				skip_audio(waveform, 0.1);
			} else if (e.key === "ArrowLeft" && mode !== "edit") {
				skip_audio(waveform, -0.1);
			}
		});
	});

	async function addSubtitlesToWaveform(
		wavesurfer: WaveSurfer,
		subtitleUrl: string
	): Promise<void> {
		try {
			const response = await fetch(subtitleUrl);
			const vttContent = await response.text();

			const subtitles = parseVTT(vttContent);

			if (subtitles.length > 0) {
				let currentSubtitle = "";
				if (subtitleContainer) {
					subtitleContainer.style.display = "";
					wavesurfer.on("audioprocess", (time) => {
						const subtitle = subtitles.find(
							(s) => time >= s.start && time <= s.end
						);
						if (subtitle && subtitle.text !== currentSubtitle) {
							currentSubtitle = subtitle.text;
							subtitleContainer.textContent = currentSubtitle;
						} else if (!subtitle && currentSubtitle !== "") {
							currentSubtitle = "";
							subtitleContainer.textContent = "";
						}
					});

					wavesurfer.on("seek", (progress) => {
						const time = progress * wavesurfer.getDuration();
						const subtitle = subtitles.find(
							(s) => time >= s.start && time <= s.end
						);
						if (subtitle) {
							currentSubtitle = subtitle.text;
							subtitleContainer.textContent = currentSubtitle;
						} else {
							currentSubtitle = "";
							subtitleContainer.textContent = "";
						}
					});
				}
			}
		} catch (error) {}
	}

	function hideSubtitles(): void {
		if (subtitleContainer) {
			subtitleContainer.style.display = "none";
		}
	}

	function parseVTT(
		vttContent: string
	): { start: number; end: number; text: string }[] {
		const lines = vttContent.split("\n");
		const subtitles: { start: number; end: number; text: string }[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.includes(" --> ")) {
				const [startTime, endTime] = line.split(" --> ");
				const start = parseTimeToSeconds(startTime);
				const end = parseTimeToSeconds(endTime);

				let text = "";
				for (let j = i + 1; j < lines.length && lines[j].trim() !== ""; j++) {
					if (text) text += " ";
					text += lines[j].trim();
				}

				if (text) {
					subtitles.push({ start, end, text });
				}
			}
		}

		return subtitles;
	}

	function parseTimeToSeconds(timeStr: string): number {
		const parts = timeStr.split(":");
		if (parts.length === 3) {
			const hours = parseInt(parts[0]);
			const minutes = parseInt(parts[1]);
			const seconds = parseFloat(parts[2]);
			return hours * 3600 + minutes * 60 + seconds;
		}
		return 0;
	}
</script>

{#if value === null}
	<Empty size="small">
		<Music />
	</Empty>
{:else if use_waveform}
	<div
		class="component-wrapper"
		data-testid={label ? "waveform-" + label : "unlabelled-audio"}
	>
		<div class="waveform-container">
			<div
				id="waveform"
				bind:this={container}
				style:height={container ? null : "58px"}
			/>
		</div>

		<div class="timestamps">
			<time bind:this={timeRef} id="time">0:00</time>
			<div>
				{#if mode === "edit" && trimDuration > 0}
					<time id="trim-duration">{format_time(trimDuration)}</time>
				{/if}
				<time bind:this={durationRef} id="duration">0:00</time>
			</div>
		</div>

		<div bind:this={subtitleContainer} class="subtitle-display"></div>

		<WaveformControls
			{container}
			{waveform}
			{playing}
			{audio_duration}
			{i18n}
			{interactive}
			{handle_trim_audio}
			bind:mode
			bind:trimDuration
			bind:show_volume_slider
			bind:subtitles_toggle
			show_redo={interactive}
			{handle_reset_value}
			{waveform_options}
			{trim_region_settings}
			{editable}
			show_subtitles={subtitles !== null}
		/>
		<audio
			bind:this={audio_player}
			preload="metadata"
			style="display: none;"
		></audio>
	</div>
{/if}

<style>
	.component-wrapper {
		padding: var(--size-3);
		width: 100%;
	}

	:global(::part(wrapper)) {
		margin-bottom: var(--size-2);
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

	.subtitle-display {
		color: white;
		padding: 12px 16px;
		margin: 8px 0;
		font-size: 14px;
		text-align: center;
		max-width: 600px;
		line-height: 1.4;
		min-height: 20px;
		font-family: monospace;
		font-weight: bold;
		margin: 0 auto;
		transition: opacity 0.2s ease-in-out;
	}

	.subtitle-display:empty {
		display: none;
	}
</style>
