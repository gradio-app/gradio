<script lang="ts">
  import { onMount } from "svelte";
  let { node, children, ...rest } = $props();

  // $inspect(node);

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
    if (el && !comp) {
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

  onMount(() => {
    console.log("Mounted custom component", { component, runtime, el });

    // return () => {
    //   runtime.umount(component);
    // };
  });
</script>

<span bind:this={el}></span>
