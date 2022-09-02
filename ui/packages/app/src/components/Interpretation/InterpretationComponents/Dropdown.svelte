<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let interpretation: Array<number>;
	export let choices: Array<string>;
	export let label: string = "";
</script>

<div class="input-dropdown">
	<BlockTitle>{label}</BlockTitle>
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
	.input-dropdown {
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
