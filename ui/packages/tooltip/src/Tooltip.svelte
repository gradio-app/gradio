<script lang="ts">
	export let text: string;
	export let x: number;
	export let y: number;
	export let color: string;

	let w: number;
	let h: number;
</script>

<div
	class="bg-black bg-opacity-80 text-white border-r-2 p-1 absolute text-xs flex items-center justify-center"
	bind:offsetWidth={w}
	bind:offsetHeight={h}
	style="
		top: {y - h / 2}px;
		left: {x - w - 7}px;"
>
	<span class="inline-block w-3 h-3 mr-1" style="background: {color}" />{text}
</div>
