<script>
  import Upload from "../../utils/Upload.svelte";
  import Chart from "../../utils/Chart.svelte";

  export let value;
  $: console.log(value);
</script>

<Chart value={value.data} />
