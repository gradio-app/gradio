<script lang="ts">
    import { JsonView } from '@zerodevx/svelte-json-view'
  
    export let value: any = {}
</script>
  
<JsonView json={value} />