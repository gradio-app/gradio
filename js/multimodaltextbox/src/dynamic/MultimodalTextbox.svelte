<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Copy, Check, Plus, RemoveFile } from "@gradio/icons";
	import { fade } from "svelte/transition";
	import type { SelectData } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";

	export let value: {
		text: string | null;
		files: [string | FileData][];
	} = { text: null, files: [] };
	export let lines: number = 1;
	export let placeholder: string = "Type here...";
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label: boolean = true;
	export let container: boolean = true;
	export let max_lines: number;
	export let show_copy_button: boolean = false;
	export let rtl = false;
	export let autofocus: boolean = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let file_count: string;
	export let file_types: string[] = [];
	export let include_file_metadata = true;

	let el: HTMLTextAreaElement | HTMLInputElement;
	let copied = false;
	let hover = false;
	let timer: NodeJS.Timeout;
	let hidden_upload: HTMLInputElement;
	let accept_file_types: string | null;

	if (file_types == null) {
		accept_file_types = null;
	} else {
		file_types = file_types.map((x) => {
			if (x.startsWith(".")) {
				return x;
			}
			return x + "/*";
		});
		accept_file_types = file_types.join(", ");
	}

	$: value, el && lines !== max_lines && resize({ target: el });

	const dispatch = createEventDispatcher<{
		change: {
			text: string | null;
			files: [string | FileData];
		};
		submit: undefined;
		blur: undefined;
		select: SelectData;
		input: undefined;
		load: {
			text: string | null;
			files: [string | FileData];
		};
	}>();

	function handle_change() {
		dispatch("change", value);
		dispatch("input");
	}
	$: value, handle_change();

	function handle_blur() {
		dispatch("blur");
	}

	async function handle_copy() {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value.text);
			copy_feedback();
		}
	}

	function copy_feedback() {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	function handle_select(event: Event) {
		const target: HTMLTextAreaElement | HTMLInputElement = event.target as
			| HTMLTextAreaElement
			| HTMLInputElement;
		const text = target.value;
		const index: [number, number] = [
			target.selectionStart as number,
			target.selectionEnd as number,
		];
		dispatch("select", { value: text.substring(...index), index: index });
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();
		if (e.key === "Enter" && e.shiftKey && lines > 1) {
			e.preventDefault();
			dispatch("submit");
		} else if (
			e.key === "Enter" &&
			!e.shiftKey &&
			lines === 1 &&
			max_lines >= 1
		) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	async function resize(
		event: Event | { target: HTMLTextAreaElement | HTMLInputElement }
	) {
		await tick();
		if (lines === max_lines || !container) return;

		let max =
			max_lines === undefined
				? false
				: max_lines === undefined // default
				? 21 * 11
				: 21 * (max_lines + 1);
		let min = 21 * (lines + 1);

		const target = event.target as HTMLTextAreaElement;
		target.style.height = "1px";

		let scroll_height;
		if (max && target.scrollHeight > max) {
			scroll_height = max;
		} else if (target.scrollHeight < min) {
			scroll_height = min;
		} else {
			scroll_height = target.scrollHeight;
		}
		target.style.height = `${scroll_height}px`;
	}

	const openFileUpload = () => {
		hidden_upload.click();
	};

	const loadFiles = (files: FileList) => {
		let _files: File[] = Array.from(files);
		if (!files.length) {
			return;
		}

		var all_file_data: FileData[] = [];
		_files.forEach((f, i) => {
			all_file_data[i] = {
				name: f.name,
				size: f.size,
				data: "",
				blob: f,
			};
			if (
				all_file_data.filter((x) => x !== undefined).length === files.length
			) {
				value.files = all_file_data;
				dispatch("load", value);
			}
		});
	};

	const loadFilesFromUpload = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (!target.files) {
			return;
		}
		loadFiles(target.files);
	};

	const clearInputValue = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.value) target.value = "";
	};

	const clearFiles = (e: Event) => {
		value.files = [];
		e.preventDefault();
	};
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class:container>
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	{#if lines === 1 && max_lines === 1}
		<form class="input-form">
			<input
				data-testid="textbox"
				type="text"
				class="scroll-hide"
				dir={rtl ? "rtl" : "ltr"}
				bind:value={value["text"]}
				bind:this={el}
				{placeholder}
				{disabled}
				{autofocus}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
				on:select={handle_select}
				style={text_align ? "text-align: " + text_align : ""}
			/>
		</form>
	{:else}
		{#if show_label && show_copy_button}
			{#if copied}
				<button class="copy-button" in:fade={{ duration: 300 }}
					><Check /></button
				>
			{:else}
				<button class="copy-button" on:click={handle_copy}><Copy /></button>
			{/if}
		{/if}
		<input
			class="hide"
			accept={accept_file_types}
			type="file"
			bind:this={hidden_upload}
			on:change={loadFilesFromUpload}
			on:click={clearInputValue}
			multiple={file_count === "multiple" || undefined}
			webkitdirectory={file_count === "directory" || undefined}
			mozdirectory={file_count === "directory" || undefined}
			data-testid="{label}-upload-button"
		/>
		<div class="wrap">
			<textarea
				data-testid="textbox"
				class="scroll-hide"
				dir={rtl ? "rtl" : "ltr"}
				bind:value={value["text"]}
				bind:this={el}
				{placeholder}
				rows={lines}
				{disabled}
				{autofocus}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
				on:select={handle_select}
				style={text_align ? "text-align: " + text_align : ""}
			/>
			{#if value.files.length > 0}
				<button
					class="upload-button"
					on:click={clearFiles}
					in:fade={{ duration: 300 }}
				>
					<RemoveFile /></button
				>
			{:else}
				<button class="upload-button" on:click={openFileUpload}><Plus /></button
				>
			{/if}
		</div>
	{/if}
</label>

<style>
	label {
		display: block;
		width: 100%;
	}

	label:not(.container),
	label:not(.container) > input,
	label:not(.container) > textarea {
		height: 100%;
	}
	.container > input,
	.container > textarea {
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
	}
	input:disabled,
	textarea:disabled {
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
	}

	input:focus,
	textarea:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--input-placeholder-color);
	}
	.copy-button {
		display: flex;
		position: absolute;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
		align-items: center;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--color-border-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-label-background-fill);
		padding: 5px;
		width: 22px;
		height: 22px;
		overflow: hidden;
		color: var(--block-label-color);
		font: var(--font-sans);
		font-size: var(--button-small-text-size);
	}
	.hide {
		display: none;
	}
	.wrap {
		display: flex;
		align-items: center;
		height: auto;
	}

	textarea {
		display: flex;
		position: relative;
		outline: none !important;
		box-shadow: var(--input-shadow);
		background: var(--input-background-fill);
		padding: var(--input-padding);
		width: 95%;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		border: none;
	}

	.upload-button {
		display: flex;
		position: absolute;
		right: var(--block-label-margin);
		width: 5%;
		height: var(--size-6);
		overflow: hidden;
		color: var(--block-label-color);
	}
</style>
