<script lang="ts">
	import { tick } from "svelte";
	import { text_area_resize, resize } from "../shared/utils";
	import { BlockTitle, ScrollFade } from "@gradio/atoms";
	import { Upload } from "@gradio/upload";
	import { Image } from "@gradio/image/shared";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { FileData, Client } from "@gradio/client";
	import type { WaveformOptions } from "@gradio/audio";
	import {
		Clear,
		File,
		Music,
		Paperclip,
		Video,
		ArrowUp,
		Square,
		Microphone,
		Check
	} from "@gradio/icons";
	import { should_show_scroll_fade, type SelectData } from "@gradio/utils";
	import {
		MinimalAudioPlayer,
		MinimalAudioRecorder
	} from "@gradio/audio/shared";
	import type { InputHTMLAttributes } from "./types";

	let {
		value = $bindable(),
		value_is_output = false,
		lines = 1,
		i18n: _i18n,
		placeholder = "",
		disabled = false,
		label,
		info = undefined,
		show_label = true,
		max_lines,
		submit_btn = null,
		stop_btn = null,
		rtl = false,
		autofocus = false,
		text_align = undefined,
		autoscroll = true,
		root,
		file_types_string = null,
		max_file_size = null,
		upload,
		stream_handler,
		file_count = "multiple",
		max_plain_text_length = 1000,
		waveform_settings,
		waveform_options: _waveform_options = { show_recording_waveform: true },
		sources_string = "upload",
		active_source = $bindable<"microphone" | null>(),
		html_attributes = null,
		upload_promise = $bindable<Promise<any> | null>(),
		dragging = $bindable<boolean>(),
		onchange,
		onsubmit,
		onstop,
		onblur,
		onselect,
		oninput,
		onfocus,
		ondrag,
		onupload,
		onclear,
		onload: _onload,
		onerror,
		onstop_recording
	}: {
		value?: { text: string; files: FileData[] };
		value_is_output?: boolean;
		lines?: number;
		i18n: I18nFormatter;
		placeholder?: string;
		disabled?: boolean;
		label: string;
		info?: string | undefined;
		show_label?: boolean;
		max_lines: number;
		submit_btn?: string | boolean | null;
		stop_btn?: string | boolean | null;
		rtl?: boolean;
		autofocus?: boolean;
		text_align?: "left" | "right" | undefined;
		autoscroll?: boolean;
		root: string;
		file_types_string?: string | null;
		max_file_size?: number | null;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		file_count?: "single" | "multiple" | "directory";
		max_plain_text_length?: number;
		waveform_settings: Record<string, any>;
		waveform_options?: WaveformOptions;
		sources_string?:
			| "upload"
			| "upload,microphone"
			| "microphone"
			| "microphone,upload";
		active_source?: "microphone" | null;
		html_attributes?: InputHTMLAttributes | null;
		upload_promise?: Promise<any> | null;
		dragging?: boolean;
		onchange?: (value: { text: string; files: FileData[] }) => void;
		onsubmit?: () => void;
		onstop?: () => void;
		onblur?: () => void;
		onselect?: (data: SelectData) => void;
		oninput?: () => void;
		onfocus?: () => void;
		ondrag?: (dragging: boolean) => void;
		onupload?: (files: FileData[] | FileData) => void;
		onclear?: () => void;
		onload?: (files: FileData[] | FileData) => void;
		onerror?: (error: string) => void;
		onstop_recording?: () => void;
	} = $props();

	let upload_component: Upload;
	let el: HTMLTextAreaElement | HTMLInputElement;
	let can_scroll = $state(false);
	let previous_scroll_top = $state(0);
	let user_has_scrolled_up = $state(false);
	let show_fade = $state(false);
	let uploading = $state(false);
	let oldValue = $state(value?.text ?? "");
	let recording = $state(false);
	let mic_audio = $state<FileData | null>(null);
	let full_container: HTMLDivElement;

	let sources = $derived(
		sources_string
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s === "upload" || s === "microphone") as (
			| "upload"
			| "microphone"
		)[]
	);

	let file_types = $derived(
		file_types_string ? file_types_string.split(",").map((s) => s.trim()) : null
	);

	let show_upload = $derived(
		sources &&
			sources.includes("upload") &&
			!(file_count === "single" && value?.files?.length > 0)
	);

	function update_fade(): void {
		show_fade = should_show_scroll_fade(el);
	}

	$effect(() => {
		if (el && value?.text !== undefined) {
			tick().then(update_fade);
		}
	});

	$effect(() => {
		ondrag?.(dragging);
	});

	$effect(() => {
		if (value && oldValue !== value.text) {
			onchange?.(value);
			oldValue = value.text;
		}
	});

	$effect(() => {
		if (el && lines !== max_lines) {
			resize(el, lines, max_lines);
		}
	});

	$effect.pre(() => {
		if (el && el.offsetHeight + el.scrollTop > el.scrollHeight - 100) {
			can_scroll = true;
		}
	});

	const scroll = (): void => {
		if (can_scroll && autoscroll && !user_has_scrolled_up) {
			el.scrollTo(0, el.scrollHeight);
		}
	};

	async function handle_change(): Promise<void> {
		onchange?.(value);
		if (!value_is_output) {
			oninput?.();
		}
	}

	$effect(() => {
		if (autofocus && el) {
			el.focus();
		}
	});

	$effect(() => {
		if (can_scroll && autoscroll) {
			scroll();
		}
	});

	function handle_select(event: Event): void {
		const target: HTMLTextAreaElement | HTMLInputElement = event.target as
			| HTMLTextAreaElement
			| HTMLInputElement;
		const text = target.value;
		const index: [number, number] = [
			target.selectionStart as number,
			target.selectionEnd as number
		];
		onselect?.({ value: text.substring(...index), index: index });
	}

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		if (e.key === "Enter" && e.shiftKey && lines > 1) {
			e.preventDefault();
			await tick();
			onsubmit?.();
		} else if (
			e.key === "Enter" &&
			!e.shiftKey &&
			lines === 1 &&
			max_lines >= 1
		) {
			e.preventDefault();
			add_mic_audio_to_files();
			active_source = null;
			await tick();
			onsubmit?.();
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
		update_fade();
	}

	async function handle_upload(detail: FileData | FileData[]): Promise<void> {
		handle_change();
		if (Array.isArray(detail)) {
			for (let file of detail) {
				value.files.push(file);
			}
			value = value;
		} else {
			value.files.push(detail);
			value = value;
		}
		await tick();
		onchange?.(value);
		onupload?.(detail);
	}

	function remove_thumbnail(event: MouseEvent, index: number): void {
		handle_change();
		event.stopPropagation();
		value.files.splice(index, 1);
		value = value;
	}

	function handle_upload_click(): void {
		upload_component.open_upload();
	}

	function handle_stop(): void {
		onstop?.();
	}

	function add_mic_audio_to_files(): void {
		if (mic_audio) {
			value.files.push(mic_audio);
			value = value;
			mic_audio = null;
			onchange?.(value);
		}
	}

	function handle_submit(): void {
		add_mic_audio_to_files();
		active_source = null;
		onsubmit?.();
	}

	async function handle_paste(event: ClipboardEvent): Promise<void> {
		if (!event.clipboardData) return;
		const items = event.clipboardData.items;
		const text = event.clipboardData.getData("text");

		if (text && text.length > max_plain_text_length) {
			event.preventDefault();
			const file = new window.File([text], "pasted_text.txt", {
				type: "text/plain",
				lastModified: Date.now()
			});
			if (upload_component) {
				upload_component.load_files([file]);
			}
			return;
		}

		for (let index in items) {
			const item = items[index];
			if (item.kind === "file" && item.type.includes("image")) {
				const blob = item.getAsFile();
				if (blob) upload_component.load_files([blob]);
			}
		}
	}

	function handle_dragenter(event: DragEvent): void {
		event.preventDefault();
		dragging = true;
	}

	function handle_dragleave(event: DragEvent): void {
		event.preventDefault();
		const rect = full_container.getBoundingClientRect();
		const { clientX, clientY } = event;
		if (
			clientX <= rect.left ||
			clientX >= rect.right ||
			clientY <= rect.top ||
			clientY >= rect.bottom
		) {
			dragging = false;
		}
	}

	function handle_drop(event: DragEvent): void {
		event.preventDefault();
		dragging = false;
		if (event.dataTransfer && event.dataTransfer.files) {
			const files = Array.from(event.dataTransfer.files);

			if (file_types) {
				const valid_files = files.filter((file) => {
					return file_types.some((type) => {
						if (type.startsWith(".")) {
							return file.name.toLowerCase().endsWith(type.toLowerCase());
						}
						return file.type.match(new RegExp(type.replace("*", ".*")));
					});
				});

				const invalid_files = files.length - valid_files.length;
				if (invalid_files > 0) {
					onerror?.(
						`${invalid_files} file(s) were rejected. Accepted formats: ${file_types.join(", ")}`
					);
				}

				if (valid_files.length > 0) {
					upload_component.load_files(valid_files);
				}
			} else {
				upload_component.load_files(files);
			}
		}
	}
</script>

<div
	class="full-container"
	class:dragging
	bind:this={full_container}
	ondragenter={handle_dragenter}
	ondragleave={handle_dragleave}
	ondragover={(e) => e.preventDefault()}
	ondrop={handle_drop}
	role="group"
	aria-label="Multimedia input field"
>
	<BlockTitle {show_label} {info} {rtl}>{label}</BlockTitle>
	<div class="input-container">
		{#if sources && sources.includes("microphone") && active_source === "microphone"}
			<div class="recording-overlay" class:has-audio={mic_audio !== null}>
				{#if !mic_audio}
					<div class="recording-content">
						<MinimalAudioRecorder
							label={label || "Audio"}
							{waveform_settings}
							{recording}
							{upload}
							{root}
							{max_file_size}
							bind:upload_promise
							onchange={(audio_value) => {
								mic_audio = audio_value;
							}}
							onstoprecording={() => {
								recording = false;
								onstop_recording?.();
							}}
							onclear={() => {
								active_source = null;
								recording = false;
								mic_audio = null;
								onclear?.();
							}}
						/>
					</div>
				{:else}
					<div class="recording-content">
						<MinimalAudioPlayer
							value={mic_audio}
							label={label || "Audio"}
							loop={false}
						/>
						<div class="action-buttons">
							<button
								class="confirm-button"
								onclick={() => {
									add_mic_audio_to_files();
									active_source = null;
									recording = false;
								}}
								aria-label="Attach audio"
							>
								<Check />
							</button>
							<button
								class="cancel-button"
								onclick={() => {
									active_source = null;
									recording = false;
									mic_audio = null;
								}}
								aria-label="Clear audio"
							>
								<Clear />
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
		{#if show_upload}
			<Upload
				bind:upload_promise
				bind:this={upload_component}
				onload={handle_upload}
				{file_count}
				filetype={file_types}
				{root}
				{max_file_size}
				bind:dragging
				bind:uploading
				show_progress={false}
				disable_click={true}
				{onerror}
				hidden={true}
				{upload}
				{stream_handler}
			/>
		{/if}

		<div
			class="input-wrapper"
			class:has-files={(value?.files?.length ?? 0) > 0 || uploading}
		>
			{#if (value?.files?.length ?? 0) > 0 || uploading}
				<div
					class="thumbnails"
					aria-label="Uploaded files"
					data-testid="container_el"
				>
					{#if show_upload}
						<button
							data-testid="upload-button"
							class="upload-button thumbnail-add"
							{disabled}
							onclick={handle_upload_click}
							aria-label="Upload a file"
						>
							<Paperclip />
						</button>
					{/if}
					{#each value?.files ?? [] as file, index}
						<span
							class="thumbnail-wrapper"
							role="listitem"
							aria-label="File thumbnail"
						>
							<div class="thumbnail-item thumbnail-small">
								{#if file.mime_type && file.mime_type.includes("image")}
									<Image
										src={file.url}
										restProps={{
											title: null,
											alt: "",
											loading: "lazy",
											class: "thumbnail-image"
										}}
									/>
								{:else if file.mime_type && file.mime_type.includes("audio")}
									<Music />
								{:else if file.mime_type && file.mime_type.includes("video")}
									<Video />
								{:else}
									<File />
								{/if}
								<button
									class="delete-button"
									onclick={(event) => remove_thumbnail(event, index)}
									aria-label="Remove file"
								>
									<Clear />
								</button>
							</div>
						</span>
					{/each}
					{#if uploading}
						<div class="loader" role="status" aria-label="Uploading"></div>
					{/if}
				</div>
			{/if}

			<div class="input-row">
				{#if show_upload && (value?.files?.length ?? 0) === 0 && !uploading}
					<button
						data-testid="upload-button"
						class="upload-button icon-button"
						{disabled}
						onclick={handle_upload_click}
						aria-label="Upload a file"
					>
						<Paperclip />
					</button>
				{/if}
				<div class="textarea-wrapper">
					<textarea
						data-testid="textbox"
						use:text_area_resize={{
							text: value.text,
							lines: lines,
							max_lines: max_lines
						}}
						class:no-label={!show_label}
						dir={rtl ? "rtl" : "ltr"}
						bind:value={value.text}
						bind:this={el}
						{placeholder}
						rows={lines}
						{disabled}
						onkeypress={handle_keypress}
						onblur={() => onblur?.()}
						onselect={handle_select}
						onfocus={() => onfocus?.()}
						onscroll={handle_scroll}
						onpaste={handle_paste}
						style={text_align ? "text-align: " + text_align : ""}
						autocapitalize={html_attributes?.autocapitalize}
						autocorrect={html_attributes?.autocorrect}
						spellcheck={html_attributes?.spellcheck}
						autocomplete={html_attributes?.autocomplete}
						tabindex={html_attributes?.tabindex}
						enterkeyhint={html_attributes?.enterkeyhint}
						lang={html_attributes?.lang}
					/>
					<ScrollFade visible={show_fade} position="absolute" />
				</div>

				{#if sources && sources.includes("microphone")}
					<button
						data-testid="microphone-button"
						class="microphone-button"
						class:recording
						{disabled}
						onclick={async () => {
							if (active_source !== "microphone") {
								active_source = "microphone";
								await tick();
								recording = true;
							} else {
								active_source = null;
								recording = false;
							}
						}}
						aria-label="Record audio"
					>
						<Microphone />
					</button>
				{/if}

				{#if submit_btn}
					<button
						class="submit-button"
						data-testid="submit-button"
						class:padded-button={submit_btn !== true}
						{disabled}
						onclick={handle_submit}
						aria-label="Submit"
					>
						{#if submit_btn === true}
							<ArrowUp />
						{:else}
							{submit_btn}
						{/if}
					</button>
				{/if}
				{#if stop_btn}
					<button
						class="stop-button"
						class:padded-button={stop_btn !== true}
						onclick={handle_stop}
						aria-label="Stop"
					>
						{#if stop_btn === true}
							<Square fill={"none"} stroke_width={2.5} />
						{:else}
							{stop_btn}
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.full-container {
		width: 100%;
		position: relative;
		padding: var(--block-padding);
		border: 1px solid transparent;
	}

	.full-container.dragging {
		border-color: var(--color-accent);
		border-radius: calc(var(--radius-sm) - var(--size-px));
	}

	.full-container.dragging::after {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.input-container {
		display: flex;
		position: relative;
		flex-direction: column;
		gap: 0;
	}

	.input-wrapper {
		display: flex;
		position: relative;
		flex-direction: column;
		gap: 0;
		background: var(--block-background-fill);
		border-radius: var(--radius-xl);
		padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 0;
		align-items: flex-start;
		min-height: auto;
	}

	.input-wrapper.has-files {
		padding-top: var(--spacing-xs);
	}

	.input-row {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.thumbnails {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xs) 0;
		margin-bottom: var(--spacing-xs);
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
		flex-wrap: nowrap;
		-webkit-overflow-scrolling: touch;
		scroll-behavior: smooth;
		overflow-y: scroll;
		width: 100%;
	}

	.thumbnails::-webkit-scrollbar,
	.thumbnails::-webkit-scrollbar-track,
	.thumbnails::-webkit-scrollbar-thumb {
		display: none;
	}

	.thumbnails :global(img) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: cover;
		border-radius: var(--radius-md);
	}

	.thumbnail-wrapper {
		position: relative;
		flex-shrink: 0;
	}

	.thumbnail-item {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: var(--radius-md);
		background: var(--background-fill-secondary);
		width: var(--size-full);
		height: var(--size-full);
		cursor: default;
		padding: 0;
	}

	.thumbnail-small {
		width: var(--size-10);
		height: var(--size-10);
	}

	.thumbnail-item :global(svg) {
		width: var(--size-5);
		height: var(--size-5);
	}

	.delete-button {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--button-primary-text-color);
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: var(--blur-xs);
		border-radius: var(--radius-md);
		padding: 0;
		z-index: var(--layer-1);
		opacity: 0;
		transition: opacity 0.1s var(--easing-standard);
	}

	.delete-button:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	.delete-button :global(svg) {
		width: var(--size-5);
		height: var(--size-5);
	}

	.thumbnail-item:hover .delete-button {
		opacity: 1;
	}

	textarea {
		flex-grow: 1;
		outline: none !important;
		background: transparent;
		padding: var(--spacing-sm) 0;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		border: none;
		margin: 0;
		resize: none;
		position: relative;
		z-index: var(--layer-1);
		text-align: left;
	}

	textarea:disabled {
		-webkit-opacity: 1;
		opacity: 1;
	}

	textarea::placeholder {
		color: var(--input-placeholder-color);
	}

	textarea[dir="rtl"] {
		text-align: right;
	}

	textarea[dir="rtl"] ~ .submit-button :global(svg) {
		transform: scaleX(-1);
	}

	.microphone-button,
	.icon-button {
		color: var(--body-text-color);
		cursor: pointer;
		padding: var(--spacing-sm);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
		border-radius: var(--radius-md);
	}

	.thumbnail-add {
		background: var(--button-secondary-background-fill);
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
		width: var(--size-10);
		height: var(--size-10);
		border-radius: var(--radius-md);
		z-index: var(--layer-1);
	}

	.thumbnail-add:hover:not(:disabled) {
		background: var(--button-secondary-background-fill-hover);
	}

	.thumbnail-add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.thumbnail-add :global(svg) {
		width: var(--size-5);
		height: var(--size-5);
	}

	.microphone-button,
	.icon-button {
		width: var(--size-9);
		height: var(--size-9);
	}

	.microphone-button:hover:not(:disabled),
	.icon-button:hover:not(:disabled) {
		background: var(--button-secondary-background-fill);
	}

	.microphone-button:disabled,
	.icon-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.microphone-button :global(svg),
	.icon-button :global(svg) {
		width: var(--size-5);
		height: var(--size-5);
	}

	.submit-button,
	.stop-button {
		background: var(--button-secondary-background-fill);
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
		width: var(--size-9);
		height: var(--size-9);
		border-radius: var(--radius-md);
		z-index: var(--layer-1);
	}

	.submit-button:hover:not(:disabled),
	.stop-button:hover:not(:disabled) {
		background: var(--button-secondary-background-fill-hover);
	}

	.submit-button:active:not(:disabled),
	.stop-button:active:not(:disabled) {
		box-shadow: var(--button-shadow-active);
	}

	.submit-button:disabled,
	.stop-button:disabled {
		cursor: not-allowed;
	}

	.submit-button :global(svg),
	.stop-button :global(svg) {
		width: var(--size-5);
		height: var(--size-5);
	}

	.padded-button {
		padding: 0 var(--spacing-lg);
		width: auto;
		border-radius: var(--radius-xl);
	}

	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		border: var(--size-1) solid var(--border-color-primary);
		border-top-color: var(--color-accent);
		border-radius: var(--radius-100);
		width: var(--size-5);
		height: var(--size-5);
		animation: spin 1s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.recording-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--block-background-fill);
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--layer-5);
		padding: var(--spacing-lg);
		backdrop-filter: blur(8px);
		animation: fadeIn 0.2s var(--easing-standard);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.recording-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		width: 100%;
		max-width: 700px;
	}

	.recording-content :global(.minimal-audio-recorder),
	.recording-content :global(.minimal-audio-player) {
		flex: 1;
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-shrink: 0;
	}

	.stop-button,
	.confirm-button,
	.cancel-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-9);
		height: var(--size-9);
		padding: 0;
		border-radius: var(--radius-md);
		cursor: pointer;
		flex-shrink: 0;
	}

	.stop-button {
		background: var(--button-secondary-background-fill);
		border-color: var(--border-color-primary);
		color: var(--error-500);
	}

	.stop-button:hover {
		background: var(--button-secondary-background-fill-hover);
		color: var(--error-600);
	}

	.stop-button:active {
		transform: scale(0.95);
	}

	.confirm-button {
		background: var(--button-primary-background-fill);
		border-color: var(--button-primary-border-color);
		color: white;
	}

	.confirm-button:hover {
		background: var(--button-primary-background-fill-hover);
		color: var(--button-primary-text-color-hover);
	}

	.confirm-button:active {
		transform: scale(0.95);
	}

	.cancel-button {
		background: var(--button-secondary-background-fill);
		color: var(--body-text-color);
	}

	.cancel-button:hover {
		background: var(--button-secondary-background-fill-hover);
	}

	.stop-button :global(svg),
	.confirm-button :global(svg),
	.cancel-button :global(svg) {
		width: var(--size-5);
		height: var(--size-5);
	}

	@media (max-width: 768px) {
		.input-wrapper {
			padding: var(--spacing-xs);
		}

		.thumbnails {
			padding: var(--spacing-xs) 0;
			margin-bottom: var(--spacing-md);
		}

		.thumbnail-small,
		.thumbnail-add {
			width: var(--size-9);
			height: var(--size-9);
		}

		.thumbnail-item:active .delete-button {
			opacity: 1;
		}
	}

	.textarea-wrapper {
		position: relative;
		flex-grow: 1;
	}

	.textarea-wrapper textarea {
		width: 100%;
	}
</style>
