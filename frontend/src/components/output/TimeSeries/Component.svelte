<script>
  import Upload from "../../utils/Upload.svelte";
  import Chart from "../../utils/Chart.svelte";

  export let value;
</script>

<Chart value={value.data} />
