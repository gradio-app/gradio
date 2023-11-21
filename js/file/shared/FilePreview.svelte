<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { prettyBytes } from "./utils";
	import { createEventDispatcher } from "svelte";
	import type { I18nFormatter, SelectData } from "@gradio/utils";

	const dispatch = createEventDispatcher<{
		select: SelectData;
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
</script>

<div
	class="file-preview-holder"
	style="max-height: {typeof height === undefined ? 'auto' : height + 'px'};"
>
	<table class="file-preview">
		<tbody>
			{#each normalized_files as file, i}
				<tr
					class="file"
					class:selectable
					on:click={() =>
						dispatch("select", {
							value: file.orig_name,
							index: i
						})}
				>
					<td class="filename" aria-label={file.orig_name}>
						<span class="stem">{file.filename_stem}</span>
						<span class="ext">{file.filename_ext}</span>
					</td>

					<td class="download">
						{#if file.url}
							<a
								href={file.url}
								target="_blank"
								download={window.__is_colab__ ? null : file.orig_name}
							>
								{@html file.size != null
									? prettyBytes(file.size)
									: "(size unknown)"}&nbsp;&#8675;
							</a>
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
	.file-preview {
		table-layout: fixed;
		width: var(--size-full);
		max-height: var(--size-60);
		overflow-y: auto;
		margin-top: var(--size-1);
		color: var(--body-text-color);
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
	.download > a {
		color: var(--link-text-color);
	}

	.download > a:hover {
		color: var(--link-text-color-hover);
	}
	.download > a:visited {
		color: var(--link-text-color-visited);
	}
	.download > a:active {
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
