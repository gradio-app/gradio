<script lang="ts">
	import { Block, BlockLabel } from "@gradio/atoms";
	import { ModifyUpload } from "@gradio/upload";
	import { tick } from "svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import ImageIcon from "./ImageIcon.svelte";

	export let loading_status: LoadingStatus;
	export let show_label: boolean;
	export let label: string;
	export let value: Array<string> | null = null;
	export let style: string = "";

	let selected_image: number | null = null;

	$: previous =
		((selected_image ?? 0) + (value?.length ?? 0) - 1) % (value?.length ?? 0);
	$: next = ((selected_image ?? 0) + 1) % (value?.length ?? 0);

	function on_keydown(e: KeyboardEvent) {
		switch (e.code) {
			case "Escape":
				e.preventDefault();
				selected_image = null;
				break;
			case "ArrowLeft":
				e.preventDefault();
				selected_image = previous;
				break;
			case "ArrowRight":
				e.preventDefault();
				selected_image = next;
				break;
			default:
				break;
		}
	}

	$: scroll_to_img(selected_image);

	let el: Array<HTMLButtonElement> = [];
	let container: HTMLDivElement;

	async function scroll_to_img(index: number | null) {
		if (typeof index !== "number") return;
		await tick();

		el[index].focus();

		const { left: container_left, width: container_width } =
			container.getBoundingClientRect();
		const { left, width } = el[index].getBoundingClientRect();

		const relative_left = left - container_left;

		const pos =
			relative_left + width / 2 - container_width / 2 + container.scrollLeft;

		container.scrollTo({
			left: pos < 0 ? 0 : pos,
			behavior: "smooth"
		});
	}
</script>

<svelte:window />

<Block variant="solid" color="grey" padding={false}>
	<StatusTracker {...loading_status} />
	<BlockLabel {show_label} Icon={ImageIcon} label={label || "Gallery"} />
	{#if value === null}
		<div class="min-h-[16rem] flex justify-center items-center">
			<ImageIcon />
		</div>
	{:else}
		{#if selected_image !== null}
			<div
				on:keydown={on_keydown}
				class="absolute inset-0 z-10 flex flex-col bg-white/90 dark:bg-gray-900 backdrop-blur min-h-[350px] xl:min-h-[450px] max-h-[55vh]"
			>
				<ModifyUpload on:clear={() => (selected_image = null)} />

				<img
					on:click={() => (selected_image = next)}
					class="w-full object-contain h-[calc(100%-50px)]"
					src={value[selected_image]}
					alt=""
				/>

				<div
					bind:this={container}
					class="absolute h-[50px] bg-white overflow-x-scroll scroll-hide w-full bottom-0 flex gap-1.5 items-center py-2 text-sm px-3"
				>
					{#each value as image, i}
						<button
							bind:this={el[i]}
							on:click={() => (selected_image = i)}
							class="gallery-item !flex-none !h-7 !w-7 transition-all duration-75 {selected_image ===
							i
								? '!ring-2 !ring-orange-500 hover:!ring-orange-500'
								: 'scale-90 transform'}"
						>
							<img
								alt=""
								class="h-full w-full overflow-hidden object-contain"
								src={image}
							/>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<div
			class="overflow-y-auto h-full p-2 min-h-[350px] xl:min-h-[450px] max-h-[55vh]"
		>
			<div class="pt-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
				{#each value as image, i}
					<button class="gallery-item" on:click={() => (selected_image = i)}>
						<img
							alt=""
							class="h-full w-full overflow-hidden object-contain"
							src={image}
						/>
					</button>
				{:else}
					<p>Empty</p>
				{/each}
			</div>
		</div>
	{/if}
</Block>

<style lang="postcss">
	.gallery-item {
		@apply rounded shadow-sm relative aspect-square h-full hover:brightness-110 focus:ring-blue-500 focus:ring-2 ring-1 ring-gray-200 hover:ring hover:ring-orange-300 w-full overflow-hidden bg-gray-100 dark:bg-gray-900 object-fill outline-none;
	}
</style>
