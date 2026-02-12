<script lang="ts">
	import gradio_logo_svg from "$lib/assets/brand-assets/gradio-logo.svg";
	import gradio_logo_png from "$lib/assets/brand-assets/gradio-logo.png";
	import gradio_logo_with_title_svg from "$lib/assets/brand-assets/gradio-logo-with-title.svg";
	import gradio_logo_with_title_png from "$lib/assets/brand-assets/gradio-logo-with-title.png";

	export let show = false;
	export let x = 0;
	export let y = 0;

	const downloads = [
		{
			label: "Logo (SVG)",
			url: gradio_logo_svg,
			filename: "gradio-logo.svg"
		},
		{
			label: "Logo (PNG)",
			url: gradio_logo_png,
			filename: "gradio-logo.png"
		},
		{
			label: "Logo with Title (SVG)",
			url: gradio_logo_with_title_svg,
			filename: "gradio-logo-with-title.svg"
		},
		{
			label: "Logo with Title (PNG)",
			url: gradio_logo_with_title_png,
			filename: "gradio-logo-with-title.png"
		}
	];

	function handleDownload(url: string, filename: string) {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		show = false;
	}
</script>

{#if show}
	<div
		class="fixed bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 z-50 min-w-[200px]"
		style="left: {x}px; top: {y}px;"
	>
		<div
			class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700"
		>
			Download Logo
		</div>
		{#each downloads as download}
			<button
				class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
				on:click={() => handleDownload(download.url, download.filename)}
			>
				<svg
					class="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					/>
				</svg>
				{download.label}
			</button>
		{/each}
	</div>
{/if}
