<script lang="ts">
	export let value: string;
	export let examples_dir: string;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img class="input-model3d-example h-24 max-w-none" src={examples_dir + value} />
