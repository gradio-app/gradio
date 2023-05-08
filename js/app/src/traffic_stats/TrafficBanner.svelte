<script lang="ts">
	import api_logo from "/static/img/activity.svg";
	import Clear from "../images/clear.svg";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
</script>

<div class="banner-wrap">
	<h2>
		<img src={api_logo} alt="" />
		Traffic Stats
	</h2>
</div>

<button on:click={() => dispatch("close")}>
	<img src={Clear} alt="" />
</button>

<style>
	.banner-wrap {
		position: relative;
		border-bottom: 1px solid var(--border-color-primary);
		padding: var(--size-4) var(--size-6);
		font-size: var(--text-md);
	}

	@media (--screen-md) {
		.banner-wrap {
			font-size: var(--text-xl);
		}
	}
	h2 {
		display: flex;
		color: var(--body-text-color);
		font-weight: var(--weight-semibold);
	}

	h2 img {
		margin-right: var(--size-2);
		width: var(--size-4);
	}

	span {
		color: var(--color-accent);
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
</style>
