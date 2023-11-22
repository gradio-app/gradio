<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
	type $$Props = HTMLImgAttributes;

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLImgAttributes["src"] = undefined;
</script>

{#await resolve_wasm_src(src) then resolved_src}
	<!-- svelte-ignore a11y-missing-attribute -->
	<img src={resolved_src} {...$$restProps} />
{:catch error}
	<p style="color: red;">{error.message}</p>
{/await}

<style>
	img {
		max-width: 100%;
		max-height: 100%;
		border-radius: var(--radius-lg);
		max-width: none;
	}
</style>
