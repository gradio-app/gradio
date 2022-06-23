<script lang="ts">
	export let value: string;
	export let samples_dir: string;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img
	class="gr-sample-image object-contain h-20 w-20"
	src={samples_dir + value}
/>
