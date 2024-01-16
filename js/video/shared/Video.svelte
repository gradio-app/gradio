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

	export let processingVideo = false;

	let resolved_src: typeof src;

	// The `src` prop can be updated before the Promise from `resolve_wasm_src` is resolved.
	// In such a case, the resolved value for the old `src` has to be discarded,
	// This variable `latest_src` is used to pick up only the value resolved for the latest `src` prop.
	let latest_src: typeof src;
	$: {
		// In normal (non-Wasm) Gradio, the `<img>` element should be rendered with the passed `src` props immediately
		// without waiting for `resolve_wasm_src()` to resolve.
		// If it waits, a blank element is displayed until the async task finishes
		// and it leads to undesirable flickering.
		// So set `src` to `resolved_src` here.
		resolved_src = src;

		latest_src = src;
		const resolving_src = src;
		resolve_wasm_src(resolving_src).then((s) => {
			if (latest_src === resolving_src) {
				resolved_src = s;
			}
		});
	}

	const dispatch = createEventDispatcher();
</script>

<!--
The spread operator with `$$props` or `$$restProps` can't be used here
to pass props from the parent component to the <video> element
because of its unexpected behavior: https://github.com/sveltejs/svelte/issues/7404
For example, if we add {...$$props} or {...$$restProps}, the boolean props aside it like `controls` will be compiled as string "true" or "false" on the actual DOM.
Then, even when `controls` is false, the compiled DOM would be `<video controls="false">` which is equivalent to `<video controls>` since the string "false" is even truthy.
-->
<div class:hidden={!processingVideo} class="overlay">
	<span class="load-wrap">
		<span class="loader" />
	</span>
</div>
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
	crossorigin="anonymous"
>
	<slot />
</video>

<style>
	.overlay {
		position: absolute;
		background-color: rgba(0, 0, 0, 0.4);
		width: 100%;
		height: 100%;
	}

	.hidden {
		display: none;
	}

	.load-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.loader {
		display: flex;
		position: relative;
		background-color: var(--border-color-accent-subdued);
		animation: shadowPulse 2s linear infinite;
		box-shadow:
			-24px 0 var(--border-color-accent-subdued),
			24px 0 var(--border-color-accent-subdued);
		margin: var(--spacing-md);
		border-radius: 50%;
		width: 10px;
		height: 10px;
		scale: 0.5;
	}

	@keyframes shadowPulse {
		33% {
			box-shadow:
				-24px 0 var(--border-color-accent-subdued),
				24px 0 #fff;
			background: #fff;
		}
		66% {
			box-shadow:
				-24px 0 #fff,
				24px 0 #fff;
			background: var(--border-color-accent-subdued);
		}
		100% {
			box-shadow:
				-24px 0 #fff,
				24px 0 var(--border-color-accent-subdued);
			background: #fff;
		}
	}
</style>
