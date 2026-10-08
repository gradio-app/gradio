<script lang="ts">
	import { onDestroy } from "svelte";
	import type { Component } from "svelte";
	import type { StreamState } from "../types";

	let {
		stream_state = "closed",
		audio_source,
		icon = undefined,
		pulse_color = "var(--color-accent)",
		icon_radius = 50
	}: {
		stream_state?: StreamState;
		audio_source: () => MediaStream | null;
		icon?: string | Component | undefined;
		pulse_color?: string;
		icon_radius?: number;
	} = $props();

	let audio_context: AudioContext | null = null;
	let analyser: AnalyserNode;
	let data: Uint8Array<ArrayBuffer>;
	let animation_id: number;
	let pulse_scale = $state(1);
	let pulse_intensity = $state(0);
	let max_pulse_scale = $derived(1 + pulse_intensity * 10);

	$effect(() => {
		if (stream_state === "open") setup_audio_context();
	});

	onDestroy(() => {
		if (animation_id) cancelAnimationFrame(animation_id);
		audio_context?.close();
	});

	function setup_audio_context(): void {
		const source_stream = audio_source();
		if (!source_stream || audio_context) return;
		audio_context = new AudioContext();
		analyser = audio_context.createAnalyser();
		audio_context.createMediaStreamSource(source_stream).connect(analyser);
		analyser.fftSize = 64;
		analyser.smoothingTimeConstant = 0.8;
		data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
		update();
	}

	function update(): void {
		analyser.getByteFrequencyData(data);
		const average = data.reduce((a, b) => a + b, 0) / data.length / 255;
		pulse_scale = 1 + average * 0.15;
		pulse_intensity = average;
		animation_id = requestAnimationFrame(update);
	}
</script>

<div class="icon-wrapper">
	<div class="pulsing-icon-container">
		{#if pulse_intensity > 0}
			{#each Array(3) as _, i}
				<div
					class="pulse-ring"
					style:background={pulse_color}
					style:animation-delay={`${i * 0.4}s`}
					style:--max-scale={max_pulse_scale}
					style:opacity={0.5 * pulse_intensity}
				></div>
			{/each}
		{/if}
		<div class="pulsing-icon" style:transform={`scale(${pulse_scale})`}>
			{#if typeof icon === "string"}
				<img
					src={icon}
					alt="Audio visualization icon"
					class="icon-image"
					style:border-radius={`${icon_radius}%`}
				/>
			{:else if icon}
				{@const Icon = icon}
				<div><Icon /></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.icon-wrapper {
		position: relative;
		display: flex;
		max-height: 128px;
		justify-content: center;
		align-items: center;
	}

	.pulsing-icon-container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.pulsing-icon {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		transition: transform 0.1s ease;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2;
	}

	.icon-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.pulse-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 100%;
		border-radius: 50%;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		opacity: 0.5;
		min-width: 18px;
		min-height: 18px;
	}

	@keyframes pulse {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.5;
		}
		100% {
			transform: translate(-50%, -50%) scale(var(--max-scale, 3));
			opacity: 0;
		}
	}
</style>
