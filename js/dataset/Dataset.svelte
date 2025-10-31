<script lang="ts">
	import { Block } from "@gradio/atoms";
	import type { SvelteComponent, ComponentType } from "svelte";
	import type { Gradio, SelectData } from "@gradio/utils";
	import { BaseExample } from "@gradio/textbox";
	import type { load_component as load_component_type } from "@gradio/utils";

	export let components: string[];
	export let component_props: Record<string, any>[];
	let component_map: Map<
		string,
		Promise<{
			default: ComponentType<SvelteComponent>;
		}>
	> = new Map();
	export let load_component: load_component_type;
	export let headers: string[];
	export let samples: any[][] | null = null;
	let old_samples: any[][] | null = null;
	export let sample_labels: string[] | null = null;
	export let value: number | null = null;
	export let root: string;
	export let proxy_url: null | string;
	export let samples_per_page = 10;
	export let onclick: (data: SelectData) => void;
	export let onselect: (data: SelectData) => void;

	export let layout: "gallery" | "table" | null = null;

	// Although the `samples_dir` prop is not used in any of the core Gradio component, it is kept for backward compatibility
	// with any custom components created with gradio<=4.20.0
	let samples_dir: string = proxy_url
		? `/proxy=${proxy_url}file=`
		: `${root}/file=`;
	let page = 0;

	$: gallery =
		(components.length < 2 || sample_labels !== null) && layout !== "table";
	let paginate = samples ? samples.length > samples_per_page : false;

	let selected_samples: any[][];
	let page_count: number;
	let visible_pages: number[] = [];

	let current_hover = -1;

	function handle_mouseenter(i: number): void {
		current_hover = i;
	}

	function handle_mouseleave(): void {
		current_hover = -1;
	}

	$: {
		if (sample_labels) {
			samples = sample_labels.map((e) => [e]);
		} else if (!samples) {
			samples = [];
		}
		if (JSON.stringify(samples) !== JSON.stringify(old_samples)) {
			page = 0;
			old_samples = samples;
		}
		paginate = samples.length > samples_per_page;
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

	let component_meta: {
		value: any;
		component: ComponentType<SvelteComponent>;
	}[][] = [];

	async function get_component_meta(selected_samples: any[][]): Promise<void> {
		console.log("+++++++++++++++++++++++++++++++++++++");
		console.log(
			"Getting component meta for samples:",
			selected_samples,
			components
		);
		component_meta = await Promise.all(
			selected_samples &&
				selected_samples.map(
					async (sample_row) =>
						await Promise.all(
							sample_row.map(async (sample_cell, j) => {
								console.log("Loading component:", components[j]);
								return {
									value: sample_cell,
									component: load_component(components[j], "example")
								};
							})
						)
				)
		);
	}

	$: get_component_meta(selected_samples);
	$: console.log("Component meta:", component_meta, component_map);
</script>

{#if gallery}
	<div class="gallery">
		{#each selected_samples as sample_row, i}
			{#if sample_row[0] != null}
				<button
					class="gallery-item"
					on:click={() => {
						value = i + page * samples_per_page;
						onclick({ index: value, value: sample_row });
						onselect({ index: value, value: sample_row });
					}}
					on:mouseenter={() => handle_mouseenter(i)}
					on:mouseleave={() => handle_mouseleave()}
				>
					{#if sample_labels}
						<BaseExample
							value={sample_row[0]}
							selected={current_hover === i}
							type="gallery"
						/>
					{:else if component_meta.length}
						{#await component_meta[0][0].component then component}
							<svelte:component
								this={component}
								{...component_props[0]}
								value={sample_row[0]}
								{samples_dir}
								type="gallery"
								selected={current_hover === i}
								index={i}
								{root}
							/>
						{:catch error}
							<div>Error loading component: {error.message}</div>
						{/await}
						<svelte:component
							this={component_meta[0][0].component}
							{...component_props[0]}
							value={sample_row[0]}
							{samples_dir}
							type="gallery"
							selected={current_hover === i}
							index={i}
							{root}
						/>
					{/if}
				</button>
			{/if}
		{/each}
	</div>
{:else if selected_samples.length > 0}
	<div class="table-wrap">
		<table tabindex="0" role="grid">
			<thead>
				<tr class="tr-head">
					{#each headers as header}
						<th>
							{header}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each component_meta as sample_row, i}
					<tr
						class="tr-body"
						on:click={() => {
							value = i + page * samples_per_page;
							onclick({ index: value, value: sample_row });
							onselect({
								index: value,
								value: selected_samples[i]
							});
						}}
						on:mouseenter={() => handle_mouseenter(i)}
						on:mouseleave={() => handle_mouseleave()}
					>
						{#each sample_row as { value, component }, j}
							{@const component_name = components[j]}

							{#if component_name !== undefined}
								<td
									style="max-width: {component_name === 'textbox'
										? '35ch'
										: 'auto'}"
									class={component_name}
								>
									{#await component then component}
										<svelte:component
											this={component.default}
											{...component_props[j]}
											{value}
											{samples_dir}
											type="table"
											selected={current_hover === i}
											index={i}
											{root}
										/>
									{:catch error}
										<div>Error loading component: {error.message}</div>
									{/await}
								</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
{#if paginate}
	<div class="paginate">
		Pages:
		{#each visible_pages as visible_page}
			{#if visible_page === -1}
				<div>...</div>
			{:else}
				<button
					class:current-page={page === visible_page}
					on:click={() => (page = visible_page)}
				>
					{visible_page + 1}
				</button>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.wrap {
		display: inline-block;
		width: var(--size-full);
		max-width: var(--size-full);
		color: var(--body-text-color);
	}

	.hide {
		display: none;
	}

	.gallery {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-lg);
	}

	.gallery-item {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--button-large-radius);
		overflow: hidden;
	}

	.gallery-item:hover {
		border-color: var(--border-color-accent);
		background: var(--table-row-focus);
	}

	.table-wrap {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		width: var(--size-full);
		table-layout: auto;
		overflow-x: auto;
		line-height: var(--line-sm);
		color: var(--table-text-color);
	}
	table {
		width: var(--size-full);
	}

	.tr-head {
		box-shadow: var(--shadow-drop-lg);
		border-bottom: 1px solid var(--border-color-primary);
	}

	.tr-head > * + * {
		border-right-width: 0px;
		border-left-width: 1px;
		border-color: var(--border-color-primary);
	}

	th {
		padding: var(--size-2);
		white-space: nowrap;
	}

	.tr-body {
		cursor: pointer;
		border-bottom: 1px solid var(--border-color-primary);
		background: var(--table-even-background-fill);
	}

	.tr-body:last-child {
		border: none;
	}

	.tr-body:nth-child(odd) {
		background: var(--table-odd-background-fill);
	}

	.tr-body:hover {
		background: var(--table-row-focus);
	}

	.tr-body > * + * {
		border-right-width: 0px;
		border-left-width: 1px;
		border-color: var(--border-color-primary);
	}

	.tr-body:hover > * + * {
		border-color: var(--border-color-accent);
	}

	td {
		padding: var(--size-2);
		text-align: center;
	}

	.paginate {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-sm);
		margin-top: var(--size-2);
		color: var(--block-label-text-color);
		font-size: var(--text-sm);
	}

	button.current-page {
		font-weight: var(--weight-bold);
	}
</style>
