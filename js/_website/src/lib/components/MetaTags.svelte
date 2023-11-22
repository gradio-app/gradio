<script lang="ts">
	export let title = "Gradio";
	export let description = "Build & Share Delightful Machine Learning Apps";
	export let url: string;
	export let canonical: string;
</script>

<svelte:head>
	<title>{title}</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content={description} />
	<meta name="author" content="Gradio Team" />
	<meta property="og:title" content={title} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={url} />
	<meta property="og:description" content={description} />
	<meta
		property="og:image"
		content="https://raw.githubusercontent.com/gradio-app/gradio/main/js/_website/src/lib/assets/img/header-image.jpg"
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:creator" content="@Gradio" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content="{description}." />
	<meta
		name="twitter:image"
		content="https://raw.githubusercontent.com/gradio-app/gradio/main/js/_website/src/lib/assets/img/header-image.jpg"
	/>

	<link rel="canonical" href={canonical} />
</svelte:head>
