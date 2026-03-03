<script lang="ts">
	import "$lib/assets/theme.css";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import BaseHTML from "@gradio/html/base";
	import CopyButton from "$lib/icons/CopyButton.svelte";
	import { highlight } from "$lib/prism";
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import { tick, onMount } from "svelte";
	import ComponentEntry from "./ComponentEntry.svelte";
	import type { ManifestEntry, HTMLComponentEntry } from "./types";

	const BASE_URL =
		"https://huggingface.co/datasets/gradio/custom-html-gallery/resolve/main";

	let manifest: ManifestEntry[] = [];
	let component_cache: Record<string, HTMLComponentEntry> = {};
	let loading = true;
	let error = "";

	let search = "";

	$: filtered = manifest.filter((c) => {
		if (!search.trim()) return true;
		const q = search.toLowerCase();
		return (
			c.name.toLowerCase().includes(q) ||
			c.description.toLowerCase().includes(q) ||
			c.tags.some((t) => t.toLowerCase().includes(q))
		);
	});

	async function load_manifest() {
		loading = true;
		error = "";
		try {
			const res = await fetch(`${BASE_URL}/manifest.json`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			manifest = await res.json();
		} catch (e) {
			error = "Failed to load components.";
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function load_component(
		id: string
	): Promise<HTMLComponentEntry | null> {
		if (component_cache[id]) return component_cache[id];
		try {
			const res = await fetch(`${BASE_URL}/components/${id}.json`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: HTMLComponentEntry = await res.json();
			component_cache[id] = data;
			component_cache = component_cache; // trigger reactivity
			return data;
		} catch (e) {
			console.error(`Failed to load component ${id}:`, e);
			return null;
		}
	}

	// Track which components are being loaded to avoid duplicate fetches
	let loading_ids = new Set<string>();

	function request_load(id: string) {
		if (component_cache[id] || loading_ids.has(id)) return;
		loading_ids.add(id);
		load_component(id).finally(() => {
			loading_ids.delete(id);
		});
	}

	// IntersectionObserver for lazy loading
	let observer: IntersectionObserver | null = null;

	function observe_entry(node: HTMLElement, id: string) {
		if (observer) observer.observe(node);
		return {
			destroy() {
				if (observer) observer.unobserve(node);
			}
		};
	}

	if (browser) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const id = (entry.target as HTMLElement).dataset.componentId;
						if (id) {
							request_load(id);
							observer?.unobserve(entry.target);
						}
					}
				}
			},
			{ rootMargin: "200px" }
		);

		onMount(() => {
			return () => {
				observer?.disconnect();
				observer = null;
			};
		});

		load_manifest().then(() => {
			const id = new URLSearchParams(window.location.search).get("id");
			if (id) {
				// Load the specific component immediately, then scroll to it
				load_component(id).then(() => {
					tick().then(() => {
						const el = document.getElementById(id);
						if (el) {
							el.scrollIntoView({
								behavior: "smooth",
								block: "center"
							});
						}
					});
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

	async function open_maximized(comp: HTMLComponentEntry) {
		maximized_component = comp;
		maximized_props = JSON.parse(JSON.stringify(comp.default_props));
		show_maximized_code = false;
		document.body.style.overflow = "hidden";
	}

	async function open_maximized_by_id(id: string) {
		const data = await load_component(id);
		if (data) {
			open_maximized(data);
		}
	}

	function close_maximized() {
		maximized_component = null;
		document.body.style.overflow = "";
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
		<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
			HTML Components Gallery
		</h1>
		<p class="text-gray-600 dark:text-gray-400 text-md max-w-xl mx-auto">
			Interactive components built with <code
				class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-sm"
				>gr.HTML</code
			>
			using just HTML, CSS, and JavaScript. Click "View Code" to copy the Python class.
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
			<button class="retry-btn" on:click={load_manifest}>Retry</button>
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

		{#if filtered.length === 0}
			<p class="text-center text-gray-500 dark:text-gray-400 py-12">
				No components match your search.
			</p>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{#each filtered as entry (entry.id)}
					<div data-component-id={entry.id} use:observe_entry={entry.id}>
						<ComponentEntry
							manifest={entry}
							full_data={component_cache[entry.id] || null}
							on_maximize={open_maximized}
							on_request_load={request_load}
						/>
					</div>
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
						<h2 class="modal-title">
							{maximized_component.name}
						</h2>
						<p class="modal-description">
							{maximized_component.description}
						</p>
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
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M5 5l10 10M15 5L5 15" />
							</svg>
						</button>
					</div>
				</div>
				<div class="modal-body">
					{#if show_maximized_code}
						<p class="modal-code-note">
							This code may be simplified.
							{#if maximized_component.repo_url}
								<a
									href={maximized_component.repo_url}
									target="_blank"
									rel="noopener noreferrer">Visit the repo</a
								> for the full implementation.
							{/if}
						</p>
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

	.modal-component-container :global(.prose),
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

	.modal-code-note {
		font-size: 13px;
		color: var(--body-text-color-subdued, #9ca3af);
		margin: 0 0 12px;
	}

	.modal-code-note a {
		color: var(--color-accent, #f97316);
		text-decoration: none;
	}

	.modal-code-note a:hover {
		text-decoration: underline;
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
