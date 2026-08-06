<script lang="ts">
	let {
		text,
		x,
		y,
		color
	}: {
		text: string;
		x: number;
		y: number;
		color: string;
	} = $props();

	let w = $state(0);
	let h = $state(0);
</script>

<div
	bind:offsetWidth={w}
	bind:offsetHeight={h}
	style="
		top: {y - h / 2}px;
		left: {x - w - 7}px;"
>
	<span style="background: {color}"></span>
	{text}
</div>

<style>
	div {
		display: flex;
		position: absolute;
		justify-content: center;
		align-items: center;
		border-radius: var(--radius-sm);
		background-color: rgba(0, 0, 0, 0.8);
		padding: var(--size-1) 0.4rem;
		color: white;
		font-size: var(--text-sm);
	}

	span {
		display: inline-block;
		margin-right: var(--size-1);
		border-radius: var(--radius-xs);
		width: var(--size-3);
		height: var(--size-3);
	}
</style>
