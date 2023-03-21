<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let interpretation: Array<number>;
	export let choices: Array<string>;
	export let label: string = "";
</script>

<div>
	<BlockTitle>{label}</BlockTitle>
	<ul class="dropdown-menu">
		{#each choices as choice, i}
			<li
				class="dropdown-item"
				style={"background-color: " + getSaliencyColor(interpretation[i])}
			>
				{choice}
			</li>
		{/each}
	</ul>
</div>

<style>
	.dropdown-menu {
		box-shadow: var(--shadow-drop);
	}
	.dropdown-item {
		display: block;
		transition: 150ms;
		cursor: pointer;
		background: var(--background-fill-primary);
		padding: var(--size-2) var(--size-3);
		white-space: nowrap;
	}

	.dropdown-item:first-child {
		border-top-right-radius: var(--radius-md);
		border-top-left-radius: var(--radius-md);
	}
	.dropdown-item:last-child {
		border-bottom-right-radius: var(--radius-md);
		border-bottom-left-radius: var(--radius-md);
	}

	.dropdown-item:hover {
		font-weight: var(--weight-semibold);
	}
</style>
