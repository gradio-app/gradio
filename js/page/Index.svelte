<script lang="ts">
	import Column from "@gradio/column";
	export let route: string;
	export let title: string;
</script>

<div data-route="/page{route}" style:display="none">
	<Column>
		<slot></slot>
	</Column>
</div>
