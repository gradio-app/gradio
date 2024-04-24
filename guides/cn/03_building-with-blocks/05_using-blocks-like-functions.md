# 使用 Gradio 块像函数一样

Tags: TRANSLATION, HUB, SPACES

**先决条件**: 本指南是在块介绍的基础上构建的。请确保[先阅读该指南](https://gradio.app/blocks-and-event-listeners)。

## 介绍

你知道吗，除了作为一个全栈机器学习演示，Gradio 块应用其实也是一个普通的 Python 函数！？

这意味着如果你有一个名为 `demo` 的 Gradio 块（或界面）应用，你可以像使用任何 Python 函数一样使用 `demo`。

所以，像 `output = demo("Hello", "friend")` 这样的操作会在输入为 "Hello" 和 "friend" 的情况下运行 `demo` 中定义的第一个事件，并将其存储在变量 `output` 中。

如果以上内容让你打瞌睡 🥱，请忍耐一下！通过将应用程序像函数一样使用，你可以轻松地组合 Gradio 应用。
接下来的部分将展示如何实现。

## 将块视为函数

假设我们有一个将英文文本翻译为德文文本的演示块。

$code_english_translator

我已经将它托管在 Hugging Face Spaces 上的 [gradio/english_translator](https://huggingface.co/spaces/gradio/english_translator)。

你也可以在下面看到演示：

$demo_english_translator

现在，假设你有一个生成英文文本的应用程序，但你还想额外生成德文文本。

你可以选择：

1. 将我的英德翻译的源代码复制粘贴到你的应用程序中。

2. 在你的应用程序中加载我的英德翻译，并将其当作普通的 Python 函数处理。

选项 1 从技术上讲总是有效的，但它经常引入不必要的复杂性。

选项 2 允许你借用所需的功能，而不会过于紧密地耦合我们的应用程序。

你只需要在源文件中调用 `Blocks.load` 类方法即可。
之后，你就可以像使用普通的 Python 函数一样使用我的翻译应用程序了！

下面的代码片段和演示展示了如何使用 `Blocks.load`。

请注意，变量 `english_translator` 是我的英德翻译应用程序，但它在 `generate_text` 中像普通函数一样使用。

$code_generate_english_german

$demo_generate_english_german

## 如何控制使用应用程序中的哪个函数

如果你正在加载的应用程序定义了多个函数，你可以使用 `fn_index` 和 `api_name` 参数指定要使用的函数。

在英德演示的代码中，你会看到以下代码行：

translate_btn.click(translate, inputs=english, outputs=german, api_name="translate-to-german")

这个 `api_name` 在我们的应用程序中给这个函数一个唯一的名称。你可以使用这个名称告诉 Gradio 你想使用
上游空间中的哪个函数：

english_generator(text, api_name="translate-to-german")[0]["generated_text"]

你也可以使用 `fn_index` 参数。
假设我的应用程序还定义了一个英语到西班牙语的翻译函数。
为了在我们的文本生成应用程序中使用它，我们将使用以下代码：

english_generator(text, fn_index=1)[0]["generated_text"]

Gradio 空间中的函数是从零开始索引的，所以西班牙语翻译器将是我的空间中的第二个函数，
因此你会使用索引 1。

## 结语

我们展示了将块应用视为普通 Python 函数的方法，这有助于在不同的应用程序之间组合功能。
任何块应用程序都可以被视为一个函数，但一个强大的模式是在将其视为函数之前，
在[自己的应用程序中加载](https://huggingface.co/spaces)托管在[Hugging Face Spaces](https://huggingface.co/spaces)上的应用程序。
您也可以加载托管在[Hugging Face Model Hub](https://huggingface.co/models)上的模型——有关示例，请参阅[使用 Hugging Face 集成](/using_hugging_face_integrations)指南。

### 开始构建！⚒️

## Parting Remarks

我们展示了如何将 Blocks 应用程序视为常规 Python 函数，以便在不同的应用程序之间组合功能。
任何 Blocks 应用程序都可以被视为函数，但是一种有效的模式是在将其视为自己应用程序的函数之前，先`加载`托管在[Hugging Face Spaces](https://huggingface.co/spaces)上的应用程序。
您还可以加载托管在[Hugging Face Model Hub](https://huggingface.co/models)上的模型-请参见[使用 Hugging Face 集成指南](/using_hugging_face_integrations)中的示例。

### Happy building! ⚒️
