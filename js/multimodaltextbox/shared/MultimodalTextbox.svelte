<script lang="ts">
	import {
		beforeUpdate,
		afterUpdate,
		createEventDispatcher,
		tick
	} from "svelte";
	import { Upload } from "@gradio/upload";
	import { Image } from "@gradio/image/shared";
	import type { FileData } from "@gradio/client";
	import { Copy, Check, Clear, File, Music, Video } from "@gradio/icons";
	import { fade } from "svelte/transition";
	import type { SelectData } from "@gradio/utils";

	export let value: { type: string; text?: string; file?: FileData | null }[] =
		[];
	export let value_is_output = false;
	export let lines = 1;
	export let placeholder = "Type here...";
	export let disabled = false;
	export let show_label = true;
	export let container = true;
	export let max_lines: number;
	export let show_copy_button = false;
	export let rtl = false;
	export let autofocus = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autoscroll = true;
	export let root: string;
	export let file_types: string[] | null = null;

	let el: HTMLTextAreaElement | HTMLInputElement;
	let copied = false;
	let timer: NodeJS.Timeout;
	let can_scroll: boolean;
	let previous_scroll_top = 0;
	let user_has_scrolled_up = false;

	let text = "";
	let dragging = false;
	$: dispatch("drag", dragging);

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
	$: file_count = Array.isArray(value) ? value.filter((item) => item.type === "file").length : 0;

	const dispatch = createEventDispatcher<{
		change: typeof value;
		submit: typeof value;
		blur: undefined;
		select: SelectData;
		input: undefined;
		focus: undefined;
		drag: boolean;
		upload: FileData[] | FileData;
		clear: undefined;
		load: FileData[] | FileData;
		error: string;
	}>();

	beforeUpdate(() => {
		can_scroll = el && el.offsetHeight + el.scrollTop > el.scrollHeight - 100;
	});

	const scroll = (): void => {
		if (can_scroll && autoscroll && !user_has_scrolled_up) {
			el.scrollTo(0, el.scrollHeight);
		}
	};

	function handle_change(): void {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}

	afterUpdate(() => {
		if (autofocus && el !== null) {
			el.focus();
		}
		if (can_scroll && autoscroll) {
			scroll();
		}
		value_is_output = false;
	});
	$: value, handle_change();

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			const text = value.find((item) => item && "text" in item);
			if (text && "text" in text && typeof text["text"] === "string") {
				await navigator.clipboard.writeText(text["text"]);
				copy_feedback();
			}
		}
	}

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	function handle_select(event: Event): void {
		const target: HTMLTextAreaElement | HTMLInputElement = event.target as
			| HTMLTextAreaElement
			| HTMLInputElement;
		const text = target.value;
		const index: [number, number] = [
			target.selectionStart as number,
			target.selectionEnd as number
		];
		dispatch("select", { value: text.substring(...index), index: index });
	}

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		if (e.key === "Enter" && e.shiftKey && lines > 1) {
			e.preventDefault();
			value.push({ type: "text", text: text });
			dispatch("submit", value);
			text = "";
			await tick();
			value = [];
		} else if (
			e.key === "Enter" &&
			!e.shiftKey &&
			lines === 1 &&
			max_lines >= 1
		) {
			e.preventDefault();
			value.push({ type: "text", text: text });
			dispatch("submit", value);
			text = "";
			await tick();
			value = [];
		}
	}

	function handle_scroll(event: Event): void {
		const target = event.target as HTMLElement;
		const current_scroll_top = target.scrollTop;
		if (current_scroll_top < previous_scroll_top) {
			user_has_scrolled_up = true;
		}
		previous_scroll_top = current_scroll_top;

		const max_scroll_top = target.scrollHeight - target.clientHeight;
		const user_has_scrolled_to_bottom = current_scroll_top >= max_scroll_top;
		if (user_has_scrolled_to_bottom) {
			user_has_scrolled_up = false;
		}
	}

	async function resize(
		event: Event | { target: HTMLTextAreaElement | HTMLInputElement }
	): Promise<void> {
		await tick();
		if (lines === max_lines) return;

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

	function text_area_resize(
		_el: HTMLTextAreaElement,
		_value: string
	): any | undefined {
		if (lines === max_lines) return;
		_el.style.overflowY = "scroll";
		_el.addEventListener("input", resize);

		if (!_value.trim()) return;
		resize({ target: _el });

		return {
			destroy: () => _el.removeEventListener("input", resize)
		};
	}

	async function handle_upload({
		detail
	}: CustomEvent<FileData | FileData[]>): Promise<void> {
		if (Array.isArray(detail)) {
			for (let file of detail) {
				value = [...value, { type: "file", file: file }];
			}
		} else {
			value.push({ type: "file", file: detail });
			value = value;
		}
		await tick();
		dispatch("change", value);
		dispatch("upload", detail);
	}

	function remove_thumbnail(event: MouseEvent, index: number): void {
		event.stopPropagation();
		value.splice(index, 1);
		value = value;
	}

	let hidden_upload: HTMLInputElement;

	function handle_upload_click(): void {
		if (hidden_upload) {
			hidden_upload.click();
		}
	}

	async function handle_submit(): Promise<void> {
		value.push({ type: "text", text: text });
		dispatch("submit", value);
		text = "";
		await tick();
		value = [];
	}
</script>

<!-- svelte-ignore a11y-autofocus -->
<label class:container>
	{#if show_label && show_copy_button}
		{#if copied}
			<button
				in:fade={{ duration: 300 }}
				aria-label="Copied"
				aria-roledescription="Text copied"><Check /></button
			>
		{:else}
			<button
				on:click={handle_copy}
				aria-label="Copy"
				aria-roledescription="Copy text"><Copy /></button
			>
		{/if}
	{/if}
	<div class="input-container">
		<Upload
			on:load={handle_upload}
			filetype={accept_file_types}
			{root}
			bind:dragging
			disable_click={true}
			bind:hidden_upload
		>
			<button class="submit-button" on:click={handle_submit}>⌲</button>
			<button class="plus-button" on:click={handle_upload_click}>+</button>
			{#if file_count > 0}
				<div
					class="thumbnails scroll-hide"
					data-testid="container_el"
					style="display: {file_count > 0 ? 'flex' : 'none'};"
				>
					{#each value.filter((item) => item.type === "file") as file, index}
						<button class="thumbnail-item thumbnail-small">
							<button
								class="delete-button"
								on:click={(event) => remove_thumbnail(event, index)}
								><Clear /></button
							>
							{#if file.file?.mime_type && file.file.mime_type.includes("image")}
								<Image
									src={file.file.url}
									title={null}
									alt=""
									loading="lazy"
									class={"thumbnail-image"}
								/>
							{:else if file.file?.mime_type && file.file.mime_type.includes("audio")}
								<Music />
							{:else if file.file?.mime_type && file.file.mime_type.includes("video")}
								<Video />
							{:else}
								<File />
							{/if}
						</button>
					{/each}
				</div>
			{/if}
			<textarea
				data-testid="textbox"
				use:text_area_resize={text}
				class="scroll-hide"
				dir={rtl ? "rtl" : "ltr"}
				bind:value={text}
				bind:this={el}
				{placeholder}
				rows={lines}
				{disabled}
				{autofocus}
				on:keypress={handle_keypress}
				on:blur
				on:select={handle_select}
				on:focus
				on:scroll={handle_scroll}
				style={text_align ? "text-align: " + text_align : ""}
			/>
		</Upload>
	</div>
</label>

<style>
	.input-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	textarea {
		align-self: flex-start;
		outline: none !important;
		background: var(--input-background-fill);
		padding: var(--input-padding);
		width: 90%;
		max-height: 100%;
		height: 25px;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		border: none;
		margin-top: 0px;
		margin-bottom: 0px;
		margin-left: 30px;
	}

	textarea:disabled {
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
	}

	textarea::placeholder {
		color: var(--input-placeholder-color);
	}

	.plus-button,
	.submit-button {
		position: absolute;
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		border: none;
		text-align: center;
		text-decoration: none;
		font-size: 20px;
		cursor: pointer;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		bottom: 15px;
	}

	.plus-button:hover,
	.submit-button:hover {
		background: var(--button-secondary-background-fill-hover);
	}

	.plus-button:active,
	.submit-button:active {
		box-shadow: var(--button-shadow-active);
	}

	.submit-button {
		right: 10px;
		margin-left: 5px;
		padding-bottom: 5px;
		padding-left: 2px;
	}

	.plus-button {
		left: 10px;
		margin-right: 5px;
	}

	.thumbnails :global(img) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: cover;
		border-radius: var(--radius-lg);
	}

	.thumbnails {
		align-self: flex-start;
		display: flex;
		justify-content: left;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.thumbnail-item {
		display: flex;
		justify-content: center;
		align-items: center;
		--ring-color: transparent;
		position: relative;
		box-shadow:
			0 0 0 2px var(--ring-color),
			var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		background: var(--background-fill-secondary);
		aspect-ratio: var(--ratio-square);
		width: var(--size-full);
		height: var(--size-full);
		cursor: default;
	}

	.thumbnail-small {
		flex: none;
		transform: scale(0.9);
		transition: 0.075s;
		width: var(--size-12);
		height: var(--size-12);
	}

	.thumbnail-item :global(svg) {
		width: 30px;
		height: 30px;
	}

	.delete-button {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		right: -7px;
		top: -7px;
		background-color: var(--input-border-color-focus);
		border: none;
		color: white;
		text-align: center;
		text-decoration: none;
		font-size: 10px;
		cursor: pointer;
		border-radius: 50%;
		width: 20px;
		height: 20px;
	}

	.delete-button :global(svg) {
		width: 15px;
		height: 15px;
	}

	.delete-button:hover {
		filter: brightness(1.2);
		border: 0.8px solid var(--color-grey-500);
	}
</style>
