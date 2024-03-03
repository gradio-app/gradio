<script lang="ts">
	import Blocks from "@gradio/app";

	export let value: Record<any, any>;
	let self: HTMLDivElement;
</script>

<div bind:this={self}>
	<Blocks {...value} target={self} show_footer={false}></Blocks>
</div>
