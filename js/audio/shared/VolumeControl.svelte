<script lang="ts">
	import { onMount } from "svelte";
	import WaveSurfer from "wavesurfer.js";

	let {
		currentVolume = $bindable(),
		show_volume_slider = $bindable(),
		waveform
	}: {
		currentVolume?: number;
		show_volume_slider?: boolean;
		waveform: WaveSurfer | undefined;
	} = $props();

	let volumeElement: HTMLInputElement;

	onMount(() => {
		adjustSlider();
	});

	const adjustSlider = (): void => {
		let slider = volumeElement;
		if (!slider) return;

		slider.style.background = `linear-gradient(to right, var(--color-accent) ${
			currentVolume * 100
		}%, var(--neutral-400) ${currentVolume * 100}%)`;
	};

	$effect(() => {
		currentVolume;
		adjustSlider();
	});
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
	onfocusout={() => (show_volume_slider = false)}
	oninput={(e) => {
		if (e.target instanceof HTMLInputElement) {
			currentVolume = parseFloat(e.target.value);
			waveform?.setVolume(currentVolume);
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
		background-color: var(--neutral-400);
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: 15px;
		width: 15px;
		background-color: var(--color-accent);
		border-radius: 50%;
		border: none;
		transition: 0.2s ease-in-out;
	}

	input[type="range"]::-moz-range-thumb {
		height: 15px;
		width: 15px;
		background-color: var(--color-accent);
		border-radius: 50%;
		border: none;
		transition: 0.2s ease-in-out;
	}
</style>
