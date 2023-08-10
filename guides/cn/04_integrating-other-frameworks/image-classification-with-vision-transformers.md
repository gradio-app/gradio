# Vision Transformers 图像分类

相关空间：https://huggingface.co/spaces/abidlabs/vision-transformer
标签：VISION, TRANSFORMERS, HUB

## 简介

图像分类是计算机视觉中的重要任务。构建更好的分类器以确定图像中存在的对象是当前研究的热点领域，因为它在从人脸识别到制造质量控制等方面都有应用。

最先进的图像分类器基于 _transformers_ 架构，该架构最初在自然语言处理任务中很受欢迎。这种架构通常被称为 vision transformers (ViT)。这些模型非常适合与 Gradio 的*图像*输入组件一起使用，因此在本教程中，我们将构建一个使用 Gradio 进行图像分类的 Web 演示。我们只需用**一行 Python 代码**即可构建整个 Web 应用程序，其效果如下（试用一下示例之一！）：

<iframe src="https://abidlabs-vision-transformer.hf.space" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

让我们开始吧！

### 先决条件

确保您已经[安装](/getting_started)了 `gradio` Python 包。

## 步骤 1 - 选择 Vision 图像分类模型

首先，我们需要一个图像分类模型。在本教程中，我们将使用[Hugging Face Model Hub](https://huggingface.co/models?pipeline_tag=image-classification)上的一个模型。该 Hub 包含数千个模型，涵盖了多种不同的机器学习任务。

在左侧边栏中展开 Tasks 类别，并选择我们感兴趣的“Image Classification”作为我们的任务。然后，您将看到 Hub 上为图像分类设计的所有模型。

在撰写时，最受欢迎的模型是 `google/vit-base-patch16-224`，该模型在分辨率为 224x224 像素的 ImageNet 图像上进行了训练。我们将在演示中使用此模型。

## 步骤 2 - 使用 Gradio 加载 Vision Transformer 模型

当使用 Hugging Face Hub 上的模型时，我们无需为演示定义输入或输出组件。同样，我们不需要关心预处理或后处理的细节。所有这些都可以从模型标签中自动推断出来。

除了导入语句外，我们只需要一行代码即可加载并启动演示。

我们使用 `gr.Interface.load()` 方法，并传入包含 `huggingface/` 的模型路径，以指定它来自 Hugging Face Hub。

```python
import gradio as gr

gr.Interface.load(
             "huggingface/google/vit-base-patch16-224",
             examples=["alligator.jpg", "laptop.jpg"]).launch()
```

请注意，我们添加了一个 `examples` 参数，允许我们使用一些预定义的示例预填充我们的界面。

这将生成以下接口，您可以直接在浏览器中尝试。当您输入图像时，它会自动进行预处理并发送到 Hugging Face Hub API，通过模型处理，并以人类可解释的预测结果返回。尝试上传您自己的图像！

<iframe src="https://abidlabs-vision-transformer.hf.space" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

---

完成！只需一行代码，您就建立了一个图像分类器的 Web 演示。如果您想与他人分享，请在 `launch()` 接口时设置 `share=True`。
