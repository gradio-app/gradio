<script lang="ts">
	import { onMount } from "svelte";

	interface Props {
		current_volume?: number;
		show_volume_slider?: boolean;
	}

	let {
		current_volume = $bindable(1),
		show_volume_slider = $bindable(false)
	}: Props = $props();

	let volume_element: HTMLInputElement | undefined = $state();

	onMount(() => {
		adjustSlider();
	});

	const adjustSlider = (): void => {
		let slider = volume_element;
		if (!slider) return;

		slider.style.background = `linear-gradient(to right, white ${
			current_volume * 100
		}%, rgba(255, 255, 255, 0.3) ${current_volume * 100}%)`;
	};

	$effect(() => {
		current_volume;
		adjustSlider();
	});
</script>

<input
	bind:this={volume_element}
	id="volume"
	class="volume-slider"
	type="range"
	min="0"
	max="1"
	step="0.01"
	value={current_volume}
	onfocusout={() => (show_volume_slider = false)}
	oninput={(e) => {
		if (e.target instanceof HTMLInputElement) {
			current_volume = parseFloat(e.target.value);
		}
	}}
/>

<style>
	.volume-slider {
		-webkit-appearance: none;
		appearance: none;
		width: var(--size-20);
		accent-color: var(--color-accent);
		height: 4px;
		cursor: pointer;
		outline: none;
		border-radius: 15px;
		background-color: rgba(255, 255, 255, 0.3);
		margin-left: var(--spacing-sm);
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: 15px;
		width: 15px;
		background-color: white;
		border-radius: 50%;
		border: none;
		transition: 0.2s ease-in-out;
	}

	input[type="range"]::-moz-range-thumb {
		height: 15px;
		width: 15px;
		background-color: white;
		border-radius: 50%;
		border: none;
		transition: 0.2s ease-in-out;
	}
</style>
