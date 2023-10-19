<script lang="ts">
	import { Loader } from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";

	export let is_running: boolean;
	export let endpoint_returns: any;
	export let js_returns: any;
	export let current_language: "python" | "javascript";
</script>

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot" />
	</div>
	Return Type(s)
</h4>
<Block>
	<div class="response-wrap">
		<div class:hide={is_running}>
			{#if endpoint_returns.length > 1}({/if}
			{#each endpoint_returns as { label, type, python_type, component, serializer }, i}
				<div class:second-level={endpoint_returns.length > 1}>
					<span class="desc"
						><!--
					--> # {#if current_language === "python"}{python_type.type}{#if python_type?.description}&nbsp;({python_type.description}){/if}{:else}{js_returns[
								i
							].type}{#if js_returns[i].description}&nbsp;({js_returns[i]
									.description}){/if}{/if}
						<!--
					-->representing output in '{label}' <!--
					-->{component}
						component<!--
					--></span
					>{#if endpoint_returns.length > 1},{/if}
				</div>
			{/each}
			{#if endpoint_returns.length > 1}){/if}
		</div>
		{#if is_running}
			<div class="load-wrap">
				<Loader margin={false} />
			</div>
		{/if}
	</div>
</Block>

<style>
	.load-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
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
		margin-left: auto;
		border-radius: var(--radius-full);
		background: var(--color-grey-700);
		width: 6px;
		height: 6px;
	}

	.response-wrap {
		font-family: var(--font-mono);
	}

	.desc {
		color: var(--body-text-color-subdued);
	}

	.hide {
		display: none;
	}

	.second-level {
		margin-left: var(--size-4);
	}
</style>
