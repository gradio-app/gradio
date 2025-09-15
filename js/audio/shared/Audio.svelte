<script lang="ts">
	import type { HTMLAudioAttributes } from "svelte/elements";
	import { createEventDispatcher } from "svelte";
	interface Props extends HTMLAudioAttributes {
		"data-testid"?: string;
	}
	type $$Props = Props;

	export let src: HTMLAudioAttributes["src"] = undefined;

	const dispatch = createEventDispatcher();
</script>

<audio
	{src}
	{...$$restProps}
	on:play={dispatch.bind(null, "play")}
	on:pause={dispatch.bind(null, "pause")}
	on:ended={dispatch.bind(null, "ended")}
/>
