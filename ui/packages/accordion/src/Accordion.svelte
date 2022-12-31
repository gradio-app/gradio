<script lang="ts">
	export let label: string = "";
	export let open: boolean = true;
</script>

<div on:click={() => (open = !open)} class="label-wrap">
	<span>{label}</span>
	<span style:transform={open ? "rotate(0)" : "rotate(90deg)"} class="icon"
		>▼</span
	>
</div>
{#if open}
	<slot />
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		padding: var(--size-3);
		border-width: 1px;
		transition: 150ms;
		border-radius: var(--radius-lg);
		border: 1px solid;
	}

	.label-wrap {
		width: var(--size-full);
		display: flex;
		justify-content: space-between;
		cursor: pointer;
	}

	.icon {
		transition: 150ms;
	}
</style>
