<script>
  import Cropper from "cropperjs";
  import { onMount, createEventDispatcher } from "svelte";

  export let image;
  let el;

  const dispatch = createEventDispatcher();

  onMount(() => {
    console.log(el);
    const cropper = new Cropper(el, {
      autoCropArea: 1,
      cropend() {
        const image_data = cropper.getCroppedCanvas().toDataURL();
        dispatch("crop", image_data);
      },
    });

    dispatch("crop", image);
  });
</script>

<img src={image} bind:this={el} alt="" />
