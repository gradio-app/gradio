<script lang="ts">
	let {
		title = "Gradio",
		description = "Build & Share Delightful Machine Learning Apps",
		url,
		canonical
	}: {
		title?: any;
		description?: any;
		url: string;
		canonical: string;
	} = $props();
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
		content="https://raw.githubusercontent.com/gradio-app/gradio/main/js/_website/src/lib/assets/img/meta-image.jpg"
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:creator" content="@Gradio" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content="{description}." />
	<meta
		name="twitter:image"
		content="https://raw.githubusercontent.com/gradio-app/gradio/main/js/_website/src/lib/assets/img/meta-image.jpg"
	/>

	<link rel="canonical" href={canonical} />
</svelte:head>
