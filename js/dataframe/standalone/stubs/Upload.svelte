<script lang="ts">
	export const aria_label = "";
	export const root = "";
	export const upload: any = null;
	export const stream_handler: any = null;
</script>

<div>
	<slot />
</div>

<style>
	div {
		width: 100%;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		overflow: hidden;
	}
</style>
