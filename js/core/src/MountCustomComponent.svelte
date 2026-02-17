<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  let { node, children, ...rest } = $props();

  let component = $derived(await node.component);
  let runtime = $derived(
    (await node.runtime) as {
      mount: typeof import("svelte").mount;
      umount: typeof import("svelte").unmount;
    },
  );
  let el: HTMLElement = $state(null);
  let comp;

  $effect(() => {
    console.log({ el, comp, runtime });
    if (el && !comp && runtime) {
      comp = runtime.mount(component.default, {
        target: el,

        props: {
          shared_props: node.props.shared_props,
          props: node.props.props,
          children,
        },
      });
    }
  });

  onDestroy(() => {
    if (comp) {
      runtime.umount(comp);
    }
  });
</script>

<span bind:this={el}></span>
