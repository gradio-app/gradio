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
	<div
		class="file-preview w-full flex flex-row justify-between overflow-y-auto mt-7 dark:text-slate-200"
	>
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
{:else}
	<div class="h-full min-h-[15rem] flex justify-center items-center">
		<div class="h-5 dark:text-white opacity-50"><File /></div>
	</div>
{/if}
