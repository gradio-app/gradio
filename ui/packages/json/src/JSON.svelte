<script lang="ts">
	import JSONNode from "./JSONNode.svelte";

	export let value: any = {};
	export let style: string = "";
</script>

<div class="output-json font-mono leading-relaxed w-full">
	<JSONNode {value} depth={0} />
</div>

<style lang="postcss" global>
	.output-text[theme="default"] {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>
