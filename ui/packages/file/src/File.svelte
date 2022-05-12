<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { prettyBytes } from "./utils";
	import { File } from "@gradio/icons";

	export let value: FileData | null;
	export let label: string;
	export let show_label: boolean;
</script>

<BlockLabel {show_label} Icon={File} label={label || "File"} />

{#if value}
	<a
		class="output-file w-full h-full flex flex-row flex-wrap justify-center items-center relative"
		href={value.data}
		download={value.name}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-1/5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		</svg>
		<div class="file-name w-3/5 text-4xl p-6 break-all">{value.name}</div>
		<div class="text-2xl p-2">
			{isNaN(value.size || NaN) ? "" : prettyBytes(value.size || 0)}
		</div>
	</a>
{:else}
	<div class="min-h-[16rem] flex justify-center items-center">
		<div class="h-5 dark:text-white opacity-50"><File /></div>
	</div>
{/if}
