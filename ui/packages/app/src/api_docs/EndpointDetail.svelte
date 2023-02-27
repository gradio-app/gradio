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
		margin-bottom: var(--size-2);
		color: var(--color-text-body);
		font-weight: var(--weight-bold);
		font-size: var(--text-md);
	}

	.post {
		margin-right: var(--size-2);
		border: 1px solid var(--color-border-accent);
		border-radius: var(--radius-sm);
		background: var(--color-accent-soft);
		padding-right: var(--size-1);
		padding-left: var(--size-1);
		color: var(--color-accent-base);
		font-weight: var(--weight-semibold);
		font-size: var(--text-xs);
	}

	.endpoint {
		margin-bottom: var(--size-6);
		color: var(--color-text-body);
		font-size: var(--text-xs);
	}

	.url {
		display: inline-block;
		border: none;
		background: none;
		padding: var(--size-0-5);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
	}

</style>
