<script lang="ts">
	// import video_icon from "./video.svg";
	// import audio_icon from "./music.svg";
	// import file_icon from "./file.svg";
	// import csv_icon from "./table.svg";

	export let label: string | null = null;
	export let image: string | undefined = undefined;
	export let show_label: boolean = true;

	// const type_labels = {
	// 	"audio/*": { text: "Audio", icon: audio_icon },
	// 	file: { text: "File", icon: file_icon },
	// 	"image/x-png,image/gif,image/jpeg": { text: "Image", icon: image_icon },
	// 	"text/csv": { text: "CSV", icon: csv_icon },
	// 	"video/mp4,video/x-m4v,video/*": { text: "Video", icon: video_icon }
	// } as const;

	// if (!label && label !== "" && filetype) {
	// 	label = type_labels[filetype as keyof typeof type_labels].text;
	// }
</script>

<div
	class:sr-only={!show_label}
	class="absolute left-0 top-0 py-1 px-2 rounded-br-lg shadow-sm text-xs text-gray-500 flex items-center pointer-events-none bg-white z-20 border-b border-r border-gray-100"
>
	<img src={image} alt="" class="mr-2 h-[12px] w-[12px] opacity-50" />

	{label}
</div>
