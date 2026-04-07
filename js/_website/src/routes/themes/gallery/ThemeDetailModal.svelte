<script lang="ts">
	import type { ThemeData } from "./types";
	import { clickOutside, is_color_dark } from "./utils";

	export let theme: ThemeData;
	export let on_close: () => void;

	let link_copied = false;
	let code_copied = false;

	$: usage_code = theme.is_official
		? `import gradio as gr

with gr.Blocks(theme=gr.themes.${theme.name}()) as demo:
    ...`
		: `import gradio as gr

with gr.Blocks(theme=gr.Theme.from_hub("${theme.id}")) as demo:
    ...`;

	$: has_preview = !theme.is_official && theme.subdomain;

	function copy_link() {
		const url = new URL(window.location.href);
		url.searchParams.set("id", theme.id);
		navigator.clipboard.writeText(url.toString()).then(() => {
			link_copied = true;
			setTimeout(() => {
				link_copied = false;
			}, 1500);
		});
	}

	function copy_code() {
		navigator.clipboard.writeText(usage_code).then(() => {
			code_copied = true;
			setTimeout(() => {
				code_copied = false;
			}, 1500);
		});
	}
</script>

<svelte:window on:keydown={(e) => e.key === "Escape" && on_close()} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
	on:click={on_close}
></div>

<div
	class="details-panel border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl bg-white dark:bg-neutral-900 flex flex-col overflow-auto"
	class:has-preview={has_preview}
	use:clickOutside={on_close}
>
	<div
		class="flex justify-between items-start p-5 pb-4 border-b border-gray-100 dark:border-neutral-800 shrink-0"
	>
		<div>
			<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
				{theme.name}
			</h2>
			<p class="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
				by @{theme.author}
				{#if theme.is_official}
					<span
						class="ml-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-md text-xs font-medium"
					>
						Official
					</span>
				{/if}
			</p>
		</div>
		<div class="flex gap-2">
			{#if !link_copied}
				<button
					on:click={copy_link}
					class="rounded-md px-3 py-1.5 text-xs font-semibold text-white bg-orange-400 hover:bg-orange-500 transition-colors"
				>
					Share
				</button>
			{:else}
				<span
					class="rounded-md px-3 py-1.5 text-xs font-semibold text-white bg-green-500"
				>
					Copied!
				</span>
			{/if}
			<button
				on:click={on_close}
				class="rounded-md p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
				aria-label="Close"
			>
				<svg
					class="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	</div>

	<div class="bento-body p-5 overflow-auto" class:has-preview={has_preview}>
		{#if has_preview}
			<div class="bento-preview">
				<div
					class="preview-wrapper rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full h-full"
				>
					<iframe
						src={theme.subdomain}
						title="{theme.name} preview"
						class="preview-iframe border-0 origin-top-left"
						loading="lazy"
					></iframe>
				</div>
			</div>
		{/if}

		<div class="bento-details flex flex-col gap-4">
			<div>
				<h3
					class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide"
				>
					Colors
				</h3>
				<div class="flex gap-2">
					{#each [{ label: "Primary", color: theme.colors.primary }, { label: "Accent", color: theme.colors.secondary }, { label: "Neutral", color: theme.colors.neutral }, { label: "Background", color: theme.colors.background }, { label: "Background Dark", color: theme.colors.background_dark }] as { label, color }}
						<div class="flex-1 flex flex-col">
							<div
								class="h-10 rounded-md border border-gray-200 dark:border-gray-700 flex items-end justify-start p-1"
								style="background-color: {color};"
							>
								<span
									class="text-[9px] font-mono px-1 rounded"
									style="color: {is_color_dark(color)
										? '#fff'
										: '#000'}; background: {is_color_dark(color)
										? 'rgba(0,0,0,0.2)'
										: 'rgba(255,255,255,0.7)'};"
								>
									{color}
								</span>
							</div>
							<span
								class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-center"
								>{label}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div
					class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
				>
					<span
						class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide"
						>Main Font</span
					>
					<p
						class="text-base mt-0.5 text-gray-900 dark:text-gray-100"
						style="font-family: '{theme.fonts.main}', sans-serif;"
					>
						{theme.fonts.main}
					</p>
				</div>
				<div
					class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
				>
					<span
						class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide"
						>Mono Font</span
					>
					<p
						class="text-base mt-0.5 text-gray-900 dark:text-gray-100"
						style="font-family: '{theme.fonts.mono}', monospace;"
					>
						{theme.fonts.mono}
					</p>
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between mb-2">
					<h3
						class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
					>
						Usage
					</h3>
					<button
						on:click={copy_code}
						class="text-[10px] px-2 py-0.5 rounded transition-colors {code_copied
							? 'bg-green-500 text-white'
							: 'bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-600'}"
					>
						{code_copied ? "Copied!" : "Copy"}
					</button>
				</div>
				<pre
					class="bg-gray-900 dark:bg-neutral-950 text-gray-100 rounded-lg p-3 text-xs overflow-x-auto border border-gray-700"><code
						>{usage_code}</code
					></pre>
			</div>

			{#if !theme.is_official}
				<div class="flex justify-center">
					<a
						href="https://huggingface.co/spaces/{theme.id}"
						target="_blank"
						class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
					>
						<svg
							class="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
						View on Hugging Face
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.details-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-height: 90vh;
		width: 95%;
		max-width: 600px;
		z-index: 1000;
	}

	.details-panel.has-preview {
		max-width: 900px;
	}

	.bento-body {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.bento-body.has-preview {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		align-items: start;
	}

	.bento-preview {
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.preview-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.preview-iframe {
		width: 250%;
		height: 250%;
		transform: scale(0.4);
		transform-origin: top left;
	}

	@media (max-width: 768px) {
		.bento-body.has-preview {
			grid-template-columns: 1fr;
		}

		.bento-preview {
			max-height: 250px;
		}
	}
</style>
