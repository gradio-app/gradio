<script lang="ts">
	import { BaseButton } from "@gradio/button";

	export let dependency_index: number;
	export let run: (id: number) => Promise<void>;
</script>

<span class="space" />
<BaseButton variant="primary" on:click={run.bind(null, dependency_index)}>
	Try It Out
</BaseButton>

<style>
	.space {
		display: flex;
		flex-basis: 1;
		margin-top: var(--size-4);
	}
</style>
