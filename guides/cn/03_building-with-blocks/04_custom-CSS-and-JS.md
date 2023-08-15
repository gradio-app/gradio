# 自定义的 JS 和 CSS

本指南介绍了如何更灵活地为 Blocks 添加样式，并添加 JavaScript 代码到事件监听器中。

**警告**：在自定义的 JS 和 CSS 中使用查询选择器不能保证能在所有 Gradio 版本中正常工作，因为 Gradio 的 HTML DOM 可能会发生变化。我们建议谨慎使用查询选择器。

## 自定义的 CSS

Gradio 主题是自定义应用程序外观和感觉的最简单方式。您可以从各种主题中进行选择，或者创建自己的主题。要实现这一点，请将 `theme=` kwarg 传递给 `Blocks` 构造函数。例如：

```python
with gr.Blocks(theme=gr.themes.Glass()):
    ...
```

Gradio 自带一套预构建的主题，您可以从 `gr.themes.*` 中加载这些主题。您可以扩展这些主题，或者从头开始创建自己的主题 - 有关更多详细信息，请参阅[主题指南](/theming-guide)。

要增加附加的样式能力，您可以使用 `css=` kwarg 将任何 CSS 传递给您的应用程序。

Gradio 应用程序的基类是 `gradio-container`，因此下面是一个示例，用于更改 Gradio 应用程序的背景颜色：

```python
with gr.Blocks(css=".gradio-container {background-color: red}") as demo:
    ...
```

如果您想在您的 CSS 中引用外部文件，请使用 `"file="` 作为文件路径的前缀（可以是相对路径或绝对路径），例如：

```python
with gr.Blocks(css=".gradio-container {background: url('file=clouds.jpg')}") as demo:
    ...
```

您还可以将 CSS 文件的文件路径传递给 `css` 参数。

## `elem_id` 和 `elem_classes` 参数

您可以使用 `elem_id` 来为任何组件添加 HTML 元素 `id`，并使用 `elem_classes` 添加一个类或类列表。这将使您能够更轻松地使用 CSS 选择元素。这种方法更有可能在 Gradio 版本之间保持稳定，因为内置的类名或 id 可能会发生变化（但正如上面的警告中所提到的，如果您使用自定义 CSS，我们不能保证在 Gradio 版本之间完全兼容，因为 DOM 元素本身可能会发生变化）。

```python
css = """
#warning {background-color: #FFCCCB}
.feedback textarea {font-size: 24px !important}
"""

with gr.Blocks(css=css) as demo:
    box1 = gr.Textbox(value="Good Job", elem_classes="feedback")
    box2 = gr.Textbox(value="Failure", elem_id="warning", elem_classes="feedback")
```

CSS `#warning` 规则集仅针对第二个文本框，而 `.feedback` 规则集将同时作用于两个文本框。请注意，在针对类时，您可能需要使用 `!important` 选择器来覆盖默认的 Gradio 样式。

## 自定义的 JS

事件监听器具有 `_js` 参数，可以接受 JavaScript 函数作为字符串，并像 Python 事件监听器函数一样处理它。您可以传递 JavaScript 函数和 Python 函数（在这种情况下，先运行 JavaScript 函数），或者仅传递 JavaScript（并将 Python 的 `fn` 设置为 `None`）。请查看下面的代码：

$code_blocks_js_methods
$demo_blocks_js_methods
