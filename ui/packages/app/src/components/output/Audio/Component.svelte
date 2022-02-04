<script lang="ts">
	export let value: string;
	export let theme: string;
</script>

<audio {theme} controls>
	<source src={value} />
</audio>

<style lang="postcss">
</style>
