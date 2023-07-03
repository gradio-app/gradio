<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import api_logo from "./img/api-logo.svg";
	import Clear from "./img/clear.svelte";

	export let root: string;
	export let api_count: number;

	const dispatch = createEventDispatcher();
</script>

<h2>
	<img src={api_logo} alt="" />
	<div>
		API documentation
		<div class="url">
			{root}
		</div>
	</div>
	<span class="counts">
		<span class="url">{api_count}</span> API endpoint{#if api_count > 1}s{/if}
	</span>
</h2>

<button on:click={() => dispatch("close")}>
	<Clear />
</button>

<style>
	h2 {
		display: flex;
		color: var(--body-text-color);
		font-weight: var(--weight-semibold);
		gap: var(--size-4);
	}

	h2 img {
		margin-right: var(--size-2);
		width: var(--size-4);
		display: inline-block;
	}

	.url {
		color: var(--color-accent);
		font-weight: normal;
	}

	button {
		position: absolute;
		top: var(--size-5);
		right: var(--size-6);
		width: var(--size-4);
		color: var(--body-text-color);
	}

	button:hover {
		color: var(--color-accent);
	}

	@media (--screen-md) {
		button {
			top: var(--size-6);
		}

		h2 img {
			width: var(--size-5);
		}
	}

	.counts {
		margin-top: auto;
		margin-right: var(--size-8);
		margin-bottom: auto;
		margin-left: auto;
		color: var(--body-text-color);
		font-weight: var(--weight-light);
	}
</style>
