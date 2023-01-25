<script lang="ts">
	import { Button } from "@gradio/button";
	export let api_name: string;
	export let root: string;
	export let dependency_index: number;

	let just_copied = -1;

	function copy() {
		navigator.clipboard.writeText(root + "run/" + api_name);
		just_copied = dependency_index;
		setTimeout(() => {
			just_copied = -1;
		}, 1500);
	}
</script>

<h3>
	<span class="post">POST</span>
	/run/{api_name}
</h3>
<div class="endpoint prose">
	Endpoint: <code>{root}run/{api_name}</code>
	<Button size="sm" on:click={copy}>
		{#if just_copied === dependency_index}
			copied!
		{:else}
			copy
		{/if}
	</Button>
</div>

<style>
	h3 {
		margin-bottom: var(--size-2);
		color: var(--color-text-body);
		font-weight: var(--weight-bold);
		font-size: var(--scale-1);
	}

	.post {
		margin-right: var(--size-2);
		border: 1px solid var(--docs-pill-border);
		border-radius: var(--radius-sm);
		background: var(--docs-pill-background);
		padding-right: var(--size-1);
		padding-left: var(--size-1);
		color: var(--docs-pill-text);
		font-weight: var(--weight-semibold);
		font-size: var(--scale-00);
	}

	.endpoint {
		margin-bottom: var(--size-6);
		color: var(--color-text-body);
		font-size: var(--scale-00);
	}

	code {
		border: none;
		background: none;
		font-size: 90%;
	}

	.endpoint > :global(button) {
		margin-bottom: 0;
		margin-left: var(--size-2);
		padding: 0 var(--size-2);
	}
</style>
