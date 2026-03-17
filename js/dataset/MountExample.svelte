<script lang="ts">
	import { mount, unmount } from "svelte";

	interface Props {
		component: { default: any };
		runtime: false | typeof import("svelte");
		[key: string]: any;
	}

	let { component, runtime, ...rest }: Props = $props();
	let el: HTMLElement = $state(null);

	$effect(() => {
		if (!el || !component) return;

		const _component = component;
		const _runtime = runtime;
		const _rest = rest;

		if (_runtime) {
			const mounted = _runtime.mount(_component.default, {
				target: el,
				props: _rest
			});
			return () => {
				_runtime.unmount(mounted);
			};
		} else {
			const mounted = mount(_component.default, {
				target: el,
				props: _rest
			});
			return () => {
				unmount(mounted);
			};
		}
	});
</script>

<span bind:this={el}></span>
