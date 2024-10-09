# 快速开始

**先决条件**：Gradio 需要 Python 3.10 或更高版本，就是这样！

## Gradio 是做什么的？

与他人分享您的机器学习模型、API 或数据科学流程的*最佳方式之一*是创建一个**交互式应用程序**，让您的用户或同事可以在他们的浏览器中尝试演示。

Gradio 允许您**使用 Python 构建演示并共享这些演示**。通常只需几行代码！那么我们开始吧。

## Hello, World

要通过一个简单的“Hello, World”示例运行 Gradio，请遵循以下三个步骤：

1. 使用 pip 安装 Gradio：

```bash
pip install gradio
```

2. 将下面的代码作为 Python 脚本运行或在 Jupyter Notebook 中运行（或者 [Google Colab](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing)）：

$code_hello_world

我们将导入的名称缩短为 `gr`，以便以后在使用 Gradio 的代码中更容易理解。这是一种广泛采用的约定，您应该遵循，以便与您的代码一起工作的任何人都可以轻松理解。

3. 在 Jupyter Notebook 中，该演示将自动显示；如果从脚本运行，则会在浏览器中弹出，网址为 [http://localhost:7860](http://localhost:7860)：

$demo_hello_world

在本地开发时，如果您想将代码作为 Python 脚本运行，您可以使用 Gradio CLI 以**重载模式**启动应用程序，这将提供无缝和快速的开发。了解有关[自动重载指南](https://gradio.app/developing-faster-with-reload-mode/)中重新加载的更多信息。

```bash
gradio app.py
```

注意：您也可以运行 `python app.py`，但它不会提供自动重新加载机制。

## `Interface` 类

您会注意到为了创建演示，我们创建了一个 `gr.Interface`。`Interface` 类可以将任何 Python 函数与用户界面配对。在上面的示例中，我们看到了一个简单的基于文本的函数，但该函数可以是任何内容，从音乐生成器到税款计算器再到预训练的机器学习模型的预测函数。

`Interface` 类的核心是使用三个必需参数进行初始化：

- `fn`：要在其周围包装 UI 的函数
- `inputs`：用于输入的组件（例如 `"text"`、`"image"` 或 `"audio"`）
- `outputs`：用于输出的组件（例如 `"text"`、`"image"` 或 `"label"`）

让我们更详细地了解用于提供输入和输出的组件。

## 组件属性 (Components Attributes)

我们在前面的示例中看到了一些简单的 `Textbox` 组件，但是如果您想更改 UI 组件的外观或行为怎么办？

假设您想自定义输入文本字段 - 例如，您希望它更大并具有文本占位符。如果我们使用实际的 `Textbox` 类而不是使用字符串快捷方式，您可以通过组件属性获得更多的自定义功能。

$code_hello_world_2
$demo_hello_world_2

## 多个输入和输出组件

假设您有一个更复杂的函数，具有多个输入和输出。在下面的示例中，我们定义了一个接受字符串、布尔值和数字，并返回字符串和数字的函数。请看一下如何传递输入和输出组件的列表。

$code_hello_world_3
$demo_hello_world_3

只需将组件包装在列表中。`inputs` 列表中的每个组件对应函数的一个参数，顺序相同。`outputs` 列表中的每个组件对应函数返回的一个值，同样是顺序。

## 图像示例

Gradio 支持许多类型的组件，例如 `Image`、`DataFrame`、`Video` 或 `Label`。让我们尝试一个图像到图像的函数，以了解这些组件的感觉！

$code_sepia_filter
$demo_sepia_filter

使用 `Image` 组件作为输入时，您的函数将接收到一个形状为`（高度，宽度，3）` 的 NumPy 数组，其中最后一个维度表示 RGB 值。我们还将返回一个图像，形式为 NumPy 数组。

您还可以使用 `type=` 关键字参数设置组件使用的数据类型。例如，如果您希望函数接受图像文件路径而不是 NumPy 数组，输入 `Image` 组件可以写成：

```python
gr.Image(type="filepath")
```

还要注意，我们的输入 `Image` 组件附带有一个编辑按钮🖉，允许裁剪和缩放图像。通过这种方式操作图像可以帮助揭示机器学习模型中的偏见或隐藏的缺陷！

您可以在[Gradio 文档](https://gradio.app/docs)中阅读有关许多组件以及如何使用它们的更多信息。

## Blocks：更灵活和可控

Gradio 提供了两个类来构建应用程序：

1. **Interface**，提供了用于创建演示的高级抽象，我们到目前为止一直在讨论。

2. **Blocks**，用于以更灵活的布局和数据流设计 Web 应用程序的低级 API。Blocks 允许您执行诸如特性多个数据流和演示，控制组件在页面上的出现位置，处理复杂的数据流（例如，输出可以作为其他函数的输入），并基于用户交互更新组件的属性 / 可见性等操作 - 仍然全部使用 Python。如果您需要这种可定制性，请尝试使用 `Blocks`！

## Hello, Blocks

让我们看一个简单的示例。请注意，此处的 API 与 `Interface` 不同。

$code_hello_blocks
$demo_hello_blocks

需要注意的事项：

- `Blocks` 可以使用 `with` 子句创建，此子句中创建的任何组件都会自动添加到应用程序中。
- 组件以按创建顺序垂直放置在应用程序中。（稍后我们将介绍自定义布局！）
- 创建了一个 `Button`，然后在此按钮上添加了一个 `click` 事件监听器。对于这个 API，应该很熟悉！与 `Interface` 类似，`click` 方法接受一个 Python 函数、输入组件和输出组件。

## 更复杂的应用

下面是一个应用程序，以让您对 `Blocks` 可以实现的更多内容有所了解：

$code_blocks_flipper
$demo_blocks_flipper

这里有更多的东西！在[building with blocks](https://gradio.app/building_with_blocks)部分中，我们将介绍如何创建像这样的复杂的 `Blocks` 应用程序。

恭喜，您已经熟悉了 Gradio 的基础知识！ 🥳 转到我们的[下一个指南](https://gradio.app/key_features)了解更多关于 Gradio 的主要功能。
