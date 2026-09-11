<script lang="ts">
	let {
		props
	}: {
		props: { value: string; on_mount: () => void };
	} = $props();

	props.on_mount();
	const value = props.value;
</script>

<div>{value}</div>
