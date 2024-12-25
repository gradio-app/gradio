<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import settings_logo from "./img/settings-logo.svg";
	import Clear from "./img/clear.svelte";

	export let root: string;

	const dispatch = createEventDispatcher();
</script>

<h2>
	<img src={settings_logo} alt="" />
	<div class="title">
		Settings
		<div class="url">
			{root}
		</div>
	</div>
</h2>

<button on:click={() => dispatch("close")}>
	<Clear />
</button>

<style>
	h2 {
		display: flex;
		color: var(--body-text-color);
		font-weight: var(--weight-semibold);
		gap: var(--size-3);
	}

	h2 img {
		width: var(--size-4);
		display: inline-block;
		margin-top: 0.1rem;
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
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.loading-dot {
		position: relative;
		left: -9999px;
		width: 12px;
		height: 12px;
		border-radius: 6px;
		background-color: #fd7b00;
		color: #fd7b00;
		box-shadow: 9999px 0 0 -1px;
		margin-right: 0.3rem;
	}

	.self-baseline {
		align-self: baseline;
	}
	.title {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
	.btn-text {
		font-size: var(--text-lg);
	}
</style>
