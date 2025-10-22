<script lang="ts">
	import { gradio_logo, gradio_logo_dark, twitter, github } from "../assets";
	import { theme } from "$lib/stores/theme";

	$: currentLogo = $theme === "dark" ? gradio_logo_dark : gradio_logo;
</script>

<footer
	class="main-footer container mx-auto flex-row flex items-center px-4 py-6 justify-between"
>
	<a href="/">
		<img src={currentLogo} alt="Gradio logo" />
	</a>
	<div class="flex gap-3">
		<a
			href="https://status.gradio.app"
			target="_blank"
			class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
		>
			<span>Status</span>
		</a>
		<a class="hover:opacity-75 transition" href="https://twitter.com/Gradio">
			<img src={twitter} class="w-6" alt="Twitter logo" />
		</a>
		<a
			class="hover:opacity-75 transition"
			href="https://github.com/gradio-app/gradio"
		>
			<img src={github} class="w-6" alt="Github logo" />
		</a>
	</div>
</footer>
