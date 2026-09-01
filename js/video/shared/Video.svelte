<script lang="ts">
	import type { HTMLVideoAttributes } from "svelte/elements";
	import { loaded } from "./utils";
	import { onDestroy, type Snippet } from "svelte";

	import Hls from "hls.js";
	import { attach_hls_stream } from "@gradio/utils/hls";

	interface Props {
		src?: HTMLVideoAttributes["src"];
		muted?: HTMLVideoAttributes["muted"];
		playsinline?: HTMLVideoAttributes["playsinline"];
		preload?: HTMLVideoAttributes["preload"];
		autoplay?: HTMLVideoAttributes["autoplay"];
		controls?: HTMLVideoAttributes["controls"];
		currentTime?: number;
		duration?: number;
		paused?: boolean;
		node?: HTMLVideoElement;
		loop: boolean;
		is_stream: boolean;
		processingVideo?: boolean;
		onloadeddata?: () => void;
		onclick?: () => void;
		onplay?: () => void;
		onpause?: () => void;
		onended?: () => void;
		onmouseover?: () => void;
		onmouseout?: () => void;
		onfocus?: () => void;
		onblur?: () => void;
		onerror?: (error: string) => void;
		onloadstart?: () => void;
		onloadedmetadata?: () => void;
		"data-testid"?: string;
		children?: Snippet;
		[key: string]: any;
	}

	let {
		src = undefined,
		muted = undefined,
		playsinline = undefined,
		preload = undefined,
		autoplay = undefined,
		controls = undefined,
		currentTime = $bindable(undefined),
		duration = $bindable(undefined),
		paused = $bindable(undefined),
		node = $bindable(undefined),
		loop,
		is_stream,
		processingVideo = false,
		onloadeddata,
		onclick,
		onplay,
		onpause,
		onended,
		onmouseover,
		onmouseout,
		onfocus,
		onblur,
		onerror,
		onloadstart,
		onloadedmetadata,
		"data-testid": dataTestid,
		children
	}: Props = $props();

	let stream_active = $state(false);
	let active_hls: Hls | undefined;

	function load_stream(
		src: string | null | undefined,
		is_stream: boolean,
		node: HTMLVideoElement
	): void {
		if (!src || !is_stream) return;

		if (Hls.isSupported() && !stream_active) {
			active_hls = attach_hls_stream(node, src, {
				on_manifest_parsed: () => node.play(),
				on_unrecoverable: () => {
					active_hls = undefined;
					stream_active = false;
				}
			});
			stream_active = true;
		}
	}

	// A run re-sends its URL with every chunk, so a new URL ends the stream.
	$effect(() => {
		src;
		active_hls?.destroy();
		active_hls = undefined;
		stream_active = false;
	});

	onDestroy(() => {
		active_hls?.destroy();
	});

	$effect(() => {
		if (node && src && is_stream) {
			load_stream(src, is_stream, node);
		}
	});
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
	{src}
	{muted}
	{playsinline}
	{preload}
	{autoplay}
	{controls}
	{loop}
	onloadeddata={() => onloadeddata?.()}
	onclick={() => onclick?.()}
	onplay={() => onplay?.()}
	onpause={() => onpause?.()}
	onended={() => onended?.()}
	onmouseover={() => onmouseover?.()}
	onmouseout={() => onmouseout?.()}
	onfocus={() => onfocus?.()}
	onblur={() => onblur?.()}
	onerror={() => onerror?.("Video not playable")}
	onloadstart={() => onloadstart?.()}
	onloadedmetadata={() => onloadedmetadata?.()}
	bind:currentTime
	bind:duration
	bind:paused
	bind:this={node}
	use:loaded={{ autoplay: autoplay ?? false }}
	data-testid={dataTestid}
	crossorigin="anonymous"
>
	{#if children}
		{@render children()}
	{/if}
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
