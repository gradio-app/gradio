<script lang="ts">
	import type { Payload, Dependency } from "../types";
	import { BaseButton as Button } from "@gradio/button";

	export let api_calls: Payload[] = [];
	export let dependencies: Dependency[];
</script>

<div id="api-recorder">
	<Button size="sm" variant="secondary">
		<div class="loading-dot self-baseline"></div>
		<p class="self-baseline">Recording API Calls:</p>
		<p class="self-baseline api-section">
			<span class="api-count">
				[{api_calls.length}]
			</span>
			{#if api_calls.length > 0}
				<span class="api-name"
					>/{dependencies[api_calls[api_calls.length - 1].fn_index]
						.api_name}</span
				>
			{/if}
		</p>
	</Button>
</div>

<style>
	.api-name {
		font-size: var(--text-sm);
		font-family: var(--font-mono);
		color: #fd7b00;
	}
	.loading-dot {
		position: relative;
		left: -9999px;
		width: 10px;
		height: 10px;
		border-radius: 5px;
		background-color: #fd7b00;
		color: #fd7b00;
		box-shadow: 9999px 0 0 -1px;
		animation: loading-dot 2s infinite linear;
		animation-delay: 0.25s;
		margin-left: 0.25rem;
		margin-right: 0.5rem;
	}
	:global(.docs-wrap .sm.secondary) {
		padding-top: 1px;
		padding-bottom: 1px;
	}
	.self-baseline {
		align-self: baseline;
	}
	@keyframes loading-dot {
		0% {
			box-shadow: 9999px 0 0 -1px;
		}
		50% {
			box-shadow: 9999px 0 0 2px;
		}
		100% {
			box-shadow: 9999px 0 0 -1px;
		}
	}
	.api-count {
		font-weight: bold;
		color: #fd7b00;
		align-self: baseline;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}
	.api-section {
		margin-left: 4px;
	}
</style>
