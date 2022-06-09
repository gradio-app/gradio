<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { component_map } from "./directory";

	export let components: Array<string>;
	export let headers: Array<string>;
	export let samples: Array<Array<any>>;
	export let elem_id: string = "";
	export let value: Number | null = null;
	export let root: string;
	export let samples_per_page: number = 10;

	export let theme: string;

	const dispatch = createEventDispatcher<{ click: number }>();

	let samples_dir: string = root + "file/";
	let sample_id: number | null = null;
	let page = 0;
	let gallery = headers.length === 1;
	let paginate = samples.length > samples_per_page;

	let selected_samples: Array<Array<unknown>>;
	let page_count: number;
	let visible_pages: Array<number> = [];
	$: {
		if (paginate) {
			visible_pages = [];
			selected_samples = samples.slice(
				page * samples_per_page,
				(page + 1) * samples_per_page
			);
			page_count = Math.ceil(samples.length / samples_per_page);
			[0, page, page_count - 1].forEach((anchor) => {
				for (let i = anchor - 2; i <= anchor + 2; i++) {
					if (i >= 0 && i < page_count && !visible_pages.includes(i)) {
						if (
							visible_pages.length > 0 &&
							i - visible_pages[visible_pages.length - 1] > 1
						) {
							visible_pages.push(-1);
						}
						visible_pages.push(i);
					}
				}
			});
		} else {
			selected_samples = samples.slice();
		}
	}
</script>

<div id={elem_id} class="mt-4 inline-block max-w-full text-gray-700 w-full">
	<div class="text-xs mb-2 flex items-center text-gray-500">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			role="img"
			class="mr-1"
			width="1em"
			height="1em"
			preserveAspectRatio="xMidYMid meet"
			viewBox="0 0 32 32"
			><path
				fill="currentColor"
				d="M10 6h18v2H10zm0 18h18v2H10zm0-9h18v2H10zm-6 0h2v2H4zm0-9h2v2H4zm0 18h2v2H4z"
			/></svg
		>
		Examples
	</div>
	{#if gallery}
		<div class="gr-samples-gallery">
			{#each selected_samples as sample_row, i}
				<button
					class="group rounded-lg"
					on:click={() => {
						value = i;
						dispatch("click", i + page * samples_per_page);
					}}
				>
					<svelte:component
						this={component_map[components[0]]}
						{theme}
						value={sample_row[0]}
						{samples_dir}
					/>
				</button>
			{/each}
		</div>
	{:else}
		<div class="overflow-x-auto border table-auto rounded-lg w-full text-sm">
			<table class="gr-samples-table">
				<thead>
					<tr
						class="border-b dark:border-gray-800 divide-x dark:divide-gray-800 shadow-sm"
					>
						{#each headers as header}
							<th class="p-2 whitespace-nowrap min-w-lg text-left">
								{header}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each selected_samples as sample_row, i}
						<tr
							class="group cursor-pointer odd:bg-gray-50 border-b dark:border-gray-800 divide-x dark:divide-gray-800 last:border-none hover:bg-orange-50 hover:divide-orange-100 dark:hover:bg-gray-700"
							on:click={() => {
								value = i;
								dispatch("click", i + page * samples_per_page);
							}}
						>
							{#each sample_row as sample_cell, j}
								<td class="p-2">
									<svelte:component
										this={component_map[components[j]]}
										{theme}
										value={sample_cell}
										{samples_dir}
									/>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
{#if paginate}
	<div class="flex gap-2 items-center justify-center text-sm">
		Pages:
		{#each visible_pages as visible_page}
			{#if visible_page === -1}
				<div>...</div>
			{:else}
				<button
					class:font-bold={page === visible_page}
					on:click={() => (page = visible_page)}
				>
					{visible_page + 1}
				</button>
			{/if}
		{/each}
	</div>
{/if}
