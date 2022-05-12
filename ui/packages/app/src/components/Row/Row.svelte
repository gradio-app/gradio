<script lang="ts">
	export let parent: string | null = null;
	export let styles: Record<string, unknown> = {};

	$: console.log(styles);
</script>

<div
	class="flex flex-col md:flex-row gr-gap gr-form-gap row w-full flex-none"
	class:flex-1={parent === "row"}
	class:unequal-height={styles.equal_height !== false}
>
	<slot />
</div>
