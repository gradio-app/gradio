<script lang="ts">
	export let show_label: boolean = true;
	export let style: string | undefined = "";
</script>

<span
	class="text-gray-600 text-[0.855rem] mb-2 block dark:text-gray-200"
	class:sr-only={!show_label}
	{style}
>
	<slot />
</span>
