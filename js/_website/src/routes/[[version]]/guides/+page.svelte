<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import DropDown from "$lib/components/VersionDropdown.svelte";

	export let data: {
		[key: string]: any;
	};
</script>

<MetaTags
	title="Gradio Guides & Tutorials"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Step-by-step guides and tutorials for building with Gradio."
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<div class="float-right">
		<DropDown />
	</div>
	<h1
		class="mb-4 flex items-center text-2xl font-light text-gray-900 dark:text-gray-100"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			role="img"
			class="mr-1.5 text-gray-400 dark:text-gray-500 text-3xl"
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
		Learn
	</h1>

	<!-- Featured: Quickstart -->
	<div class="mb-8">
		<a
			href="./guides/quickstart"
			target="_self"
			class="shadow-alternate hover:scale-[1.02] group flex flex-col overflow-hidden rounded-xl px-6 py-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 hover:shadow-alternate shadow-none transition-shadow text-gray-900 dark:text-gray-100"
		>
			<div class="text-xl mb-2">
				<p class="font-semibold">Get Started with Gradio</p>
			</div>
			<div class="text-lg font-light">
				Learn the basics of Gradio and build your first machine learning web app in minutes.
			</div>
		</a>
	</div>

	<!-- All Guides by Category -->
	{#each data.guides_by_category as { category, guides }, i (category)}
		<div class="category py-4">
			<h2
				class="mb-4 text-xl font-normal block text-gray-900 dark:text-gray-100"
			>
				{category}
			</h2>
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{#each guides as guide (guide.name)}
					<a
						class="shadow-alternate hover:scale-[1.04] guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl px-3 py-4 bg-gradient-to-r from-{data
							.COLOR_SETS[
							i
						]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
						href=".{guide.url}"
					>
						<div class="flex flex-col p-4 h-min">
							<h2 class="text-lg">
								{guide.pretty_name}
							</h2>
							<div class="tags-holder">
								{#if guide.tags}
									<p class="text-gray-600 dark:text-gray-400">
										<!--
                    -->{#each guide.tags as tag, j (tag)}<!--
                    -->{tag}{#if j !== guide.tags.length - 1},&nbsp;{/if}<!--
                    -->{/each}<!--
                -->
									</p>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/each}
</div>
