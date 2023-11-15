<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";

	interface DownloadLinkAttributes
		extends Omit<HTMLAnchorAttributes, "target"> {
		href: NonNullable<HTMLAnchorAttributes["href"]>;
		download: NonNullable<HTMLAnchorAttributes["download"]>;
	}
	type $$Props = DownloadLinkAttributes;

	import { resolve_wasm_src } from ".";

	export let href: DownloadLinkAttributes["href"];
	export let download: DownloadLinkAttributes["download"];
</script>

{#await resolve_wasm_src(href) then resolved_href}
	<a
		href={resolved_href}
		target={window.__is_colab__ ? "_blank" : null}
		{download}
		{...$$restProps}
	>
		<slot />
	</a>
{:catch error}
	<p style="color: red;">{error.message}</p>
{/await}
