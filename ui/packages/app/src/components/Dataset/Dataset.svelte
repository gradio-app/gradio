<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { component_map } from "./directory";

	export let components: Array<string>;
	export let headers: Array<string>;
	export let samples: Array<Array<any>>;
	export let value: Number | null = null;
	export let root: string;
	export let samples_per_page: number = 10;

	export let theme: string;
	export let style: string = "";

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

<div
	class="samples-holder mt-4 inline-block max-w-full"
	class:gallery
	class:overflow-x-auto={!gallery}
>
	{#if gallery}
		<div class="samples-gallery flex gap-2 flex-wrap">
			{#each selected_samples as sample_row, i}
				<button
					class="sample cursor-pointer p-2 rounded bg-gray-50 dark:bg-gray-700 transition"
					class:selected={i + page * samples_per_page === sample_id}
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
		<table
			class="samples-table table-auto p-2 bg-gray-50 dark:bg-gray-600 rounded max-w-full border-collapse"
		>
			<thead class="border-b-2 dark:border-gray-600">
				<tr>
					{#each headers as header}
						<th class="py-2 px-4">
							{header}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each selected_samples as sample_row, i}
					<tr
						class="cursor-pointer transition"
						class:selected={i + page * samples_per_page === sample_id}
						on:click={() => {
							value = i;
							dispatch("click", i + page * samples_per_page);
						}}
					>
						{#each sample_row as sample_cell, j}
							<td class="py-2 px-4">
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
	{/if}
</div>
{#if paginate}
	<div class="flex gap-2 items-center mt-4">
		Pages:
		{#each visible_pages as visible_page}
			{#if visible_page === -1}
				<div>...</div>
			{:else}
				<button
					class="page"
					class:font-bold={page === visible_page}
					on:click={() => (page = visible_page)}
				>
					{visible_page + 1}
				</button>
			{/if}
		{/each}
	</div>
{/if}

<style lang="postcss" global>
	.samples-holder:not(.gallery) {
		@apply shadow;
		.samples-table {
			@apply rounded dark:bg-gray-700;
			thead {
				@apply border-gray-300 dark:border-gray-600;
			}
			tbody tr:hover {
				@apply bg-amber-500 dark:bg-red-700 text-white;
			}
		}
	}
	.samples-holder .samples-gallery {
		.sample {
			@apply shadow;
		}
		.sample:hover {
			@apply bg-amber-500 text-white;
		}
	}
	.samples-table tr.selected {
		@apply font-semibold;
	}
	.page {
		@apply py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded;
	}
</style>
