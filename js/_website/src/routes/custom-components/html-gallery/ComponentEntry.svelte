<script lang="ts">
	import BaseHTML from "@gradio/html/base";
	import CopyButton from "$lib/icons/CopyButton.svelte";
	import { highlight } from "$lib/prism";
	import type { ManifestEntry, HTMLComponentEntry } from "./types";

	export let manifest: ManifestEntry;
	export let full_data: HTMLComponentEntry | null = null;
	export let on_maximize: (component: HTMLComponentEntry) => void = () => {};
	export let on_request_load: (id: string) => void = () => {};

	let show_code = false;

	$: component = full_data;
	$: initial_props = component
		? JSON.parse(JSON.stringify(component.default_props))
		: {};
	$: highlighted_html = component
		? highlight(component.python_code, "python")
		: "";

	function handle_maximize() {
		if (component) {
			on_maximize(component);
		} else {
			on_request_load(manifest.id);
		}
	}

	function handle_view_code() {
		if (!component) {
			on_request_load(manifest.id);
		}
		show_code = !show_code;
	}
</script>

<div class="entry" id={manifest.id}>
	<div class="entry-header">
		<div class="entry-info">
			<h3 class="entry-name">{manifest.name}</h3>
			<p class="entry-description">{manifest.description}</p>
			<div class="entry-meta">
				<a
					class="author"
					href="https://huggingface.co/{manifest.author}"
					target="_blank"
					rel="noopener noreferrer">@{manifest.author}</a
				>
				{#if manifest.repo_url}
					<a
						class="repo-link"
						href={manifest.repo_url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{#if manifest.repo_url.includes("github.com")}
							<svg
								width="14"
								height="14"
								viewBox="0 0 16 16"
								fill="currentColor"
								><path
									d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
								/></svg
							>
						{:else}
							<svg
								width="14"
								height="14"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								><path d="M6 2H2v4M14 10v4h-4M2 2l5 5M14 14l-5-5" /></svg
							>
						{/if}
						Repo
					</a>
				{/if}
				{#each manifest.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		</div>
		<div class="entry-actions">
			{#if !show_code}
				<button class="icon-btn" on:click={handle_maximize} title="Expand">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path d="M6 1H1v5M15 10v5h-5M1 1l5.5 5.5M15 15l-5.5-5.5" />
					</svg>
				</button>
			{/if}
			<button class="toggle-btn" on:click={handle_view_code}>
				{show_code ? "Live Demo" : "View Code"}
			</button>
			{#if show_code && component}
				<CopyButton content={component.python_code} />
			{/if}
		</div>
	</div>

	<div class="entry-body">
		{#if show_code}
			{#if component}
				<p class="code-note">
					This code may be simplified.
					{#if manifest.repo_url}
						<a
							href={manifest.repo_url}
							target="_blank"
							rel="noopener noreferrer">Visit the repo</a
						> for the full implementation.
					{/if}
				</p>
				<div class="code-container">
					{@html highlighted_html}
				</div>
			{:else}
				<div class="loading-placeholder">
					<div class="entry-spinner"></div>
					<span>Loading code...</span>
				</div>
			{/if}
		{:else if component}
			<div class="component-container">
				<BaseHTML
					props={initial_props}
					html_template={component.html_template}
					css_template={component.css_template}
					js_on_load={component.js_on_load}
					head={component.head || null}
					apply_default_css={true}
				/>
			</div>
		{:else}
			<div class="loading-placeholder">
				<div class="entry-spinner"></div>
				<span>Loading component...</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.entry {
		border: 1px solid var(--border-color-primary, #e5e7eb);
		border-radius: 12px;
		overflow: hidden;
		background: transparent;
		transition: box-shadow 0.2s;
	}

	.entry:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	}

	:global(.dark) .entry:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	.entry-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 16px 16px 12px;
		border-bottom: 1px solid var(--border-color-primary, #f3f4f6);
	}

	.entry-info {
		flex: 1;
		min-width: 0;
	}

	.entry-name {
		font-size: 17px;
		font-weight: 700;
		margin: 0 0 4px;
		color: var(--body-text-color, #111827);
	}

	.entry-description {
		font-size: 13px;
		color: var(--body-text-color-subdued, #6b7280);
		margin: 0 0 8px;
	}

	.entry-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
	}

	.author {
		font-size: 12px;
		color: var(--body-text-color-subdued, #9ca3af);
		margin-right: 4px;
		text-decoration: none;
	}

	.author:hover {
		color: var(--color-accent, #f97316);
	}

	.repo-link {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 10px;
		background: var(--background-fill-secondary, #f3f4f6);
		color: var(--body-text-color-subdued, #6b7280);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.repo-link:hover {
		color: var(--color-accent, #f97316);
	}

	.tag {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 10px;
		background: var(--background-fill-secondary, #f3f4f6);
		color: var(--body-text-color-subdued, #6b7280);
	}

	.entry-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.icon-btn {
		width: 32px;
		height: 32px;
		border-radius: 6px;
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

	.icon-btn:hover {
		border-color: var(--color-accent, #f97316);
		color: var(--color-accent, #f97316);
	}

	.toggle-btn {
		font-size: 12px;
		font-weight: 600;
		padding: 6px 14px;
		border-radius: 6px;
		border: 1px solid var(--border-color-primary, #e5e7eb);
		background: var(--background-fill-primary, white);
		color: var(--body-text-color, #374151);
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}

	.toggle-btn:hover {
		border-color: var(--color-accent, #f97316);
		color: var(--color-accent, #f97316);
	}

	.entry-body {
		padding: 16px;
		min-height: 120px;
	}

	.component-container {
		min-height: 80px;
		max-height: 280px;
		overflow: auto;
		color: var(--body-text-color);
	}

	.component-container :global(.prose) {
		--tw-prose-body: var(--body-text-color);
		--tw-prose-headings: var(--body-text-color);
		--tw-prose-bold: var(--body-text-color);
		--tw-prose-links: var(--link-text-color);
		color: var(--body-text-color);
	}

	.code-note {
		font-size: 12px;
		color: var(--body-text-color-subdued, #9ca3af);
		margin: 0 0 8px;
	}

	.code-note a {
		color: var(--color-accent, #f97316);
		text-decoration: none;
	}

	.code-note a:hover {
		text-decoration: underline;
	}

	.code-container {
		border-radius: 8px;
		overflow: auto;
		max-height: 400px;
	}

	.code-container :global(pre) {
		margin: 0;
		border-radius: 8px;
		font-size: 13px;
	}

	.loading-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-height: 120px;
		color: var(--body-text-color-subdued, #9ca3af);
		font-size: 13px;
	}

	.entry-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid #e5e7eb;
		border-top-color: #f97316;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	:global(.dark) .entry-spinner {
		border-color: #374151;
		border-top-color: #f97316;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
