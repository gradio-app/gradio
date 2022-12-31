<script lang="ts">
	export let size: "small" | "large" = "small";
</script>

<div
	class="empty"
	class:small={size === "small"}
	class:large={size === "large"}
>
	<div class="icon">
		<slot />
	</div>
</div>

<style>
	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--size-full);
	}

	.icon {
		opacity: 0.5;
		height: var(--size-5);
		color: var(--color-text-body);
	}

	.small {
		min-height: var(--size-32);
	}

	.large {
		min-height: var(--size-64);
	}
</style>
