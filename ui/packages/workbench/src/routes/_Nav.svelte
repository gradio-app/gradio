<script lang="ts">
	import { page } from "$app/stores";
	const comp_routes = [
		["Forms", ["Forms"]],
		[
			"Media",
			["Audio", "File", "Image", "Gallery", "Video", "Model3D", "Upload"]
		],
		["Buttons", ["Button", "UploadButton"]],
		["Content", ["Markdown", "HTML", "JSON"]],
		["Data Science", ["Chart", "ScatterPlot", "Table"]],
		["Design", ["Atoms", "Theme"]],
		["Layout", ["Tabs"]],
		["Misc", ["Chatbot", "HighlightedText", "Label", "Dataset"]]
	].map((section) => {
		console.log({ section });
		return [
			section[0],
			section[1].map((comp) => {
				console.log({ comp });
				return [comp, comp.toLowerCase()];
			})
		];
	}) as Array<[string, [string, string]]>;

	console.log(comp_routes);
</script>

<nav class="inline-block">
	<ul class="flex flex-col px-6 ">
		{#each comp_routes as [section, comps]}
			<li>
				<h2 class="text-xs uppercase font-bold">{section}</h2>
				<ul class="mb-4 ml-2">
					{#each comps as [name, route]}
						{@const is_current = $page.url.pathname === `/${route}`}
						<li>
							<a
								class="font-mono text-md hover:text-orange-500 {is_current
									? 'text-orange-500'
									: ''} "
								href="/{route}">{name}</a
							>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
</nav>
