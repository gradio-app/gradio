# Gradio 界面的 4 种类型

到目前为止，我们一直假设构建 Gradio 演示需要同时具备输入和输出。但对于机器学习演示来说，并不总是如此：例如，*无条件图像生成模型*不需要任何输入，但会生成一张图像作为输出。

事实证明，`gradio.Interface` 类实际上可以处理 4 种不同类型的演示：

1. **Standard demos 标准演示**：同时具有独立的输入和输出（例如图像分类器或语音转文本模型）
2. **Output-only demos 仅输出演示**：不接受任何输入，但会产生输出（例如无条件图像生成模型）
3. **Input-only demos 仅输入演示**：不产生任何输出，但会接受某种形式的输入（例如保存您上传到外部持久数据库的图像的演示）
4. **Unified demos 统一演示**：同时具有输入和输出组件，但这些组件是*相同的*。这意味着生成的输出将覆盖输入（例如文本自动完成模型）

根据演示类型的不同，用户界面（UI）会有略微不同的外观：

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/interfaces4.png)

我们来看一下如何使用 `Interface` 类构建每种类型的演示，以及示例：

## 标准演示 (Standard demos)

要创建具有输入和输出组件的演示，只需在 `Interface()` 中设置 `inputs` 和 `outputs` 参数的值。以下是一个简单图像滤镜的示例演示：

$code_sepia_filter
$demo_sepia_filter

## 仅输出演示 (Output-only demos)

那么仅包含输出的演示呢？为了构建这样的演示，只需将 `Interface()` 中的 `inputs` 参数值设置为 `None`。以下是模拟图像生成模型的示例演示：

$code_fake_gan_no_input
$demo_fake_gan_no_input

## 仅输入演示 (Input-only demos)

同样地，要创建仅包含输入的演示，将 `Interface()` 中的 `outputs` 参数值设置为 `None`。以下是将任何上传的图像保存到磁盘的示例演示：

$code_save_file_no_output
$demo_save_file_no_output

## 统一演示 (Unified demos)

这种演示将单个组件同时作为输入和输出。只需将 `Interface()` 中的 `inputs` 和 `outputs` 参数值设置为相同的组件即可创建此演示。以下是文本生成模型的示例演示：

$code_unified_demo_text_generation
$demo_unified_demo_text_generation
