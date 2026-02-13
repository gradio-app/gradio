<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import { onMount, tick } from "svelte";
	import ComponentEntry from "./ComponentEntry.svelte";
	import type { HTMLComponentEntry, ComponentCategory } from "./types";
	import components_data from "$lib/json/html_components.json";

	const components: HTMLComponentEntry[] =
		components_data as HTMLComponentEntry[];

	let search = "";
	let active_category: ComponentCategory = "all";

	const categories: { value: ComponentCategory; label: string }[] = [
		{ value: "all", label: "All" },
		{ value: "input", label: "Input" },
		{ value: "display", label: "Display" },
		{ value: "form", label: "Form" }
	];

	$: filtered = components.filter((c) => {
		const matches_category =
			active_category === "all" || c.category === active_category;
		if (!search.trim()) return matches_category;
		const q = search.toLowerCase();
		const matches_search =
			c.name.toLowerCase().includes(q) ||
			c.description.toLowerCase().includes(q) ||
			c.tags.some((t) => t.toLowerCase().includes(q));
		return matches_category && matches_search;
	});

	onMount(async () => {
		if (!browser) return;
		const id = $page.url.searchParams.get("id");
		if (id) {
			await tick();
			const el = document.getElementById(id);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	});

	let submit_name = "";
	let submit_description = "";
	let submit_category = "input";
	let submit_html = "";
	let submit_css = "";
	let submit_js = "";
	let submit_author = "";
	let form_submitted = false;
</script>

<MetaTags
	title="HTML Components Gallery - Gradio"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Browse and interact with custom HTML components built with gr.HTML. Copy the Python code to use them in your Gradio apps."
/>

<div class="container mx-auto px-4 pt-8 mb-16">
	<div class="text-center mb-8">
		<h1
			class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2"
		>
			HTML Components Gallery
		</h1>
		<p class="text-gray-600 dark:text-gray-400 text-md max-w-xl mx-auto">
			Interactive components built with <code
				class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-sm"
				>gr.HTML</code
			>
			using just HTML, CSS, and JavaScript. Click "View Code" to copy the Python
			class.
		</p>
	</div>

	<div class="max-w-2xl mx-auto mb-6">
		<input
			type="text"
			class="w-full border border-gray-200 dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-200 p-2.5 rounded-lg outline-none text-center text-md focus:placeholder-transparent focus:border-orange-500 focus:ring-0"
			placeholder="Search components..."
			autocomplete="off"
			bind:value={search}
		/>
	</div>

	<div class="flex justify-center gap-2 mb-8">
		{#each categories as cat}
			<button
				class="category-btn"
				class:active={active_category === cat.value}
				on:click={() => (active_category = cat.value)}
			>
				{cat.label}
			</button>
		{/each}
	</div>

	{#if filtered.length === 0}
		<p class="text-center text-gray-500 dark:text-gray-400 py-12">
			No components match your search.
		</p>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{#each filtered as component (component.id)}
				<ComponentEntry {component} />
			{/each}
		</div>
	{/if}

	<div class="submit-section">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
			Submit Your Component
		</h2>
		<p class="text-gray-600 dark:text-gray-400 text-sm mb-6">
			Built a custom HTML component? Share it with the community. Fill out the
			form below and we'll review it for the gallery.
		</p>

		{#if form_submitted}
			<div class="submitted-message">
				<p class="text-lg font-semibold text-green-700 dark:text-green-400">
					Thanks for your submission!
				</p>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
					We'll review your component and add it to the gallery soon.
				</p>
				<button
					class="reset-btn"
					on:click={() => {
						form_submitted = false;
						submit_name = "";
						submit_description = "";
						submit_html = "";
						submit_css = "";
						submit_js = "";
						submit_author = "";
						submit_category = "input";
					}}>Submit another</button
				>
			</div>
		{:else}
			<form
				class="submit-form"
				on:submit|preventDefault={() => {
					form_submitted = true;
				}}
			>
				<div class="form-row">
					<div class="form-group">
						<label for="comp-name">Component Name</label>
						<input
							id="comp-name"
							type="text"
							placeholder="e.g. Star Rating"
							bind:value={submit_name}
							required
						/>
					</div>
					<div class="form-group">
						<label for="comp-author">Your Name</label>
						<input
							id="comp-author"
							type="text"
							placeholder="e.g. @yourname"
							bind:value={submit_author}
							required
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group flex-2">
						<label for="comp-desc">Description</label>
						<input
							id="comp-desc"
							type="text"
							placeholder="A short description of what the component does"
							bind:value={submit_description}
							required
						/>
					</div>
					<div class="form-group">
						<label for="comp-cat">Category</label>
						<select id="comp-cat" bind:value={submit_category}>
							<option value="input">Input</option>
							<option value="display">Display</option>
							<option value="form">Form</option>
						</select>
					</div>
				</div>

				<div class="form-group">
					<label for="comp-html">HTML Template</label>
					<textarea
						id="comp-html"
						rows="5"
						placeholder={'<div class="my-component">\n  <h2>${label}</h2>\n  <p>${value}</p>\n</div>'}
						bind:value={submit_html}
						required
					></textarea>
				</div>

				<div class="form-group">
					<label for="comp-css">CSS Template</label>
					<textarea
						id="comp-css"
						rows="4"
						placeholder={".my-component { padding: 16px; }\nh2 { font-weight: bold; }"}
						bind:value={submit_css}
					></textarea>
				</div>

				<div class="form-group">
					<label for="comp-js"
						>JavaScript <span class="optional">(js_on_load)</span></label
					>
					<textarea
						id="comp-js"
						rows="4"
						placeholder={"element.querySelector('button').addEventListener('click', () => {\n    props.value = 'clicked';\n});"}
						bind:value={submit_js}
					></textarea>
				</div>

				<button type="submit" class="submit-btn"> Submit Component </button>
			</form>
		{/if}
	</div>
</div>

<style>
	.category-btn {
		font-size: 13px;
		font-weight: 600;
		padding: 6px 16px;
		border-radius: 20px;
		border: 1px solid #e5e7eb;
		background: white;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	:global(.dark) .category-btn {
		border-color: #4b5563;
		background: #1f2937;
		color: #9ca3af;
	}

	.category-btn:hover {
		border-color: #f97316;
		color: #f97316;
	}

	.category-btn.active {
		background: #f97316;
		border-color: #f97316;
		color: white;
	}

	.submit-section {
		margin-top: 64px;
		padding-top: 40px;
		border-top: 1px solid #e5e7eb;
		max-width: 640px;
		margin-left: auto;
		margin-right: auto;
	}

	:global(.dark) .submit-section {
		border-top-color: #374151;
	}

	.submit-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-row {
		display: flex;
		gap: 12px;
	}

	@media (max-width: 640px) {
		.form-row {
			flex-direction: column;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
	}

	.form-group.flex-2 {
		flex: 2;
	}

	.form-group label {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
	}

	:global(.dark) .form-group label {
		color: #d1d5db;
	}

	.optional {
		font-weight: 400;
		color: #9ca3af;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 8px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.15s;
		font-family: inherit;
		background: white;
		color: #111827;
	}

	:global(.dark) .form-group input,
	:global(.dark) .form-group select,
	:global(.dark) .form-group textarea {
		border-color: #4b5563;
		background: #1f2937;
		color: #e5e7eb;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		border-color: #f97316;
	}

	.form-group textarea {
		font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
			monospace;
		font-size: 13px;
		resize: vertical;
	}

	.submit-btn {
		padding: 10px 24px;
		background: #f97316;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
		align-self: flex-start;
	}

	.submit-btn:hover {
		background: #ea580c;
	}

	.submitted-message {
		padding: 24px;
		border: 1px solid #bbf7d0;
		border-radius: 12px;
		background: #f0fdf4;
		text-align: center;
	}

	:global(.dark) .submitted-message {
		border-color: #166534;
		background: #052e16;
	}

	.reset-btn {
		margin-top: 12px;
		padding: 6px 16px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}

	:global(.dark) .reset-btn {
		border-color: #4b5563;
		background: #374151;
		color: #e5e7eb;
	}

	.reset-btn:hover {
		border-color: #f97316;
		color: #f97316;
	}
</style>
