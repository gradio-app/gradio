<script lang="ts">
	import { Component as Column } from "../Column";
	export let label: string;
	export let elem_id: string;
	export let visible: boolean = true;
	export let open: boolean = true;

	$: _open = open;

	const toggle = () => {
		_open = !_open;
	};
</script>

<div
	id={elem_id}
	class="container border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 "
	style:display={visible ? "block" : "none"}
>
	<div on:click={toggle} class="label-wrap">
		<span>{label}</span>
		<span style:transform={_open ? "rotate(0)" : "rotate(90deg)"} class="icon"
			>▼</span
		>
	</div>
	<Column visible={_open}>
		<slot />
	</Column>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		padding: var(--size-3);
		border-width: 1px;
		transition: 150ms;
		border-radius: var(--radius-lg);
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
