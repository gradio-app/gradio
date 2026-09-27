<script lang="ts">
	let {
		value,
		type,
		index,
		samples_dir,
		badge
	}: {
		value?: any;
		type?: string;
		index?: number;
		samples_dir?: string;
		badge?: string;
	} = $props();
</script>

<span data-testid="dataset-context"
	>{value}|{type}|{index}|{samples_dir}|{badge ?? "no-badge"}</span
>
