<script lang="ts">
	import { tick, type SvelteComponent, type ComponentType } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import { BaseExample } from "@gradio/textbox";
	import type {
		load_component as load_component_type,
		LoadingComponent
	} from "@gradio/utils";
	import MountExample from "./MountExample.svelte";

	interface Props {
		components: { name: string; class_id: string }[];
		component_props: Record<string, any>[];
		load_component: load_component_type;
		headers: string[];
		samples: any[][] | null;
		sample_labels?: string[] | null;
		value?: number | null;
		root: string;
		proxy_url: null | string;
		samples_per_page?: number;
		onclick: (data: SelectData) => void;
		onselect: (data: SelectData) => void;
		layout?: "gallery" | "table" | null;
	}

	type DatasetCellMeta = {
		value: any;
		component: LoadingComponent;
		runtime: false | typeof import("svelte");
	};

	let {
		components,
		component_props,
		load_component,
		headers,
		samples,
		sample_labels = null,
		value = $bindable(null),
		root,
		proxy_url,
		samples_per_page = 10,
		onclick,
		onselect,
		layout = null
	}: Props = $props();

	// Although the `samples_dir` prop is not used in any of the core Gradio component, it is kept for backward compatibility
	// with any custom components created with gradio<=4.20.0
	let samples_dir: string = $derived(
		proxy_url ? `/proxy=${proxy_url}file=` : `${root}/file=`
	);

	let current_hover = $state(-1);
	let active_cell: [number, number] = $state([0, 0]);
	let table: HTMLTableElement | undefined = $state();

	let gallery = $derived(
		(components.length < 2 || sample_labels !== null) && layout !== "table"
	);

	let effective_samples = $derived.by(() => {
		if (sample_labels) {
			return sample_labels.map((e) => [e]);
		}
		return samples ?? [];
	});

	// page resets to 0 whenever effective_samples changes,
	// but can still be overwritten by user clicks
	let page = $state(0);
	$effect(() => {
		effective_samples;
		page = 0;
	});

	let paginate = $derived(effective_samples.length > samples_per_page);
	let has_headers = $derived(headers.length > 0);

	let selected_samples = $derived.by(() => {
		if (paginate) {
			return effective_samples.slice(
				page * samples_per_page,
				(page + 1) * samples_per_page
			);
		}
		return effective_samples.slice();
	});

	let page_count = $derived(
		Math.ceil(effective_samples.length / samples_per_page)
	);

	let visible_pages = $derived.by(() => {
		if (!paginate) return [];
		let pages: number[] = [];
		[0, page, page_count - 1].forEach((anchor) => {
			for (let i = anchor - 2; i <= anchor + 2; i++) {
				if (i >= 0 && i < page_count && !pages.includes(i)) {
					if (pages.length > 0 && i - pages[pages.length - 1] > 1) {
						pages.push(-1);
					}
					pages.push(i);
				}
			}
		});
		return pages;
	});

	function handle_mouseenter(i: number): void {
		current_hover = i;
	}

	function handle_mouseleave(): void {
		current_hover = -1;
	}

	function select_sample(i: number, sample_row: DatasetCellMeta[]): void {
		value = i + page * samples_per_page;
		onclick({ index: value, value: sample_row });
		onselect({ index: value, value: selected_samples[i] });
	}

	async function focus_cell(row: number, col: number): Promise<void> {
		active_cell = [row, col];
		await tick();
		table
			?.querySelector<HTMLElement>(`[data-testid="dataset-cell-${row}-${col}"]`)
			?.focus();
	}

	function handle_cell_keydown(
		event: KeyboardEvent,
		row: number,
		col: number,
		sample_row: DatasetCellMeta[]
	): void {
		let next_row = row;
		let next_col = col;
		const last_row = component_meta.length - 1;
		const last_col = (component_meta[row]?.length ?? 1) - 1;

		switch (event.key) {
			case "ArrowUp":
				next_row = Math.max(0, row - 1);
				break;
			case "ArrowDown":
				next_row = Math.min(last_row, row + 1);
				break;
			case "ArrowLeft":
				next_col = Math.max(0, col - 1);
				break;
			case "ArrowRight":
				next_col = Math.min(last_col, col + 1);
				break;
			case "Home":
				if (event.ctrlKey || event.metaKey) next_row = 0;
				next_col = 0;
				break;
			case "End":
				if (event.ctrlKey || event.metaKey) next_row = last_row;
				next_col = (component_meta[next_row]?.length ?? 1) - 1;
				break;
			case "Enter":
			case " ":
			case "Spacebar":
				event.preventDefault();
				select_sample(row, sample_row);
				return;
			default:
				return;
		}

		event.preventDefault();
		next_col = Math.min(next_col, (component_meta[next_row]?.length ?? 1) - 1);
		focus_cell(next_row, next_col);
	}

	let component_meta: DatasetCellMeta[][] = $state([]);
	let keyboard_active = $derived.by((): [number, number] | null => {
		const [row, col] = active_cell;
		if (component_meta[row]?.[col] !== undefined) {
			return active_cell;
		}
		if (component_meta[0]?.[0] !== undefined) {
			return [0, 0];
		}
		return null;
	});

	async function get_component_meta(
		selected_samples_json: string
	): Promise<void> {
		const _selected_samples: any[][] = JSON.parse(selected_samples_json);

		// @ts-ignore
		component_meta = await Promise.all(
			_selected_samples &&
				_selected_samples.map(
					async (sample_row) =>
						await Promise.all(
							sample_row.map(async (sample_cell, j) => {
								const loaded = load_component(
									components[j].name,
									"example",
									components[j].class_id
								);
								return {
									value: sample_cell,
									component: loaded.component,
									runtime: loaded.runtime
								};
							})
						)
				)
		);
	}

	// Need to stringify the samples otherwise get_component_meta will trigger infinitely
	// Saw this when rendering examples in a gr.render block
	let selected_samples_json = $derived(JSON.stringify(selected_samples || []));
</script>

{#await get_component_meta(selected_samples_json)}
	{#if gallery}
		<div class="gallery">
			{#each selected_samples as sample_row, i (i)}
				{#if sample_row[0] != null}
					<button
						class="gallery-item"
						onclick={() => {
							value = i + page * samples_per_page;
							onclick({ index: value, value: sample_row });
							onselect({ index: value, value: sample_row });
						}}
						onmouseenter={() => handle_mouseenter(i)}
						onmouseleave={() => handle_mouseleave()}
					>
						{#if sample_labels}
							<BaseExample
								value={sample_row[0]}
								selected={current_hover === i}
								type="gallery"
							/>
						{:else}
							{sample_row[0]}
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
{:then _}
	{#if gallery}
		<div class="gallery">
			{#each selected_samples as sample_row, i (i)}
				{#if sample_row[0] != null}
					<button
						class="gallery-item"
						onclick={() => {
							value = i + page * samples_per_page;
							onclick({ index: value, value: sample_row });
							onselect({ index: value, value: sample_row });
						}}
						onmouseenter={() => handle_mouseenter(i)}
						onmouseleave={() => handle_mouseleave()}
					>
						{#if sample_labels}
							<BaseExample
								value={sample_row[0]}
								selected={current_hover === i}
								type="gallery"
							/>
						{:else if component_meta.length && component_meta[i]}
							{#await Promise.all( [component_meta[i][0].component, component_meta[i][0].runtime] ) then [component, runtime]}
								{#key sample_row[0]}
									<MountExample
										{component}
										{runtime}
										{...component_props[0]}
										value={sample_row[0]}
										{samples_dir}
										type="gallery"
										selected={current_hover === i}
										index={i}
										{root}
									/>
								{/key}
							{/await}
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	{:else if selected_samples.length > 0}
		<div class="table-wrap">
			<table
				bind:this={table}
				role="grid"
				aria-rowcount={effective_samples.length + Number(has_headers)}
				aria-colcount={components.length}
			>
				{#if has_headers}
					<thead>
						<tr class="tr-head" aria-rowindex="1">
							{#each headers as header, j (header)}
								<th role="columnheader" aria-colindex={j + 1}>
									{header}
								</th>
							{/each}
						</tr>
					</thead>
				{/if}
				<tbody>
					{#each component_meta as sample_row, i (i)}
						<tr
							class="tr-body"
							aria-rowindex={page * samples_per_page +
								i +
								1 +
								Number(has_headers)}
							aria-selected={value === i + page * samples_per_page}
							onclick={() => select_sample(i, sample_row)}
							onmouseenter={() => handle_mouseenter(i)}
							onmouseleave={() => handle_mouseleave()}
						>
							{#each sample_row as { value, component, runtime }, j (j)}
								{@const component_name = components[j]?.name}

								{#if component_name !== undefined}
									<td
										role="gridcell"
										aria-colindex={j + 1}
										tabindex={keyboard_active?.[0] === i &&
										keyboard_active?.[1] === j
											? 0
											: -1}
										data-testid={`dataset-cell-${i}-${j}`}
										onfocus={() => (active_cell = [i, j])}
										onkeydown={(event) =>
											handle_cell_keydown(event, i, j, sample_row)}
										style="max-width: {component_name === 'textbox'
											? '35ch'
											: 'auto'}"
										class={component_name}
									>
										{#await Promise.all( [component, runtime] ) then [component, runtime]}
											<MountExample
												{component}
												{runtime}
												{...component_props[j]}
												{value}
												{samples_dir}
												type="table"
												selected={current_hover === i}
												index={i}
												{root}
											/>
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
			{#each visible_pages as visible_page (visible_page)}
				{#if visible_page === -1}
					<div>...</div>
				{:else}
					<button
						class:current-page={page === visible_page}
						onclick={() => {
							page = visible_page;
							active_cell = [0, 0];
						}}
					>
						{visible_page + 1}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
{/await}

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

	td:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
		background: var(--table-row-focus);
	}

	@media (forced-colors: active) {
		td:focus-visible {
			outline-color: CanvasText;
		}
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
