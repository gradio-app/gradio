# How to Create a New Component

Docs: component

## Introduction

The purpose of this guide is to illustrate how to add a new component, which you can use in your Gradio applications. The guide will be complemented by code snippets showing step by step how the [ColorPicker](https://gradio.app/docs/#colorpicker) component was added.

## Prerequisites

Make sure you have followed the [CONTRIBUTING.md](../CONTRIBUTING.md) guide in order to setup your local development environment (both client and server side).

## Step 1 - Create a New Python Class and Import it

The first thing to do is to create a new class within the [components.py](https://github.com/gradio-app/gradio/blob/main/gradio/components.py) file. This Python class should inherit from a list of base components and should be placed within the file in the correct section with respect to the type of component you want to add (e.g. input, output or static components).
In general, it is advisable to take an existing component as a reference (e.g. [TextBox](https://github.com/gradio-app/gradio/blob/main/gradio/components.py#L290)), copy its code as a skeleton and then adapt it to the case at hand.

Let's take a look at the class added to the [components.py](https://github.com/gradio-app/gradio/blob/main/gradio/components.py) file for the ColorPicker component:

```python
@document()
class ColorPicker(Changeable, Submittable, IOComponent):
    """
    Creates a color picker for user to select a color as string input.
    Preprocessing: passes selected color value as a {str} into the function.
    Postprocessing: expects a {str} returned from function and sets color picker value to it.
    Examples-format: a {str} with a hexadecimal representation of a color, e.g. "#ff0000" for red.
    Demos: color_picker, color_generator
    """

    def __init__(
        self,
        value: str = None,
        *,
        label: Optional[str] = None,
        show_label: bool = True,
        interactive: Optional[bool] = None,
        visible: bool = True,
        elem_id: Optional[str] = None,
        **kwargs,
    ):
        """
        Parameters:
            value: default text to provide in color picker.
            label: component name in interface.
            show_label: if True, will display label.
            interactive: if True, will be rendered as an editable color picker; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.value = self.postprocess(value)
        self.cleared_value = "#000000"
        self.test_input = value
        IOComponent.__init__(
            self,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: Optional[Any] = None,
        label: Optional[str] = None,
        show_label: Optional[bool] = None,
        visible: Optional[bool] = None,
        interactive: Optional[bool] = None,
    ):
        updated_config = {
            "value": value,
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "__type__": "update",
        }
        return IOComponent.add_interactive_to_config(updated_config, interactive)

    # Input Functionalities
    def preprocess(self, x: str | None) -> Any:
        """
        Any preprocessing needed to be performed on function input.
        Parameters:
        x (str): text
        Returns:
        (str): text
        """
        if x is None:
            return None
        else:
            return str(x)

    def preprocess_example(self, x: str | None) -> Any:
        """
        Any preprocessing needed to be performed on an example before being passed to the main function.
        """
        if x is None:
            return None
        else:
            return str(x)

    def generate_sample(self) -> str:
        return "#000000"

    # Output Functionalities
    def postprocess(self, y: str | None):
        """
        Any postprocessing needed to be performed on function output.
        Parameters:
        y (str | None): text
        Returns:
        (str | None): text
        """
        if y is None:
            return None
        else:
            return str(y)

    def deserialize(self, x):
        """
        Convert from serialized output (e.g. base64 representation) from a call() to the interface to a human-readable version of the output (path of an image, etc.)
        """
        return x
```


Once defined, it is necessary to import the new class inside the [\_\_init\_\_](https://github.com/gradio-app/gradio/blob/main/gradio/__init__.py) module class in order to make it module visible.

```python

from gradio.components import (
    ...
    ColorPicker,
    ...
)

```

### Step 1.1 - Writing Unit Test for Python Class

When developing new components, you should also write a suite of unit tests for it. The tests should be placed in the [gradio/test/test_components.py](https://github.com/gradio-app/gradio/blob/main/test/test_components.py) file. Again, as above, take a cue from the tests of other components (e.g. [Textbox](https://github.com/gradio-app/gradio/blob/main/test/test_components.py)) and add as many unit tests as you think are appropriate to test all the different aspects and functionalities of the new component. For example, the following tests were added for the ColorPicker component:

```python
class TestColorPicker(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, save_flagged, restore_flagged, tokenize, generate_sample, get_config
        """
        color_picker_input = gr.ColorPicker()
        self.assertEqual(color_picker_input.preprocess("#000000"), "#000000")
        self.assertEqual(color_picker_input.preprocess_example("#000000"), "#000000")
        self.assertEqual(color_picker_input.postprocess(None), None)
        self.assertEqual(color_picker_input.postprocess("#FFFFFF"), "#FFFFFF")
        self.assertEqual(color_picker_input.serialize("#000000", True), "#000000")

        color_picker_input.interpretation_replacement = "unknown"

        self.assertEqual(
            color_picker_input.get_config(),
            {
                "value": None,
                "show_label": True,
                "label": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
                "name": "colorpicker",
            },
        )
        self.assertIsInstance(color_picker_input.generate_sample(), str)

    def test_in_interface_as_input(self):
        """
        Interface, process, interpret,
        """
        iface = gr.Interface(lambda x: x, "colorpicker", "colorpicker")
        self.assertEqual(iface.process(["#000000"]), ["#000000"])

    def test_in_interface_as_output(self):
        """
        Interface, process

        """
        iface = gr.Interface(lambda x: x, "colorpicker", gr.ColorPicker())
        self.assertEqual(iface.process(["#000000"]), ["#000000"])

    def test_static(self):
        """
        postprocess
        """
        component = gr.ColorPicker("#000000")
        self.assertEqual(component.get_config().get("value"), "#000000")
```

## Step 2 - Create a New Svelte Component

Let's see the steps you need to follow to create the frontend of your new component and to map it to its python code:
- Create a new UI-side Svelte component and figure out where to place it. The options are: create a package for the new component in the [ui/packages folder](https://github.com/gradio-app/gradio/tree/main/ui/packages), if this is completely different from existing components or add the new component to an existing package, such as to the [form package](https://github.com/gradio-app/gradio/tree/main/ui/packages/form). The ColorPicker component for example, was included in the form package because it is similar to components that already exist.
- Create a file with an appropriate name in the src folder of the package where you placed the Svelte component, note: the name must start with a capital letter. Initially add any text/html to this file so that the component renders something. The Svelte application code for the ColorPicker looks like this:

```typescript
<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { get_styles } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";
	import type { Styles } from "@gradio/utils";

	export let value: string = "#000000";
	export let style: Styles = {};
	export let label: string;
	export let disabled = false;
	export let show_label: boolean = true;

	$: value;
	$: handle_change(value);

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
	}>();

	function handle_change(val: string) {
		dispatch("change", val);
	}

	$: ({ classes } = get_styles(style, ["rounded", "border"]));
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label}>{label}</BlockTitle>
	<input
		type="color"
		class="gr-box-unrounded {classes}"
		bind:value
		{disabled}
	/>
</label>
```

- Export this file inside the index.ts file of the package where you placed the Svelte component by doing `export { default as FileName } from "./FileName.svelte"`. The ColorPicker file is exported in the [index.ts](https://github.com/gradio-app/gradio/blob/main/ui/packages/form/src/index.ts) file and the export is performed by doing: `export { default as ColorPicker } from "./ColorPicker.svelte";`.
- Create the Gradio specific component in [ui/packages/app/src/components](https://github.com/gradio-app/gradio/tree/main/ui/packages/app/src/components), copy the folder of another component, rename it and edit the code inside it, keeping the structure. 

Here you will have three files, the first file is for the Svelte application, and it will look like this:

```typescript
<svelte:options accessors={true} />

<script lang="ts">
	import { ColorPicker } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let label: string = "ColorPicker";
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string;
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	export let style: Styles = {};

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";
</script>

<Block
	{visible}
	{form_position}
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	<ColorPicker
		{style}
		bind:value
		{label}
		{show_label}
		on:change
		on:submit
		disabled={mode === "static"}
	/>
</Block>
```

The second one contains the tests for the frontend, for example for the ColorPicker component:

```typescript
import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render } from "@gradio/tootils";

import ColorPicker from "./ColorPicker.svelte";
import type { LoadingStatus } from "../StatusTracker/types";

const loading_status = {
	eta: 0,
	queue_position: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0
};

describe("ColorPicker", () => {
	afterEach(() => cleanup());

	test("renders provided value", () => {
		const { getByDisplayValue } = render(ColorPicker, {
			loading_status,
			show_label: true,
			mode: "dynamic",
			value: "#000000",
			label: "ColorPicker"
		});

		const item: HTMLInputElement = getByDisplayValue("#000000");
		assert.equal(item.value, "#000000");
	});

	test("changing the color should update the value", async () => {
		const { component, getByDisplayValue } = render(ColorPicker, {
			loading_status,
			show_label: true,
			mode: "dynamic",
			value: "#000000",
			label: "ColorPicker"
		});

		const item: HTMLInputElement = getByDisplayValue("#000000");

		assert.equal(item.value, "#000000");

		await component.$set({
			value: "#FFFFFF"
		});

		assert.equal(component.value, "#FFFFFF");
	});
});
```

The third one is the index.ts file:

```typescript
export { default as Component } from "./ColorPicker.svelte";
export const modes = ["static", "dynamic"];
```

- Add the mapping for your component in the [directory.ts file](https://github.com/gradio-app/gradio/blob/main/ui/packages/app/src/components/directory.ts). To do this, copy and paste the mapping line of any component and edit its text. The key name must be the lowercase version of the actual component name in the Python library. So for example, for the ColorPicker component the mapping looks like this: 

```typescript
export const component_map = {
...
colorpicker: () => import("./ColorPicker"),
...
}
```

### Step 2.1 . Writing Unit Test for Svelte Component

When developing new components, you should also write a suite of unit tests for it. The tests should be placed in the new component's folder in a file named MyAwesomeComponent.test.ts. Again, as above, take a cue from the tests of other components (e.g. [Textbox.test.ts](https://github.com/gradio-app/gradio/blob/main/ui/packages/app/src/components/Textbox/Textbox.test.ts)) and add as many unit tests as you think are appropriate to test all the different aspects and functionalities of the new component.

### Step 3 - Create a New Demo

The last step is to create a demo in the [gradio/demo folder](https://github.com/gradio-app/gradio/tree/main/demo), which will use the newly added component. Again, the suggestion is to reference an existing demo. Write the code for the demo in a file called run.py, add the necessary requirements and an image showing the application interface. Finally add a gif showing its usage. 
You can take a look at the [demo](https://github.com/gradio-app/gradio/tree/main/demo/color_picker) created for the ColorPicker, where an icon and a color selected through the new component is taken as input, and the same icon colored with the selected color is returned as output.

To test the application:

- run on a terminal `python path/demo/run.py` which starts the backend at the address [http://localhost:7860](http://localhost:7860);
- in another terminal, from the ui folder, run `pnpm dev` to start the frontend at [localhost:3000](localhost:3000) with hot reload functionalities.

## Conclusion

In this guide, we have shown how simple it is to add a new component to Gradio, seeing step by step how the ColorPicker component was added. For further details, you can refer to PR: [#1695](https://github.com/gradio-app/gradio/pull/1695).
