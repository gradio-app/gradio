<script lang="ts">
	import { tick } from "svelte";
	import {
		BlockLabel,
		Empty,
		IconButton,
		ShareButton,
		IconButtonWrapper,
		DownloadLink
	} from "@gradio/atoms";
	import type { FileData, Client } from "@gradio/client";
	import { Video, Download } from "@gradio/icons";
	import { uploadToHuggingFace } from "@gradio/utils";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	import Player from "./Player.svelte";
	import type { I18nFormatter } from "js/core/src/gradio_helper";

	interface Props {
		value?: FileData | null;
		subtitle?: FileData | null;
		label?: string;
		show_label?: boolean;
		autoplay: boolean;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
		loop: boolean;
		i18n: I18nFormatter;
		upload: Client["upload"];
		display_icon_button_wrapper_top_corner?: boolean;
		playback_position?: number;
		onplay?: () => void;
		onpause?: () => void;
		onend?: () => void;
		onstop?: () => void;
		onload?: () => void;
		onchange?: (value: FileData) => void;
		onerror?: (error: string) => void;
		onshare?: (detail: unknown) => void;
	}

	let {
		value = $bindable(null),
		subtitle = null,
		label = undefined,
		show_label = true,
		autoplay,
		buttons = null,
		on_custom_button_click = null,
		loop,
		i18n,
		upload,
		display_icon_button_wrapper_top_corner = false,
		playback_position = $bindable(),
		onplay,
		onpause,
		onend,
		onstop,
		onload,
		onchange,
		onerror,
		onshare
	}: Props = $props();

	let old_value = $state<FileData | null>(null);
	let old_subtitle = $state<FileData | null>(null);

	$effect(() => {
		if (value) {
			onchange?.(value);
		}
	});

	$effect(() => {
		async function updateValue(): Promise<void> {
			// needed to bust subtitle caching issues on Chrome
			if (
				value !== old_value &&
				subtitle !== old_subtitle &&
				old_subtitle !== null
			) {
				old_value = value;
				value = null;
				await tick();
				value = old_value;
			}
			old_value = value;
			old_subtitle = subtitle;
		}
		updateValue();
	});
</script>

<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
{#if !value || value.url === undefined}
	<Empty unpadded_box={true} size="large"><Video /></Empty>
{:else}
	{#key value.url}
		<Player
			src={value.url}
			subtitle={subtitle?.url}
			is_stream={value.is_stream}
			{autoplay}
			onplay={() => onplay?.()}
			onpause={() => onpause?.()}
			onstop={() => onstop?.()}
			onend={() => onend?.()}
			onloadedmetadata={() => {
				// Deal with `<video>`'s `loadedmetadata` event as `VideoPreview`'s `load` event
				// to represent not only the video is loaded but also the metadata is loaded
				// so its dimensions (w/h) are known. This is used for Chatbot's auto scroll.
				onload?.();
			}}
			mirror={false}
			{label}
			{loop}
			interactive={false}
			{upload}
			{i18n}
			bind:playback_position
		/>
	{/key}
	<div data-testid="download-div">
		<IconButtonWrapper
			display_top_corner={display_icon_button_wrapper_top_corner}
			buttons={buttons ?? ["download", "share"]}
			{on_custom_button_click}
		>
			{#if buttons?.some((btn) => typeof btn === "string" && btn === "download")}
				<DownloadLink
					href={value.is_stream
						? value.url?.replace("playlist.m3u8", "playlist-file")
						: value.url}
					download={value.orig_name || value.path}
				>
					<IconButton Icon={Download} label="Download" />
				</DownloadLink>
			{/if}
			{#if buttons?.some((btn) => typeof btn === "string" && btn === "share")}
				<ShareButton
					{i18n}
					onerror={(detail) => onerror?.(detail)}
					onshare={(detail) => onshare?.(detail)}
					{value}
					formatter={async (value) => {
						if (!value) return "";
						let url = await uploadToHuggingFace(value.data, "url");
						return url;
					}}
				/>
			{/if}
		</IconButtonWrapper>
	</div>
{/if}
