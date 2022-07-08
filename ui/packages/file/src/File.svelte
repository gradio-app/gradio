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
	export let file_count: string;
</script>

<BlockLabel {show_label} Icon={File} label={label || "File"} />
	
{#if value}
	<div
		class="file-preview overflow-y-scroll w-full max-h-60 flex flex-col justify-between mt-7 mb-7 dark:text-slate-200"
	>
		{#if Array.isArray(value)}
			{#each value as file}
				<div class="flex flex-row w-1/2 justify-between">
					<div class="file-name p-2">
						{display_file_name(file)}
					</div>
					<div class="file-size  p-2">
						{display_file_size(file)}
					</div>
					<div class="file-size p-2 hover:underline">
						<a
							href={download_files(file)}
							download
							class="text-indigo-600 hover:underline dark:text-indigo-300">Download</a
						>
					</div>
				</div>
			{/each}
		{:else}
			<div class="flex flex-row">
				<div class="file-name p-2">
					{display_file_name(value)}
				</div>
				<div class="file-size  p-2">
					{display_file_size(value)}
				</div>
				<div class="file-size p-2 hover:underline">
					<a
						href={download_files(value)}
						download
						class="text-indigo-600 hover:underline dark:text-indigo-300">Download</a
					>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="h-full min-h-[15rem] flex justify-center items-center">
		<div class="h-5 dark:text-white opacity-50"><File /></div>
	</div>
{/if}
