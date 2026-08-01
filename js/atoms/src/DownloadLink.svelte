<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	interface DownloadLinkAttributes extends Omit<
		HTMLAnchorAttributes,
		"target" | "children"
	> {
		download: NonNullable<HTMLAnchorAttributes["download"]>;
		children?: Snippet;
	}

	let {
		href = undefined,
		download,
		children,
		...rest
	}: DownloadLinkAttributes = $props();
</script>

<a
	style:position="relative"
	class="download-link"
	data-testid="download-link"
	{href}
	target={typeof window !== "undefined" && window.__is_colab__
		? "_blank"
		: null}
	rel="noopener noreferrer"
	{download}
	{...rest}
>
	{@render children?.()}
</a>

<style>
	.unstyled-link {
		all: unset;
		cursor: pointer;
	}
</style>
