<script lang="ts">
	export let image: string;
	export let alt = "";
</script>

<button
	on:click
	class="text-gray-500  bg-white/90 h-5 w-5 flex items-center justify-center rounded shadow-sm hover:shadow-xl hover:ring-1 ring-inset ring-gray-200 z-10 dark:bg-gray-900 dark:ring-gray-600"
>
	<img src={image} {alt} class="m-t-1 w-[60%] h-[60%] opacity-60" />
</button>
