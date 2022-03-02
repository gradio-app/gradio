<script lang="ts">
	import ImageEditor from "tui-image-editor";

	import { createEventDispatcher, onMount } from "svelte";

	export let value: string;
	let el: HTMLDivElement;
	let editor: ImageEditor;

	const dispatch = createEventDispatcher();

	function create_editor() {
		editor = new ImageEditor(el, {
			usageStatistics: false,
			includeUI: {
				loadImage: {
					path: value,
					name: "Edit Image"
				},
				menuBarPosition: "left",
				uiSize: {
					width: "800px",
					height: "600px"
				}
			},
			cssMaxWidth: 700,
			cssMaxHeight: 500,
			selectionStyle: {
				cornerSize: 20,
				rotatingPointOffset: 70
			}
		});
	}

	onMount(create_editor);
</script>

<div
	class="fixed w-screen h-screen top-0 left-0 bg-black bg-opacity-50 z-40 flex flex-col justify-center items-center"
>
	<div class="image_editor_buttons">
		<button on:click={() => dispatch("save", editor.toDataURL())}>Save</button>
		<button on:click={() => dispatch("cancel")}>Cancel</button>
	</div>
	<div bind:this={el} />
</div>
