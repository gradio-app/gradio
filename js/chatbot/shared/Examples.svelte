<script lang="ts">
	import { Image } from "@gradio/image/shared";
	import { MarkdownCode as Markdown } from "@gradio/markdown-code";
	import { File } from "@gradio/icons";
	import type { ExampleMessage } from "../types";
	import { createEventDispatcher } from "svelte";
	import type { SelectData } from "@gradio/utils";

	export let examples: ExampleMessage[] | null = null;
	export let placeholder: string | null = null;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let root: string;

	const dispatch = createEventDispatcher<{
		example_select: SelectData;
	}>();

	function handle_example_select(i: number, example: ExampleMessage): void {
		dispatch("example_select", {
			index: i,
			value: { text: example.text, files: example.files }
		});
	}
</script>

<div class="placeholder-content">
	{#if placeholder !== null}
		<div class="placeholder">
			<Markdown message={placeholder} {latex_delimiters} {root} />
		</div>
	{/if}
	{#if examples !== null}
		<div class="examples">
			{#each examples as example, i}
				<button
					class="example"
					on:click={() => handle_example_select(i, example)}
				>
					<div class="example-content">
						{#if example.files !== undefined && example.files.length > 0}
							{#if example.files.length > 1}
								<div class="example-images-grid">
									{#each example.files.slice(0, 4) as file, i}
										{#if file.mime_type?.includes("image")}
											<div class="example-image-container">
												<Image
													class="example-image"
													src={file.url}
													alt="example-image"
												/>
												{#if i === 3 && example.files.length > 4}
													<div class="image-overlay">
														+{example.files.length - 4}
													</div>
												{/if}
											</div>
										{/if}
									{/each}
								</div>
							{:else if example.files[0].mime_type?.includes("image")}
								<div class="example-image-container">
									<Image
										class="example-image"
										src={example.files[0].url}
										alt="example-image"
									/>
								</div>
							{:else}
								<div class="example-icon">
									<File />
								</div>
							{/if}
						{:else}
							<div class="example-icon">
								<span class="text-icon-aa">Aa</span>
							</div>
						{/if}

						<div class="example-text-content">
							{#if example.text}
								<span class="example-text">{example.text}</span>
							{:else if example.display_text}
								<span class="example-display-text">{example.display_text}</span>
							{/if}

							{#if example.files?.[0] && !example.files[0].mime_type?.includes("image")}
								<span class="example-file"
									><em>{example.files[0].orig_name}</em></span
								>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.placeholder-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.placeholder {
		align-items: center;
		display: flex;
		justify-content: center;
		height: 100%;
		flex-grow: 1;
	}

	.examples :global(img) {
		pointer-events: none;
	}

	.examples {
		margin: auto;
		padding: var(--spacing-xxl);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--spacing-xl);
		max-width: calc(min(4 * 240px + 5 * var(--spacing-xxl), 100%));
	}

	.example {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--spacing-xxl);
		border: none;
		border-radius: var(--radius-lg);
		background-color: var(--block-background-fill);
		cursor: pointer;
		transition: all 150ms ease-in-out;
		width: 100%;
		gap: var(--spacing-sm);
		border: var(--block-border-width) solid var(--block-border-color);
	}

	.example:hover {
		transform: translateY(-2px);
		background-color: var(--color-accent-soft);
	}

	.example-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		height: 100%;
	}

	.example-text-content {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.example-icon {
		width: var(--size-8);
		height: var(--size-8);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--background-fill-primary);
		border-radius: var(--radius-lg);
		margin-bottom: var(--spacing-lg);
	}

	.example-icon :global(svg) {
		width: var(--size-4);
		height: var(--size-4);
		color: var(--color-text-secondary);
	}

	.text-icon-aa {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-text-secondary);
		line-height: 1;
	}

	.example-text,
	.example-display-text,
	.example-file {
		font-size: var(--text-md);
		width: 100%;
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.example-file {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.example-image-container {
		width: var(--size-8);
		height: var(--size-8);
		border-radius: var(--radius-lg);
		overflow: hidden;
		position: relative;
		margin-bottom: var(--spacing-lg);
	}

	.example-image-container :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.example-images-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
	}

	.example-images-grid .example-image-container {
		margin-bottom: 0;
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		border-radius: var(--radius-lg);
	}
</style>
