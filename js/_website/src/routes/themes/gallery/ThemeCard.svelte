<script lang="ts">
	import type { ThemeData } from "./types";

	export let theme: ThemeData;
	export let on_click: () => void;
	export let dark: boolean = false;

	$: current_bg = dark ? theme.colors.background_dark : theme.colors.background;
	$: is_dark = is_color_dark(current_bg);

	function is_color_dark(hex: string): boolean {
		const rgb = hex_to_rgb(hex);
		if (!rgb) return false;
		const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
		return luminance < 0.5;
	}

	function hex_to_rgb(hex: string): { r: number; g: number; b: number } | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				}
			: null;
	}

	function adjust_color(hex: string, amount: number): string {
		const rgb = hex_to_rgb(hex);
		if (!rgb) return hex;
		const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n)));
		const toHex = (c: number) => c.toString(16).padStart(2, "0");
		return `#${toHex(clamp(rgb.r + amount))}${toHex(clamp(rgb.g + amount))}${toHex(clamp(rgb.b + amount))}`;
	}

	function mix_color(hex: string, opacity: number): string {
		return `${hex}${Math.round(opacity * 255)
			.toString(16)
			.padStart(2, "0")}`;
	}
</script>

<div
	on:click={(event) => {
		on_click();
		event.stopPropagation();
	}}
	on:keydown={(event) => {
		if (event.key === "Enter" || event.key === " ") {
			on_click();
			event.preventDefault();
		}
	}}
	role="button"
	tabindex="0"
	class="card-container cursor-pointer group relative rounded-xl overflow-hidden border"
	style="
		background: {current_bg};
		border-color: {is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
	"
>
	<div class="p-2.5">
		<div
			class="text-[11px] font-semibold truncate mb-2"
			style="color: {is_dark ? '#ffffff' : '#1f2937'};"
		>
			{theme.name}
		</div>

		<div class="flex gap-2">
			<div class="flex-1 space-y-1.5">
				<div
					class="rounded p-1.5 border"
					style="
						background: {is_dark ? adjust_color(current_bg, 15) : '#ffffff'};
						border-color: {is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
					"
				>
					<div
						class="text-[8px] font-medium mb-0.5"
						style="color: {is_dark ? '#a0a0a0' : '#6b7280'};"
					>
						Prompt
					</div>
					<div
						class="text-[9px] leading-tight"
						style="color: {is_dark ? '#e0e0e0' : '#374151'}; font-family: '{theme.fonts.main}', sans-serif;"
					>
						A serene mountain...
					</div>
				</div>

				<div
					class="rounded p-1.5 border"
					style="
						background: {is_dark ? adjust_color(current_bg, 15) : '#ffffff'};
						border-color: {is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
					"
				>
					<div class="flex justify-between items-center mb-1">
						<span
							class="text-[8px] font-medium"
							style="color: {is_dark ? '#a0a0a0' : '#6b7280'};"
						>
							Steps
						</span>
						<span
							class="text-[8px] font-mono"
							style="color: {theme.colors.primary};"
						>
							25
						</span>
					</div>
					<div
						class="h-1 rounded-full relative"
						style="background: {is_dark
							? 'rgba(255,255,255,0.1)'
							: 'rgba(0,0,0,0.1)'};"
					>
						<div
							class="absolute left-0 top-0 h-full rounded-full"
							style="background: {theme.colors.primary}; width: 50%;"
						></div>
					</div>
				</div>

				<button
					class="w-full py-1 rounded text-[9px] font-semibold"
					style="
						background: {theme.colors.primary};
						color: {is_color_dark(theme.colors.primary) ? '#ffffff' : '#000000'};
					"
				>
					Generate
				</button>
			</div>

			<div class="flex-1 space-y-1.5">
				<div
					class="rounded p-1.5 border"
					style="
						background: {is_dark ? adjust_color(current_bg, 15) : '#ffffff'};
						border-color: {is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
					"
				>
					<div
						class="text-[7px] mb-0.5"
						style="color: {is_dark ? '#a0a0a0' : '#6b7280'};"
					>
						Font
					</div>
					<div
						class="text-[10px] font-medium leading-tight"
						style="color: {is_dark
							? '#e0e0e0'
							: '#374151'}; font-family: '{theme.fonts.main}', sans-serif;"
					>
						{theme.fonts.main}
					</div>
				</div>

				<div
					class="rounded p-1.5 border flex items-center gap-1.5"
					style="
						background: {is_dark ? adjust_color(current_bg, 15) : '#ffffff'};
						border-color: {is_dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
					"
				>
					<div
						class="w-3 h-3 rounded-sm flex items-center justify-center"
						style="background: {theme.colors.primary};"
					>
						<svg
							class="w-2 h-2 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="3"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<span
						class="text-[8px]"
						style="color: {is_dark ? '#e0e0e0' : '#374151'};">Enabled</span
					>
				</div>

				<button
					class="w-full py-1 rounded text-[8px] font-medium border"
					style="
						background: transparent;
						border-color: {theme.colors.neutral};
						color: {theme.colors.neutral};
					"
				>
					Secondary
				</button>
			</div>
		</div>
	</div>
	<div
		class="px-2.5 py-1.5 flex items-center justify-between border-t"
		style="
			background: {is_dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
			border-color: {is_dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
		"
	>
		<div class="flex items-center gap-1.5">
			{#if theme.is_official}
				<span
					class="px-1 py-0.5 rounded text-[8px] font-medium"
					style="
						background: {mix_color(theme.colors.primary, 0.15)};
						color: {theme.colors.primary};
					"
				>
					Official
				</span>
			{:else if theme.likes > 0}
				<span
					class="flex items-center gap-0.5 text-[8px]"
					style="color: {is_dark ? '#a0a0a0' : '#6b7280'};"
				>
					<svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
							clip-rule="evenodd"
						/>
					</svg>
					{theme.likes}
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-1">
			<div
				class="w-2.5 h-2.5 rounded-full"
				style="background: {theme.colors
					.primary}; box-shadow: 0 0 0 1px {is_dark
					? 'rgba(255,255,255,0.1)'
					: 'rgba(0,0,0,0.1)'};"
			></div>
			<div
				class="w-2.5 h-2.5 rounded-full"
				style="background: {theme.colors
					.neutral}; box-shadow: 0 0 0 1px {is_dark
					? 'rgba(255,255,255,0.1)'
					: 'rgba(0,0,0,0.1)'};"
			></div>
		</div>
	</div>
</div>

<style>
	.card-container {
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.card-container:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
	}
</style>
