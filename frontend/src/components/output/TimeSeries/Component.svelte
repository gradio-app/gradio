<script>
  import Upload from "../../utils/Upload.svelte";
  import Chart from "../../utils/Chart.svelte";

  export let value;
  $: formatted_value = value.data.map((r) =>
    r.reduce((acc, next, i) => ({ ...acc, [value.headers[i]]: next }), {})
  );
</script>

<Chart value={formatted_value} type="data" />
