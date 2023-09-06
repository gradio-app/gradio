<svelte:options accessors={true} />

<script lang="ts">
	export let value = "";
</script>

<input bind:value />
