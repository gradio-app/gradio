<script lang="ts">
	export let style: string = "";
</script>

<div {style} class="flex flex-col md:flex-row gap-3">
	<slot />
</div>
