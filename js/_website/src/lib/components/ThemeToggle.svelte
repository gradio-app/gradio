<script lang="ts">
	import { theme } from "$lib/stores/theme";

	$: is_dark = $theme === "dark";

	function handle_click() {
		theme.toggle();
	}
</script>

<button
	on:click={handle_click}
	class="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/20 dark:hover:bg-white/20 hover:bg-gray-200 transition-colors text-gray-900 dark:text-gray-300"
	aria-label="Toggle dark mode"
	title={is_dark ? "Switch to light mode" : "Switch to dark mode"}
>
	{#if is_dark}
		<svg
			aria-label="Sun icon"
			width="24px"
			height="24px"
			stroke-width="1.5"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			color="currentColor"
		>
			<path
				d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M22 12L23 12"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M12 2V1"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M12 23V22"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M20 20L19 19"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M20 4L19 5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M4 20L5 19"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M4 4L5 5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M1 12L2 12"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
		</svg>
	{:else}
		<svg
			aria-label="Moon icon"
			width="24px"
			height="24px"
			stroke-width="1.5"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			color="currentColor"
		>
			<path
				d="M3 11.5066C3 16.7497 7.25034 21 12.4934 21C16.2209 21 19.4466 18.8518 21 15.7259C12.4934 15.7259 8.27411 11.5066 8.27411 3C5.14821 4.55344 3 7.77915 3 11.5066Z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
		</svg>
	{/if}
</button>
