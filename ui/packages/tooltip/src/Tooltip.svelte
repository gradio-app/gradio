<script lang="ts">
	export let text: string;
	export let x: number;
	export let y: number;
	export let color: string;

	let w: number;
	let h: number;
</script>

<div
	bind:offsetWidth={w}
	bind:offsetHeight={h}
	style="
		top: {y - h / 2}px;
		left: {x - w - 7}px;"
>
	<span style="background: {color}" />{text}
</div>

<style>
	div {
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: var(--size-1) 0.4rem;
		position: absolute;
		font-size: var(--scale-000);
		display: flex;
		justify-content: center;
		border-radius: var(--radius-sm);
		align-items: center;
	}

	span {
		/* inline-block w-3 h-3 mr-1 rounded-sm */
		display: inline-block;
		width: var(--size-3);
		height: var(--size-3);
		border-radius: var(--radius-xs);
		margin-right: var(--size-1);
	}
</style>
