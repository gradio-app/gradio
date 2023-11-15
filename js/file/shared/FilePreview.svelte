<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { display_file_name, display_file_size } from "./utils";
	import { createEventDispatcher } from "svelte";
	import type { I18nFormatter, SelectData } from "@gradio/utils";
	import { DownloadLink } from "@gradio/wasm/svelte";

	const dispatch = createEventDispatcher<{
		select: SelectData;
	}>();
	export let value: FileData | FileData[];
	export let selectable = false;
	export let height: number | undefined = undefined;
	export let i18n: I18nFormatter;
</script>

<div
	class="file-preview-holder"
	style="max-height: {typeof height === undefined ? 'auto' : height + 'px'};"
>
	<table class="file-preview">
		<tbody>
			{#each Array.isArray(value) ? value : [value] as file, i}
				<tr
					class="file"
					class:selectable
					on:click={() =>
						dispatch("select", {
							value: file.orig_name,
							index: i
						})}
				>
					<td>
						{display_file_name(file)}
					</td>

					<td class="download">
						{#if file.url}
							<DownloadLink
								href={file.url}
								download={window.__is_colab__ ? null : file.orig_name}
							>
								{@html display_file_size(file)}&nbsp;&#8675;
							</DownloadLink>
						{:else}
							{i18n("file.uploading")}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	td {
		width: 45%;
	}

	td:last-child {
		width: 10%;
		text-align: right;
	}
	.file-preview-holder {
		overflow-x: auto;
		overflow-y: auto;
	}
	.file-preview {
		width: var(--size-full);
		max-height: var(--size-60);
		overflow-y: auto;
		margin-top: var(--size-1);
		color: var(--body-text-color);
	}
	.file {
		width: var(--size-full);
	}

	.file > * {
		padding: var(--size-1) var(--size-2-5);
	}

	.download:hover {
		text-decoration: underline;
	}
	.download > :global(a) {
		color: var(--link-text-color);
	}

	.download > :global(a:hover) {
		color: var(--link-text-color-hover);
	}
	.download > :global(a:visited) {
		color: var(--link-text-color-visited);
	}
	.download > :global(a:active) {
		color: var(--link-text-color-active);
	}
	.selectable {
		cursor: pointer;
	}

	tbody > tr:nth-child(even) {
		background: var(--block-background-fill);
	}

	tbody > tr:nth-child(odd) {
		background: var(--table-odd-background-fill);
	}
</style>
