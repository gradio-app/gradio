<script lang="ts">
	export let style: string = "";
</script>

<div {style} class="flex flex-1 flex-col gap-2 relative">
	<slot />
</div>
