<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import {
		display_file_name,
		download_files,
		display_file_size
	} from "./utils";

	export let value: FileData | FileData[];
</script>

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
					<a
						href={download_files(file)}
						target={window.__is_colab__ ? "_blank" : null}
						download={window.__is_colab__ ? null : display_file_name(file)}
						>Download</a
					>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	td {
		width: 45%;
	}

	td:last-child {
		text-align: right;
		width: 10%;
	}

	.file-preview {
		margin-top: var(--size-7);
		margin-bottom: var(--size-7);
		overflow-y: scroll;
		width: var(--size-full);
		max-height: var(--size-60);
		color: var(--color-text-body);
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
		color: var(--color-text-link);
	}
</style>
