<script lang="ts">
	import {
		keymap,
		highlightSpecialChars,
		drawSelection,
		highlightActiveLine,
		dropCursor,
		rectangularSelection,
		crosshairCursor,
		lineNumbers,
		highlightActiveLineGutter
	} from "@codemirror/view";
	import { Extension, EditorState } from "@codemirror/state";
	import {
		defaultHighlightStyle,
		syntaxHighlighting,
		indentOnInput,
		bracketMatching,
		foldGutter,
		foldKeymap
	} from "@codemirror/language";
	import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
	import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
	import {
		autocompletion,
		completionKeymap,
		closeBrackets,
		closeBracketsKeymap
	} from "@codemirror/autocomplete";
	import { lintKeymap } from "@codemirror/lint";

	// (The superfluous function calls around the list of extensions work
	// around current limitations in tree-shaking software.)

	/// This is an extension value that just pulls together a number of
	/// extensions that you might want in a basic editor. It is meant as a
	/// convenient helper to quickly set up CodeMirror without installing
	/// and importing a lot of separate packages.
	///
	/// Specifically, it includes...
	///
	///  - [the default command bindings](#commands.defaultKeymap)
	///  - [line numbers](#view.lineNumbers)
	///  - [special character highlighting](#view.highlightSpecialChars)
	///  - [the undo history](#commands.history)
	///  - [a fold gutter](#language.foldGutter)
	///  - [custom selection drawing](#view.drawSelection)
	///  - [drop cursor](#view.dropCursor)
	///  - [multiple selections](#state.EditorState^allowMultipleSelections)
	///  - [reindentation on input](#language.indentOnInput)
	///  - [the default highlight style](#language.defaultHighlightStyle) (as fallback)
	///  - [bracket matching](#language.bracketMatching)
	///  - [bracket closing](#autocomplete.closeBrackets)
	///  - [autocompletion](#autocomplete.autocompletion)
	///  - [rectangular selection](#view.rectangularSelection) and [crosshair cursor](#view.crosshairCursor)
	///  - [active line highlighting](#view.highlightActiveLine)
	///  - [active line gutter highlighting](#view.highlightActiveLineGutter)
	///  - [selection match highlighting](#search.highlightSelectionMatches)
	///  - [search](#search.searchKeymap)
	///  - [linting](#lint.lintKeymap)
	///
	/// (You'll probably want to add some language package to your setup
	/// too.)
	///
	/// This extension does not allow customization. The idea is that,
	/// once you decide you want to configure your editor more precisely,
	/// you take this package's source (which is just a bunch of imports
	/// and an array literal), copy it into your own code, and adjust it
	/// as desired.
	export const basicSetup: Extension = (() => [
		lineNumbers(),
		highlightActiveLineGutter(),
		highlightSpecialChars(),
		history(),
		foldGutter(),
		// drawSelection(),
		dropCursor(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
		bracketMatching(),
		closeBrackets(),
		autocompletion(),
		rectangularSelection(),
		crosshairCursor(),
		highlightActiveLine(),
		highlightSelectionMatches(),
		keymap.of([
			...closeBracketsKeymap,
			// ...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			...foldKeymap,
			...completionKeymap
			// ...lintKeymap
		])
	])();

	import { onMount } from "svelte";
	import { Compartment } from "@codemirror/state";
	import { EditorView } from "@codemirror/view";
	import { indentWithTab } from "@codemirror/commands";
	import { python } from "@codemirror/lang-python";
	import {} from "codemirror";
	import { basicDark } from "cm6-theme-basic-dark";

	export let lang: string = "";
	export let value: string = "";
	export let readonly = false;

	let parent: HTMLDivElement;
	let view: EditorView;
	let language = new Compartment();
	let old_value = "";

	console.log(basicSetup);

	let state = EditorState.create({
		doc: "",
		extensions: [
			basicSetup,
			basicDark,
			keymap.of([indentWithTab]),
			language.of(python()),
			readonly ? EditorView.editable.of(false) : [],
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					value = update.state.doc.toString();
					old_value = value;
					console.log(update.changes.empty);
					console.log("inside update", value);
				}
			})
		]
	});

	onMount(() => {
		view = new EditorView({
			state: state,
			parent: parent
		});

		return () => {
			view.destroy();
		};
	});

	function update() {
		view.dispatch({
			changes: { from: 0, to: state.doc.length, insert: value }
		});
		old_value = value;
	}
	$: value !== old_value && update();

	$: console.log(value, $$props.label);
</script>

<div bind:this={parent} contenteditable={!readonly} />

<style>
	:global(.ͼ1.cm-editor) {
		padding-top: 25px;
		background-color: rgb(31 41 55 / var(--tw-bg-opacity));
	}

	:global(.cm-cursor) {
		border-color: white !important;
		background-color: white !important;
		opacity: 1 !important;
		color: white !important;
	}

	:global(.ͼo .cm-cursor) {
		background-color: white;
	}

	:global(.ͼ1.cm-editor:focus-visible, div) {
		outline: none;
	}
	:global(.ͼ1 .cm-editor, .ͼ1 .cm-gutter) {
		min-height: 150px;
	}
	:global(.ͼ1 .cm-gutters) {
		margin-right: 1px;
		background-color: transparent;
		color: #ccc;
		border-color: #79b9ff2e;
	}
	:global(.ͼ1 .cm-scroller) {
		overflow: auto;
	}
	:global(.ͼ1 .cm-wrap) {
		border: 1px solid silver;
	}

	:global(.cm-activeLineGutter, .cm-activeLine) {
		background-color: #79b9ff2e !important;
	}
</style>
