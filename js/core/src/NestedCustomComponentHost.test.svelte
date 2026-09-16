<script lang="ts">
	import type { Component } from "svelte";

	import MountCustomComponent from "./MountCustomComponent.svelte";

	let {
		provider,
		consumer,
		provider_runtime,
		consumer_runtime
	}: {
		provider: Component;
		consumer: Component;
		provider_runtime: Pick<
			typeof import("svelte"),
			"createRawSnippet" | "getAllContexts" | "mount" | "unmount"
		>;
		consumer_runtime: Pick<
			typeof import("svelte"),
			"createRawSnippet" | "getAllContexts" | "mount" | "unmount"
		>;
	} = $props();

	const provider_node = {
		component: Promise.resolve({ default: provider }),
		runtime: Promise.resolve(provider_runtime),
		props: { shared_props: {}, props: {} }
	};
	const consumer_node = {
		component: Promise.resolve({ default: consumer }),
		runtime: Promise.resolve(consumer_runtime),
		props: { shared_props: {}, props: {} }
	};
</script>

<MountCustomComponent node={provider_node}>
	<MountCustomComponent node={consumer_node} />
</MountCustomComponent>
