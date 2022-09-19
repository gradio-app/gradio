<script lang="ts">
	import { Block, BlockLabel } from "@gradio/atoms";
	import { ModifyUpload } from "@gradio/upload";
	import { tick } from "svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { Styles } from "@gradio/utils";
	import { get_styles } from "@gradio/utils";
	import { Image } from "@gradio/icons";
	import { _ } from "svelte-i18n";

	export let loading_status: LoadingStatus;
	export let show_label: boolean;
	export let label: string;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: Array<string | [string, string]> | null = null;
	export let style: Styles = {};

	$: _value =
		value === null
			? null
			: value.map((img) => (Array.isArray(img) ? img : [img, null]));

	let selected_image: number | null = null;

	$: previous =
		((selected_image ?? 0) + (_value?.length ?? 0) - 1) % (_value?.length ?? 0);
	$: next = ((selected_image ?? 0) + 1) % (_value?.length ?? 0);

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

	$: can_zoom = window_height >= height;

	$: ({ classes } = get_styles(style, ["grid"]));

	let height = 0;
	let window_height = 0;
</script>

<svelte:window bind:innerHeight={window_height} />

<Block
	{visible}
	variant="solid"
	color="grey"
	padding={false}
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />
	{#if show_label}
		<BlockLabel
			{show_label}
			Icon={Image}
			label={label || "Gallery"}
			disable={typeof style.container === "boolean" && !style.container}
		/>
	{/if}
	{#if _value === null}
		<div class="h-full min-h-[15rem] flex justify-center items-center">
			<div class="h-5 dark:text-white opacity-50"><Image /></div>
		</div>
	{:else}
		{#if selected_image !== null}
			<div
				on:keydown={on_keydown}
				class="absolute group inset-0 z-20 flex flex-col bg-white/90 dark:bg-gray-900 backdrop-blur h-full"
				class:min-h-[350px]={style.height !== "auto"}
				class:max-h-[55vh]={style.height !== "auto"}
				class:xl:min-h-[450px]={style.height !== "auto"}
			>
				<ModifyUpload on:clear={() => (selected_image = null)} />

				<img
					on:click={() => (selected_image = next)}
					class="w-full object-contain h-[calc(100%-50px)]"
					src={_value[selected_image][0]}
					alt=""
				/>
				{#if _value[selected_image][1]}
					<div class="bottom-[70px] absolute z-40 flex justify-center w-full">
						<div
							class="bg-gray-100 dark:bg-gray-600 font-semibold p-2 rounded group-hover:opacity-70 transition-opacity"
						>
							{_value[selected_image][1]}
						</div>
					</div>
				{/if}
				<div
					bind:this={container}
					class="absolute h-[60px] bg-white dark:bg-gray-900 overflow-x-scroll scroll-hide w-full bottom-0 flex gap-1.5 items-center py-2 text-sm px-3 justify-center"
				>
					{#each _value as image, i}
						<button
							bind:this={el[i]}
							on:click={() => (selected_image = i)}
							class="gallery-item !flex-none !h-9 !w-9 transition-all duration-75 {selected_image ===
							i
								? '!ring-2 !ring-orange-500 hover:!ring-orange-500'
								: 'scale-90 transform'}"
						>
							<img
								alt=""
								class="h-full w-full overflow-hidden object-contain"
								src={image[0]}
							/>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<div
			bind:clientHeight={height}
			class="overflow-y-auto h-full p-2"
			class:min-h-[350px]={style.height !== "auto"}
			class:max-h-[55vh]={style.height !== "auto"}
			class:xl:min-h-[450px]={style.height !== "auto"}
		>
			{#if _value.length === 0}
				<div class="h-full min-h-[15rem] flex justify-center items-center">
					<div class="h-5 dark:text-white opacity-50"><Image /></div>
				</div>
			{:else}
				<div class="grid gap-2 {classes}" class:pt-6={show_label}>
					{#each _value as [image, caption], i}
						<button
							class="gallery-item"
							on:click={() => (selected_image = can_zoom ? i : selected_image)}
						>
							<img
								alt=""
								class="h-full w-full overflow-hidden object-contain"
								src={image}
							/>
							{#if caption}
								<div class="bottom-6 absolute z-10 flex justify-center w-full">
									<div
										class="bg-gray-100 dark:bg-gray-600 font-semibold p-2 rounded group-hover:opacity-70 transition-opacity"
									>
										{caption}
									</div>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Block>

<style lang="postcss">
	.gallery-item {
		@apply rounded shadow-sm relative aspect-square h-full hover:brightness-110 focus:ring-blue-500 focus:ring-2 ring-1 ring-gray-200 hover:ring hover:ring-orange-300 w-full overflow-hidden bg-gray-100 dark:bg-gray-900 object-fill outline-none;
	}
</style>
