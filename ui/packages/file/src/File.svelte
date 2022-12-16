<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import {
		display_file_name,
		download_files,
		display_file_size
	} from "./utils";
	import { File } from "@gradio/icons";

	export let value: FileData | null;
	export let label: string;
	export let show_label: boolean;
</script>

<BlockLabel {show_label} Icon={File} label={label || "File"} />

{#if value}
	<div class="file-preview">
		{#if Array.isArray(value)}
			{#each value as file}
				<div class="file file-multiple">
					<div>
						{display_file_name(file)}
					</div>
					<div>
						{display_file_size(file)}
					</div>
					<div class="download">
						<a
							href={download_files(file)}
							target={window.__is_colab__ ? "_blank" : null}
							download={window.__is_colab__ ? null : display_file_name(file)}
							class="download-link">Download</a
						>
					</div>
				</div>
			{/each}
		{:else}
			<div class="file">
				<div class="file-name">
					{display_file_name(value)}
				</div>
				<div class="file-size">
					{display_file_size(value)}
				</div>
				<div class="download">
					<a
						href={download_files(value)}
						target={window.__is_colab__ ? "_blank" : null}
						download={window.__is_colab__ ? null : display_file_name(value)}
						class="download-link">Download</a
					>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="empty">
		<div><File /></div>
	</div>
{/if}

<style>
	.empty {
		/*   */
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--size-full);
		min-height: var(--size-60);
	}

	.empty > div {
		height: var(--size-5);
		color: var(--color-text-subdued);
	}

	.file-preview {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-top: var(--size-7);
		margin-bottom: var(--size-7);
		overflow-y: scroll;
		width: var(--size-full);
		max-height: var(--size-60);
		color: var(--color-text-body);
	}
	.file {
		display: flex;
		flex-direction: row;
	}
	.file-multiple {
		display: flex;
		justify-content: space-between;
		flex-direction: row;
		width: var(--size-full);
	}

	.file > * {
		padding: var(--size-2);
	}

	.file-name {
		width: 41.666667%;
	}
	.file-size {
		width: 25%;
	}
	.file-size-single {
	}

	.download {
		width: 25%;
	}

	.download:hover {
		text-decoration: underline;
	}
	.download-link {
		/* text-indigo-600 hover:underline dark:text-indigo-300 */
		color: var(--color-blue-300);
	}
</style>
