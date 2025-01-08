<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";
	import settings_logo from "./img/settings-logo.svg";
	import Clear from "./img/clear.svelte";
	import { setupi18n } from "../i18n";

	export let root: string;

	const dispatch = createEventDispatcher();
	setupi18n();
</script>

<h2>
	<img src={settings_logo} alt="" />
	<div class="title">
		{$_("common.settings")}
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
		font-size: var(--text-xl);
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
	.title {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>
