<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";

	import { _ } from "svelte-i18n";
	import { setupi18n } from "@gradio/core";

	setupi18n();

	export let is_embed: boolean;
	export let error: Error | undefined = undefined;
</script>

<StatusTracker
	i18n={$_}
	absolute={!is_embed}
	status="error"
	timer={false}
	queue_position={null}
	queue_size={null}
	translucent={true}
	autoscroll={false}
>
	<div class="error" slot="error">
		{#if error}
			{#if error.message}
				<p class="error-name">
					{error.message}
				</p>
			{/if}
			{#if error.stack}
				<pre class="error-stack"><code>{error.stack}</code></pre>
			{/if}
		{/if}
	</div>
</StatusTracker>

<style>
	.error {
		position: relative;
		width: 100%;
		padding: var(--size-4);
		color: var(--body-text-color);
		/* Status tracker sets `pointer-events: none`.
		Override it here so the user can scroll the element with `overflow: hidden`
		and copy and paste the error message */
		pointer-events: all;
	}

	.error-name {
		text-align: center;
	}

	.error-stack {
		width: 100%;
		overflow: scroll;
	}
</style>
