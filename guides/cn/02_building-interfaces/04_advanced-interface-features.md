# 高级接口特性

在[接口 Interface](https://gradio.app/docs#interface)类上还有更多内容需要介绍。本指南涵盖了所有高级特性：使用[解释器 Interpretation](https://gradio.app/docs#interpretation)，自定义样式，从[Hugging Face Hub](https://hf.co)加载模型，以及使用[并行 Parallel](https://gradio.app/docs#parallel)和[串行 Series](https://gradio.app/docs#series)。

## 解释您的预测

大多数模型都是黑盒模型，函数的内部逻辑对最终用户来说是隐藏的。为了鼓励透明度，我们通过在 `Interface` 类中简单地将 `interpretation` 关键字设置为 `default`，使得为模型添加解释非常容易。这样，您的用户就可以了解到哪些输入部分对输出结果负责。请看下面的简单界面示例，它展示了一个图像分类器，还包括解释功能：

$code_image_classifier_interpretation

除了 `default`，Gradio 还包括了基于[Shapley-based interpretation](https://christophm.github.io/interpretable-ml-book/shap.html)，它提供了更准确的解释，尽管运行时间通常较慢。要使用它，只需将 `interpretation` 参数设置为 `"shap"`（注意：还要确保安装了 Python 包 `shap`）。您还可以选择修改 `num_shap` 参数，该参数控制准确性和运行时间之间的权衡（增加此值通常会增加准确性）。下面是一个示例：

```python
gr.Interface(fn=classify_image, inputs=image, outputs=label, interpretation="shap", num_shap=5).launch()
```

这适用于任何函数，即使在内部，模型是复杂的神经网络或其他黑盒模型。如果使用 Gradio 的 `default` 或 `shap` 解释，输出组件必须是 `Label`。支持所有常见的输入组件。下面是一个包含文本输入的示例。

$code_gender_sentence_default_interpretation

那么在幕后发生了什么？使用这些解释方法，Gradio 会使用修改后的输入的多个版本进行多次预测。根据结果，您将看到界面自动将增加类别可能性的文本部分（或图像等）以红色突出显示。颜色的强度对应于输入部分的重要性。减少类别置信度的部分以蓝色突出显示。

您还可以编写自己的解释函数。下面的演示在前一个演示中添加了自定义解释。此函数将使用与主封装函数相同的输入。该解释函数的输出将用于突出显示每个输入组件的输入-因此函数必须返回一个列表，其中元素的数量与输入组件的数量相对应。要查看每个输入组件的解释格式，请查阅文档。

$code_gender_sentence_custom_interpretation

在[文档](https://gradio.app/docs#interpretation)中了解更多关于解释的信息。

## 自定义样式

如果您希望对演示的任何方面都有更精细的控制，还可以编写自己的 CSS 或通过 `Interface` 类的 `css` 参数传递 CSS 文件的文件路径。

```python
gr.Interface(..., css="body {background-color: red}")
```

如果您希望在 CSS 中引用外部文件，请在文件路径（可以是相对路径或绝对路径）之前加上 `"file="`，例如：

```python
gr.Interface(..., css="body {background-image: url('file=clouds.jpg')}")
```

**警告**：不能保证自定义 CSS 能够在 Gradio 的不同版本之间正常工作，因为 Gradio 的 HTML DOM 可能会发生更改。我们建议尽量少使用自定义 CSS，而尽可能使用[主题 Themes](/theming-guide/)。

## 加载 Hugging Face 模型和 Spaces

Gradio 与[Hugging Face Hub](https://hf.co)完美集成，只需一行代码即可加载模型和 Spaces。要使用它，只需在 `Interface` 类中使用 `load()` 方法。所以：

- 要从 Hugging Face Hub 加载任何模型并围绕它创建一个界面，您需要传递 `"model/"` 或 `"huggingface/"`，后面跟着模型名称，就像这些示例一样：

```python
gr.Interface.load("huggingface/gpt2").launch();
```

```python
gr.Interface.load("huggingface/EleutherAI/gpt-j-6B",
    inputs=gr.Textbox(lines=5, label="Input Text")  # customizes the input component
).launch()
```

- 要从 Hugging Face Hub 加载任何 Space 并在本地重新创建它（这样您可以自定义输入和输出），您需要传递 `"spaces/"`，后面跟着模型名称：

```python
gr.Interface.load("spaces/eugenesiow/remove-bg", inputs="webcam", title="Remove your webcam background!").launch()
```

使用 Gradio 使用加载 Hugging Face 模型或 spaces 的一个很棒的功能是，您可以立即像 Python 代码中的函数一样使用生成的 `Interface` 对象（这适用于每种类型的模型 / 空间：文本，图像，音频，视频，甚至是多模态模型）：

```python
io = gr.Interface.load("models/EleutherAI/gpt-neo-2.7B")
io("It was the best of times")  # outputs model completion
```

## 并行和串行放置接口

Gradio 还可以使用 `gradio.Parallel` 和 `gradio.Series` 类非常容易地混合接口。`Parallel` 允许您将两个相似的模型（如果它们具有相同的输入类型）并行放置以比较模型预测：

```python
generator1 = gr.Interface.load("huggingface/gpt2")
generator2 = gr.Interface.load("huggingface/EleutherAI/gpt-neo-2.7B")
generator3 = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B")

gr.Parallel(generator1, generator2, generator3).launch()
```

`Series` 允许您将模型和 spaces 串行放置，将一个模型的输出传输到下一个模型的输入。

```python
generator = gr.Interface.load("huggingface/gpt2")
translator = gr.Interface.load("huggingface/t5-small")

gr.Series(generator, translator).launch()  # this demo generates text, then translates it to German, and outputs the final result.
```

当然，您还可以在适当的情况下同时使用 `Parallel` 和 `Series`！

在[文档](https://gradio.app/docs#parallel)中了解有关并行和串行 (`Parallel` 和 `Series`) 的更多信息。
