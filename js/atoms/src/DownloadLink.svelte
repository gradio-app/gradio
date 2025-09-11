<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { createEventDispatcher } from "svelte";

	interface DownloadLinkAttributes
		extends Omit<HTMLAnchorAttributes, "target"> {
		download: NonNullable<HTMLAnchorAttributes["download"]>;
	}
	type $$Props = DownloadLinkAttributes;

	export let href: DownloadLinkAttributes["href"] = undefined;
	export let download: DownloadLinkAttributes["download"];

	const dispatch = createEventDispatcher();
</script>

<a
	style:position="relative"
	class="download-link"
	{href}
	target={typeof window !== "undefined" && window.__is_colab__
		? "_blank"
		: null}
	rel="noopener noreferrer"
	{download}
	{...$$restProps}
	on:click={dispatch.bind(null, "click")}
>
	<slot />
</a>

<style>
	.unstyled-link {
		all: unset;
		cursor: pointer;
	}
</style>
