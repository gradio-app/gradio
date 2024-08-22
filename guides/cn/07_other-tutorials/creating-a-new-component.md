# 如何创建一个新组件

## 简介

本指南旨在说明如何添加一个新组件，你可以在 Gradio 应用程序中使用该组件。该指南将通过代码片段逐步展示如何添加[ColorPicker](https://gradio.app/docs/colorpicker)组件。

## 先决条件

确保您已经按照[CONTRIBUTING.md](https://github.com/gradio-app/gradio/blob/main/CONTRIBUTING.md)指南设置了本地开发环境（包括客户端和服务器端）。

以下是在 Gradio 上创建新组件的步骤：

1. [创建一个新的 Python 类并导入它](#1-create-a-new-python-class-and-import-it)
2. [创建一个新的 Svelte 组件](#2-create-a-new-svelte-component)
3. [创建一个新的演示](#3-create-a-new-demo)

## 1. 创建一个新的 Python 类并导入它

首先要做的是在[components.py](https://github.com/gradio-app/gradio/blob/main/gradio/components.py)文件中创建一个新的类。这个 Python 类应该继承自一系列的基本组件，并且应该根据要添加的组件的类型（例如输入、输出或静态组件）将其放置在文件中的正确部分。
一般来说，建议参考现有的组件（例如[TextBox](https://github.com/gradio-app/gradio/blob/main/gradio/components.py#L290)），将其代码复制为骨架，然后根据实际情况进行修改。

让我们来看一下添加到[components.py](https://github.com/gradio-app/gradio/blob/main/gradio/components.py)文件中的 ColorPicker 组件的类：

```python
@document()
class ColorPicker(Changeable, Submittable, IOComponent):
    """
    创建一个颜色选择器，用户可以选择颜色作为字符串输入。
    预处理：将选择的颜色值作为{str}传递给函数。
    后处理：期望从函数中返回一个{str}，并将颜色选择器的值设置为它。
    示例格式：表示颜色的十六进制{str}，例如红色的"#ff0000"。
    演示：color_picker，color_generator
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
        return {
            "value": value,
            "label": label,
            "show_label": show_label,
            "visible": visible,
            "interactive": interactive,
            "__type__": "update",
        }

    # 输入功能
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
        在传递给主函数之前，对示例进行任何预处理。
        """
        if x is None:
            return None
        else:
            return str(x)

    # 输出功能
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
        将从调用接口的序列化输出（例如base64表示）转换为输出的人类可读版本（图像的路径等）
        """
        return x
```

一旦定义完，就需要在[\_\_init\_\_](https://github.com/gradio-app/gradio/blob/main/gradio/__init__.py)模块类中导入新类，以使其可见。

```python

from gradio.components import (
    ...
    ColorPicker,
    ...
)

```

### 1.1 为 Python 类编写单元测试

在开发新组件时，还应为其编写一套单元测试。这些测试应该放在[gradio/test/test_components.py](https://github.com/gradio-app/gradio/blob/main/test/test_components.py)文件中。同样，如上所述，参考其他组件的测试（例如[Textbox](https://github.com/gradio-app/gradio/blob/main/test/test_components.py)）并添加尽可能多的单元测试，以测试新组件的所有不同方面和功能。例如，为 ColorPicker 组件添加了以下测试：

```python
class TestColorPicker(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, save_flagged, restore_flagged, tokenize, get_config
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

    def test_in_interface_as_input(self):
        """
        接口、处理、解释
        """
        iface = gr.Interface(lambda x: x, "colorpicker", "colorpicker")
        self.assertEqual(iface.process(["#000000"]), ["#000000"])

    def test_in_interface_as_output(self):
        """
        接口、处理

        """
        iface = gr.Interface(lambda x: x, "colorpicker", gr.ColorPicker())
        self.assertEqual(iface.process(["#000000"]), ["#000000"])

    def test_static(self):
        """
        后处理
        """
        component = gr.ColorPicker("#000000")
        self.assertEqual(component.get_config().get("value"), "#000000")
```

## 2. 创建一个新的 Svelte 组件

让我们来看看创建新组件的前端并将其与其 Python 代码映射起来的步骤：

- 在 [js 文件夹](https://github.com/gradio-app/gradio/tree/main/js/) 中创建一个新的 UI-side Svelte 组件，并确定要放置在什么地方。选项包括：创建新组件的包（如果与现有组件完全不同），或将新组件添加到现有包中，例如 [form 包](https://github.com/gradio-app/gradio/tree/main/js/form)。例如，ColorPicker 组件被包含在 form 包中，因为它与已存在的组件相似。
- 在您将 Svelte 组件放置的包的 src 文件夹中创建一个带有适当名称的文件，注意：名称必须以大写字母开头。这是“核心”组件，是没有 Gradio 特定功能了解的通用组件。最初，将任何文本 /HTML 添加到此文件，以便组件呈现任何内容。ColorPicker 的 Svelte 应用程序代码如下所示：

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

	$: ({ styles } = get_styles(style, ["rounded", "border"]));
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

- 通过执行 `export { default as FileName } from "./FileName.svelte"`，在您将 Svelte 组件放置的包的 index.ts 文件中导出此文件。例如，在 [index.ts](https://github.com/gradio-app/gradio/blob/main/js/form/src/index.ts) 文件中导出了 ColorPicker 文件，并通过 `export { default as ColorPicker } from "./ColorPicker.svelte";` 执行导出。
- 创建 [js/app/src/components](https://github.com/gradio-app/gradio/tree/main/js/app/src/components) 中的 Gradio 特定组件。这是一个 Gradio 包装器，处理库的特定逻辑，将必要的数据传递给核心组件，并附加任何必要的事件监听器。复制另一个组件的文件夹，重新命名并编辑其中的代码，保持结构不变。

在这里，您将拥有三个文件，第一个文件用于 Svelte 应用程序，具体如下所示：

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

	export let interactive: boolean;
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
		disabled={!interactive}
	/>
</Block>
```

第二个文件包含了前端的测试，例如 ColorPicker 组件的测试：

```typescript
import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render } from "@self/tootils";

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
			interactive: true,
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
			interactive: true,
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

- `directory.ts` 文件中添加组件的映射。复制并粘贴任何组件的映射行，并编辑其文本。键名必须是 Python 库中实际组件名称的小写版本。例如，对于 ColorPicker 组件，映射如下所示：

```typescript
export const component_map = {
...
colorpicker: () => import("./ColorPicker"),
...
}
```

### 2.1 为 Svelte 组件编写单元测试

在开发新组件时，您还应该为其编写一套单元测试。测试应该放置在新组件的文件夹中，文件名为 MyAwesomeComponent.test.ts。同样，像上面那样参考其他组件的测试（例如[Textbox.test.ts](https://github.com/gradio-app/gradio/blob/main/js/app/src/components/Textbox/Textbox.test.ts)），并添加尽可能多的单元测试，以测试新组件的不同方面和功能。

### 3. 创建新的演示

最后一步是在[gradio/demo 文件夹](https://github.com/gradio-app/gradio/tree/main/demo)中创建一个使用新添加的组件的演示。同样，建议参考现有演示。在一个名为 run.py 的文件中编写演示的代码，添加必要的要求和显示应用程序界面的图像。最后添加一个显示其用法的 gif。
您可以查看为 ColorPicker 创建的[demo](https://github.com/gradio-app/gradio/tree/main/demo/color_picker)，其中以新组件选择的图标和颜色作为输入，并以选择的颜色着色的相同图标作为输出。

要测试应用程序：

- 在终端上运行 `python path/demo/run.py`，它会在地址 [http://localhost:7860](http://localhost:7860) 启动后端；
- 在另一个终端上，运行 `pnpm dev` 以在 [http://localhost:9876](http://localhost:9876) 上启动具有热重新加载功能的前端。

## 结论

在本指南中，我们展示了将新组件添加到 Gradio 是多么简单，逐步介绍了如何添加 ColorPicker 组件。要了解更多细节，可以参考 PR：[#1695](https://github.com/gradio-app/gradio/pull/1695).
