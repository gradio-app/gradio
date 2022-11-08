<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SvelteComponentDev, ComponentType } from "svelte/internal";
	import { component_map } from "./directory";

	export let components: Array<keyof typeof component_map>;
	export let label: string = "Examples";
	export let headers: Array<string>;
	export let samples: Array<Array<any>>;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: number | null = null;
	export let root: string;
	export let root_url: null | string;
	export let samples_per_page: number = 10;

	const dispatch = createEventDispatcher<{ click: number }>();

	let samples_dir: string = (root_url ?? root) + "file=";
	let page = 0;
	let gallery = headers.length === 1;
	let paginate = samples.length > samples_per_page;

	let selected_samples: Array<Array<any>>;
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

	$: component_meta = selected_samples.map((sample_row) =>
		sample_row.map((sample_cell, j) => ({
			value: sample_cell,
			component: component_map[
				components[j]
			] as ComponentType<SvelteComponentDev>
		}))
	);
</script>

<div
	id={elem_id}
	class="mt-4 inline-block max-w-full text-gray-700 w-full"
	class:!hidden={!visible}
>
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
		{label}
	</div>
	{#if gallery}
		<div class="gr-samples-gallery">
			{#each selected_samples as sample_row, i}
				<!-- {@const x = component_map[]} -->

				<button
					class="group rounded-lg"
					on:click={() => {
						value = i + page * samples_per_page;
						dispatch("click", value);
					}}
				>
					{#if Object.keys(component_map).includes(components[0]) && component_map[components[0]]}
						<svelte:component
							this={component_meta[0][0].component}
							value={sample_row[0]}
							{samples_dir}
						/>
					{/if}
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
					{#each component_meta as sample_row, i}
						<tr
							class="group cursor-pointer odd:bg-gray-50 border-b dark:border-gray-800 divide-x dark:divide-gray-800 last:border-none hover:bg-orange-50 hover:divide-orange-100 dark:hover:bg-gray-700"
							on:click={() => {
								value = i + page * samples_per_page;
								dispatch("click", value);
							}}
						>
							{#each sample_row as { value, component }, j}
								{#if components[j] !== undefined && component_map[components[j]] !== undefined}
									<td class="p-2">
										<svelte:component this={component} {value} {samples_dir} />
									</td>
								{/if}
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
