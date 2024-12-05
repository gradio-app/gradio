<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Maximize, Minimize } from "@gradio/icons";

	export let container: HTMLElement | undefined = undefined;
	const dispatch = createEventDispatcher<{
		fullscreenchange: boolean;
	}>();

	let is_full_screen = false;

	onMount(() => {
		document.addEventListener("fullscreenchange", () => {
			is_full_screen = !!document.fullscreenElement;
			dispatch("fullscreenchange", is_full_screen);
		});
	});

	const toggle_full_screen = async (): Promise<void> => {
		if (!container) return;

		if (!is_full_screen) {
			await container.requestFullscreen();
		} else {
			await document.exitFullscreen();
			is_full_screen = !is_full_screen;
		}
	};
</script>

{#if !is_full_screen}
	<IconButton
		Icon={Maximize}
		label="View in full screen"
		on:click={toggle_full_screen}
	/>
{/if}

{#if is_full_screen}
	<IconButton
		Icon={Minimize}
		label="Exit full screen"
		on:click={toggle_full_screen}
	/>
{/if}
