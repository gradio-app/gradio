<script lang="ts">
	import { getSaliencyColor } from "../utils";

	export let original: string;
	export let interpretation: Array<number>;
	export let theme: string;
	export let choices: Array<string>;
</script>

<div class="input-dropdown" {theme}>
	<ul class="dropdown-menu">
		{#each choices as choice, i}
			<li
				class="dropdown-item first:rounded-t transition last:rounded-b py-2 px-3 block whitespace-nowrap cursor-pointer"
				style={"background-color: " + getSaliencyColor(interpretation[i])}
			>
				{choice}
			</li>
		{/each}
	</ul>
</div>

<style lang="postcss" global>
	.input-dropdown[theme="default"] {
		.selector {
			@apply bg-white dark:bg-gray-800 shadow transition hover:shadow-md;
		}
		.dropdown-menu {
			@apply shadow;
		}
		.dropdown-item {
			@apply bg-white dark:bg-gray-800 hover:font-semibold;
		}
	}
</style>
