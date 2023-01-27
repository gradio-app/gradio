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
	<span style="background: {color}" />
	{text}
</div>

<style>
	div {
		display: flex;
		position: absolute;
		justify-content: center;
		align-items: center;
		border-radius: var(--rounded);
		background-color: rgba(0, 0, 0, 0.8);
		padding: var(--size-1) 0.4rem;
		color: white;
		font-size: var(--scale-000);
	}

	span {
		display: inline-block;
		margin-right: var(--size-1);
		border-radius: var(--rounded-sm);
		width: var(--size-3);
		height: var(--size-3);
	}
</style>
