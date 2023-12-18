<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { createEventDispatcher } from "svelte";

	interface DownloadLinkAttributes
		extends Omit<HTMLAnchorAttributes, "target"> {
		download: NonNullable<HTMLAnchorAttributes["download"]>;
	}
	type $$Props = DownloadLinkAttributes;

	import { resolve_wasm_src } from ".";

	export let href: DownloadLinkAttributes["href"] = undefined;
	export let download: DownloadLinkAttributes["download"];

	const dispatch = createEventDispatcher();
</script>

{#await resolve_wasm_src(href) then resolved_href}
	<a
		href={resolved_href}
		target={window.__is_colab__ ? "_blank" : null}
		rel="noopener noreferrer"
		{download}
		{...$$restProps}
		on:click={dispatch.bind(null, "click")}
	>
		<slot />
	</a>
{:catch error}
	<p style="color: red;">{error.message}</p>
{/await}
