<script lang="ts">
	export let parameters = [] as any[];
	import { style_formatted_text } from "$lib/text";
</script>

{#if (parameters.length > 0 && parameters[0].name != "self") || parameters.length > 1}
	<div style="background-color: rgb(252 253 253);">
		{#each parameters as param}
			{#if param["name"] != "self"}
				<hr class="hr" />
				<div style="padding-left:5px">
					<p>
						<span class="code" style="font-weight:bold">{param["name"]}</span
						>
						<span class="code highlight" style="margin-left: 10px;"
							>{param["annotation"].replace("Sequence[", "list[")}</span
						>
						</p>
						<p>
						{#if "default" in param}
							<span> <em>Default: </em></span><span>{param["default"]}</span>
						{:else if !("kwargs" in param)}<em
								>Required</em
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
		height: 2px;
		background: var(--color-accent-soft);
		margin-bottom: 12px;
		margin-top:12px;
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
		color: #444;
		font-size: var(--text-lg);
		margin-top: var(--size-1);
	}
</style>
