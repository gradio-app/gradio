<script lang="ts">
	export let value: string;
	export let samples_dir: string;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img class="gr-sample-image" src={samples_dir + value} />
