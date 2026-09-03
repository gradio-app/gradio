<script lang="ts">
	import { onMount, untrack } from "svelte";
	import { Music } from "@gradio/icons";
	import { format_time, type I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import { skip_audio, process_audio } from "../shared/utils";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import { Empty } from "@gradio/atoms";
	import type { FileData } from "@gradio/client";
	import type { WaveformOptions, SubtitleData } from "../shared/types";

	import { create_hls_stream, is_hls_supported } from "@gradio/utils/hls";

	let {
		value = null,
		subtitles = null,
		label,
		i18n,
		dispatch_blob = () => Promise.resolve(),
		interactive = false,
		editable = true,
		trim_region_settings = {},
		waveform_settings,
		waveform_options,
		mode = $bindable(),
		loop,
		handle_reset_value = () => {},
		playback_position = $bindable(),
		onstop,
		onplay,
		onpause,
		onedit,
		onload
	}: {
		value?: null | FileData;
		subtitles?: null | string | SubtitleData[];
		label: string;
		i18n: I18nFormatter;
		dispatch_blob?: (
			blobs: Uint8Array[] | Blob[],
			event: "stream" | "change"
		) => Promise<void>;
		interactive?: boolean;
		editable?: boolean;
		trim_region_settings?: Record<string, any>;
		waveform_settings: Record<string, any>;
		waveform_options: WaveformOptions;
		mode?: string;
		loop?: boolean;
		handle_reset_value?: () => void;
		playback_position?: number;
		onstop?: () => void;
		onplay?: () => void;
		onpause?: () => void;
		onedit?: () => void;
		onload?: () => void;
	} = $props();

	let url = $derived(value?.url);
	let is_stream = $derived(value?.is_stream ?? false);
	let old_playback_position = $state(0);

	let container = $state<HTMLDivElement | undefined>(undefined);
	let waveform_container: HTMLDivElement | undefined = undefined;
	let waveform: WaveSurfer | undefined;
	let waveform_ready = $state(false);
	let waveform_component_wrapper: HTMLDivElement;
	let playing = $state(false);

	let subtitle_container: HTMLDivElement;

	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audio_duration = $state<number>(0);

	let trimDuration = $state(0);

	let show_volume_slider = $state(false);
	let audio_player = $state<HTMLAudioElement | undefined>(undefined);

	let subtitles_toggle = $state(true);
	let subtitle_event_handlers: (() => void)[] = [];

	let waveform_load_failed = $state(false);

	let use_waveform = $derived(
		waveform_options.show_recording_waveform && !is_stream
	);

	let native_fallback_active = $derived(waveform_load_failed && url != null);

	// The native element is the player, rather than a hidden decoy, whenever
	// there is no working waveform to drive playback: the waveform is turned
	// off, the value is a stream, or the waveform failed to load. Its events
	// are only meaningful in those cases.
	let native_player_active = $derived(!use_waveform || native_fallback_active);

	$effect(() => {
		if (
			playback_position !== undefined &&
			old_playback_position !== playback_position
		) {
			if (native_player_active) {
				if (audio_player) {
					audio_player.currentTime = playback_position;
					old_playback_position = playback_position;
				}
			} else if (waveform_ready && audio_duration) {
				waveform?.seekTo(playback_position / audio_duration);
				old_playback_position = playback_position;
			}
		}
	});

	const create_waveform = (): void => {
		// `container` only exists while the waveform branch is rendered, and it is
		// a fresh element every time that branch remounts, so bail out when there
		// is nothing to draw into and rebuild when the element is replaced.
		if (!container || waveform_container === container) return;
		clear_subtitles();
		waveform?.destroy();
		waveform_ready = false;
		waveform_container = container;
		waveform = WaveSurfer.create({
			container: container,
			...waveform_settings
		});
		if (subtitles && waveform) {
			if (subtitles_toggle) {
				add_subtitles_to_waveform(waveform, subtitles);
			} else {
				hide_subtitles();
			}
		}

		waveform?.on("init", () => {
			waveform_ready = true;
		});
		waveform?.on("decode", (duration: any) => {
			audio_duration = duration;
			durationRef && (durationRef.textContent = format_time(duration));
		});

		let firstTimeUpdate = true;
		waveform?.on("timeupdate", (currentTime: any) => {
			timeRef && (timeRef.textContent = format_time(currentTime));
			if (firstTimeUpdate) {
				firstTimeUpdate = false;
				return;
			}
			playback_position = currentTime;
			old_playback_position = currentTime;
		});

		waveform?.on("interaction", () => {
			const currentTime = waveform?.getCurrentTime() || 0;
			timeRef && (timeRef.textContent = format_time(currentTime));
			playback_position = currentTime;
			old_playback_position = currentTime;
		});

		waveform?.on("ready", () => {
			if (!waveform_settings.autoplay) {
				waveform?.stop();
			} else {
				waveform?.play();
			}
		});

		waveform?.on("finish", () => {
			if (loop) {
				waveform?.play();
			} else {
				playing = false;
				onstop?.();
			}
		});
		waveform?.on("pause", () => {
			playing = false;
			onpause?.();
		});
		waveform?.on("play", () => {
			playing = true;
			onplay?.();
		});

		waveform?.on("load", () => {
			onload?.();
		});

		// wavesurfer emits `error` for a failed load and for a media element
		// error. A failed load also rejects the load promise, the only path
		// that knows which URL failed, so it is handled there. A media element
		// error never reaches that promise: wavesurfer reads the duration by
		// waiting for `loadedmetadata`, an error means that event never
		// arrives, and the wait has no reject path, so the load hangs. The
		// event is the only signal for it, and `MediaError` is what separates
		// the two.
		waveform?.on("error", (e: Error | MediaError) => {
			if (!(e instanceof MediaError)) return;
			handle_waveform_error(e);
		});
	};

	$effect(() => {
		if (url && waveform_ready && use_waveform) {
			const loading_url = url;
			untrack(() => {
				if (waveform) {
					if (waveform_load_failed) {
						// The failed file is still attached to the native element
						// and keeps playing behind the waveform unless released.
						audio_player?.removeAttribute("src");
						audio_player?.load();
					}
					waveform_load_failed = false;
					waveform
						.load(loading_url)
						.catch((e: Error) => handle_waveform_error(e, loading_url));
				}
			});
		}
	});

	function handle_waveform_error(
		e: Error | MediaError,
		failed_url?: string
	): void {
		// A late rejection from a load the value has moved past (a stream, or
		// an earlier file) must not downgrade the current source to the
		// native fallback. A media element error carries no URL, so it is
		// taken to be about the file currently attached.
		if (failed_url !== undefined && failed_url !== url) return;
		if (is_stream) return;
		if (("name" in e && e.name === "AbortError") || waveform_load_failed)
			return;
		console.error("Waveform load error:", e);
		waveform_load_failed = true;
		if (audio_player && url) {
			audio_player.src = url;
		}
	}

	const handle_trim_audio = async (
		start: number,
		end: number
	): Promise<void> => {
		mode = "";
		const decodedData = waveform?.getDecodedData();
		if (decodedData) {
			const trimmedBlob = await process_audio(
				decodedData,
				start,
				end,
				waveform_settings.sampleRate
			);
			await dispatch_blob([trimmedBlob], "change");
		}
		onedit?.();
	};

	$effect(() => {
		if (subtitles && waveform) {
			if (subtitles_toggle) {
				add_subtitles_to_waveform(waveform, subtitles);
			} else {
				hide_subtitles();
			}
		}
	});

	// This effect owns the native element's source: a stream gets one HLS
	// instance per playlist URL, and a plain file is assigned directly when
	// there is no waveform to play it. Both live in one effect because they
	// are one resource. Svelte runs an effect's teardown before its next
	// body, so releasing the old source and putting the new one in place can
	// never happen out of order, which two effects could not guarantee: the
	// player would then be left with a source hls.js had already discarded.
	// `value` is a fresh object on every chunk, so the effect must only
	// depend on the equality-stable deriveds, or each chunk would restart
	// the stream.
	$effect(() => {
		if (!audio_player || !url) return;
		const media = audio_player;
		if (is_stream) {
			if (is_hls_supported()) {
				// A manifest parsed off the network never runs in a reactive
				// context, so the `untrack` is defensive: it keeps a
				// synchronous emit from making `waveform_settings` a
				// dependency, which would tear the stream down mid-run
				// whenever the parent re-created that object.
				const hls = create_hls_stream(media, url, () => {
					// A pending play promise is rejected by the teardown's
					// detach, and an autoplay policy can block playback
					// outright; neither is something the app can act on.
					if (untrack(() => waveform_settings.autoplay))
						media.play().catch(() => {});
				});
				return () => hls.destroy();
			}
			media.src = url;
			if (untrack(() => waveform_settings.autoplay))
				media.play().catch(() => {});
			return () => {
				// `load()` stops playback without dispatching a `pause` the
				// app never caused.
				media.removeAttribute("src");
				media.load();
			};
		}
		if (!use_waveform) {
			media.src = url;
		}
	});

	$effect(() => {
		if (container) {
			untrack(() => create_waveform());
		} else if (waveform) {
			clear_subtitles();
			waveform.destroy();
			waveform = undefined;
			waveform_container = undefined;
			waveform_ready = false;
			waveform_load_failed = false;
		}
	});

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent): void => {
			if (!waveform || show_volume_slider) return;

			const is_focused_in_waveform =
				waveform_component_wrapper &&
				waveform_component_wrapper.contains(document.activeElement);
			if (!is_focused_in_waveform) return;
			if (e.key === "ArrowRight" && mode !== "edit") {
				skip_audio(waveform, 0.1);
			} else if (e.key === "ArrowLeft" && mode !== "edit") {
				skip_audio(waveform, -0.1);
			}
		};
		window.addEventListener("keydown", handleKeydown);

		return () => {
			waveform?.destroy();
			window.removeEventListener("keydown", handleKeydown);
		};
	});

	async function add_subtitles_to_waveform(
		wavesurfer: WaveSurfer,
		subtitle_data: string | SubtitleData[]
	): Promise<void> {
		clear_subtitles();
		try {
			let subtitles: SubtitleData[];
			if (Array.isArray(subtitle_data)) {
				subtitles = subtitle_data;
			} else {
				const response = await fetch(subtitle_data);
				const subtitle_content = await response.text();
				subtitles = parse_subtitles(subtitle_content);
			}

			if (subtitles.length > 0) {
				let current_subtitle = "";
				if (subtitle_container) {
					subtitle_container.style.display = "";
					const audioProcessHandler = (time: number): void => {
						const subtitle = subtitles.find(
							(s) => time >= s.start && time <= s.end
						);
						if (subtitle && subtitle.text !== current_subtitle) {
							current_subtitle = subtitle.text;
							subtitle_container.textContent = current_subtitle;
						} else if (!subtitle && current_subtitle !== "") {
							current_subtitle = "";
							subtitle_container.textContent = "";
						}
					};
					wavesurfer.on("audioprocess", audioProcessHandler);
					subtitle_event_handlers.push(() => {
						wavesurfer.un("audioprocess", audioProcessHandler);
					});
				}
			}
		} catch (error) {}
	}

	function hide_subtitles(): void {
		if (subtitle_container) {
			subtitle_container.style.display = "none";
		}
	}

	function clear_subtitles(): void {
		if (subtitle_container) {
			subtitle_container.textContent = "";
		}
		subtitle_event_handlers.forEach((handler) => handler());
		subtitle_event_handlers = [];
	}

	function parse_subtitles(subtitle_content: string): SubtitleData[] {
		const lines = subtitle_content.split("\n");
		const subtitles: SubtitleData[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.includes(" --> ")) {
				const [start_time, end_time] = line.split(" --> ");
				const start = parse_time_to_seconds(start_time);
				const end = parse_time_to_seconds(end_time);

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

	function parse_time_to_seconds(time_str: string): number {
		const parts = time_str.split(":");
		if (parts.length === 3) {
			const hours = parseInt(parts[0]);
			const minutes = parseInt(parts[1]);
			const seconds = parseFloat(parts[2]);
			return hours * 3600 + minutes * 60 + seconds;
		}
		return 0;
	}
</script>

<audio
	class="standard-player"
	class:hidden={!native_player_active}
	data-testid={label ? "audio-player-" + label : "unlabelled-audio-player"}
	controls
	autoplay={waveform_settings.autoplay}
	{onload}
	bind:this={audio_player}
	onended={() => {
		if (native_player_active) playing = false;
		onstop?.();
	}}
	onplay={() => {
		if (native_player_active) playing = true;
		onplay?.();
	}}
	onpause={() => {
		if (!native_player_active) return;
		playing = false;
		onpause?.();
	}}
	ontimeupdate={() => {
		if (!native_player_active || !audio_player) return;
		playback_position = audio_player.currentTime;
		old_playback_position = audio_player.currentTime;
	}}
	onloadedmetadata={() => {
		if (native_player_active && audio_player) {
			audio_duration = audio_player.duration;
		}
	}}
	preload="metadata"
>
</audio>
{#if value === null}
	<Empty size="small">
		<Music />
	</Empty>
{:else if use_waveform}
	<div
		class="component-wrapper"
		class:hidden={native_fallback_active}
		data-testid={label ? "waveform-" + label : "unlabelled-audio"}
		bind:this={waveform_component_wrapper}
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

		<div
			bind:this={subtitle_container}
			class="subtitle-display"
			data-testid="subtitle-display"
		></div>

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

	.standard-player {
		width: 100%;
		padding: var(--size-2);
	}

	.subtitle-display {
		color: var(--text-secondary);
		font-size: var(--text-lg);
		text-align: center;
		max-width: 600px;
		line-height: 1.3;
		min-height: var(--size-4);
		font-family: var(--font-sans);
		font-weight: normal;
		margin: var(--size-2) auto;
		padding: var(--size-1) var(--size-2);
		border-radius: 2px;
		transition: opacity 0.2s ease-in-out;
	}

	.hidden,
	.subtitle-display:empty {
		display: none;
	}
</style>
