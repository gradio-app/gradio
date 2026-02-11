<script lang="ts">
  import Self from "./MountComponents.svelte";
  import MountCustomComponent from "./MountCustomComponent.svelte";
  let { node, ...rest } = $props();

  $inspect(node);

  let component = $derived(await node.component);
</script>

{#if node && component}
  {#if node.props.shared_props.visible && !node.runtime}
    <svelte:component
      this={component.default}
      shared_props={node.props.shared_props}
      props={node.props.props}
    >
      {#if node.children && node.children.length}
        {#each node.children as _node}
          <Self node={_node} />
        {/each}
      {/if}
    </svelte:component>
  {:else if node.props.shared_props.visible && node.runtime}
    <MountCustomComponent {...rest} {node}>
      {#if node.children && node.children.length}
        {#each node.children as _node}
          <Self node={_node} />
        {/each}
      {/if}
    </MountCustomComponent>
  {/if}
{/if}
