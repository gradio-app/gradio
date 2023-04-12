<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block } from "@gradio/atoms";
	import { StaticImage } from "@gradio/image";
	import { Image } from "@gradio/icons";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
    import { FileData, normalise_file } from "@gradio/upload";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: [FileData, Array<[FileData, string]>] | null;
	let old_value: [FileData, Array<[FileData, string]>] | null;
	let _value: [FileData, Array<[FileData, string]>] | null;
	export let label: string = "Image Sections";
	export let show_label: boolean = true;
	export let root: string;
	export let root_url: string;

	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: {
		if (value !== old_value) {
			old_value = value;
			dispatch("change");
		}
		if (value) {
			_value = [normalise_file(value[0], root, root_url) as FileData, value[1].map(
				([file, label]) => [normalise_file(file, root, root_url) as FileData, label]
			)];
			console.log(value);
		} else {
			_value = null;
		}
	}
</script>

<Block {visible} {elem_id} {elem_classes} padding={false}>
	<StatusTracker {...loading_status} />
	<StaticImage value={_value ? _value[0].data : null} {label} {show_label} />
</Block>
