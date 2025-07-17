<script lang="ts">
	import { Image } from "@gradio/image/shared";
	import { MarkdownCode as Markdown } from "@gradio/markdown-code";
	import { File, Music, Video } from "@gradio/icons";
	import type { ExampleMessage } from "../types";
	import { createEventDispatcher } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import type { FileData } from "@gradio/client";

	export let examples: ExampleMessage[] | null = null;
	export let placeholder: string | null = null;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];

	const dispatch = createEventDispatcher<{
		example_select: SelectData;
	}>();

	function handle_example_select(
		i: number,
		example: ExampleMessage | string
	): void {
		const example_obj =
			typeof example === "string" ? { text: example } : example;
		dispatch("example_select", {
			index: i,
			value: { text: example_obj.text, files: example_obj.files }
		});
	}
</script>

<div class="placeholder-content" role="complementary">
	{#if placeholder !== null}
		<div class="placeholder">
			<Markdown message={placeholder} {latex_delimiters} />
		</div>
	{/if}
	{#if examples !== null}
		<div class="examples" role="list">
			{#each examples as example, i}
				<button
					class="example"
					on:click={() =>
						handle_example_select(
							i,
							typeof example === "string" ? { text: example } : example
						)}
					aria-label={`Select example ${i + 1}: ${example.display_text || example.text}`}
				>
					<div class="example-content">
						{#if example?.icon?.url}
							<div class="example-image-container">
								<Image
									class="example-image"
									src={example.icon.url}
									alt="Example icon"
								/>
							</div>
						{:else if example?.icon?.mime_type === "text"}
							<div class="example-icon" aria-hidden="true">
								<span class="text-icon-aa">Aa</span>
							</div>
						{:else if example.files !== undefined && example.files.length > 0}
							{#if example.files.length > 1}
								<div
									class="example-icons-grid"
									role="group"
									aria-label="Example attachments"
								>
									{#each example.files.slice(0, 4) as file, i}
										{#if file.mime_type?.includes("image")}
											<div class="example-image-container">
												<Image
													class="example-image"
													src={file.url}
													alt={file.orig_name || `Example image ${i + 1}`}
												/>
												{#if i === 3 && example.files.length > 4}
													<div
														class="image-overlay"
														role="status"
														aria-label={`${example.files.length - 4} more files`}
													>
														+{example.files.length - 4}
													</div>
												{/if}
											</div>
										{:else if file.mime_type?.includes("video")}
											<div class="example-image-container">
												<video
													class="example-image"
													src={file.url}
													aria-hidden="true"
												/>
												{#if i === 3 && example.files.length > 4}
													<div
														class="image-overlay"
														role="status"
														aria-label={`${example.files.length - 4} more files`}
													>
														+{example.files.length - 4}
													</div>
												{/if}
											</div>
										{:else}
											<div
												class="example-icon"
												aria-label={`File: ${file.orig_name}`}
											>
												{#if file.mime_type?.includes("audio")}
													<Music />
												{:else}
													<File />
												{/if}
											</div>
										{/if}
									{/each}
									{#if example.files.length > 4}
										<div class="example-icon">
											<div
												class="file-overlay"
												role="status"
												aria-label={`${example.files.length - 4} more files`}
											>
												+{example.files.length - 4}
											</div>
										</div>
									{/if}
								</div>
							{:else if example.files[0].mime_type?.includes("image")}
								<div class="example-image-container">
									<Image
										class="example-image"
										src={example.files[0].url}
										alt={example.files[0].orig_name || "Example image"}
									/>
								</div>
							{:else if example.files[0].mime_type?.includes("video")}
								<div class="example-image-container">
									<video
										class="example-image"
										src={example.files[0].url}
										aria-hidden="true"
									/>
								</div>
							{:else if example.files[0].mime_type?.includes("audio")}
								<div
									class="example-icon"
									aria-label={`File: ${example.files[0].orig_name}`}
								>
									<Music />
								</div>
							{:else}
								<div
									class="example-icon"
									aria-label={`File: ${example.files[0].orig_name}`}
								>
									<File />
								</div>
							{/if}
						{/if}

						<div class="example-text-content">
							<span class="example-text"
								>{example.display_text || example.text}</span
							>
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
		transform: translateY(0px);
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
		text-align: left;
	}

	.example-text {
		font-size: var(--text-md);
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.example-icons-grid {
		display: flex;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
		width: 100%;
	}

	.example-icon {
		flex-shrink: 0;
		width: var(--size-8);
		height: var(--size-8);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-lg);
		border: var(--block-border-width) solid var(--block-border-color);
		background-color: var(--block-background-fill);
		position: relative;
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

	.file-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		border-radius: var(--radius-lg);
	}
</style>
