<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import {
		EditorView,
		ViewUpdate,
		keymap,
		placeholder as placeholderExt
	} from "@codemirror/view";
	import { StateEffect, EditorState, type Extension } from "@codemirror/state";
	import { indentWithTab } from "@codemirror/commands";

	import { basicDark } from "cm6-theme-basic-dark";
	import { basicLight } from "cm6-theme-basic-light";
	import { basicSetup } from "./extensions";
	import { getLanguageExtension } from "./language";

	export let class_names = "";
	export let value = "";
	export let dark_mode: boolean;
	export let basic = true;
	export let language: string;
	export let lines = 5;
	export let max_lines: number | null = null;
	export let extensions: Extension[] = [];
	export let use_tab = true;
	export let readonly = false;
	export let placeholder: string | HTMLElement | null | undefined = undefined;
	export let wrap_lines = false;

	const dispatch = createEventDispatcher<{
		change: string;
		blur: undefined;
		focus: undefined;
	}>();
	let lang_extension: Extension | undefined;
	let element: HTMLDivElement;
	let view: EditorView;

	$: get_lang(language);

	async function get_lang(val: string): Promise<void> {
		const ext = await getLanguageExtension(val);
		lang_extension = ext;
	}

	$: reconfigure(), lang_extension, readonly;
	$: set_doc(value);
	$: update_lines();

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
		dispatch("focus");
	}

	function handle_blur(): void {
		dispatch("blur");
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

	function handle_change(vu: ViewUpdate): void {
		if (vu.docChanged) {
			const doc = vu.state.doc;
			const text = doc.toString();
			value = text;
			dispatch("change", text);
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
				lang_extension
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
		lang: Extension | null | undefined
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
			extensions.push(keymap.of([indentWithTab]));
		}
		if (placeholder) {
			extensions.push(placeholderExt(placeholder));
		}
		if (lang) {
			extensions.push(lang);
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
