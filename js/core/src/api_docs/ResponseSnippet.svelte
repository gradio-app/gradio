<script lang="ts">
	import { Loader } from "@gradio/statustracker";

	export let is_running: boolean;
	export let endpoint_returns: any;
	export let js_returns: any;
	export let current_language: "python" | "javascript" | "bash";
</script>

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot toggle-right" />
	</div>
	Returns {#if endpoint_returns.length > 1}
		{current_language == "python" ? "tuple" : "list"} of {endpoint_returns.length}
		elements{:else}
		1 element{/if}
</h4>

<div class:hide={is_running}>
	{#each endpoint_returns as { label, type, python_type, component, serializer }, i}
		<hr class="hr" />
		<div style="margin:10px;">
			<p>
				{#if endpoint_returns.length > 1}
					<span class="code">[{i}]</span>
				{/if}
				<span class="code highlight"
					>{#if current_language === "python"}{python_type.type}{:else}{js_returns[
							i
						].type}{/if}</span
				>
			</p>
			<p class="desc">
				The output value that appears in the "{label}" <!--
	-->{component}
				component<!--
	-->.
			</p>
		</div>
	{/each}
</div>
{#if is_running}
	<div class="load-wrap">
		<Loader margin={false} />
	</div>
{/if}

<style>
	.hr {
		border: 0;
		height: 1px;
		background: var(--color-accent-soft);
	}
	.code {
		font-family: var(--font-mono);
		margin-right: 10px;
	}

	.highlight {
		background: var(--color-accent-soft);
		color: var(--color-accent);
		padding: var(--size-1);
	}

	.desc {
		color: var(--body-text-color-subdued);
		font-size: var(--text-lg);
	}

	h4 {
		display: flex;
		align-items: center;
		margin-top: var(--size-6);
		margin-bottom: var(--size-3);
		color: var(--body-text-color);
		font-weight: var(--weight-bold);
	}

	.toggle-icon {
		display: flex;
		align-items: center;
		margin-right: var(--size-2);
		border-radius: var(--radius-full);
		background: var(--color-grey-300);
		width: 12px;
		height: 4px;
	}

	.toggle-dot {
		border-radius: var(--radius-full);
		background: var(--color-grey-700);
		width: 6px;
		height: 6px;
		margin-left: auto;
	}
</style>
