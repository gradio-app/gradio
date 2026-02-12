<script lang="ts">
	import type { HTMLAudioAttributes } from "svelte/elements";

	let {
		src = undefined,
		onplay,
		onpause,
		onended,
		...restProps
	}: HTMLAudioAttributes & {
		onplay?: () => void;
		onpause?: () => void;
		onended?: () => void;
	} = $props();
</script>

<audio {src} {...restProps} {onplay} {onpause} {onended} />
