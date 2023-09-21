<script lang="ts">
	import DownloadIcon from "$lib/components/icons/DownloadIcon.svelte";
	import gradio_logo_svg from "$lib/assets/brand-assets/gradio-logo.svg";
	import gradio_logo_with_title_svg from "$lib/assets/brand-assets/gradio-logo-with-title.svg";

	const LOGO_OPTIONS = [
		{
			thumbnailUrl: gradio_logo_svg,
			thumbnailAlt: "Gradio logo",
			downloads: [{ type: "svg", url: gradio_logo_svg }]
		},
		{
			thumbnailUrl: gradio_logo_with_title_svg,
			thumbnailAlt: "Gradio logo with title",
			downloads: [
				{
					type: "svg",
					url: gradio_logo_with_title_svg
				}
			]
		}
	];
</script>

<main class="container mx-auto px-4 gap-4">
	<h2 class="text-4xl font-light mb-2 pt-2 text-orange-500 group">
		Brand assets
	</h2>

	<section class="mb-8">
		<h3 class="mb-4 text-2xl font-thin block">Gradio Logos</h3>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{#each LOGO_OPTIONS as logo}
				<div class="pt-4 flex items-center justify-between">
					<div class="h-16 flex-grow">
						<img
							src={logo.thumbnailUrl}
							alt={logo.thumbnailAlt}
							class="w-full h-full object-contain"
						/>
					</div>
					<ul class="space-y-2 px-2">
						{#each logo.downloads as download}
							<li>
								<a
									href={download.url}
									download
									class="flex items-center hover:underline font-mono"
								>
									<DownloadIcon />
									.{download.type}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>
</main>
