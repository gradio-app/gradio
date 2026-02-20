<script lang="ts">
	import "$lib/assets/theme.css";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import BaseHTML from "@gradio/html/base";
	import CopyButton from "$lib/icons/CopyButton.svelte";
	import { highlight } from "$lib/prism";
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import { tick } from "svelte";
	import ComponentEntry from "./ComponentEntry.svelte";
	import type { HTMLComponentEntry, ComponentCategory } from "./types";

	let components: HTMLComponentEntry[] = [];
	let loading = true;
	let error = "";

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

	async function load_components() {
		loading = true;
		error = "";
		try {
			const res = await fetch(
				"https://huggingface.co/datasets/gradio/custom-html-gallery/resolve/main/components.json"
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			components = await res.json();
		} catch (e) {
			error = "Failed to load components.";
			console.error(e);
		} finally {
			loading = false;
		}
	}

	if (browser) {
		load_components().then(() => {
			const id = new URLSearchParams(window.location.search).get("id");
			if (id) {
				tick().then(() => {
					const el = document.getElementById(id);
					if (el) {
						el.scrollIntoView({ behavior: "smooth", block: "center" });
					}
				});
			}
		});
	}

	let maximized_component: HTMLComponentEntry | null = null;
	let maximized_props: Record<string, any> = {};
	let show_maximized_code = false;
	$: maximized_highlighted = maximized_component
		? highlight(maximized_component.python_code, "python")
		: "";

	function open_maximized(comp: HTMLComponentEntry) {
		maximized_component = comp;
		maximized_props = JSON.parse(JSON.stringify(comp.default_props));
		show_maximized_code = false;
		document.body.style.overflow = "hidden";
	}

	function close_maximized() {
		maximized_component = null;
		document.body.style.overflow = "";
	}

	let submit_name = "";
	let submit_description = "";
	let submit_category = "input";
	let submit_html = "";
	let submit_css = "";
	let submit_js = "";
	let submit_author = "";
	let form_submitted = false;

	function slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
	}

	function submit_component() {
		const component_json = JSON.stringify(
			{
				id: slugify(submit_name),
				name: submit_name,
				description: submit_description,
				author: submit_author,
				category: submit_category,
				html_template: submit_html,
				css_template: submit_css,
				js_on_load: submit_js
			},
			null,
			2
		);

		const title = encodeURIComponent(`New Component: ${submit_name}`);
		const body = encodeURIComponent(
			`## Component Submission\n\n\`\`\`json\n${component_json}\n\`\`\``
		);
		window.open(
			`https://huggingface.co/datasets/gradio/custom-html-gallery/discussions/new?title=${title}&description=${body}`,
			"_blank"
		);
		form_submitted = true;
	}
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

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading components...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="error-text">{error}</p>
			<button class="retry-btn" on:click={load_components}>Retry</button>
		</div>
	{:else}
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
					<ComponentEntry {component} on_maximize={open_maximized} />
				{/each}
			</div>
		{/if}
	{/if}

{#if maximized_component}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-backdrop" on:click={close_maximized}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<div class="modal-info">
					<h2 class="modal-title">{maximized_component.name}</h2>
					<p class="modal-description">{maximized_component.description}</p>
				</div>
				<div class="modal-actions">
					<button
						class="modal-toggle-btn"
						on:click={() => (show_maximized_code = !show_maximized_code)}
					>
						{show_maximized_code ? "Live Demo" : "View Code"}
					</button>
					{#if show_maximized_code}
						<CopyButton content={maximized_component.python_code} />
					{/if}
					<button class="modal-close-btn" on:click={close_maximized}>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 5l10 10M15 5L5 15" />
						</svg>
					</button>
				</div>
			</div>
			<div class="modal-body">
				{#if show_maximized_code}
					<div class="modal-code-container">
						{@html maximized_highlighted}
					</div>
				{:else}
					<div class="modal-component-container">
						<BaseHTML
							props={maximized_props}
							html_template={maximized_component.html_template}
							css_template={maximized_component.css_template}
							js_on_load={maximized_component.js_on_load}
							head={maximized_component.head || null}
							apply_default_css={true}
						/>
					</div>
				{/if}
			</div>
		</div>
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
					A discussion has been opened on HuggingFace for review. We'll add your component to the gallery soon.
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
				on:submit|preventDefault={submit_component}
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
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 48px 0;
		color: #6b7280;
	}

	:global(.dark) .loading-state {
		color: #9ca3af;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e5e7eb;
		border-top-color: #f97316;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	:global(.dark) .spinner {
		border-color: #374151;
		border-top-color: #f97316;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state {
		text-align: center;
		padding: 48px 0;
	}

	.error-text {
		color: #ef4444;
		margin-bottom: 12px;
	}

	.retry-btn {
		padding: 8px 20px;
		background: #f97316;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}

	.retry-btn:hover {
		background: #ea580c;
	}

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

	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: var(--background-fill-primary, white);
		border: 1px solid var(--border-color-primary, #e5e7eb);
		border-radius: 16px;
		width: 100%;
		max-width: 1100px;
		max-height: calc(100vh - 48px);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 20px 24px;
		border-bottom: 1px solid var(--border-color-primary, #e5e7eb);
		flex-shrink: 0;
	}

	.modal-info {
		flex: 1;
		min-width: 0;
	}

	.modal-title {
		font-size: 20px;
		font-weight: 700;
		margin: 0 0 4px;
		color: var(--body-text-color, #111827);
	}

	.modal-description {
		font-size: 14px;
		color: var(--body-text-color-subdued, #6b7280);
		margin: 0;
	}

	.modal-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		margin-left: 16px;
	}

	.modal-toggle-btn {
		font-size: 13px;
		font-weight: 600;
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border-color-primary, #e5e7eb);
		background: var(--background-fill-primary, white);
		color: var(--body-text-color, #374151);
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}

	.modal-toggle-btn:hover {
		border-color: var(--color-accent, #f97316);
		color: var(--color-accent, #f97316);
	}

	.modal-close-btn {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid var(--border-color-primary, #e5e7eb);
		background: var(--background-fill-primary, white);
		color: var(--body-text-color-subdued, #6b7280);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: all 0.15s;
	}

	.modal-close-btn:hover {
		border-color: #ef4444;
		color: #ef4444;
	}

	.modal-body {
		flex: 1;
		overflow: auto;
		padding: 24px;
	}

	.modal-component-container {
		min-height: 300px;
		color: var(--body-text-color);
		width: 100%;
	}

	.modal-component-container :global(.prose) ,
	.modal-component-container :global(.prose > div) {
		max-width: 100% !important;
		width: 100% !important;
	}

	.modal-component-container :global(.prose) {
		--tw-prose-body: var(--body-text-color);
		--tw-prose-headings: var(--body-text-color);
		--tw-prose-bold: var(--body-text-color);
		--tw-prose-links: var(--link-text-color);
		color: var(--body-text-color);
	}

	.modal-code-container {
		border-radius: 8px;
		overflow: auto;
	}

	.modal-code-container :global(pre) {
		margin: 0;
		border-radius: 8px;
		font-size: 13px;
	}
</style>
