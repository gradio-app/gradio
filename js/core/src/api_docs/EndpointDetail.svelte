<script lang="ts">
	export let api_name: string | null = null;
	export let description: string | null = null;
</script>

<h3>
	API name:
	<span class="post">{"/" + api_name}</span>
	<span class="desc">{description}</span>
</h3>

<style>
	h3 {
		color: var(--body-text-color);
		font-weight: var(--section-header-text-weight);
		font-size: var(--text-lg);
	}

	.post {
		margin-right: var(--size-2);
		border: 1px solid var(--border-color-accent);
		border-radius: var(--radius-sm);
		background: var(--color-accent-soft);
		padding-right: var(--size-1);
		padding-bottom: var(--size-1);
		padding-left: var(--size-1);
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
	}

	.desc {
		color: var(--body-text-color-subdued);
		font-size: var(--text-lg);
		margin-top: var(--size-1);
	}
</style>
