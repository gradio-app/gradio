<script lang="ts">
	import { onMount } from "svelte";
	import {
		EditorView,
		ViewUpdate,
		keymap,
		placeholder as placeholderExt,
		lineNumbers
	} from "@codemirror/view";
	import { StateEffect, EditorState, type Extension } from "@codemirror/state";
	import { indentWithTab } from "@codemirror/commands";
	import { autocompletion, acceptCompletion } from "@codemirror/autocomplete";

	import { basicDark } from "cm6-theme-basic-dark";
	import { basicLight } from "cm6-theme-basic-light";
	import { basicSetup } from "./extensions";
	import { getLanguageExtension } from "./language";

	interface Props {
		class_names?: string;
		value?: string;
		dark_mode: boolean;
		basic?: boolean;
		language: string;
		lines?: number;
		max_lines?: number | null;
		extensions?: Extension[];
		use_tab?: boolean;
		readonly?: boolean;
		placeholder?: string | HTMLElement | null | undefined;
		wrap_lines?: boolean;
		show_line_numbers?: boolean;
		autocomplete?: boolean;
		onchange?: (value: string) => void;
		onblur?: () => void;
		onfocus?: () => void;
		oninput?: () => void;
	}

	let {
		class_names = "",
		value = $bindable(""),
		dark_mode,
		basic = true,
		language,
		lines = 5,
		max_lines = null,
		extensions = [],
		use_tab = true,
		readonly = false,
		placeholder = undefined,
		wrap_lines = false,
		show_line_numbers = true,
		autocomplete = false,
		onchange,
		onblur,
		onfocus,
		oninput
	}: Props = $props();

	let lang_extension: Extension | undefined = $state();
	let element: HTMLDivElement;
	let view: EditorView;

	async function get_lang(val: string): Promise<void> {
		const ext = await getLanguageExtension(val);
		lang_extension = ext;
	}

	$effect(() => {
		get_lang(language);
	});

	$effect(() => {
		lang_extension;
		readonly;
		reconfigure();
	});

	$effect(() => {
		set_doc(value);
	});

	update_lines();

	function set_doc(new_doc: string): void {
		if (view && new_doc !== view.state.doc.toString()) {
			view.dispatch({
				changes: {
					from: 0,
					to: view.state.doc.length,
					insert: new_doc
				}
			});
		}
	}

	function update_lines(): void {
		if (view) {
			view.requestMeasure({ read: resize });
		}
	}

	function create_editor_view(): EditorView {
		const editorView = new EditorView({
			parent: element,
			state: create_editor_state(value)
		});
		editorView.dom.addEventListener("focus", handle_focus, true);
		editorView.dom.addEventListener("blur", handle_blur, true);
		return editorView;
	}

	function handle_focus(): void {
		onfocus?.();
	}

	function handle_blur(): void {
		onblur?.();
	}

	function getGutterLineHeight(_view: EditorView): string | null {
		let elements = _view.dom.querySelectorAll<HTMLElement>(".cm-gutterElement");
		if (elements.length === 0) {
			return null;
		}
		for (var i = 0; i < elements.length; i++) {
			let node = elements[i];
			let height = getComputedStyle(node)?.height ?? "0px";
			if (height != "0px") {
				return height;
			}
		}
		return null;
	}

	function resize(_view: EditorView): any {
		let scroller = _view.dom.querySelector<HTMLElement>(".cm-scroller");
		if (!scroller) {
			return null;
		}
		const lineHeight = getGutterLineHeight(_view);
		if (!lineHeight) {
			return null;
		}

		const minLines = lines == 1 ? 1 : lines + 1;
		scroller.style.minHeight = `calc(${lineHeight} * ${minLines})`;
		if (max_lines)
			scroller.style.maxHeight = `calc(${lineHeight} * ${max_lines + 1})`;
	}

	import { Transaction } from "@codemirror/state";

	function is_user_input(update: ViewUpdate): boolean {
		return update.transactions.some(
			(tr) => tr.annotation(Transaction.userEvent) != null
		);
	}

	function handle_change(vu: ViewUpdate): void {
		if (!vu.docChanged) return;

		const doc = vu.state.doc;
		const text = doc.toString();
		value = text;

		const user_change = is_user_input(vu);
		if (user_change) {
			onchange?.(text);
			oninput?.();
		} else {
			onchange?.(text);
		}

		view.requestMeasure({ read: resize });
	}

	function get_extensions(): Extension[] {
		const stateExtensions = [
			...get_base_extensions(
				basic,
				use_tab,
				placeholder,
				readonly,
				lang_extension,
				show_line_numbers
			),
			FontTheme,
			...get_theme(),
			...extensions
		];
		return stateExtensions;
	}

	const FontTheme = EditorView.theme({
		"&": {
			fontSize: "var(--text-sm)",
			backgroundColor: "var(--border-color-secondary)"
		},
		".cm-content": {
			paddingTop: "5px",
			paddingBottom: "5px",
			color: "var(--body-text-color)",
			fontFamily: "var(--font-mono)",
			minHeight: "100%"
		},
		".cm-gutterElement": {
			marginRight: "var(--spacing-xs)"
		},
		".cm-gutters": {
			marginRight: "1px",
			borderRight: "1px solid var(--border-color-primary)",
			backgroundColor: "var(--block-background-fill);",
			color: "var(--body-text-color-subdued)"
		},
		".cm-focused": {
			outline: "none"
		},
		".cm-scroller": {
			height: "auto"
		},
		".cm-cursor": {
			borderLeftColor: "var(--body-text-color)"
		}
	});

	const AutocompleteTheme = EditorView.theme({
		".cm-tooltip-autocomplete": {
			"& > ul": {
				backgroundColor: "var(--background-fill-primary)",
				color: "var(--body-text-color)"
			},
			"& > ul > li[aria-selected]": {
				backgroundColor: "var(--color-accent-soft)",
				color: "var(--body-text-color)"
			}
		}
	});

	function create_editor_state(_value: string | null | undefined): EditorState {
		return EditorState.create({
			doc: _value ?? undefined,
			extensions: get_extensions()
		});
	}

	function get_base_extensions(
		basic: boolean,
		use_tab: boolean,
		placeholder: string | HTMLElement | null | undefined,
		readonly: boolean,
		lang: Extension | null | undefined,
		show_line_numbers: boolean
	): Extension[] {
		const extensions: Extension[] = [
			EditorView.editable.of(!readonly),
			EditorState.readOnly.of(readonly),
			EditorView.contentAttributes.of({ "aria-label": "Code input container" })
		];

		if (basic) {
			extensions.push(basicSetup);
		}
		if (use_tab) {
			extensions.push(
				keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab])
			);
		}
		if (placeholder) {
			extensions.push(placeholderExt(placeholder));
		}
		if (lang) {
			extensions.push(lang);
		}
		if (show_line_numbers) {
			extensions.push(lineNumbers());
		}
		if (autocomplete) {
			extensions.push(autocompletion());
			extensions.push(AutocompleteTheme);
		}

		extensions.push(EditorView.updateListener.of(handle_change));
		if (wrap_lines) {
			extensions.push(EditorView.lineWrapping);
		}

		return extensions;
	}

	function get_theme(): Extension[] {
		const extensions: Extension[] = [];

		if (dark_mode) {
			extensions.push(basicDark);
		} else {
			extensions.push(basicLight);
		}
		return extensions;
	}

	function reconfigure(): void {
		view?.dispatch({
			effects: StateEffect.reconfigure.of(get_extensions())
		});
	}

	onMount(() => {
		view = create_editor_view();
		return () => view?.destroy();
	});
</script>

<div class="wrap">
	<div class="codemirror-wrapper {class_names}" bind:this={element} />
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		margin: 0;
		padding: 0;
		height: 100%;
	}
	.codemirror-wrapper {
		flex-grow: 1;
		overflow: auto;
	}

	:global(.cm-editor) {
		height: 100%;
	}

	/* Dunno why this doesn't work through the theme API -- don't remove*/
	:global(.cm-selectionBackground) {
		background-color: #b9d2ff30 !important;
	}

	:global(.cm-focused) {
		outline: none !important;
	}
</style>
