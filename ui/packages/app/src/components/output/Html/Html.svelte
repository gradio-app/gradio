<script lang="ts">
	export let value: string;
	export let theme: string;
</script>

<div class="output-html" {theme}>
	{@html value}
</div>
