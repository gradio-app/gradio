<script lang="ts">
	// based on https://svelte.dev/playground/d65a4e9f0ae74d1eb1b08d13e428af32?version=3.35.0

	import { createEventDispatcher } from "svelte";
	export let label;
	export let checked = false;
	export let disabled = false;
	const dispatch = createEventDispatcher();
	// @ts-ignore
	function handleClick(event: Event): void {
		const target = event.target;
		// @ts-ignore
		const state = target.getAttribute("aria-checked");
		checked = state === "true" ? false : true;
		dispatch("click", { checked });
	}
</script>

<div class="s s--slider" style="font-size:var(--font-size-sm)px">
	<button
		role="switch"
		aria-checked={checked}
		on:click={handleClick}
		{disabled}
	>
	</button>
	<span>{label}</span>
</div>

<style>
	.s--slider {
		display: flex;
		align-items: center;
	}

	.s--slider button {
		width: 3em;
		height: 1.6em;
		position: relative;
		margin: 0 0.5em 0 0;
		background: var(--button-secondary-background-fill);
		border: none;
	}

	.s--slider button[disabled] {
		cursor: not-allowed;
	}

	.s--slider button::before {
		content: "";
		position: absolute;
		width: 1.3em;
		height: 1.3em;
		background: #fff;
		top: 0.13em;
		right: 1.5em;
		transition: transform 0.3s;
	}

	.s--slider button[aria-checked="true"] {
		background-color: var(--color-accent);
	}

	.s--slider button[aria-checked="true"]::before {
		transform: translateX(1.3em);
		transition: transform 0.3s;
	}

	.s--slider button:focus {
		box-shadow: 0 0px 0px 1px var(--color-accent);
	}

	/* Slider Design Option */
	.s--slider button {
		border-radius: 1.5em;
	}

	.s--slider button::before {
		border-radius: 100%;
	}

	.s--slider button:focus {
		box-shadow: 0 0px 8px var(--accent-color);
		border-radius: 1.5em;
	}
</style>
