export const component_map = {
	audio: () => import("./ExampleComponents/Audio.svelte"),
	checkbox: () => import("./ExampleComponents/Checkbox.svelte"),
	checkboxgroup: () => import("./ExampleComponents/CheckboxGroup.svelte"),
	dropdown: () => import("./ExampleComponents/Dropdown.svelte"),
	file: () => import("./ExampleComponents/File.svelte"),
	highlightedtext: () => import("./ExampleComponents/HighlightedText.svelte"),
	html: () => import("./ExampleComponents/HTML.svelte"),
	image: () => import("./ExampleComponents/Image.svelte"),
	number: () => import("./ExampleComponents/Number.svelte"),
	radio: () => import("./ExampleComponents/Radio.svelte"),
	slider: () => import("./ExampleComponents/slider.svelte"),
	textbox: () => import("./ExampleComponents/Textbox.svelte"),
	video: () => import("./ExampleComponents/Video.svelte")
};
