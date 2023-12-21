<script lang="ts">
	import DocsNav from "$lib/components/DocsNav.svelte";
	import DocsNavCustom from "$lib/components/DocsNavCustom.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";

	export let data;
	let guide_page = data.guide;
	let guide_slug = data.guide_slug;

	$: guide_page = data.guide;
	$: guide_slug = data.guide_slug;
</script>

<MetaTags
	title={"Gradio Lite Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={"Serverless Gradio Running Entirely in Your Browser"}
/>

<div class="container mx-auto px-4 flex relative w-full">
	<div
		class="side-navigation h-screen leading-relaxed sticky top-0 text-md overflow-y-auto overflow-x-hidden hidden lg:block rounded-t-xl bg-gradient-to-r from-white to-gray-50 lg:w-3/12"
	>
		<div
			class="category-link my-2 font-semibold px-4 pt-2 text-ellipsis block"
			style="max-width: 12rem"
		>
			Gradio Lite
		</div>
		<a
			class="current-nav-link guide-link -indent-2 ml-2 thin-link px-4 block overflow-hidden"
			style="max-width: 12rem"
			href="/">Getting Started with Lite</a
		>

		<div
			class="navigation max-w-full bg-gradient-to-r from-orange-50 to-orange-100 p-2 mx-2 border-l-2 border-orange-500 mb-2"
		>
			{#each guide_slug as heading}
				<a
					class="subheading block thin-link -indent-2 ml-4 mr-2"
					href={heading.href}>{heading.text}</a
				>
			{/each}
		</div>
	</div>
	<div class="w-full lg:w-8/12 mx-auto">
		<div class="prose text-lg max-w-full">
			{@html guide_page.new_html}
		</div>
	</div>
</div>
