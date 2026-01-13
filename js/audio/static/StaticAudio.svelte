<script lang="ts">
	import { uploadToHuggingFace } from "@gradio/utils";
	import { Empty } from "@gradio/atoms";
	import {
		ShareButton,
		IconButton,
		BlockLabel,
		DownloadLink,
		IconButtonWrapper
	} from "@gradio/atoms";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";
	import { Download, Music } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import AudioPlayer from "../player/AudioPlayer.svelte";
	import MinimalAudioPlayer from "../shared/MinimalAudioPlayer.svelte";
	import type { FileData } from "@gradio/client";
	import type { WaveformOptions, SubtitleData } from "../shared/types";

	let {
		value = null,
		subtitles = null,
		label,
		show_label = true,
		buttons = [],
		on_custom_button_click = null,
		i18n,
		waveform_settings = {},
		waveform_options = { show_recording_waveform: true },
		editable = true,
		loop,
		display_icon_button_wrapper_top_corner = false,
		minimal = false,
		playback_position = $bindable(0),
		onchange,
		onplay,
		onpause,
		onstop,
		onshare,
		onerror
	}: {
		value?: null | FileData;
		subtitles?: null | FileData | SubtitleData[];
		label: string;
		show_label?: boolean;
		buttons?: (string | CustomButtonType)[];
		on_custom_button_click?: ((id: number) => void) | null;
		i18n: I18nFormatter;
		waveform_settings?: Record<string, any>;
		waveform_options?: WaveformOptions;
		editable?: boolean;
		loop?: boolean;
		display_icon_button_wrapper_top_corner?: boolean;
		minimal?: boolean;
		playback_position?: number;
		onchange?: (value: FileData) => void;
		onplay?: () => void;
		onpause?: () => void;
		onstop?: () => void;
		onshare?: (detail: any) => void;
		onerror?: (detail: any) => void;
	} = $props();

	$effect(() => {
		if (value) {
			onchange?.(value);
		}
	});
</script>

<BlockLabel
	{show_label}
	Icon={Music}
	float={false}
	label={label || i18n("audio.audio")}
/>

{#if value !== null}
	{#if minimal}
		<MinimalAudioPlayer {value} label={label || i18n("audio.audio")} {loop} />
	{:else}
		<IconButtonWrapper
			display_top_corner={display_icon_button_wrapper_top_corner}
			{buttons}
			{on_custom_button_click}
		>
			{#if buttons.some((btn) => typeof btn === "string" && btn === "download")}
				<DownloadLink
					href={value.is_stream
						? value.url?.replace("playlist.m3u8", "playlist-file")
						: value.url}
					download={value.orig_name || value.path}
				>
					<IconButton Icon={Download} label={i18n("common.download")} />
				</DownloadLink>
			{/if}
			{#if buttons.some((btn) => typeof btn === "string" && btn === "share")}
				<ShareButton
					{i18n}
					onerror={onerror}
					onshare={onshare}
					formatter={async (fileData: FileData) => {
						if (!fileData || !fileData.url) return "";
						let url = await uploadToHuggingFace(fileData.url, "url");
						return `<audio controls src="${url}"></audio>`;
					}}
					{value}
				/>
			{/if}
		</IconButtonWrapper>

		<AudioPlayer
			{value}
			subtitles={Array.isArray(subtitles) ? subtitles : subtitles?.url}
			{label}
			{i18n}
			{waveform_settings}
			{waveform_options}
			{editable}
			{loop}
			bind:playback_position
			onpause={onpause}
			onplay={onplay}
			onstop={onstop}
			onload={() => {}}
		/>
	{/if}
{:else}
	<Empty size="small">
		<Music />
	</Empty>
{/if}
