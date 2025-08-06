<script lang="ts">
	import { createEventDispatcher, tick, onMount } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Copy, Check, Send, Plus, Trash } from "@gradio/icons";
	import { fade } from "svelte/transition";
	import { BaseDropdown, BaseDropdownOptions } from "@gradio/dropdown";
	import type { SelectData, CopyData } from "@gradio/utils";
	import type { DialogueLine } from "./utils";
	import Switch from "./Switch.svelte";

	export let speakers: string[] = [];
	export let tags: string[] = [];
	export let value: DialogueLine[] | string = [];
	export let value_is_output = false;
	export let placeholder: string | undefined = undefined;
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label = true;
	export let container = true;
	export let max_lines: number | undefined = undefined;
	export let show_copy_button = false;
	export let show_submit_button = true;
	export let color_map: Record<string, string> | null = null;
	let checked = false;

	export let server: {
		format: (body: DialogueLine[]) => Promise<string>;
		unformat: (body: object) => Promise<DialogueLine[]>;
	};

	let dialogue_lines: DialogueLine[] =
		value && typeof value !== "string" ? [...value] : [];
	let dialogue_container_element: HTMLDivElement;

	let showTagMenu = false;
	let currentLineIndex = -1;
	let selectedOptionIndex = 0;
	let filtered_tags: string[] = [];
	let input_elements: (HTMLInputElement | HTMLTextAreaElement)[] = [];
	let textarea_element: HTMLTextAreaElement;
	let old_value = JSON.stringify(value);
	let offset_from_top = 0;
	let copied = false;
	let timer: any;
	let textbox_value = "";
	let hoveredSpeaker: string | null = null;

	const defaultColorNames = [
		"red",
		"green",
		"blue",
		"yellow",
		"purple",
		"teal",
		"orange",
		"cyan",
		"lime",
		"pink"
	];

	const colorNameToHex: Record<string, string> = {
		red: "rgba(254, 202, 202, 0.7)",
		green: "rgba(209, 250, 229, 0.7)",
		blue: "rgba(219, 234, 254, 0.7)",
		yellow: "rgba(254, 243, 199, 0.7)",
		purple: "rgba(233, 213, 255, 0.7)",
		teal: "rgba(204, 251, 241, 0.7)",
		orange: "rgba(254, 215, 170, 0.7)",
		cyan: "rgba(207, 250, 254, 0.7)",
		lime: "rgba(217, 249, 157, 0.7)",
		pink: "rgba(252, 231, 243, 0.7)"
	};

	let speakerColors: Record<string, string> = {};
	$: {
		if (color_map) {
			speakerColors = { ...color_map };
		} else {
			speakerColors = {};
			speakers.forEach((speaker, index) => {
				const colorName = defaultColorNames[index % defaultColorNames.length];
				speakerColors[speaker] = colorNameToHex[colorName];
			});
		}
	}

	if (speakers.length === 0) {
		checked = true;
		value = "";
	}

	$: if (
		value &&
		value.length === 0 &&
		dialogue_lines.length === 0 &&
		speakers.length !== 0
	) {
		dialogue_lines = [{ speaker: speakers[0], text: "" }];
		value = [...dialogue_lines];
		if (typeof value !== "string") {
			const formatted = value
				.map((line: DialogueLine) => `${line.speaker}: ${line.text}`)
				.join(" ");
			textbox_value = formatted;
		}
	}

	$: {
		if (dialogue_lines.length > input_elements.length) {
			input_elements = [
				...input_elements,
				...Array(dialogue_lines.length - input_elements.length).fill(null)
			];
		} else if (dialogue_lines.length < input_elements.length) {
			input_elements = input_elements.slice(0, dialogue_lines.length);
		}

		tick().then(() => {
			input_elements.forEach((element) => {
				if (element && element instanceof HTMLTextAreaElement) {
					element.style.height = "auto";
					element.style.height = element.scrollHeight + "px";
				}
			});
		});
	}

	function add_line(index: number): void {
		const newSpeaker = speakers.length > 0 ? speakers[0] : "";
		dialogue_lines = [
			...dialogue_lines.slice(0, index + 1),
			{ speaker: newSpeaker, text: "" },
			...dialogue_lines.slice(index + 1)
		];
		if (typeof value !== "string") {
			const formatted = value
				.map((line: DialogueLine) => `${line.speaker}: ${line.text}`)
				.join(" ");
			textbox_value = formatted;
		}

		tick().then(() => {
			if (input_elements[index + 1]) {
				input_elements[index + 1].focus();
			}
		});
	}

	function delete_line(index: number): void {
		dialogue_lines = [
			...dialogue_lines.slice(0, index),
			...dialogue_lines.slice(index + 1)
		];
		if (typeof value !== "string") {
			const formatted = value
				.map((line: DialogueLine) => `${line.speaker}: ${line.text}`)
				.join(" ");
			textbox_value = formatted;
		}
	}

	function update_line(
		index: number,
		key: keyof DialogueLine,
		value: string
	): void {
		dialogue_lines[index][key] = value;
		dialogue_lines = [...dialogue_lines];
		if (typeof value !== "string") {
			const formatted = dialogue_lines
				.map((line: DialogueLine) => `${line.speaker}: ${line.text}`)
				.join(" ");
			textbox_value = formatted;
		}
	}

	function handle_input(event: Event, index: number): void {
		const input = (event.target as HTMLInputElement) || HTMLTextAreaElement;
		if (input && !input_elements[index]) {
			input_elements[index] = input;
		}

		const cursor_position = input.selectionStart || 0;
		const text = input.value;
		let show_menu = false;
		let position_reference_index = -1;

		if (text[cursor_position - 1] === ":") {
			currentLineIndex = index;
			position_reference_index = cursor_position;
			const search_text = get_tag_search_text(text, cursor_position);
			filtered_tags = tags.filter(
				(tag) =>
					search_text === "" ||
					tag.toLowerCase().includes(search_text.toLowerCase())
			);
			show_menu = filtered_tags.length > 0;
			selectedOptionIndex = 0;
		} else {
			const lastColonIndex = text.lastIndexOf(":", cursor_position - 1);
			if (
				lastColonIndex >= 0 &&
				!text.substring(lastColonIndex + 1, cursor_position).includes(" ")
			) {
				currentLineIndex = index;
				position_reference_index = lastColonIndex + 1; // Position menu relative to the start of the potential tag
				const searchText = text.substring(lastColonIndex + 1, cursor_position);
				filtered_tags = tags.filter(
					(tag) =>
						searchText === "" ||
						tag.toLowerCase().includes(searchText.toLowerCase())
				);
				show_menu = filtered_tags.length > 0;
				selectedOptionIndex = 0;
			}
		}

		if (show_menu && position_reference_index !== -1) {
			showTagMenu = true;
			const input_rect = input.getBoundingClientRect();
			// Position menu below the current input by calculating the distance from the top of the container
			// and use 1.5 times the input height.
			if (dialogue_container_element) {
				const container_rect =
					dialogue_container_element.getBoundingClientRect();
				offset_from_top =
					container_rect.top + input_rect.height * (index + 1.5);
			}
		} else {
			showTagMenu = false;
		}
	}

	function get_tag_search_text(text: string, cursorPosition: number): string {
		const lastColonIndex = text.lastIndexOf(":", cursorPosition - 1);
		if (lastColonIndex >= 0) {
			return text.substring(lastColonIndex + 1, cursorPosition);
		}
		return "";
	}

	async function insert_selected_tag(): Promise<void> {
		const tag = filtered_tags[selectedOptionIndex];
		if (tag) {
			let text;
			let currentInput;
			if (checked) {
				currentInput = textarea_element;
				text = textbox_value;
			} else {
				currentInput = input_elements[currentLineIndex];
				text = dialogue_lines[currentLineIndex].text;
			}
			const cursorPosition = currentInput?.selectionStart || 0;
			const lastColonIndex = text.lastIndexOf(":", cursorPosition - 1);
			if (lastColonIndex >= 0) {
				const beforeColon = text.substring(0, lastColonIndex);
				const afterCursor = text.substring(cursorPosition);

				if (checked) {
					// plain text mode: don't filter speaker tags
					const newText = `${beforeColon}${tag} ${afterCursor}`;
					textbox_value = newText;
					if (speakers.length === 0) {
						value = newText;
					} else {
						value = await server.unformat({ text: newText });
					}

					tick().then(() => {
						if (textarea_element) {
							const newCursorPosition = beforeColon.length + tag.length + 1;
							textarea_element.setSelectionRange(
								newCursorPosition,
								newCursorPosition
							);
							textarea_element.focus();
						}
					});
				} else {
					// dialogue line mode
					const filteredBeforeColon = beforeColon
						.replace(/\[S\d+\]/g, "")
						.trim();
					const newText = `${filteredBeforeColon}${tag} ${afterCursor}`;
					update_line(currentLineIndex, "text", newText);

					tick().then(() => {
						const updatedInput = input_elements[currentLineIndex];
						if (updatedInput) {
							const newCursorPosition =
								filteredBeforeColon.length + tag.length + 1;
							updatedInput.setSelectionRange(
								newCursorPosition,
								newCursorPosition
							);
							updatedInput.focus();
						}
					});
				}
			}

			showTagMenu = false;
			selectedOptionIndex = 0;
		}
	}

	async function insert_tag(e: CustomEvent): Promise<void> {
		const tag = tags[e.detail.target.dataset.index];
		if (tag) {
			let text;
			let currentInput;
			if (checked) {
				currentInput = textarea_element;
				text = textbox_value;
			} else {
				currentInput = input_elements[currentLineIndex];
				text = dialogue_lines[currentLineIndex].text;
			}
			const cursorPosition = currentInput?.selectionStart || 0;
			const lastColonIndex = text.lastIndexOf(":", cursorPosition - 1);
			if (lastColonIndex >= 0) {
				const beforeColon = text.substring(0, lastColonIndex);
				const afterCursor = text.substring(cursorPosition);

				if (checked) {
					// plain text mode: don't filter speaker tags
					const newText = `${beforeColon}${tag} ${afterCursor}`;
					textbox_value = newText;
					if (speakers.length === 0) {
						value = newText;
					} else {
						value = await server.unformat({ text: newText });
					}

					tick().then(() => {
						if (textarea_element) {
							const newCursorPosition = beforeColon.length + tag.length + 1;
							textarea_element.setSelectionRange(
								newCursorPosition,
								newCursorPosition
							);
							textarea_element.focus();
						}
					});
				} else {
					// dialogue line mode
					const filteredBeforeColon = beforeColon
						.replace(/\[S\d+\]/g, "")
						.trim();
					const newText = `${filteredBeforeColon}${tag} ${afterCursor}`;
					update_line(currentLineIndex, "text", newText);

					tick().then(() => {
						const updatedInput = input_elements[currentLineIndex];
						if (updatedInput) {
							const newCursorPosition =
								filteredBeforeColon.length + tag.length + 1;
							updatedInput.setSelectionRange(
								newCursorPosition,
								newCursorPosition
							);
							updatedInput.focus();
						}
					});
				}
			}

			showTagMenu = false;
			selectedOptionIndex = 0;
		}
	}

	function handle_click_outside(event: MouseEvent): void {
		if (showTagMenu) {
			const target = event.target as Node;
			const tagMenu = document.getElementById("tag-menu");
			if (tagMenu && !tagMenu.contains(target)) {
				showTagMenu = false;
			}
		}
	}

	const dispatch = createEventDispatcher<{
		change: DialogueLine[] | string;
		submit: undefined;
		blur: undefined;
		select: SelectData;
		input: undefined;
		focus: undefined;
		copy: CopyData;
	}>();

	function handle_change(): void {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}

	function sync_value(dialogueLines: DialogueLine[]): void {
		if (speakers.length !== 0) {
			value = [...dialogueLines];
			if (JSON.stringify(value) !== old_value) {
				handle_change();
				old_value = JSON.stringify(value);
				const formatted = value
					.map((line: DialogueLine) => `${line.speaker}: ${line.text}`)
					.join(" ");
				textbox_value = formatted;
			}
		}
	}

	$: sync_value(dialogue_lines);

	$: if (JSON.stringify(value) !== old_value) {
		if (value == null) {
			dialogue_lines = [];
		}
		old_value = JSON.stringify(value);
		if (value && typeof value !== "string") {
			dialogue_lines = [...value];
			value_to_string(value).then((formatted) => {
				textbox_value = formatted;
			});
		} else {
			textbox_value = value;
			if (!checked && speakers.length > 0 && value) {
				dialogue_lines = string_to_dialogue_lines(value);
			}
		}
		handle_change();
	}

	async function value_to_string(
		value: DialogueLine[] | string
	): Promise<string> {
		if (typeof value === "string") {
			return value;
		}
		return await server.format(value);
	}

	function string_to_dialogue_lines(text: string): DialogueLine[] {
		if (!text.trim()) {
			return [{ speaker: speakers[0] || "", text: "" }];
		}
		const dialogueLines: DialogueLine[] = [];
		const speakerMatches = [];
		const speakerRegex = /\b(Speaker\s+\d+):\s*/g;
		let match;

		while ((match = speakerRegex.exec(text)) !== null) {
			speakerMatches.push({
				speaker: match[1].trim(),
				startIndex: match.index,
				endIndex: match.index + match[0].length
			});
		}
		if (speakerMatches.length === 0) {
			dialogueLines.push({ speaker: speakers[0] || "", text: text.trim() });
		} else {
			for (let i = 0; i < speakerMatches.length; i++) {
				const currentMatch = speakerMatches[i];
				const nextMatch = speakerMatches[i + 1];

				const textStart = currentMatch.endIndex;
				const textEnd = nextMatch ? nextMatch.startIndex : text.length;
				const speakerText = text.substring(textStart, textEnd).trim();

				dialogueLines.push({
					speaker:
						speakers.find(
							(s) => s.toLowerCase() === currentMatch.speaker.toLowerCase()
						) || currentMatch.speaker,
					text: speakerText
				});
			}
		}
		return dialogueLines;
	}

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			const text = await value_to_string(value);
			await navigator.clipboard.writeText(text);
			dispatch("copy", { value: text });
			copy_feedback();
		}
	}

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	async function handle_submit(): Promise<void> {
		if (checked) {
			value = await server.unformat({ text: textbox_value });
		}
		dispatch("submit");
	}

	onMount(async () => {
		if (typeof value === "string") {
			textbox_value = value;
		} else if (value && value.length > 0) {
			const formatted = await value_to_string(value);
			textbox_value = formatted;
		} else {
			textbox_value = "";
		}
	});
</script>

<svelte:window on:click={handle_click_outside} />

<label class:container>
	{#if show_label && show_copy_button}
		{#if copied}
			<button
				in:fade={{ duration: 300 }}
				class="copy-button"
				aria-label="Copied"
				aria-roledescription="Text copied"><Check /></button
			>
		{:else}
			<button
				on:click={handle_copy}
				class="copy-button"
				aria-label="Copy"
				aria-roledescription="Copy text"><Copy /></button
			>
		{/if}
	{/if}

	<!-- svelte-ignore missing-declaration -->
	<BlockTitle {show_label} {info}>{label}</BlockTitle>
	{#if speakers.length !== 0}
		<div class="switch-container top-switch">
			<Switch
				label="Plain Text"
				bind:checked
				on:click={async (e) => {
					if (!e.detail.checked) {
						value = await server.unformat({ text: textbox_value });
					}
				}}
			/>
		</div>
	{/if}
	{#if !checked}
		<div class="dialogue-container" bind:this={dialogue_container_element}>
			{#each dialogue_lines as line, i}
				<div
					class="dialogue-line"
					style="--speaker-bg-color: {disabled &&
					(hoveredSpeaker === null || hoveredSpeaker === line.speaker)
						? speakerColors[line.speaker] || 'transparent'
						: 'transparent'}"
				>
					<div
						class="speaker-column"
						role="button"
						tabindex="0"
						on:mouseenter={() => disabled && (hoveredSpeaker = line.speaker)}
						on:mouseleave={() => disabled && (hoveredSpeaker = null)}
					>
						{#if disabled}
							<textarea
								bind:value={line.speaker}
								{disabled}
								rows="1"
								readonly
							/>
						{:else}
							<BaseDropdown
								bind:value={line.speaker}
								on:change={() => update_line(i, "speaker", line.speaker)}
								choices={speakers.map((s) => [s, s])}
								show_label={false}
								container={true}
								label={""}
							/>
						{/if}
					</div>
					<div class="text-column">
						<div class="input-container">
							<textarea
								bind:value={line.text}
								{placeholder}
								{disabled}
								on:input={(event) => handle_input(event, i)}
								on:focus={(event) => handle_input(event, i)}
								on:keydown={(event) => {
									if (event.key === "Escape" && showTagMenu) {
										showTagMenu = false;
										selectedOptionIndex = 0;
										event.preventDefault();
									} else if (showTagMenu && currentLineIndex === i) {
										if (event.key === "ArrowDown") {
											selectedOptionIndex = Math.min(
												selectedOptionIndex + 1,
												filtered_tags.length - 1
											);
											event.preventDefault();
										} else if (event.key === "ArrowUp") {
											selectedOptionIndex = Math.max(
												selectedOptionIndex - 1,
												0
											);
											event.preventDefault();
										} else if (event.key === "Enter") {
											if (filtered_tags[selectedOptionIndex]) {
												insert_selected_tag();
											}
											event.preventDefault();
										}
									}
								}}
								bind:this={input_elements[i]}
								rows="1"
							></textarea>
							{#if showTagMenu && currentLineIndex === i}
								<div
									id="tag-menu"
									class="tag-menu"
									transition:fade={{ duration: 100 }}
								>
									<BaseDropdownOptions
										choices={tags.map((s, i) => [s, i])}
										filtered_indices={filtered_tags.map((s) => tags.indexOf(s))}
										active_index={filtered_tags.map((s) => tags.indexOf(s))[
											selectedOptionIndex
										]}
										show_options={true}
										on:change={(e) => insert_tag(e)}
										{offset_from_top}
										from_top={true}
									/>
								</div>
							{/if}
						</div>
					</div>
					{#if max_lines == undefined || (max_lines && i < max_lines - 1)}
						<div class:action-column={i == 0} class:hidden={disabled}>
							<button
								class="add-button"
								on:click={() => add_line(i)}
								aria-label="Add new line"
								{disabled}
							>
								<Plus />
							</button>
						</div>
					{/if}
					<div class="action-column" class:hidden={disabled || i == 0}>
						<button
							class="delete-button"
							on:click={() => delete_line(i)}
							aria-label="Remove current line"
							{disabled}
						>
							<Trash />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="textarea-container">
			<textarea
				data-testid="textbox"
				bind:value={textbox_value}
				{placeholder}
				rows={5}
				{disabled}
				on:input={(event) => {
					handle_input(event, 0);
				}}
				on:focus={(event) => handle_input(event, 0)}
				on:keydown={(event) => {
					if (event.key === "Escape" && showTagMenu) {
						showTagMenu = false;
						selectedOptionIndex = 0;
						event.preventDefault();
					} else if (showTagMenu) {
						if (event.key === "ArrowDown") {
							selectedOptionIndex = Math.min(
								selectedOptionIndex + 1,
								filtered_tags.length - 1
							);
							event.preventDefault();
						} else if (event.key === "ArrowUp") {
							selectedOptionIndex = Math.max(selectedOptionIndex - 1, 0);
							event.preventDefault();
						} else if (event.key === "Enter") {
							if (filtered_tags[selectedOptionIndex]) {
								insert_selected_tag();
							}
							event.preventDefault();
						}
					}
				}}
				bind:this={textarea_element}
			/>
			{#if showTagMenu}
				<div
					id="tag-menu"
					class="tag-menu-plain-text"
					transition:fade={{ duration: 100 }}
				>
					<BaseDropdownOptions
						choices={tags.map((s, i) => [s, i])}
						filtered_indices={filtered_tags.map((s) => tags.indexOf(s))}
						active_index={filtered_tags.map((s) => tags.indexOf(s))[
							selectedOptionIndex
						]}
						show_options={true}
						on:change={(e) => insert_tag(e)}
					/>
				</div>
			{/if}
		</div>
	{/if}

	{#if show_submit_button && !disabled}
		<div class="submit-container">
			<button class="submit-button" on:click={handle_submit} {disabled}>
				<Send />
			</button>
		</div>
	{/if}
</label>

<style>
	label {
		display: block;
		width: 100%;
	}

	.input-container {
		display: flex;
		position: relative;
		align-items: flex-end;
	}

	.dialogue-container {
		border: none;
		border-radius: var(--input-radius);
		background: var(--input-background-fill);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-sm);
		position: relative;
	}

	.dialogue-line {
		display: flex;
		align-items: center;
		margin-bottom: var(--spacing-sm);
	}

	.dialogue-line:has(.action-column.hidden) .text-column {
		margin-right: 0;
	}

	.speaker-column {
		flex: 0 0 150px;
		margin-right: var(--spacing-sm);
		display: flex;
		align-items: center;
	}

	.speaker-column textarea {
		background: var(--speaker-bg-color);
		transition: background-color 0.2s ease;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--input-padding);
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		resize: none;
		width: 100%;
		box-sizing: border-box;
		height: auto;
		min-height: 30px;
		max-height: none;
		margin-top: 0px;
		margin-bottom: 0px;
		z-index: 1;
		display: block;
		position: relative;
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		overflow: hidden;
	}

	.text-column {
		flex: 1;
		margin-right: var(--spacing-sm);
	}

	.text-column textarea {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		color: var(--body-text-color);
		background: var(--speaker-bg-color);
		transition: background-color 0.2s ease;
		height: auto;
		min-height: 30px;
		max-height: none;
		flex-grow: 1;
		margin-top: 0px;
		margin-bottom: 0px;
		resize: none;
		z-index: 1;
		display: block;
		position: relative;
		padding: var(--input-padding);
		width: 100%;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		overflow: hidden;
		box-sizing: border-box;
	}

	.text-column textarea {
		color: var(--body-text-color);
	}

	.dialogue-line[style*="--speaker-bg-color: rgba"] .text-column textarea,
	.dialogue-line[style*="--speaker-bg-color: rgba"] .speaker-column textarea {
		color: black;
	}

	textarea {
		flex-grow: 1;
		outline: none !important;
		margin-top: 0px;
		margin-bottom: 0px;
		resize: none;
		z-index: 1;
		display: block;
		position: relative;
		outline: none !important;
		background: var(--input-background-fill);
		padding: var(--input-padding);
		width: 100%;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
	}

	textarea:disabled {
		-webkit-opacity: 1;
		opacity: 1;
	}

	textarea:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
		background: var(--input-background-fill-focus);
	}

	textarea::placeholder {
		color: var(--input-placeholder-color);
	}

	.action-column {
		display: flex;
		justify-content: center;
	}

	.add-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 25px;
		height: 25px;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.delete-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 15px;
		height: 15px;
	}

	.add-button:hover {
		color: var(--color-accent);
	}

	.switch-container {
		display: flex;
		justify-content: flex-start;
	}

	.switch-container.top-switch {
		margin-bottom: var(--spacing-sm);
		justify-content: flex-end;
	}

	.submit-container {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--spacing-sm);
	}

	.submit-container button[disabled] {
		cursor: not-allowed;
	}

	.submit-button {
		border: none;
		text-align: center;
		text-decoration: none;
		font-size: 14px;
		cursor: pointer;
		border-radius: 15px;
		min-width: 30px;
		height: 30px;
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
	}

	.submit-button:hover {
		background: var(--button-secondary-background-fill-hover);
	}

	.submit-button:active {
		box-shadow: var(--button-shadow-active);
	}

	.submit-button :global(svg) {
		height: 22px;
		width: 22px;
	}

	.copy-button {
		display: flex;
		position: absolute;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
		align-items: center;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
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

	.tag-menu {
		position: absolute;
		width: 100%;
		top: 100%;
		left: 0;
	}

	.tag-menu-plain-text {
		position: relative;
		width: 100%;
	}

	.tag-menu-plain-text :global(.options) {
		position: static !important;
		width: 100% !important;
		max-height: none !important;
		top: auto !important;
		bottom: auto !important;
	}

	.hidden {
		display: none;
	}
</style>
