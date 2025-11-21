<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import DropDown from "$lib/components/VersionDropdown.svelte";

	export let data: {
		[key: string]: any;
	};
</script>

<MetaTags
	title="Gradio Guides"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Guides and tutorials for building with Gradio."
/>

<div class="container mx-auto px-4 relative pt-8 mb-12">
	<div class="flex gap-8">
		<nav
			class="hidden lg:block w-64 flex-shrink-0 sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto"
		>
			<div class="space-y-8">
				{#each data.guides_by_category as { category, guides } (category)}
					<div>
						<h2
							class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
						>
							{category}
						</h2>
						<ul class="space-y-2">
							{#each guides as guide (guide.name)}
								<li>
									<a
										href=".{guide.url}"
										class="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-1"
									>
										{guide.pretty_name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</nav>

		<div class="flex-1">
			<div class="mb-8">
				<DropDown />
			</div>
			<h1
				class="mb-8 flex items-center text-4xl font-bold text-gray-900 dark:text-gray-100"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					aria-hidden="true"
					role="img"
					class="mr-2 text-gray-400 dark:text-gray-500"
					width="0.75em"
					height="0.75em"
					preserveAspectRatio="xMidYMid meet"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						d="M15,19H9c-0.6,0-1-0.4-1-1v-0.5c0-1.4-0.6-2.8-1.7-3.9C4.7,12,3.9,9.9,4,7.7C4.2,3.5,7.7,0.1,11.9,0L12,0     c4.4,0,8,3.6,8,8c0,2.1-0.8,4.2-2.4,5.7c-1.1,1-1.6,2.4-1.6,3.8V18C16,18.6,15.6,19,15,19z M10,17h4c0.1-1.8,0.9-3.4,2.2-4.8     C17.4,11.1,18,9.6,18,8c0-3.3-2.7-6-6-6l-0.1,0C8.8,2.1,6.1,4.6,6,7.8C5.9,9.4,6.6,11,7.7,12.2C9.1,13.6,9.9,15.3,10,17z"
					/>
					<path
						d="M12,24L12,24c-2.2,0-4-1.8-4-4v-2c0-0.6,0.4-1,1-1h6c0.6,0,1,0.4,1,1v2C16,22.2,14.2,24,12,24z M10,19v1c0,1.1,0.9,2,2,2     H12c1.1,0,2-0.9,2-2v-1H10z"
					/>
					<path
						d="M9,9C8.4,9,8,8.6,8,8c0-2.2,1.8-4,4-4c0.6,0,1,0.4,1,1s-0.4,1-1,1c-1.1,0-2,0.9-2,2C10,8.6,9.6,9,9,9z"
					/>
				</svg>
				Guides
			</h1>

			<div class="prose dark:prose-invert max-w-none">
				<p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
					Learn how to build with Gradio through step-by-step guides and
					tutorials.
				</p>
			</div>
		</div>
	</div>
</div>
