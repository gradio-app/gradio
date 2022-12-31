<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import clear from "/static/img/clear.svg";

	const dispatch = createEventDispatcher();

	export let root: string;
</script>

<div class="wrap prose">
	<h1>API Docs</h1>
	<p class="attention">
		No named API Routes found for
		<code>
			{root}
		</code>
	</p>
	<p>
		To expose an API endpoint of your app in this page, set the <code>
			api_name
		</code>
		parameter of the event listener.<br /> For more information, visit the
		<a href="https://gradio.app/sharing_your_app/#api-page" target="_blank"
			>API Page guide</a
		>. To hide the API documentation button and this page, set
		<code> show_api=False </code>
		in the
		<code> Blocks.launch()</code> method.
	</p>
</div>

<button on:click={() => dispatch("close")}> x </button>

<style>
	.wrap {
		padding: var(--size-6);
	}

	.attention {
		font-size: var(--scale-3);
		font-weight: var(--weight-bold);
	}

	.attention code {
		color: var(--color-accent-base);
		font-weight: var(--weight-bold);
		background: none;
		border: none;
	}

	button {
		position: absolute;
		right: var(--size-6);
		top: var(--size-5);
		color: var(--color-text-body);
		font-weight: var(--weight-bold);
		font-size: var(--scale-3);
	}

	@media (--screen-md) {
		button {
			top: var(--size-6);
		}
	}
</style>
