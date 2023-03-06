<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { Download } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";
	import { display_file_name, display_file_size } from "./utils";

	export let value: FileData | FileData[];
</script>

<div class="file-preview-holder">
	<table class="file-preview">
		<tbody>
			{#each Array.isArray(value) ? value : [value] as file}
				<tr class="file">
					<td>
						{display_file_name(file)}
					</td>

					<td>
						{display_file_size(file)}
					</td>

					<td class="download">
						{#if file.data}
							<a
								href={file.data}
								target="_blank"
								download={window.__is_colab__
									? null
									: file.orig_name || file.name}
							>
								Download
							</a>
						{:else}
							Uploading...
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
	}
	.file-preview {
		width: var(--size-full);
		max-height: var(--size-60);
		overflow-y: auto;
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
	.download > a {
		color: var(--text-color-link);
	}

	.download > a:hover {
		color: var(--text-color-link-hover);
	}
	.download > a:visited {
		color: var(--text-color-link-visited);
	}
	.download > a:active {
		color: var(--text-color-link-active);
	}
</style>
