<script lang="ts">
	import { onDestroy } from "svelte";
	import PulsingIcon from "./PulsingIcon.svelte";
	import type { StreamState } from "../types";

	let {
		stream_state = "closed",
		audio_source,
		icon = null,
		icon_button_color = "var(--color-accent)",
		pulse_color = "var(--color-accent)",
		icon_radius = 50,
		pending = false
	}: {
		stream_state?: StreamState;
		audio_source: () => MediaStream | null;
		icon?: string | null;
		icon_button_color?: string;
		pulse_color?: string;
		icon_radius?: number;
		pending?: boolean;
	} = $props();

	const NUM_BANDS = 16;
	const HEIGHT = 64;
	const BASE_AMPLITUDE = 20;

	let audio_context: AudioContext | null = null;
	let analyser: AnalyserNode;
	let data: Uint8Array<ArrayBuffer>;
	let animation_id: number | null = null;
	let idle_animation_id: number | null = null;
	let wave_container = $state<HTMLDivElement>();
	let amplitudes: number[] = new Array(NUM_BANDS).fill(0.1);
	let offsets: number[] = new Array(NUM_BANDS).fill(0);
	let time = 0;
	let paths = $state(["", "", ""]);

	$effect(() => {
		if (stream_state === "open") {
			setup_audio_context();
		} else {
			teardown_audio_context();
			start_idle_animation();
		}
	});

	onDestroy(() => {
		if (animation_id) cancelAnimationFrame(animation_id);
		if (idle_animation_id) cancelAnimationFrame(idle_animation_id);
		audio_context?.close();
	});

	function start_idle_animation(): void {
		if (idle_animation_id) cancelAnimationFrame(idle_animation_id);
		amplitudes = new Array(NUM_BANDS).fill(0.1);
		offsets = new Array(NUM_BANDS).fill(0);
		update_idle();
	}

	function update_idle(): void {
		time += 0.012;
		for (let i = 0; i < NUM_BANDS; i++) {
			amplitudes[i] = 0.15 + Math.sin(time * 0.5 + i * 0.3) * 0.05;
			offsets[i] = time * (0.3 + i * 0.05);
		}
		update_paths();
		if (stream_state !== "open") {
			idle_animation_id = requestAnimationFrame(update_idle);
		}
	}

	function setup_audio_context(): void {
		const source_stream = audio_source();
		if (!source_stream || audio_context) return;
		if (idle_animation_id) cancelAnimationFrame(idle_animation_id);
		audio_context = new AudioContext();
		analyser = audio_context.createAnalyser();
		audio_context.createMediaStreamSource(source_stream).connect(analyser);
		analyser.fftSize = 128;
		analyser.smoothingTimeConstant = 0.85;
		data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
		update();
	}

	function teardown_audio_context(): void {
		if (animation_id) cancelAnimationFrame(animation_id);
		animation_id = null;
		audio_context?.close();
		audio_context = null;
	}

	function update(): void {
		analyser.getByteFrequencyData(data);
		time += 0.016;
		for (let i = 0; i < NUM_BANDS; i++) {
			const index = Math.floor((i / NUM_BANDS) * data.length);
			amplitudes[i] = (data[index] / 255) * 0.8 + 0.2;
			offsets[i] = time * (0.5 + i * 0.1);
		}
		update_paths();
		animation_id = requestAnimationFrame(update);
	}

	function update_paths(): void {
		paths = [0, 1, 2].map(generate_path);
	}

	function generate_path(wave_index: number): string {
		const width = wave_container?.clientWidth || 400;
		const center_y = HEIGHT / 2;
		const points = 100;
		const frequency = 1 + wave_index * 0.3;
		const phase = offsets[wave_index] || 0;
		let amplitude = 0;
		for (let j = 0; j < Math.min(4, amplitudes.length); j++) {
			amplitude += (amplitudes[j] || 0) / (j + 1);
		}
		amplitude = amplitude * BASE_AMPLITUDE * (0.6 + wave_index * 0.1);

		let path = "";
		for (let i = 0; i <= points; i++) {
			const x = (i / points) * width;
			const normalized_x = (i / points) * Math.PI * 4;
			const sine = Math.sin(normalized_x * frequency + phase) * amplitude;
			const cosine =
				Math.cos(normalized_x * frequency * 1.3 + phase * 0.7) *
				amplitude *
				0.3;
			const y = center_y + sine + cosine;
			path += `${i === 0 ? "M" : " L"} ${x} ${y}`;
		}
		return path;
	}
</script>

<div class="wave-wrapper">
	{#if icon && !pending}
		<div class="icon-container">
			<div class="icon" style:background={icon_button_color}>
				<PulsingIcon
					{stream_state}
					{pulse_color}
					{icon}
					{icon_radius}
					{audio_source}
				/>
			</div>
		</div>
	{:else}
		<div class="wave-container" bind:this={wave_container}>
			<svg class="wave-svg" aria-hidden="true">
				<defs>
					<linearGradient
						id="webrtc-wave-gradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="0%"
					>
						<stop
							offset="0%"
							style="stop-color:var(--color-accent);stop-opacity:0.8"
						/>
						<stop
							offset="50%"
							style="stop-color:var(--color-accent);stop-opacity:0.9"
						/>
						<stop
							offset="100%"
							style="stop-color:var(--color-accent);stop-opacity:0.8"
						/>
					</linearGradient>
					<filter id="webrtc-wave-glow">
						<feGaussianBlur stdDeviation="2" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				{#each paths as d, i}
					<path
						class="wave-path"
						{d}
						stroke="url(#webrtc-wave-gradient)"
						stroke-width={2.5 - i * 0.5}
						style:opacity={1 - i * 0.2}
						fill="none"
						filter="url(#webrtc-wave-glow)"
					/>
				{/each}
			</svg>
		</div>
	{/if}
</div>

<style>
	.wave-wrapper {
		position: relative;
		display: flex;
		min-height: 100px;
		max-height: 128px;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		width: 100%;
	}

	.wave-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 64px;
		width: 100%;
		position: relative;
	}

	.wave-svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.wave-path {
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: opacity 0.2s ease;
		vector-effect: non-scaling-stroke;
	}

	.icon-container {
		position: relative;
		width: 128px;
		height: 128px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		position: relative;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2;
	}
</style>
