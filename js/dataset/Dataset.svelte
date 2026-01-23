<script lang="ts">
	import type { SvelteComponent, ComponentType } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import { BaseExample } from "@gradio/textbox";
	import type { load_component as load_component_type } from "@gradio/utils";

	interface Props {
		components: string[];
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

	let page = $state(0);
	let current_hover = $state(-1);
	let old_samples_json = $state("");

	let gallery = $derived(
		(components.length < 2 || sample_labels !== null) && layout !== "table"
	);

	let effective_samples = $derived.by(() => {
		if (sample_labels) {
			return sample_labels.map((e) => [e]);
		}
		return samples ?? [];
	});

	// Reset page when samples change
	$effect(() => {
		const current_json = JSON.stringify(effective_samples);
		if (current_json !== old_samples_json) {
			page = 0;
			old_samples_json = current_json;
		}
	});

	let paginate = $derived(effective_samples.length > samples_per_page);

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

	let component_meta: {
		value: any;
		component: ComponentType<SvelteComponent>;
	}[][] = [];

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
								return {
									value: sample_cell,
									component: load_component(components[j], "example")
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

{#await get_component_meta(selected_samples_json) then _}
	{#if gallery}
		<div class="gallery">
			{#each selected_samples as sample_row, i}
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
						{:else if component_meta.length}
							{#await component_meta[0][0].component then component}
								{#key sample_row[0]}
									<svelte:component
										this={component.default}
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
							onclick={() => {
								value = i + page * samples_per_page;
								onclick({ index: value, value: sample_row });
								onselect({
									index: value,
									value: selected_samples[i]
								});
							}}
							onmouseenter={() => handle_mouseenter(i)}
							onmouseleave={() => handle_mouseleave()}
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
						onclick={() => (page = visible_page)}
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
