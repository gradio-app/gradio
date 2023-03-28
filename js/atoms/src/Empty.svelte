<script lang="ts">
	export let size: "small" | "large" = "small";
	export let unpadded_box = false;
</script>

<div
	class="empty"
	class:small={size === "small"}
	class:large={size === "large"}
	class:unpadded_box
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
		color: var(--body-text-color);
	}

	.small {
		height: calc(var(--size-32) - 20px);
	}

	.large {
		height: calc(var(--size-64) - 20px);
	}

	.unpadded_box.small {
		min-height: var(--size-32);
	}

	.unpadded_box.large {
		min-height: var(--size-64);
	}
</style>
