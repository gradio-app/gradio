<script lang="ts">
	export let value: number = 0;
	export let visible: boolean = true;
	$: _value = (Math.max(Math.min(1, value), 0) * 100).toFixed(1);
</script>

<div
	class="w-full bg-gray-50 dark:bg-gray-700 h-9 relative rounded flex justify-center items-center"
	class:hidden={visible === false}
>
	<div class="absolute top-0 left-0 h-full w-full rounded">
		<div
			class="h-full rounded bg-gradient-to-b from-orange-500 to-orange-600 text-center truncate transition-all z-10"
			style="width: {_value}%"
		/>
	</div>
	<div class="py-0.5 px-2 bg-gray-900 bg-opacity-40 z-10 rounded-sm font-mono">{_value}%</div>
</div>
