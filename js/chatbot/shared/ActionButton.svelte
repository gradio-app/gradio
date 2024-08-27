<script lang="ts">
	export let handle_action: (action: string | null) => void;
	export let action: string;
</script>

<button
	on:click={() => {
		handle_action(action);
	}}
	aria-label={`${action} button`}
	class={`${action}-button`}
>
	<slot />
</button>

<style>
	button {
		cursor: pointer;
		color: var(--body-text-color);
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-4);
		height: var(--size-4);
	}

	button:hover,
	button:focus {
		color: var(--color-accent);
	}

	/* .selected,
	.selected:focus,
	.selected:hover {
		color: var(--color-accent);
	} */
</style>
