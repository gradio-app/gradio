<script lang="ts">
	export let fns: any[];
	import { style_formatted_text } from "$lib/text";
	import ParamTable from "$lib/components/ParamTable.svelte";
</script>

<div id="event-listeners-description">
	<h4 class="mt-8 text-xl text-orange-500 font-light group">Description</h4>
	<p class="mb-2 text-lg text-gray-600 dark:text-gray-300">
		Event listeners allow you to respond to user interactions with the UI
		components you've defined in a Gradio Blocks app. When a user interacts with
		an element, such as changing a slider value or uploading an image, a
		function is called.
	</p>
</div>

<div id="event-listeners-list">
	<h4
		class="text-xl text-orange-500 font-light group mb-4"
		id="supported-event-listeners"
	>
		Supported Event Listeners
	</h4>
	<p class="mb-4 text-lg text-gray-600 dark:text-gray-300">
		The <span class="font-mono">{fns[0].parent.replace("gradio.", "")}</span>
		component supports the following event listeners. Each event listener takes the
		same parameters, which are listed in the
		<a href="#event-listeners-arguments" class="text-orange-500 font-light"
			>Event Parameters</a
		> table below.
	</p>

	<div class="mb-4 event-card">
		<div class="event-header">
			<span class="event-title">Listeners</span>
		</div>
		<div class="event-content">
			{#each fns as fn}
				<details class="event-item">
					<summary class="event-listener">
						<pre class="listener-code"><code
								>{fn.parent.replace("gradio.", "")}.{fn.name}(fn, ···)</code
							></pre>
					</summary>
					<div class="event-description">
						<p>{@html style_formatted_text(fn.description)}</p>
					</div>
				</details>
			{/each}
		</div>
	</div>
</div>

<div id="event-listeners-arguments">
	<h4
		class="text-xl text-orange-500 font-light group mb-4"
		id="event-listener-arguments"
	>
		Event Parameters
	</h4>
	<ParamTable parameters={fns[0].parameters} anchor_links={"event"}
	></ParamTable>
</div>

<style>
	.event-card {
		border-radius: var(--block-radius);
		overflow: hidden;
		border: var(--block-border-width) solid var(--table-border-color);
		background: var(--block-background-fill);
	}

	.event-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-xl) var(--spacing-xxl);
		border-bottom: var(--block-border-width) solid var(--table-border-color);
		background: var(--block-background-fill);
	}

	.event-title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--body-text-color);
	}

	.event-content {
		overflow-y: auto;
	}

	.event-item {
		border-bottom: var(--block-border-width) solid var(--table-border-color);
	}

	.event-item:last-child {
		border-bottom: none;
	}

	.event-listener {
		position: relative;
		padding: var(--spacing-xl) var(--spacing-xxl);
		padding-right: 2.5rem;
		background: var(--table-odd-background-fill);
		border-bottom: 0px solid var(--table-border-color);
		list-style: none;
		cursor: pointer;
	}

	.event-listener::-webkit-details-marker {
		display: none;
	}

	.event-listener::after {
		content: "▼";
		position: absolute;
		top: 50%;
		right: var(--spacing-xxl);
		transform: translateY(-50%);
		transition: transform 0.3s ease;
		font-size: var(--text-xs);
		opacity: 0.7;
		color: var(--body-text-color);
	}

	details[open] .event-listener::after {
		transform: translateY(-50%) rotate(180deg);
	}

	details[open] .event-listener {
		border-bottom-width: var(--block-border-width);
	}

	.listener-code {
		margin: 0;
		background: transparent;
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}

	.listener-code code {
		background: none;
		font-family: var(--font-mono);
		color: var(--body-text-color);
	}

	.event-description {
		padding: var(--spacing-xl) var(--spacing-xxl);
		font-size: var(--text-md);
		background: var(--block-background-fill);
		color: var(--body-text-color);
	}

	.event-description p {
		margin: 0;
		color: var(--body-text-color);
	}

	.event-description :global(code) {
		color: var(--body-text-color);
		background: var(--code-background-fill);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}

	.event-description :global(a) {
		color: var(--link-text-color);
	}

	.event-description :global(a:hover) {
		color: var(--link-text-color-hover);
	}
</style>
