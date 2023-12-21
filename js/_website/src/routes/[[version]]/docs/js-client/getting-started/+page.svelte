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
	title={"Gradio JS Client Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={"Use Gradio's Javascript components in cusome components or outside the context of Gradio."}
/>

<main class="container mx-auto px-4 flex gap-4">
	<div class="flex w-full">
		<DocsNavCustom
			current_nav_link={"Getting Started With The JS Client"}
			items={{
				Reference: "reference",
				"Getting Started With The JS Client": "getting-started"
			}}
			title={"JavaScript Client"}
		/>

		<div class="w-full lg:w-8/12 mx-auto">
			<div class="prose text-lg max-w-full">
				{@html guide_page.new_html}
			</div>
		</div>
	</div>
</main>
