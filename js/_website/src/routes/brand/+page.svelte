<script lang="ts">
	import DownloadIcon from "$lib/components/icons/DownloadIcon.svelte";
	import gradio_logo_svg from "$lib/assets/brand-assets/gradio-logo.svg";
	import gradio_logo_png from "$lib/assets/brand-assets/gradio-logo.png";
	import gradio_logo_with_title_svg from "$lib/assets/brand-assets/gradio-logo-with-title.svg";
	import gradio_logo_with_title_png from "$lib/assets/brand-assets/gradio-logo-with-title.png";

	const LOGO_OPTIONS = [
		{
			thumbnailUrl: gradio_logo_svg,
			thumbnailAlt: "Gradio logo",
			downloads: [
				{ type: "svg", url: gradio_logo_svg },
				{ type: "png", url: gradio_logo_png }
			]
		},
		{
			thumbnailUrl: gradio_logo_with_title_svg,
			thumbnailAlt: "Gradio logo with title",
			downloads: [
				{
					type: "svg",
					url: gradio_logo_with_title_svg
				},
				{
					type: "png",
					url: gradio_logo_with_title_png
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
		<div class="flex-col md:w-1/2 lg:w-1/3">
			{#each LOGO_OPTIONS as logo}
				<div class="mt-8 flex items-center">
					<div class="h-12 ml-2 mr-4">
						<img
							src={logo.thumbnailUrl}
							alt={logo.thumbnailAlt}
							class="w-full h-full object-contain object-left"
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
