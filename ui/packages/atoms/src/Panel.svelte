<div>
	<slot />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--rounded-xl);
		background: var(--color-background-secondary);
		padding: var(--size-4);
	}

	div > :global(* + *) {
		margin-top: var(--size-2);
	}
</style>
