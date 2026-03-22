<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";

	export let data: {
		[key: string]: any;
	};
</script>

<MetaTags
	title="Gradio Blog"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="News, tutorials, and updates from the Gradio team."
/>

<div class="container mx-auto px-4 relative pt-8 mb-12">
	<div class="flex gap-8">
		<nav
			class="hidden lg:block w-64 flex-shrink-0 sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto"
		>
			<div class="space-y-8">
				{#each data.blogs_by_category as { category, blogs } (category)}
					<div>
						<h2
							class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
						>
							{category}
						</h2>
						<ul class="space-y-2">
							{#each blogs as blog (blog.name)}
								<li>
									<a
										href=".{blog.url}"
										class="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-1"
									>
										{blog.pretty_name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</nav>

		<div class="flex-1">
			<h1
				class="mb-8 flex items-center text-4xl font-bold text-gray-900 dark:text-gray-100"
			>
				Blog
			</h1>

			<div class="prose dark:prose-invert max-w-none">
				<p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
					News, tutorials, and updates from the Gradio team.
				</p>
			</div>

			<div class="space-y-6 mt-8">
				{#each data.blogs_by_category as { category, blogs } (category)}
					{#each blogs as blog (blog.name)}
						<a
							href=".{blog.url}"
							class="block p-6 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors group"
						>
							<h3
								class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
							>
								{blog.pretty_name}
							</h3>
							<div
								class="flex gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400"
							>
								{#if blog.author}
									<span>{blog.author}</span>
								{/if}
								{#if blog.date}
									<span>{blog.date}</span>
								{/if}
							</div>
							{#if blog.tags && blog.tags.length > 0}
								<div class="flex flex-wrap gap-2 mt-3">
									{#each blog.tags as tag}
										<span
											class="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400"
										>
											{tag}
										</span>
									{/each}
								</div>
							{/if}
						</a>
					{/each}
				{/each}
			</div>
		</div>
	</div>
</div>
