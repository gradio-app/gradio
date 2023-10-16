<script lang="ts">
	import type { HTMLVideoAttributes } from "svelte/elements";
	import { createEventDispatcher } from "svelte";
	import { loaded } from "./utils";

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLVideoAttributes["src"] = undefined;

	export let muted: HTMLVideoAttributes["muted"] = undefined;
	export let playsinline: HTMLVideoAttributes["playsinline"] = undefined;
	export let preload: HTMLVideoAttributes["preload"] = undefined;
	export let autoplay: HTMLVideoAttributes["autoplay"] = undefined;
	export let controls: HTMLVideoAttributes["controls"] = undefined;

	export let currentTime: number | undefined = undefined;
	export let duration: number | undefined = undefined;
	export let paused: boolean | undefined = undefined;

	export let node: HTMLVideoElement | undefined = undefined;

	const dispatch = createEventDispatcher();
</script>

{#await resolve_wasm_src(src) then resolved_src}
	<!--
	The spread operator with `$$props` or `$$restProps` can't be used here
	to pass props from the parent component to the <video> element
	because of its unexpected behavior: https://github.com/sveltejs/svelte/issues/7404
	For example, if we add {...$$props} or {...$$restProps}, the boolean props aside it like `controls` will be compiled as string "true" or "false" on the actual DOM.
	Then, even when `controls` is false, the compiled DOM would be `<video controls="false">` which is equivalent to `<video controls>` since the string "false" is even truthy.
-->
	<video
		src={resolved_src}
		{muted}
		{playsinline}
		{preload}
		{autoplay}
		{controls}
		on:loadeddata={dispatch.bind(null, "loadeddata")}
		on:click={dispatch.bind(null, "click")}
		on:play={dispatch.bind(null, "play")}
		on:pause={dispatch.bind(null, "pause")}
		on:ended={dispatch.bind(null, "ended")}
		on:mouseover={dispatch.bind(null, "mouseover")}
		on:mouseout={dispatch.bind(null, "mouseout")}
		on:focus={dispatch.bind(null, "focus")}
		on:blur={dispatch.bind(null, "blur")}
		bind:currentTime
		bind:duration
		bind:paused
		bind:this={node}
		use:loaded={{ autoplay: autoplay ?? false }}
		data-testid={$$props["data-testid"]}
	>
		<slot />
	</video>
{:catch error}
	<p style="color: red;">{error.message}</p>
{/await}

<style>
	video {
		position: inherit;
		background-color: black;
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}
</style>
