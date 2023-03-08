<!-- original from: https://github.com/touchifyapp/svelte-codemirror-editor/blob/main/src/lib/CodeMirror.svelte -->
<script lang="ts">
	import type { ViewUpdate } from "@codemirror/view";

	import { createEventDispatcher, onMount } from "svelte";
	import {
		EditorView,
		keymap,
		placeholder as placeholderExt
	} from "@codemirror/view";
	import { StateEffect, EditorState, type Extension } from "@codemirror/state";
	import { indentWithTab } from "@codemirror/commands";
	import { basicDark } from "cm6-theme-basic-dark";

	import { basicLight } from "cm6-theme-basic-light";

	// import IconSpin from "../Icons/IconSpin.svelte";

	import { basicSetup } from "./extensions";
	import { getLanguageExtension, type CodeMirrorLanguage } from "./language";

	export let classNames = "";
	export let value = "";
	export let dark_mode: boolean;

	export let basic = true;
	export let lang: CodeMirrorLanguage;
	export let extensions: Extension[] = [];

	export let useTab = true;

	export let editable = true;
	export let readonly = false;
	export let placeholder: string | HTMLElement | null | undefined = undefined;

	const dispatch = createEventDispatcher<{ change: string }>();
	let lang_extension: Extension | undefined;
	let element: HTMLDivElement;
	let view: EditorView;

	$: lang_extension = getLanguageExtension(lang);
	$: reconfigure(), lang;
	$: setDoc(value);

	function setDoc(newDoc: string) {
		if (view && newDoc !== view.state.doc.toString()) {
			view.dispatch({
				changes: {
					from: 0,
					to: view.state.doc.length,
					insert: newDoc
				}
			});
		}
	}

	function createEditorView(): EditorView {
		return new EditorView({
			parent: element,
			state: createEditorState(value)
		});
	}

	function handleChange(vu: ViewUpdate): void {
		if (vu.docChanged) {
			const doc = vu.state.doc;
			const text = doc.toString();
			console.log(text);
			value = text;
			dispatch("change", text);
		}
	}

	function getExtensions() {
		const stateExtensions = [
			...getBaseExtensions(
				basic,
				useTab,
				placeholder,
				editable,
				readonly,
				lang_extension
			),
			...getTheme(),
			...extensions
		];
		return stateExtensions;
	}

	function createEditorState(value: string | null | undefined): EditorState {
		return EditorState.create({
			doc: value ?? undefined,
			extensions: getExtensions()
		});
	}

	function getBaseExtensions(
		basic: boolean,
		useTab: boolean,
		placeholder: string | HTMLElement | null | undefined,
		editable: boolean,
		readonly: boolean,
		lang: Extension | null | undefined
	): Extension[] {
		const extensions: Extension[] = [
			EditorView.editable.of(editable),
			EditorState.readOnly.of(readonly)
		];

		if (basic) {
			extensions.push(basicSetup);
		}
		if (useTab) {
			extensions.push(keymap.of([indentWithTab]));
		}
		if (placeholder) {
			extensions.push(placeholderExt(placeholder));
		}
		if (lang) {
			extensions.push(lang);
		}

		extensions.push(EditorView.updateListener.of(handleChange));
		return extensions;
	}

	function getTheme(): Extension[] {
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
			effects: StateEffect.reconfigure.of(getExtensions())
		});
	}

	onMount(() => {
		view = createEditorView();
		return () => view?.destroy();
	});
</script>

<div class="codemirror-wrapper {classNames}" bind:this={element} />
