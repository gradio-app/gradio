<script lang="ts">
	import { onMount } from "svelte";

	export let currentVolume = 1;
	export let show_volume_slider = false;

	let volumeElement: HTMLInputElement;

	onMount(() => {
		adjustSlider();
	});

	const adjustSlider = (): void => {
		let slider = volumeElement;
		if (!slider) return;

		slider.style.background = `linear-gradient(to right, white ${
			currentVolume * 100
		}%, rgba(255, 255, 255, 0.3) ${currentVolume * 100}%)`;
	};

	$: (currentVolume, adjustSlider());
</script>

<input
	bind:this={volumeElement}
	id="volume"
	class="volume-slider"
	type="range"
	min="0"
	max="1"
	step="0.01"
	value={currentVolume}
	on:focusout={() => (show_volume_slider = false)}
	on:input={(e) => {
		if (e.target instanceof HTMLInputElement) {
			currentVolume = parseFloat(e.target.value);
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
