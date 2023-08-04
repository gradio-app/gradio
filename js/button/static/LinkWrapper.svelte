<script lang="ts">
	export let link: string | null;
</script>

{#if link && link.length > 0}
	<a href={link} target="_blank" rel="noreferrer">
		<slot />
	</a>
{:else}
	<slot />
{/if}
