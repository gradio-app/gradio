<script lang="ts">
	import { theme } from "$lib/stores/theme";

	$: isDark = $theme === "dark";

	function handleClick() {
		console.log('[ThemeToggle] Button clicked!');
		console.log('[ThemeToggle] Current theme:', $theme);
		theme.toggle();
	}
</script>

<button
	on:click={handleClick}
	class="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
	aria-label="Toggle dark mode"
	title={isDark ? "Switch to light mode" : "Switch to dark mode"}
>
	{#if isDark}
		🌞
	{:else}
		🌙
	{/if}
</button>
