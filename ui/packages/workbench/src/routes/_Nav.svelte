<script>
	import { page } from "$app/stores";
	const comp_routes = [
		"Atoms",
		"Audio",
		"Button",
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
		<a
			class="font-mono text-md hover:text-orange-500 {$page.url.pathname ===
			`/z_Theme`
				? 'text-orange-500'
				: ''} "
			href="/z_Theme">Theme</a
		>
	</ul>
</nav>
