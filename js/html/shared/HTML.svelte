<script lang="ts">
	import { createEventDispatcher, afterUpdate, beforeUpdate } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;
	export let scroll_to_bottom: boolean = false; // Add scroll_to_bottom option

	const dispatch = createEventDispatcher<{ change: undefined }>();

	let container: HTMLDivElement;
	let autoscroll = false; // Variable to track autoscroll state

	// Detect if we are near the bottom of the container before update
	beforeUpdate(() => {
		autoscroll =
			container && container.offsetHeight + container.scrollTop > container.scrollHeight - 100;
	});

	// Function to scroll to the bottom
	const scroll = (): void => {
		if (autoscroll && scroll_to_bottom) {
			container.scrollTo(0, container.scrollHeight);
		}
	};

	// Reactively dispatch changes when value updates
	$: value, dispatch("change");

	// After update, ensure autoscroll if enabled
	afterUpdate(() => {
		scroll();
	});
</script>

<!-- Assign reference to container -->
<div
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	bind:this={container}
>
	{@html value}
</div>

<style>
	.hide {
		display: none;
	}
	.prose {
		max-height: 400px; /* Example value for height limit */
		overflow-y: auto;
	}
</style>
