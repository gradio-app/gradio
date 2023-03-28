<script>
	import { Block } from "@gradio/atoms";
	import { Model3D, Model3DUpload } from "@gradio/model3D";
</script>

<Block padding={false}>
	<Model3DUpload label="Model3D upload" value={null} />
</Block>
<span />
<Block padding={false}>
	<Model3D value={null} label="Model3D - no value" />
</Block>
<span />
<Block padding={false}>
	<Model3D value={null} label="Model3D - with value" />
</Block>
<span />

<style>
	span {
		display: block;
		height: 1rem;
	}
</style>
