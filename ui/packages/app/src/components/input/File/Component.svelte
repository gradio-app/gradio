<script>
	import Upload from "../../utils/Upload.svelte";
	import ModifyUpload from "../../utils/ModifyUpload.svelte";
	import { prettyBytes } from "../../utils/helpers";

	export let value, setValue, theme;
</script>

<div class="input-file" {theme}>
	{#if value === null}
		<Upload load={setValue} {theme}>
			Drop File Here
			<br />- or -<br />
			Click to Upload
		</Upload>
	{:else}
		<div
			class="file-preview w-full flex flex-row flex-wrap justify-center items-center relative"
		>
			<ModifyUpload clear={() => setValue(null)} {theme} />
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-10 w-1/5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<div class="file-name w-3/5 text-4xl p-6 break-all">{value.name}</div>
			<div class="file-size text-2xl p-2">
				{prettyBytes(value.size)}
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.input-file[theme="default"] .file-preview {
		@apply h-60;
	}
</style>
