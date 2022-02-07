<script lang="ts">
	import { input_component_map } from "./components/directory";

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

	let selected_examples = examples;
	let gallery = input_components.length === 1;
</script>

<div class="examples" {theme}>
	<h4 class="text-lg font-semibold my-2">Examples</h4>
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
						on:click={() => setExampleId(i)}
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
							class:selected={i === example_id}
							on:click={() => setExampleId(i)}
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
					@apply bg-yellow-500 dark:bg-red-700 text-white;
				}
			}
		}
		.examples-holder .examples-gallery {
			.example {
				@apply shadow;
			}
			.example:hover {
				@apply bg-yellow-500 text-white;
			}
		}
	}
</style>
