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
	<div class="url">
		{root}run/{api_name}
		<Button size="sm" variant="secondary" on:click={copy}>
			{#if just_copied === dependency_index}
				copied!
			{:else}
				copy
			{/if}
		</Button>
	</div>
</div>

<style>
	h3 {
		color: var(--body-text-color);
		font-weight: var(--header-text-weight);
		font-size: var(--text-lg);
	}

	.post {
		margin-right: var(--size-2);
		border: 1px solid var(--border-color-accent);
		border-radius: var(--radius-sm);
		background: var(--background-accent-soft);
		padding-right: var(--size-1);
		padding-left: var(--size-1);
		color: var(--background-accent);
		font-weight: var(--weight-semibold);
	}

	.endpoint {
		margin-bottom: var(--size-6);
		color: var(--body-text-color);
	}

	.url {
		display: inline-block;
		border: none;
		background: none;
		padding: var(--size-0-5);
		font-family: var(--font-mono);
	}
</style>
