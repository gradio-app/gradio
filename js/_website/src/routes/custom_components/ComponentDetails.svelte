<script lang="ts">
    import type { ComponentData } from "./utils";
    export let value: ComponentData | null = null;
</script>
  

  
{#if value}
    <div class="details-container">
        <h2>{value.name}</h2>
        <p>{value.author}</p>
        <p>{value.description}</p>
        <p>Install with `pip install {value.name}`</p>
        <!-- Add more details as needed -->
    </div>
{/if}


<style>
.details-container {
    padding: 16px;
}
</style>