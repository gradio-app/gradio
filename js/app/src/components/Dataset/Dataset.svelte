<script lang="ts">
	import { hover } from "@testing-library/user-event/dist/hover";
	import { createEventDispatcher } from "svelte";
	import type { SvelteComponentDev, ComponentType } from "svelte/internal";
	import { component_map } from "./directory";
	import type { SelectData } from "@gradio/utils";

	export let components: Array<keyof typeof component_map>;
	export let label: string = "Examples";
	export let headers: Array<string>;
	export let samples: Array<Array<any>>;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: number | null = null;
	export let root: string;
	export let root_url: null | string;
	export let samples_per_page: number = 10;

	const dispatch = createEventDispatcher<{
		click: number;
		select: SelectData;
	}>();

	let samples_dir: string = root_url
		? "proxy=" + root_url + "/file="
		: root + "/file=";
	let page = 0;
	$: gallery = components.length < 2;
	let paginate = samples.length > samples_per_page;

	let selected_samples: Array<Array<any>>;
	let page_count: number;
	let visible_pages: Array<number> = [];

	let current_hover = -1;

	function handle_mouseenter(i: number) {
		current_hover = i;
	}
	function handle_mouseleave() {
		current_hover = -1;
	}

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

<div id={elem_id} class="wrap {elem_classes.join(' ')}" class:hide={!visible}>
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
	{#if gallery}
		<div class="gallery">
			{#each selected_samples as sample_row, i}
				<button
					class="gallery-item"
					on:click={() => {
						value = i + page * samples_per_page;
						dispatch("click", value);
						dispatch("select", { index: value, value: sample_row });
					}}
					on:mouseenter={() => handle_mouseenter(i)}
					on:mouseleave={() => handle_mouseleave()}
				>
					{#if Object.keys(component_map).includes(components[0]) && component_map[components[0]]}
						<svelte:component
							this={component_meta[0][0].component}
							value={sample_row[0]}
							{samples_dir}
							type="gallery"
							selected={current_hover === i}
							index={i}
						/>
					{/if}
				</button>
			{/each}
		</div>
	{:else}
		<div class="table-wrap">
			<table>
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
								dispatch("click", value);
							}}
							on:mouseenter={() => handle_mouseenter(i)}
							on:mouseleave={() => handle_mouseleave()}
						>
							{#each sample_row as { value, component }, j}
								{#if components[j] !== undefined && component_map[components[j]] !== undefined}
									<td>
										<svelte:component
											this={component}
											{value}
											{samples_dir}
											type="table"
											selected={current_hover === i}
											index={i}
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
</div>

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
