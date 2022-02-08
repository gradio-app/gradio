<script lang="ts">
	import { prettyBytes, playable } from "../../utils/helpers";

	export let value: {
		name: string;
		data: string;
	};
</script>

<div
	class="output-video w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
>
	{#if playable(value.name)}
		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			class="video_preview w-full h-full object-contain"
			controls
			playsInline
			preload="auto"
			src={value.data}
		/>
	{:else}
		<a
			href={value.data}
			download={value.name}
			class="file-preview h-60 w-full flex flex-col justify-center items-center relative"
		>
			<div class="file-name text-4xl p-6 break-all">{value.name}</div>
		</a>
	{/if}
</div>

<style lang="postcss">
</style>
