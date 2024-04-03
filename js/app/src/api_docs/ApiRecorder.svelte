<script lang="ts">
	import type { Payload, Dependency } from "../types";

	export let api_calls: Payload[] = [];
	export let dependencies: Dependency[];
</script>

<div id="api-recorder">
	🟠 <span class="message">Recording API Calls...</span>
	({api_calls.length}) {#if api_calls.length > 0}
		| <span class="api-name"
			>/{dependencies[api_calls[api_calls.length - 1].fn_index].api_name}</span
		>
	{/if}
</div>

<style>
	#api-recorder {
		border: 1px solid var(--color-accent);
		background-color: var(--color-accent-soft);
		padding: 0px var(--size-2);
		border-radius: var(--size-1);
		cursor: pointer;
		color: var(--body-text-color);
	}
	.message {
		font-style: italic;
	}
	.api-name {
		font-size: var(--text-md);
		font-family: var(--font-mono);
	}
</style>
