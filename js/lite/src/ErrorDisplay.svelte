<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import { Embed } from "@gradio/core";

	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";
	import { setupi18n } from "@gradio/core";

	setupi18n();

	const dispatch = createEventDispatcher();

	export let is_embed: boolean;
	export let error: Error | undefined = undefined;
	export let height: string;

	// For <Embed>
	export let container: boolean;
	export let version: string;
	let wrapper: HTMLDivElement;
</script>

<Embed
	display={container && is_embed}
	{is_embed}
	info={false}
	{version}
	initial_height={height}
	loaded={false}
	space={null}
	fill_width={false}
	is_lite={true}
	bind:wrapper
	root=""
>
	<StatusTracker
		i18n={$_}
		absolute={!is_embed}
		status="error"
		timer={false}
		queue_position={null}
		queue_size={null}
		translucent={true}
		autoscroll={false}
		on:clear_status={() => dispatch("clear_error")}
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
</Embed>

<style>
	.error {
		position: relative;
		width: 100%;
		padding: var(--size-4);
		color: var(--body-text-color);
		overflow: scroll;
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
