<script lang="ts">
	export let parameters = [] as any[];
	import { style_formatted_text } from "$lib/text";
</script>

{#if (parameters.length > 0 && parameters[0].name != "self") || parameters.length > 1}
	<div class="w-full">
		{#each parameters as param}
			{#if param["name"] != "self"}
				<hr class="hr" />
				<div style="margin:10px;">
					<p style="white-space: nowrap; overflow-x: auto;">
						<span class="code" style="margin-right: 10px;">{param["name"]}</span
						>
						<span class="code highlight" style="margin-right: 10px;"
							>{param["annotation"].replace("Sequence[", "list[")}</span
						>
						{#if "default" in param}
							<span> Default: </span><span
								class="code"
								style="font-size: var(--text-sm);">{param["default"]}</span
							>
						{:else if !("kwargs" in param)}<span style="font-weight:bold"
								>Required</span
							>{/if}
					</p>
					<p class="desc">
						{@html style_formatted_text(param["doc"]) || ""}
					</p>
				</div>
			{/if}
		{/each}
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
</style>
