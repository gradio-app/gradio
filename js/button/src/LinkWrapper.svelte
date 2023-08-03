<script lang="ts">
	export let link: string | null;
</script>

{#if link && link.length > 0}
	<div {...$$restProps}>
		<slot />
	</div>
{:else}
	<slot />
{/if}
