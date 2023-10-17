<svelte:options accessors={true} />

<script lang="ts">
	import Cropper from "cropperjs";
	import { onMount, createEventDispatcher } from "svelte";

	export let image: string;
	let el: HTMLImageElement;

	const dispatch = createEventDispatcher();
	let cropper: Cropper;

	export function destroy(): void {
		cropper.destroy();
	}

	export function create(): void {
		if (cropper) {
			destroy();
		}
		cropper = new Cropper(el, {
			autoCropArea: 1,
			cropend(): void {
				const image_data = cropper.getCroppedCanvas().toDataURL();
				dispatch("crop", image_data);
			}
		});

		dispatch("crop", image);
	}
</script>

<img src={image} bind:this={el} alt="" />
