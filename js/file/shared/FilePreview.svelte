<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { prettyBytes } from "./utils";
	import { createEventDispatcher } from "svelte";
	import type { I18nFormatter, SelectData } from "@gradio/utils";
	import { DownloadLink } from "@gradio/wasm/svelte";

	const dispatch = createEventDispatcher<{
		select: SelectData;
		change: FileData[] | FileData;
		delete: FileData;
	}>();
	export let value: FileData | FileData[];
	export let selectable = false;
	export let height: number | undefined = undefined;
	export let i18n: I18nFormatter;

	function split_filename(filename: string): [string, string] {
		const last_dot = filename.lastIndexOf(".");
		if (last_dot === -1) {
			return [filename, ""];
		}
		return [filename.slice(0, last_dot), filename.slice(last_dot)];
	}

	$: normalized_files = (Array.isArray(value) ? value : [value]).map((file) => {
		const [filename_stem, filename_ext] = split_filename(file.orig_name ?? "");
		return {
			...file,
			filename_stem,
			filename_ext
		};
	});

	function handle_row_click(
		event: MouseEvent & { currentTarget: HTMLTableRowElement },
		index: number
	): void {
		const tr = event.currentTarget;
		const should_select =
			event.target === tr || // Only select if the click is on the row itself
			(tr &&
				tr.firstElementChild &&
				event.composedPath().includes(tr.firstElementChild)); // Or if the click is on the name column

		if (should_select) {
			dispatch("select", { value: normalized_files[index].orig_name, index });
		}
	}

	function remove_file(index: number): void {
		const removed = normalized_files.splice(index, 1);
		normalized_files = [...normalized_files];
		value = normalized_files;
		dispatch("delete", removed[0]);
		dispatch("change", normalized_files);
	}

	const is_browser = typeof window !== "undefined";
</script>

<div
	class="file-preview-holder"
	style="max-height: {typeof height === undefined ? 'auto' : height + 'px'};"
>
	<table class="file-preview">
		<tbody>
			{#each normalized_files as file, i (file)}
				<tr
					class="file"
					class:selectable
					on:click={(event) => {
						handle_row_click(event, i);
					}}
				>
					<td class="filename" aria-label={file.orig_name}>
						<span class="stem">{file.filename_stem}</span>
						<span class="ext">{file.filename_ext}</span>
					</td>

					<td class="download">
						{#if file.url}
							<DownloadLink
								href={file.url}
								download={is_browser && window.__is_colab__
									? null
									: file.orig_name}
							>
								{@html file.size != null
									? prettyBytes(file.size)
									: "(size unknown)"}&nbsp;&#8675;
							</DownloadLink>
						{:else}
							{i18n("file.uploading")}
						{/if}
					</td>

					{#if normalized_files.length > 1}
						<td>
							<button
								class="label-clear-button"
								aria-label="Remove this file"
								on:click={() => {
									remove_file(i);
								}}
								on:keydown={(event) => {
									if (event.key === "Enter") {
										remove_file(i);
									}
								}}
								>×
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.label-clear-button {
		color: var(--body-text-color-subdued);
		position: relative;
		left: -3px;
	}

	.label-clear-button:hover {
		color: var(--body-text-color);
	}

	.file-preview {
		table-layout: fixed;
		width: var(--size-full);
		max-height: var(--size-60);
		overflow-y: auto;
		margin-top: var(--size-1);
		color: var(--body-text-color);
	}

	.file-preview-holder {
		overflow: auto;
	}

	.file {
		display: flex;
		width: var(--size-full);
	}

	.file > * {
		padding: var(--size-1) var(--size-2-5);
	}

	.filename {
		flex-grow: 1;
		display: flex;
		overflow: hidden;
	}
	.filename .stem {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.filename .ext {
		white-space: nowrap;
	}

	.download {
		min-width: 8rem;
		width: 10%;
		white-space: nowrap;
		text-align: right;
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
