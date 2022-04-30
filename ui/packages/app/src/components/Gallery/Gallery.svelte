<script lang="ts">
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Component as StatusTracker } from "../StatusTracker/";
	import image_icon from "./image.svg";

	export let loading_status: "complete" | "pending" | "error";
	export let show_label: boolean;
	export let label: string;
	export let value: Array<string> | null = null;
	export let style: string = "";

	let page = 0;
	let focus_img: number | null = null;
</script>

<Block variant="solid" color="grey" padding={false}>
	<StatusTracker tracked_status={loading_status} />
	<BlockLabel {show_label} image={image_icon} label={label || "Gallery"} />
	{#if value === null}
		<div class="min-h-[16rem] flex justify-center items-center">
			<img src={image_icon} alt="" class="h-6 opacity-20" />
		</div>
	{:else}
		<div class="p-4 relative h-[16rem]">
			{#if focus_img !== null}
				<div
					class="absolute w-full h-full z-10 bg-black bg-opacity-10 flex justify-center items-center"
					on:click={() => {
						focus_img = null;
					}}
				>
					<img
						class="h-3/4 object-contain border-gray-300 border-8"
						src={value[focus_img]}
						alt=""
					/>
				</div>
			{/if}
			<div class="flex flex-wrap gap-3 max-h-full overflow-auto">
				{#each value as img_data, i}
					<img
						class="h-32 object-contain border-gray-300 border-8 cursor-pointer"
						src={img_data}
						{style}
						on:click={() => {
							focus_img = i;
						}}
						alt=""
					/>
				{/each}
			</div>
		</div>
	{/if}
</Block>
