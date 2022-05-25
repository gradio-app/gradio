<script lang="ts">
	import { get_styles } from "@gradio/utils";

	export let label: string | null = null;
	export let Icon: any;
	export let show_label: boolean = true;
	export let disable: boolean = false;

	const { classes } = get_styles({ label_container: !disable }, [
		"label_container"
	]);
</script>

<div
	class:h-0={!show_label}
	class:sr-only={!show_label}
	class="absolute left-0 top-0 py-1 px-2 rounded-br-lg shadow-sm text-xs text-gray-500 flex items-center pointer-events-none bg-white z-20 border-b border-r border-gray-100 dark:bg-gray-900 {classes}"
>
	<!-- <img src={image} alt="" class="" /> -->
	<span class="mr-2 h-[12px] w-[12px] opacity-80">
		<Icon />
	</span>

	{label}
</div>
