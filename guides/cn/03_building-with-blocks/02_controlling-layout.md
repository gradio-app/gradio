# 控制布局 (Controlling Layout)

默认情况下，块中的组件是垂直排列的。让我们看看如何重新排列组件。在幕后，这种布局结构使用了[Web 开发的 flexbox 模型](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox)。

## Row 行

`with gr.Row` 下的元素将水平显示。例如，要并排显示两个按钮：

```python
with gr.Blocks() as demo:
    with gr.Row():
        btn1 = gr.Button("按钮1")
        btn2 = gr.Button("按钮2")
```

要使行中的每个元素具有相同的高度，请使用 `style` 方法的 `equal_height` 参数。

```python
with gr.Blocks() as demo:
    with gr.Row(equal_height=True):
        textbox = gr.Textbox()
        btn2 = gr.Button("按钮2")
```

可以通过每个组件中存在的 `scale` 和 `min_width` 参数来控制行中元素的宽度。

- `scale` 是一个整数，定义了元素在行中的占用空间。如果将 scale 设置为 `0`，则元素不会扩展占用空间。如果将 scale 设置为 `1` 或更大，则元素将扩展。行中的多个元素将按比例扩展。在下面的示例中，`btn1` 将比 `btn2` 扩展两倍，而 `btn0` 将根本不会扩展：

```python
with gr.Blocks() as demo:
    with gr.Row():
        btn0 = gr.Button("按钮0", scale=0)
        btn1 = gr.Button("按钮1", scale=1)
        btn2 = gr.Button("按钮2", scale=2)
```

- `min_width` 将设置元素的最小宽度。如果没有足够的空间满足所有的 `min_width` 值，行将换行。

在[文档](https://gradio.app/docs/row)中了解有关行的更多信息。

## 列和嵌套 (Columns and Nesting)

列中的组件将垂直放置在一起。由于默认布局对于块应用程序来说是垂直布局，因此为了有用，列通常嵌套在行中。例如：

$code_rows_and_columns
$demo_rows_and_columns

查看第一列如何垂直排列两个文本框。第二列垂直排列图像和按钮。注意两列的相对宽度由 `scale` 参数设置。具有两倍 `scale` 值的列占据两倍的宽度。

在[文档](https://gradio.app/docs/column)中了解有关列的更多信息。

## 选项卡和手风琴 (Tabs and Accordions)

您还可以使用 `with gr.Tab('tab_name'):` 语句创建选项卡。在 `with gr.Tab('tab_name'):` 上下文中创建的任何组件都将显示在该选项卡中。连续的 Tab 子句被分组在一起，以便一次只能选择一个选项卡，并且只显示该选项卡上下文中的组件。

例如：

$code_blocks_flipper
$demo_blocks_flipper

还请注意本示例中的 `gr.Accordion('label')`。手风琴是一种可以切换打开或关闭的布局。与 `Tabs` 一样，它是可以选择性隐藏或显示内容的布局元素。在 `with gr.Accordion('label'):` 内定义的任何组件在单击手风琴的切换图标时都会被隐藏或显示。

在文档中了解有关[Tabs](https://gradio.app/docs/tab)和[Accordions](https://gradio.app/docs/accordion)的更多信息。

## 可见性 (Visibility)

组件和布局元素都有一个 `visible` 参数，可以在初始时设置，并使用 `gr.update()` 进行更新。在 Column 上设置 `gr.update(visible=...)` 可用于显示或隐藏一组组件。

$code_blocks_form
$demo_blocks_form

## 可变数量的输出 (Variable Number of Outputs)

通过以动态方式调整组件的可见性，可以创建支持 _可变数量输出_ 的 Gradio 演示。这是一个非常简单的例子，其中输出文本框的数量由输入滑块控制：

例如：

$code_variable_outputs
$demo_variable_outputs

## 分开定义和渲染组件 (Defining and Rendering Components Separately)

在某些情况下，您可能希望在实际渲染 UI 之前定义组件。例如，您可能希望在相应的 `gr.Textbox` 输入上方显示示例部分，使用 `gr.Examples`。由于 `gr.Examples` 需要一个参数作为输入组件对象，您需要先定义输入组件，然后在定义 `gr.Examples` 对象之后再渲染它。

解决方法是在 `gr.Blocks()` 范围之外定义 `gr.Textbox`，并在 UI 中想要放置它的位置使用组件的 `.render()` 方法。

这是一个完整的代码示例：

```python
input_textbox = gr.Textbox()

with gr.Blocks() as demo:
    gr.Examples(["hello", "bonjour", "merhaba"], input_textbox)
    input_textbox.render()
```
