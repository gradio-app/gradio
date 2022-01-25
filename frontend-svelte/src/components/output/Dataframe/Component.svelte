<script>
  import DataFrame from "../input/DataFrame.svelte";

  export let headers,
    value,
    theme,
    setValue = () => {};

  $: console.log(headers, value);
</script>

<DataFrame
  headers={headers || value.headers}
  values={value.data}
  {setValue}
  editable={false}
/>
