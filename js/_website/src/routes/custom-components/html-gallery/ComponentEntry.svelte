<script lang="ts">
	import BaseHTML from "@gradio/html/base";
	import CopyButton from "$lib/icons/CopyButton.svelte";
	import { highlight } from "$lib/prism";
	import type { HTMLComponentEntry } from "./types";

	export let component: HTMLComponentEntry;

	let show_code = false;
	let initial_props = JSON.parse(JSON.stringify(component.default_props));

	$: highlighted_html = highlight(component.python_code, "python");
</script>

<div class="entry" id={component.id}>
	<div class="entry-header">
		<div class="entry-info">
			<h3 class="entry-name">{component.name}</h3>
			<p class="entry-description">{component.description}</p>
			<div class="entry-meta">
				<span class="author">@{component.author}</span>
				{#each component.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		</div>
		<div class="entry-actions">
			<button
				class="toggle-btn"
				on:click={() => (show_code = !show_code)}
			>
				{show_code ? "Live Demo" : "View Code"}
			</button>
			{#if show_code}
				<CopyButton content={component.python_code} />
			{/if}
		</div>
	</div>

	<div class="entry-body">
		{#if show_code}
			<div class="code-container">
				{@html highlighted_html}
			</div>
		{:else}
			<div class="component-container">
				<BaseHTML
					props={initial_props}
					html_template={component.html_template}
					css_template={component.css_template}
					js_on_load={component.js_on_load}
					apply_default_css={true}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	.entry {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		overflow: hidden;
		background: white;
		transition: box-shadow 0.2s;
	}

	:global(.dark) .entry {
		border-color: #374151;
		background: #1f2937;
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
		border-bottom: 1px solid #f3f4f6;
	}

	:global(.dark) .entry-header {
		border-bottom-color: #374151;
	}

	.entry-info {
		flex: 1;
		min-width: 0;
	}

	.entry-name {
		font-size: 17px;
		font-weight: 700;
		margin: 0 0 4px;
		color: #111827;
	}

	:global(.dark) .entry-name {
		color: #f3f4f6;
	}

	.entry-description {
		font-size: 13px;
		color: #6b7280;
		margin: 0 0 8px;
	}

	:global(.dark) .entry-description {
		color: #9ca3af;
	}

	.entry-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
	}

	.author {
		font-size: 12px;
		color: #9ca3af;
		margin-right: 4px;
	}

	.tag {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 10px;
		background: #f3f4f6;
		color: #6b7280;
	}

	:global(.dark) .tag {
		background: #374151;
		color: #9ca3af;
	}

	.entry-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.toggle-btn {
		font-size: 12px;
		font-weight: 600;
		padding: 6px 14px;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		background: white;
		color: #374151;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}

	:global(.dark) .toggle-btn {
		border-color: #4b5563;
		background: #374151;
		color: #e5e7eb;
	}

	.toggle-btn:hover {
		background: #f9fafb;
		border-color: #f97316;
		color: #f97316;
	}

	:global(.dark) .toggle-btn:hover {
		background: #4b5563;
		border-color: #f97316;
		color: #f97316;
	}

	.entry-body {
		padding: 16px;
		min-height: 120px;
	}

	.component-container {
		min-height: 80px;
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
</style>
