<script lang="ts">
	import { twitter, github } from "../assets";
</script>

<footer
	class="main-footer container mx-auto flex-row flex items-center px-4 py-6 justify-end"
>
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
