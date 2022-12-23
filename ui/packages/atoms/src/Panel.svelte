<div>
	<slot />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		background: var(--color-background-secondary);
		padding: var(--size-4);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-primary);
	}

	div > :global(* + *) {
		margin-top: var(--size-2);
	}
</style>
