<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { clickOutside } from "$lib/components/clickOutside.js";

	export let data: {
		content: any;
		changelog_slug: {
			text: string;
			href: string;
		}[];
	};

	$: content = data.content;
	$: slugs = data.changelog_slug || [];
	let show_nav = false;
	let y: number;
	let current_slug: string = "";

	$: if (typeof document !== "undefined" && y !== undefined) {
		for (const slug of slugs) {
			const id = slug.href.replace("#", "");
			const elem = document.getElementById(id);
			if (elem && y >= elem.offsetTop - 100) {
				current_slug = slug.href;
			}
		}
	}
</script>

<svelte:window bind:scrollY={y} />

<MetaTags
	title={"Gradio Changelog"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Gradio Changelog and Release Notes"
/>

<main class="container mx-auto px-4 pt-8 flex flex-col gap-4">
	<div
		class="flex items-center p-4 border-b border-t border-slate-900/10 lg:hidden dark:border-slate-50/[0.06]"
	>
		<button
			on:click={() => (show_nav = !show_nav)}
			type="button"
			class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
		>
			<svg width="24" height="24"
				><path
					d="M5 6h14M5 12h14M5 18h14"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				></path></svg
			>
		</button>
		<ol class="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0">
			<li class="font-semibold text-slate-900 truncate dark:text-slate-200">
				Version History
			</li>
		</ol>
	</div>

	<div class="flex w-full">
		<div
			class:hidden={!show_nav}
			class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md lg:hidden z-50"
		></div>

		<div
			use:clickOutside
			on:click_outside={() => (show_nav = false)}
			class="w-64 flex-shrink-0 max-h-[calc(100vh-4rem)] overflow-y-auto max-lg:fixed max-lg:inset-0 max-lg:z-50 bg-white lg:bg-transparent dark:bg-neutral-900 lg:dark:bg-transparent p-6 lg:sticky lg:top-8 lg:self-start {show_nav
				? 'block'
				: 'hidden lg:block'}"
		>
			<button
				on:click={() => (show_nav = false)}
				type="button"
				class="absolute z-10 top-4 right-4 flex items-center justify-center text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
				tabindex="0"
			>
				<svg viewBox="0 0 10 10" class="w-4 h-4">
					<path
						d="M0 0L10 10M10 0L0 10"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					></path>
				</svg>
			</button>

			<div class="space-y-8">
				<div>
					<h2
						class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
					>
						Version History
					</h2>
					<ul class="space-y-2 list-none pl-0">
						{#each slugs as heading}
							<li>
								<a
									on:click={() => (show_nav = false)}
									class="block text-sm transition-colors py-1 {current_slug ===
									heading.href
										? 'text-orange-500 font-medium'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}"
									href={heading.href}
								>
									{heading.text}
									{#if heading.text == "4.0.0"}
										<span class="ml-1">🔥</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>

		<div class="flex flex-col w-full min-w-full lg:w-8/12 lg:min-w-0 pt-4">
			<div class="lg:ml-10 w-full">
				<div class="prose dark:prose-invert text-lg max-w-full">
					{@html content}
				</div>
			</div>
		</div>
	</div>
</main>
