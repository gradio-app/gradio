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
	title={"Gradio Python Client Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={"The lightweight Gradio client library that makes it easy to use any Gradio app as an API"}
/>

<main class="container mx-auto px-4 flex gap-4">
	<div class="flex w-full">
		<DocsNavCustom
			current_nav_link={"Getting Started With The Python Client"}
			items={{
				"Intro": "intro",
				"Client": "client",
				"Job": "job",
                "Getting Started With The Python Client": "getting-started"
			}}
			title={"Python Client"}
		/>
        <div class="prose text-lg max-w-full mx-8">
			{@html guide_page.new_html}
		</div>
    </div>
</main>