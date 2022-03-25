<script lang="ts">
	export let style: string = "";
</script>

<div {style} class="flex flex-row gap-4">
	<slot />
</div>
