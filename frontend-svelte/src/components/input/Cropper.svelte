<script>
  import Cropper from "cropperjs";
  import { onMount } from "svelte";

  export let image;
  let el;

  onMount(() => {
    console.log(el);
    const cropper = new Cropper(el, {
      autoCropArea: 1,
      crop(event) {
        console.log(event.detail.x);
        console.log(event.detail.y);
        console.log(event.detail.width);
        console.log(event.detail.height);
        console.log(event.detail.rotate);
        console.log(event.detail.scaleX);
        console.log(event.detail.scaleY);
      },
    });
  });
</script>

<img src={image} bind:this={el} alt="" />
