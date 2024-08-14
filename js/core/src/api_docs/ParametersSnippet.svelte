<script lang="ts">
	import { Loader } from "@gradio/statustracker";
	import { represent_value } from "./utils";

	export let is_running: boolean;
	export let endpoint_returns: any;
	export let js_returns: any;
	export let current_language: "python" | "javascript" | "bash";
</script>

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot" />
	</div>
	Accepts {endpoint_returns.length} parameter{#if endpoint_returns.length != 1}s{/if}:
</h4>

<div class:hide={is_running}>
	{#each endpoint_returns as { label, python_type, component, parameter_name, parameter_has_default, parameter_default }, i}
		<hr class="hr" />
		<div style="margin:10px;">
			<p style="white-space: nowrap; overflow-x: auto;">
				<span class="code" style="margin-right: 10px;"
					>{current_language !== "bash" && parameter_name
						? parameter_name
						: "[" + i + "]"}</span
				>
				<span class="code highlight" style="margin-right: 10px;"
					>{#if current_language === "python"}{python_type.type}{#if parameter_has_default && parameter_default === null}&nbsp;|
							None{/if}{:else}{js_returns[i].type || "any"}{/if}</span
				>
				{#if !parameter_has_default || current_language == "bash"}<span
						style="font-weight:bold">Required</span
					>{:else}<span> Default: </span><span
						class="code"
						style="font-size: var(--text-sm);"
						>{represent_value(parameter_default, python_type.type, "py")}</span
					>{/if}
			</p>
			<p class="desc">
				The input value that is provided in the "{label}" <!--
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
		margin-bottom: 12px;
	}

	.code {
		font-family: var(--font-mono);
		display: inline;
	}

	.highlight {
		background: var(--color-accent-soft);
		color: var(--color-accent);
		padding: var(--size-1);
	}

	.desc {
		color: var(--body-text-color-subdued);
		font-size: var(--text-lg);
		margin-top: var(--size-1);
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
		margin-right: auto;
	}
</style>
