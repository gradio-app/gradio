<script lang="ts">
	import { onMount, tick } from "svelte";
	import { BlockTitle, IconButton, IconButtonWrapper } from "@gradio/atoms";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";
	import { Copy, Check, Send, Plus, Trash } from "@gradio/icons";
	import { fade } from "svelte/transition";
	import { BaseDropdown, BaseDropdownOptions } from "@gradio/dropdown";
	import { Gradio } from "@gradio/utils";
	import type { DialogueLine } from "./utils";
	import Switch from "./Switch.svelte";
	import type { DialogueEvents, DialogueProps } from "./types";

	const props = $props();

	const gradio: Gradio<DialogueEvents, DialogueProps> = props.gradio;

	let checked = $derived(false);
	let disabled = $derived(!gradio.shared.interactive);

	let dialogue_lines: DialogueLine[] = $state([]);

	$effect(() => {
		if (
			gradio.props.value &&
			gradio.props.value.length &&
			typeof gradio.props.value !== "string"
		) {
			dialogue_lines = [...gradio.props.value];
		} else if (gradio.props.value && typeof gradio.props.value !== "string") {
			dialogue_lines = [
				{
					speaker: `${gradio.props.speakers.length ? gradio.props.speakers[0] : ""}`,
					text: ""
				}
			];
		} else if (typeof gradio.props.value === "string") {
			textbox_value = gradio.props.value;
			checked = true;
		}
	});

	let buttons = $derived(gradio.props.buttons || ["copy"]);
	let on_custom_button_click = (id: number) => {
		gradio.dispatch("custom_button_click", { id });
	};

	let old_value = $state(gradio.props.value);

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	let dialogue_container_element: HTMLDivElement;

	let showTagMenu = $state(false);
	let currentLineIndex = $state(-1);
	let selectedOptionIndex = $state(0);
	let filtered_tags: string[] = $state([]);
	let input_elements: (HTMLInputElement | HTMLTextAreaElement)[] = $state([]);

	let textarea_element: HTMLTextAreaElement;
	let offset_from_top = $state(0);
	let copied = $state(false);
	let timer: any;
	let textbox_value = $state("");
	let hoveredSpeaker: string | null = $state(null);
	let is_unformatting = $state(false);
	let is_formatting = $state(false);

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

	let speakerColors: Record<string, string> = $derived.by(() => {
		let _speakerColors: Record<string, string> = {};
		if (gradio.props.color_map) {
			_speakerColors = { ...gradio.props.color_map };
		} else {
			_speakerColors = {};
			gradio.props.speakers.forEach((speaker, index) => {
				const colorName = defaultColorNames[index % defaultColorNames.length];
				_speakerColors[speaker] = colorNameToHex[colorName];
			});
		}
		return _speakerColors;
	});

	function add_line(index: number): void {
		const newSpeaker =
			gradio.props.speakers.length > 0 ? gradio.props.speakers[0] : "";
		dialogue_lines = [
			...dialogue_lines.slice(0, index + 1),
			{ speaker: newSpeaker, text: "" },
			...dialogue_lines.slice(index + 1)
		];

		tick().then(() => {
			if (input_elements[index + 1]) {
				input_elements[index + 1].focus();
			}
		});
		gradio.props.value = [...dialogue_lines];
	}

	function delete_line(index: number): void {
		dialogue_lines = [
			...dialogue_lines.slice(0, index),
			...dialogue_lines.slice(index + 1)
		];
		gradio.props.value = [...dialogue_lines];
	}

	function update_line(
		index: number,
		key: keyof DialogueLine,
		value: string
	): void {
		dialogue_lines[index][key] = value;
		dialogue_lines = [...dialogue_lines];
		gradio.props.value = [...dialogue_lines];
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
			filtered_tags = gradio.props.tags.filter(
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
				filtered_tags = gradio.props.tags.filter(
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
		gradio.dispatch("input");
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
					if (gradio.props.speakers.length === 0) {
						gradio.props.value = newText;
					} else {
						gradio.props.value = await gradio.shared.server.unformat({
							text: newText
						});
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
		const tag = gradio.props.tags[e.detail.target.dataset.index];
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
					if (gradio.props.speakers.length === 0) {
						gradio.props.value = newText;
					} else {
						gradio.props.value = await gradio.shared.server.unformat({
							text: newText
						});
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

	async function value_to_string(
		value: DialogueLine[] | string
	): Promise<string> {
		if (typeof value === "string") {
			return value;
		}
		return await gradio.shared.server.format(value);
	}

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			const text = await value_to_string(gradio.props.value);
			await navigator.clipboard.writeText(text);
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
			gradio.props.value = await gradio.shared.server.unformat({
				text: textbox_value
			});
		}
		gradio.dispatch("submit");
	}

	onMount(async () => {
		if (typeof gradio.props.value === "string") {
			textbox_value = gradio.props.value;
		} else if (gradio.props.value && gradio.props.value.length > 0) {
			const formatted = await value_to_string(gradio.props.value);
			textbox_value = formatted;
		} else {
			textbox_value = "";
		}
	});
</script>

<svelte:window on:click={handle_click_outside} />

<label class:container={gradio.shared.container}>
	{#if gradio.shared.show_label && (buttons.some((btn) => typeof btn === "string" && btn === "copy") || buttons.some((btn) => typeof btn !== "string"))}
		<IconButtonWrapper {buttons} {on_custom_button_click}>
			{#if buttons.some((btn) => typeof btn === "string" && btn === "copy")}
				<IconButton
					Icon={copied ? Check : Copy}
					on:click={handle_copy}
					label={copied ? "Copied" : "Copy"}
				/>
			{/if}
		</IconButtonWrapper>
	{/if}

	<BlockTitle show_label={gradio.shared.show_label} info={gradio.props.info}
		>{gradio.shared.label || "Dialogue"}</BlockTitle
	>
	{#if gradio.props.ui_mode === "both"}
		<div
			class="switch-container top-switch"
			class:switch-disabled={is_formatting || is_unformatting}
		>
			<Switch
				label="Plain Text"
				bind:checked
				disabled={is_formatting || is_unformatting}
				on:click={async (e) => {
					if (!e.detail.checked) {
						is_unformatting = true;
						try {
							gradio.props.value = await gradio.shared.server.unformat({
								text: textbox_value
							});
							dialogue_lines = [...(gradio.props.value as DialogueLine[])];
						} finally {
							is_unformatting = false;
						}
					} else {
						is_formatting = true;
						try {
							textbox_value = await value_to_string(dialogue_lines);
						} finally {
							is_formatting = false;
						}
					}
				}}
			/>
		</div>
	{/if}
	{#if !checked && gradio.props.ui_mode !== "text"}
		<div
			class="dialogue-container"
			bind:this={dialogue_container_element}
			class:loading={is_unformatting}
		>
			{#if is_unformatting}
				<div class="loading-overlay" transition:fade={{ duration: 200 }}>
					<div class="loading-spinner"></div>
					<div class="loading-text">Converting to dialogue format...</div>
				</div>
			{/if}
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
								label=""
								show_label={false}
								container={true}
								interactive={true}
								value={line.speaker}
								choices={gradio.props.speakers.map((s) => [s, s])}
								on_change={(val) => update_line(i, "speaker", val as string)}
							/>
						{/if}
					</div>
					<div class="text-column">
						<div class="input-container">
							<textarea
								bind:value={line.text}
								placeholder={gradio.props.placeholder}
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
										choices={gradio.props.tags.map((s, i) => [s, i])}
										filtered_indices={filtered_tags.map((s) =>
											gradio.props.tags.indexOf(s)
										)}
										active_index={filtered_tags.map((s) =>
											gradio.props.tags.indexOf(s)
										)[selectedOptionIndex]}
										show_options={true}
										on:change={(e) => insert_tag(e)}
										{offset_from_top}
										from_top={true}
									/>
								</div>
							{/if}
						</div>
					</div>
					{#if gradio.props.max_lines == undefined || (gradio.props.max_lines && i < gradio.props.max_lines - 1)}
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
	{:else if checked || gradio.props.ui_mode !== "dialogue"}
		<div class="textarea-container" class:loading={is_formatting}>
			{#if is_formatting}
				<div class="loading-overlay" transition:fade={{ duration: 200 }}>
					<div class="loading-spinner"></div>
					<div class="loading-text">Converting to plain text...</div>
				</div>
			{/if}
			<textarea
				data-testid="textbox"
				bind:value={textbox_value}
				placeholder={gradio.props.placeholder}
				rows={5}
				{disabled}
				on:input={(event) => {
					handle_input(event, 0);
					gradio.props.value = textbox_value;
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
						choices={gradio.props.tags.map((s, i) => [s, i])}
						filtered_indices={filtered_tags.map((s) =>
							gradio.props.tags.indexOf(s)
						)}
						active_index={filtered_tags.map((s) =>
							gradio.props.tags.indexOf(s)
						)[selectedOptionIndex]}
						show_options={true}
						on:change={(e) => insert_tag(e)}
					/>
				</div>
			{/if}
		</div>
	{/if}

	{#if gradio.props.submit_btn && !disabled}
		<div class="submit-container">
			<button class="submit-button" on:click={handle_submit} {disabled}>
				{#if typeof gradio.props.submit_btn === "string"}
					{gradio.props.submit_btn}
				{:else}
					<Send />
				{/if}
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
		transition: opacity 0.2s ease-in-out;
	}

	.switch-container.switch-disabled {
		opacity: 0.6;
		pointer-events: none;
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

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--input-background-fill);
		opacity: 0.95;
		backdrop-filter: blur(2px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 10;
		border-radius: var(--input-radius);
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid var(--border-color-primary);
		border-top: 2px solid var(--color-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: var(--spacing-sm);
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		color: var(--body-text-color);
		font-size: var(--text-sm);
		font-weight: 500;
		opacity: 0.8;
	}

	.dialogue-container.loading,
	.textarea-container.loading {
		position: relative;
		opacity: 0.7;
		transition: opacity 0.3s ease-in-out;
	}

	.dialogue-container,
	.textarea-container {
		transition: opacity 0.3s ease-in-out;
	}
</style>
