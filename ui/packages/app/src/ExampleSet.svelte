<script lang="ts">
	import { input_component_map } from "./components/directory";
	import { _ } from "svelte-i18n";

	interface Component {
		name: string;
		[key: string]: unknown;
	}

	export let examples: Array<Array<unknown>>;
	export let examples_dir: string;
	export let example_id: number | undefined;
	export let setExampleId: Function;
	export let examples_per_page: number;
	export let input_components: Array<Component>;
	export let theme: string;

	let page = 0;
	let gallery = input_components.length === 1;
	let paginate = examples.length > examples_per_page;

	let selected_examples: Array<Array<unknown>>;
	let page_count: number;
	let visible_pages: Array<number> = [];
	$: {
		if (paginate) {
			visible_pages = [];
			selected_examples = examples.slice(
				page * examples_per_page,
				(page + 1) * examples_per_page
			);
			page_count = Math.ceil(examples.length / examples_per_page);
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
			selected_examples = examples.slice();
		}
	}
</script>

<div class="examples" {theme}>
	<h4 class="text-lg font-semibold my-2">{$_("interface.examples")}</h4>
	<div
		class="examples-holder mt-4 inline-block max-w-full"
		class:gallery
		class:overflow-x-auto={!gallery}
	>
		{#if gallery}
			<div class="examples-gallery flex gap-2 flex-wrap">
				{#each selected_examples as example_row, i}
					<button
						class="example cursor-pointer p-2 rounded bg-gray-50 dark:bg-gray-700 transition"
						class:selected={i + page * examples_per_page === example_id}
						on:click={() => setExampleId(i + page * examples_per_page)}
					>
						<svelte:component
							this={input_component_map[input_components[0].name].example}
							{theme}
							value={example_row[0]}
							{examples_dir}
						/>
					</button>
				{/each}
			</div>
		{:else}
			<table
				class="examples-table table-auto p-2 bg-gray-50 dark:bg-gray-600 rounded max-w-full border-collapse"
			>
				<thead class="border-b-2 dark:border-gray-600">
					<tr>
						{#each input_components as input_component}
							<th class="py-2 px-4">
								{input_component.label}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each selected_examples as example_row, i}
						<tr
							class="cursor-pointer transition"
							class:selected={i + page * examples_per_page === example_id}
							on:click={() => setExampleId(i + page * examples_per_page)}
						>
							{#each example_row as example_cell, j}
								<td class="py-2 px-4">
									<svelte:component
										this={input_component_map[input_components[j].name].example}
										{theme}
										value={example_cell}
										{examples_dir}
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
</div>

<style lang="postcss" global>
	.examples[theme="default"] {
		.examples-holder:not(.gallery) {
			@apply shadow;
			.examples-table {
				@apply rounded dark:bg-gray-700;
				thead {
					@apply border-gray-300 dark:border-gray-600;
				}
				tbody tr:hover {
					@apply bg-amber-500 dark:bg-red-700 text-white;
				}
			}
		}
		.examples-holder .examples-gallery {
			.example {
				@apply shadow;
			}
			.example:hover {
				@apply bg-amber-500 text-white;
			}
		}
		.examples-table tr.selected {
			@apply font-semibold;
		}
		.page {
			@apply py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded;
		}
	}
</style>
