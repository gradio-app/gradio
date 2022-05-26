<script lang="ts">
	export let show_label: boolean = true;
</script>

<span
	class="text-gray-500 text-[0.855rem] mb-2 block dark:text-gray-200 relative z-40"
	class:sr-only={!show_label}
	class:h-0={!show_label}
	class:!m-0={!show_label}
>
	<slot />
</span>
