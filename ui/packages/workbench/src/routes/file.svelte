<script lang="ts">
	import { FileUpload, File } from "@gradio/file";
	import { Block } from "@gradio/atoms";
</script>

<!-- <FileUpload value={null} /> -->

<Block padding={false}>
	<FileUpload label="File upload - single" value={null}>
		drop file
		<br />
		- or -
		<br />
		click to upload
	</FileUpload>
</Block>
<span />

<Block padding={false}>
	<FileUpload label="File upload - multiple" value={null} file_count="multiple">
		drop file
		<br />
		- or -
		<br />
		click to upload
	</FileUpload>
</Block>
<span />

<Block padding={false}>
	<File label="Static File - no value" value={null} />
</Block>

<span />

<Block padding={false}>
	<File
		value={{ data: "asd", name: "myfile.txt", size: 123456789 }}
		label="Static File - with value"
	/>
</Block>

<span />
<Block padding={false}>
	<File
		value={[
			{ data: "asd", name: "myfile.txt", size: 123456789 },
			{ data: "asdas", name: "myfile2.svg", size: 12345678 },
			{ data: "asdas", name: "myfile3.jpg", size: 1234567 },
			{ data: "asdas", name: "myfile4.mov", size: 12345 }
		]}
		label="Static File - with value (multiple)"
	/>
</Block>
<span />

<style>
	span {
		display: block;
		height: 1rem;
	}
</style>
