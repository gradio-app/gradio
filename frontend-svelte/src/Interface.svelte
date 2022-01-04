<script>
  export let input_components;
  export let output_components;
</script>

<div class="gradio_interface">
  <div class="panels">
    <div class="panel">
      <div class="component_set">
        {#each input_components as input_component, i}
        <div class="component" key={i}>
          <div class="panel_header">{input_component.label}</div>
        </div>
        {/each}
      </div>
      <div class="panel_buttons">
        <button class="panel_button" onClick=""> Clear </button>
        <button class="panel_button submit" onClick=""> Submit </button>
      </div>
    </div>
    <div class="panel">
      <div class="component_set">
        {#each output_components as output_component, i}
        <div class="component" key={i}>
          <div class="panel_header">{output_component.label}</div>
        </div>
        {/each}
      </div>
      <div class="panel_buttons">
        <button class="flag">Flag</button>
      </div>
    </div>
  </div>
</div>

<style>
</style>
