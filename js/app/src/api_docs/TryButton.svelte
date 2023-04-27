<script lang="ts">
	import { Button } from "@gradio/button";

	export let dependency_index: number;
	export let named: boolean;
	export let run: (id: number) => Promise<void>;
</script>

<span class="space" />
<Button
	variant="primary"
	on:click={run.bind(null, dependency_index)}
	style={{ full_width: true }}
>
	Try It Out
</Button>

<style>
	.space {
		display: flex;
		flex-basis: 1;
		margin-top: var(--size-4);
	}
</style>
