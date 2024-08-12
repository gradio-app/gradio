<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Clear from "./img/clear.svelte";

	const dispatch = createEventDispatcher();

	export let root: string;
</script>

<div class="wrap prose">
	<h1>API Docs</h1>
	<p class="attention">
		No API Routes found for
		<code>
			{root}
		</code>
	</p>
	<p>
		To expose an API endpoint of your app in this page, set the <code>
			api_name
		</code>
		parameter of the event listener.
		<br />
		For more information, visit the
		<a href="https://gradio.app/sharing_your_app/#api-page" target="_blank">
			API Page guide
		</a>
		. To hide the API documentation button and this page, set
		<code>show_api=False</code>
		in the
		<code>Blocks.launch()</code>
		method.
	</p>
</div>

<button on:click={() => dispatch("close")}>
	<Clear />
</button>

<style>
	.wrap {
		padding: var(--size-6);
	}

	.attention {
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
	}

	.attention code {
		border: none;
		background: none;
		color: var(--color-accent);
		font-weight: var(--weight-bold);
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
	}
</style>
