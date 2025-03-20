<script lang="ts">
	export let on_click: (event: MouseEvent) => void;
</script>

<button
	aria-label="Open cell menu"
	class="cell-menu-button"
	aria-haspopup="menu"
	on:click={on_click}
	on:touchstart={(event) => {
		event.preventDefault();
		const touch = event.touches[0];
		const mouseEvent = new MouseEvent("click", {
			clientX: touch.clientX,
			clientY: touch.clientY,
			bubbles: true,
			cancelable: true,
			view: window
		});
		on_click(mouseEvent);
	}}
>
	&#8942;
</button>

<style>
	.cell-menu-button {
		flex-shrink: 0;
		display: none;
		align-items: center;
		justify-content: center;
		background-color: var(--block-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--block-radius);
		width: var(--size-5);
		height: var(--size-5);
		min-width: var(--size-5);
		padding: 0;
		margin-right: var(--spacing-sm);
		z-index: 2;
		position: absolute;
		right: var(--size-1);
		top: 50%;
		transform: translateY(-50%);
	}
</style>
