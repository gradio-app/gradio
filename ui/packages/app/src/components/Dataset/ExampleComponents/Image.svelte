<script lang="ts">
	export let value: string;
	export let samples_dir: string;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img class="input-image-example h-24 max-w-none" src={samples_dir + value} />
