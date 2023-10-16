<script lang="ts">
	import { createEventDispatcher, afterUpdate, tick } from "svelte";
	import { BlockLabel, Empty, IconButton, ShareButton } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";
	import { Video, Download } from "@gradio/icons";
	import { uploadToHuggingFace } from "@gradio/utils";

	import { Player } from "../shared";
	import type { I18nFormatter } from "js/app/src/gradio_helper";

	export let value: FileData | null = null;
	export let subtitle: FileData | null = null;
	export let label: string | undefined = undefined;
	export let show_label = true;
	export let autoplay: boolean;
	export let show_share_button = true;
	export let i18n: I18nFormatter;

	let old_value: FileData | null = null;
	let old_subtitle: FileData | null = null;

	const dispatch = createEventDispatcher<{
		change: FileData;
		play: undefined;
		pause: undefined;
		end: undefined;
		stop: undefined;
	}>();

	$: value && dispatch("change", value);

	afterUpdate(async () => {
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
	});
</script>

<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
{#if value === null}
	<Empty unpadded_box={true} size="large"><Video /></Empty>
{:else}
	{#key value.data}
		<Player
			src={value.data}
			subtitle={subtitle?.data}
			{autoplay}
			on:play
			on:pause
			on:stop
			on:end
			mirror={false}
			{label}
		/>
	{/key}
	<div class="icon-buttons" data-testid="download-div">
		<a
			href={value.data}
			target={window.__is_colab__ ? "_blank" : null}
			download={value.orig_name || value.name}
		>
			<IconButton Icon={Download} label="Download" />
		</a>
		{#if show_share_button}
			<ShareButton
				{i18n}
				on:error
				on:share
				{value}
				formatter={async (value) => {
					if (!value) return "";
					let url = await uploadToHuggingFace(value.data, "url");
					return url;
				}}
			/>
		{/if}
	</div>
{/if}

<style>
	.icon-buttons {
		display: flex;
		position: absolute;
		top: 6px;
		right: 6px;
		gap: var(--size-1);
	}
</style>
