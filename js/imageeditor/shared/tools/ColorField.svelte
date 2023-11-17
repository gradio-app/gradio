<script lang="ts">
	import { Eyedropper } from "@gradio/icons";
	import { createEventDispatcher } from "svelte";

	import tinycolor from "tinycolor2";
	export let color: string;

	export let current_mode: "hex" | "rgb" | "hsl" = "hex";

	const dispatch = createEventDispatcher<{
		selected: string;
	}>();
	const modes = [
		["Hex", "hex"],
		["RGB", "rgb"],
		["HSL", "hsl"]
	] as const;

	function format_color(color: string, mode: "hex" | "rgb" | "hsl"): string {
		if (mode === "hex") {
			return tinycolor(color).toHexString();
		} else if (mode === "rgb") {
			return tinycolor(color).toRgbString();
		}
		return tinycolor(color).toHslString();
	}

	$: color_string = format_color(color, current_mode);
	$: color_string && dispatch("selected", color_string);

	// function to request eyedropper
	function request_eyedropper(): void {
		// @ts-ignore
		const eyeDropper = new EyeDropper();

		eyeDropper.open().then((result: { sRGBHex: string }) => {
			color = result.sRGBHex;
		});
	}

	//@ts-ignore
	const eyedropper_supported = !!window.EyeDropper;
</script>

<div class="input">
	<div class="swatch" style:background={color}></div>
	<div>
		<div class="input-wrap">
			<input
				type="text"
				style:color="var(--neutral-700)"
				value={color_string}
				on:change={(e) => (color = e.currentTarget.value)}
			/>

			<button class="eyedropper" on:click={request_eyedropper}>
				{#if eyedropper_supported}
					<Eyedropper />
				{/if}
			</button>
		</div>
		<div class="buttons">
			{#each modes as [label, value]}
				<button
					class="button"
					class:active={current_mode === value}
					on:click={() => (current_mode = value)}>{label}</button
				>
			{/each}
		</div>
	</div>
</div>

<style>
	.input {
		display: flex;
		align-items: center;
		/* gap: 10px; */
		padding: 0 10px 15px;
	}

	.input input {
		height: 30px;
		width: 100%;
		flex-shrink: 1;
		border-bottom-left-radius: 0;
		border: 1px solid var(--block-border-color);
		letter-spacing: -0.05rem;
		border-left: none;
		border-right: none;
		font-family: var(--font-mono);
		font-size: var(--scale-000);
		padding-left: 15px;
		padding-right: 0;
	}

	.swatch {
		width: 50px;
		height: 50px;
		border-top-left-radius: 15px;
		border-bottom-left-radius: 15px;
		flex-shrink: 0;
		border: 1px solid var(--block-border-color);
	}

	.buttons button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--block-border-color);
		background: var(--background-fill-secondary);
		padding: 3px 6px;
		font-size: var(--scale-000);
		cursor: pointer;
		border-right: none;
		width: 100%;
		border-top: none;
	}

	.buttons button:first-child {
		border-left: none;
	}

	.buttons button:last-child {
		border-bottom-right-radius: 15px;
		border-right: 1px solid var(--block-border-color);
	}

	.buttons button:hover {
		background: var(--background-fill-secondary-hover);
		font-weight: var(--weight-bold);
	}

	.buttons button.active {
		background: var(--background-fill-secondary);
		font-weight: var(--weight-bold);
	}

	.buttons {
		height: 20px;

		display: flex;
		justify-content: stretch;
		gap: 0px;
		/* padding: 0 10px; */
	}

	.input-wrap {
		display: flex;
	}

	.eyedropper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 25px;
		height: 30px;
		border-top-right-radius: 15px;
		border: 1px solid var(--block-border-color);
		border-left: none;
		background: var(--background-fill-primary);
		height: 30px;
		padding: 7px 7px 5px 0px;
		cursor: pointer;
	}
</style>
