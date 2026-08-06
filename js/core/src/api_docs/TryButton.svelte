<script lang="ts">
	import { BaseButton } from "@gradio/button";

	let {
		dependency_index,
		run
	}: {
		dependency_index: number;
		run: (id: number) => Promise<void>;
	} = $props();
</script>

<span class="space" />
<BaseButton variant="primary" onclick={run.bind(null, dependency_index)}>
	Try It Out
</BaseButton>

<style>
	.space {
		display: flex;
		flex-basis: 1;
		margin-top: var(--size-4);
	}
</style>
