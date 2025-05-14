<script lang="ts">
	import { Block } from "@gradio/atoms";
	import type { SvelteComponent, ComponentType } from "svelte";
	import type { Gradio, SelectData } from "@gradio/utils";
	import { BaseExample } from "@gradio/textbox";
	export let components: string[];
	export let component_props: Record<string, any>[];
	export let component_map: Map<
		string,
		Promise<{
			default: ComponentType<SvelteComponent>;
		}>
	>;
	export let label = "Examples";
	export let show_label = true;
	export let headers: string[];
	export let samples: any[][] | null = null;
	let old_samples: any[][] | null = null;
	export let sample_labels: string[] | null = null;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: number | null = null;
	export let root: string;
	export let proxy_url: null | string;
	export let samples_per_page = 10;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio<{
		click: number;
		select: SelectData;
	}>;
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
		if (samples !== old_samples) {
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
		component_meta = await Promise.all(
			selected_samples &&
				selected_samples.map(
					async (sample_row) =>
						await Promise.all(
							sample_row.map(async (sample_cell, j) => {
								return {
									value: sample_cell,
									component: (await component_map.get(components[j]))
										?.default as ComponentType<SvelteComponent>
								};
							})
						)
				)
		);
	}

	$: component_map, get_component_meta(selected_samples);
</script>

<Block
	{visible}
	padding={false}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={false}
	container={false}
>
	{#if show_label}
		<div class="label">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				aria-hidden="true"
				role="img"
				width="1em"
				height="1em"
				preserveAspectRatio="xMidYMid meet"
				viewBox="0 0 32 32"
			>
				<path
					fill="currentColor"
					d="M10 6h18v2H10zm0 18h18v2H10zm0-9h18v2H10zm-6 0h2v2H4zm0-9h2v2H4zm0 18h2v2H4z"
				/>
			</svg>
			{label}
		</div>
	{/if}
	{#if gallery}
		<div class="gallery">
			{#each selected_samples as sample_row, i}
				{#if sample_row[0] != null}
					<button
						class="gallery-item"
						on:click={() => {
							value = i + page * samples_per_page;
							gradio.dispatch("click", value);
							gradio.dispatch("select", { index: value, value: sample_row });
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
						{:else if component_meta.length && component_map.get(components[0])}
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
								gradio.dispatch("click", value);
								gradio.dispatch("select", {
									index: value,
									value: selected_samples[i]
								});
							}}
							on:mouseenter={() => handle_mouseenter(i)}
							on:mouseleave={() => handle_mouseleave()}
						>
							{#each sample_row as { value, component }, j}
								{@const component_name = components[j]}
								{#if component_name !== undefined && component_map.get(component_name) !== undefined}
									<td
										style="max-width: {component_name === 'textbox'
											? '35ch'
											: 'auto'}"
										class={component_name}
									>
										<svelte:component
											this={component}
											{...component_props[j]}
											{value}
											{samples_dir}
											type="table"
											selected={current_hover === i}
											index={i}
											{root}
										/>
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
</Block>

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

	.label {
		display: flex;
		align-items: center;
		margin-bottom: var(--size-2);
		color: var(--block-label-text-color);
		font-weight: var(--block-label-text-weight);
		font-size: var(--block-label-text-size);
		line-height: var(--line-sm);
	}

	svg {
		margin-right: var(--size-1);
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
