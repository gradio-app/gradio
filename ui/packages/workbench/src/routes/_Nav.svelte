<script>
	import { page } from "$app/stores";
	const comp_routes = [
		"Audio",
		"Button",
		"Carousel",
		"Chatbot",
		"Chart",
		"Forms",
		"File",
		"HighlightedText",
		"Html",
		"Image",
		"JSON",
		"Label",
		"Table",
		"Tabs",
		"Upload",
		"Video"
	].map((n) => [n, n.toLowerCase()]);
</script>

<nav class="inline-block">
	<ul class="flex flex-col px-6 ">
		{#each comp_routes as [name, route]}
			{@const is_current = $page.url.pathname === `/${route}`}
			<a
				class="font-mono text-md hover:text-orange-500 {is_current
					? 'text-orange-500'
					: ''} "
				href="/{route}">{name}</a
			>
		{/each}
	</ul>
</nav>
