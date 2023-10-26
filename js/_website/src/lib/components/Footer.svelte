<script lang="ts">
	import { gradio_logo, twitter, github } from "../assets";
</script>

<footer
	class="container mx-auto flex-row flex items-center px-4 py-6 justify-between"
>
	<a href="/">
		<img src={gradio_logo} alt="Gradio logo" />
	</a>
	<div class="flex gap-3">
		<a
			href="https://status.gradio.app"
			target="_blank"
			class="text-gray-400 hover:text-gray-500"
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
