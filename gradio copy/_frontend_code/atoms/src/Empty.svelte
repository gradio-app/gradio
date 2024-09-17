<script lang="ts">
	export let size: "small" | "large" = "small";
	export let unpadded_box = false;

	let el: HTMLDivElement;
	$: parent_height = compare_el_to_parent(el);

	function compare_el_to_parent(el: HTMLDivElement): boolean {
		if (!el) return false;

		const { height: el_height } = el.getBoundingClientRect();
		const { height: parent_height } =
			el.parentElement?.getBoundingClientRect() || { height: el_height };

		return el_height > parent_height + 2;
	}
</script>

<div
	class="empty"
	class:small={size === "small"}
	class:large={size === "large"}
	class:unpadded_box
	bind:this={el}
	class:small_parent={parent_height}
	aria-label="Empty value"
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
		margin-top: calc(0px - var(--size-6));
		height: var(--size-full);
	}

	.icon {
		opacity: 0.5;
		height: var(--size-5);
		color: var(--body-text-color);
	}

	.small {
		min-height: calc(var(--size-32) - 20px);
	}

	.large {
		min-height: calc(var(--size-64) - 20px);
	}

	.unpadded_box {
		margin-top: 0;
	}

	.small_parent {
		min-height: 100% !important;
	}
</style>
