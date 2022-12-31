<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import api_logo from "./img/api-logo.svg";
	import Clear from "./img/clear.svelte";

	export let root: string;
	export let active_api_count: number;

	const dispatch = createEventDispatcher();
</script>

<h2>
	<img src={api_logo} alt="" />
	API documentation for&nbsp;
	<span class="url">
		{root}
	</span>
</h2>
{#if active_api_count > 1}
	<div>
		{active_api_count} API endpoints:
	</div>
{/if}

<button on:click={() => dispatch("close")}>
	<Clear />
</button>

<style>
	h2 {
		display: flex;
		font-weight: var(--weight-semibold);
	}

	h2 img {
		margin-right: var(--size-2);
		width: var(--size-4);
	}

	span {
		color: var(--color-accent-base);
	}

	button {
		position: absolute;
		top: var(--size-5);
		right: var(--size-6);
		width: var(--size-4);
		color: var(--color-text-body);
	}

	button:hover {
		color: var(--color-accent-base);
	}

	@media (--screen-md) {
		button {
			top: var(--size-6);
		}

		h2 img {
			width: var(--size-5);
		}
	}
</style>
