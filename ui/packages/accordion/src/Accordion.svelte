<script lang="ts">
	export let label: string = "";
	export let open: boolean = true;
</script>

<div on:click={() => (open = !open)} class="label-wrap">
	<span>{label}</span>
	<span style:transform={open ? "rotate(0)" : "rotate(90deg)"} class="icon">
		▼
	</span>
</div>
{#if open}
	<slot />
{/if}

<style>
	.label-wrap {
		display: flex;
		justify-content: space-between;
		cursor: pointer;
		width: var(--size-full);
	}

	.icon {
		transition: 150ms;
	}
</style>
