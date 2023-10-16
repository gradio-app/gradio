<script lang="ts">
	import type { HTMLAudioAttributes } from "svelte/elements";
	import { createEventDispatcher } from "svelte";
	import { loaded, type LoadedParams } from "../shared/utils";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLAudioAttributes["src"] = undefined;

	export let autoplay: LoadedParams["autoplay"] = undefined;
	export let crop_values: LoadedParams["crop_values"] = undefined;
	export let controls: HTMLAudioAttributes["controls"] = undefined;
	export let preload: HTMLAudioAttributes["preload"] = undefined;

	export let node: HTMLAudioElement | undefined = undefined;

	const dispatch = createEventDispatcher();
</script>

{#await resolve_wasm_src(src) then resolved_src}
	<audio
		src={resolved_src}
		{controls}
		{preload}
		on:play={dispatch.bind(null, "play")}
		on:pause={dispatch.bind(null, "pause")}
		on:ended={dispatch.bind(null, "ended")}
		bind:this={node}
		use:loaded={{ autoplay, crop_values }}
		data-testid={$$props["data-testid"]}
	/>
{:catch error}
	<p style="color: red;">{error.message}</p>
{/await}


<style>
	audio {
		padding: var(--size-2);
		width: var(--size-full);
		height: var(--size-14);
	}
</style>