# Gradio 和 ONNX 在 Hugging Face 上

Related spaces: https://huggingface.co/spaces/onnx/EfficientNet-Lite4
Tags: ONNX，SPACES
由 Gradio 和 <a href="https://onnx.ai/">ONNX</a> 团队贡献

## 介绍

在这个指南中，我们将为您介绍以下内容：

- ONNX、ONNX 模型仓库、Gradio 和 Hugging Face Spaces 的介绍
- 如何为 EfficientNet-Lite4 设置 Gradio 演示
- 如何为 Hugging Face 上的 ONNX 组织贡献自己的 Gradio 演示

下面是一个 ONNX 模型的示例：在下面尝试 EfficientNet-Lite4 演示。

<iframe src="https://onnx-efficientnet-lite4.hf.space" frameBorder="0" height="810" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## ONNX 模型仓库是什么？

Open Neural Network Exchange（[ONNX](https://onnx.ai/)）是一种表示机器学习模型的开放标准格式。ONNX 由一个实现了该格式的合作伙伴社区支持，该社区将其实施到许多框架和工具中。例如，如果您在 TensorFlow 或 PyTorch 中训练了一个模型，您可以轻松地将其转换为 ONNX，然后使用类似 ONNX Runtime 的引擎 / 编译器在各种设备上运行它。

[ONNX 模型仓库](https://github.com/onnx/models)是由社区成员贡献的一组预训练的先进模型，格式为 ONNX。每个模型都附带了用于模型训练和运行推理的 Jupyter 笔记本。这些笔记本以 Python 编写，并包含到训练数据集的链接，以及描述模型架构的原始论文的参考文献。

## Hugging Face Spaces 和 Gradio 是什么？

### Gradio

Gradio 可让用户使用 Python 代码将其机器学习模型演示为 Web 应用程序。Gradio 将 Python 函数封装到用户界面中，演示可以在 jupyter 笔记本、colab 笔记本中启动，并可以嵌入到您自己的网站上，并在 Hugging Face Spaces 上免费托管。

在此处开始[https://gradio.app/getting_started](https://gradio.app/getting_started)

### Hugging Face Spaces

Hugging Face Spaces 是 Gradio 演示的免费托管选项。Spaces 提供了 3 种 SDK 选项：Gradio、Streamlit 和静态 HTML 演示。Spaces 可以是公共的或私有的，工作流程与 github repos 类似。目前 Hugging Face 上有 2000 多个 Spaces。在此处了解更多关于 Spaces 的信息[https://huggingface.co/spaces/launch](https://huggingface.co/spaces/launch)。

### Hugging Face 模型

Hugging Face 模型中心还支持 ONNX 模型，并且可以通过[ONNX 标签](https://huggingface.co/models?library=onnx&sort=downloads)对 ONNX 模型进行筛选

## Hugging Face 是如何帮助 ONNX 模型仓库的？

ONNX 模型仓库中有许多 Jupyter 笔记本供用户测试模型。以前，用户需要自己下载模型并在本地运行这些笔记本测试。有了 Hugging Face，测试过程可以更简单和用户友好。用户可以在 Hugging Face Spaces 上轻松尝试 ONNX 模型仓库中的某个模型，并使用 ONNX Runtime 运行由 Gradio 提供支持的快速演示，全部在云端进行，无需在本地下载任何内容。请注意，ONNX 有各种运行时，例如[ONNX Runtime](https://github.com/microsoft/onnxruntime)、[MXNet](https://github.com/apache/incubator-mxnet)等

## ONNX Runtime 的作用是什么？

ONNX Runtime 是一个跨平台的推理和训练机器学习加速器。它使得在 Hugging Face 上使用 ONNX 模型仓库中的模型进行实时 Gradio 演示成为可能。

ONNX Runtime 可以实现更快的客户体验和更低的成本，支持来自 PyTorch 和 TensorFlow/Keras 等深度学习框架以及 scikit-learn、LightGBM、XGBoost 等传统机器学习库的模型。ONNX Runtime 与不同的硬件、驱动程序和操作系统兼容，并通过利用适用的硬件加速器以及图形优化和转换提供最佳性能。有关更多信息，请参阅[官方网站](https://onnxruntime.ai/)。

## 为 EfficientNet-Lite4 设置 Gradio 演示

EfficientNet-Lite 4 是 EfficientNet-Lite 系列中最大和最准确的模型。它是一个仅使用整数量化的模型，能够在所有 EfficientNet 模型中提供最高的准确率。在 Pixel 4 CPU 上以实时方式运行（例如 30ms/ 图像）时，可以实现 80.4％的 ImageNet top-1 准确率。要了解更多信息，请阅读[模型卡片](https://github.com/onnx/models/tree/main/vision/classification/efficientnet-lite4)

在这里，我们将演示如何使用 Gradio 为 EfficientNet-Lite4 设置示例演示

首先，我们导入所需的依赖项并下载和载入来自 ONNX 模型仓库的 efficientnet-lite4 模型。然后从 labels_map.txt 文件加载标签。接下来，我们设置预处理函数、加载用于推理的模型并设置推理函数。最后，将推理函数封装到 Gradio 接口中，供用户进行交互。下面是完整的代码。

```python
import numpy as np
import math
import matplotlib.pyplot as plt
import cv2
import json
import gradio as gr
from huggingface_hub import hf_hub_download
from onnx import hub
import onnxruntime as ort

# 从ONNX模型仓库加载ONNX模型
model = hub.load("efficientnet-lite4")
# 加载标签文本文件
labels = json.load(open("labels_map.txt", "r"))

# 通过将图像从中心调整大小并裁剪到224x224来设置图像文件的尺寸
def pre_process_edgetpu(img, dims):
    output_height, output_width, _ = dims
    img = resize_with_aspectratio(img, output_height, output_width, inter_pol=cv2.INTER_LINEAR)
    img = center_crop(img, output_height, output_width)
    img = np.asarray(img, dtype='float32')
    # 将jpg像素值从[0 - 255]转换为浮点数组[-1.0 - 1.0]
    img -= [127.0, 127.0, 127.0]
    img /= [128.0, 128.0, 128.0]
    return img

# 使用等比例缩放调整图像尺寸
def resize_with_aspectratio(img, out_height, out_width, scale=87.5, inter_pol=cv2.INTER_LINEAR):
    height, width, _ = img.shape
    new_height = int(100. * out_height / scale)
    new_width = int(100. * out_width / scale)
    if height > width:
        w = new_width
        h = int(new_height * height / width)
    else:
        h = new_height
        w = int(new_width * width / height)
    img = cv2.resize(img, (w, h), interpolation=inter_pol)
    return img

# crops the image around the center based on given height and width
def center_crop(img, out_height, out_width):
    height, width, _ = img.shape
    left = int((width - out_width) / 2)
    right = int((width + out_width) / 2)
    top = int((height - out_height) / 2)
    bottom = int((height + out_height) / 2)
    img = img[top:bottom, left:right]
    return img


sess = ort.InferenceSession(model)

def inference(img):
  img = cv2.imread(img)
  img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

  img = pre_process_edgetpu(img, (224, 224, 3))

  img_batch = np.expand_dims(img, axis=0)

  results = sess.run(["Softmax:0"], {"images:0": img_batch})[0]
  result = reversed(results[0].argsort()[-5:])
  resultdic = {}
  for r in result:
      resultdic[labels[str(r)]] = float(results[0][r])
  return resultdic

title = "EfficientNet-Lite4"
description = "EfficientNet-Lite 4是最大的变体，也是EfficientNet-Lite模型集合中最准确的。它是一个仅包含整数的量化模型，具有所有EfficientNet模型中最高的准确度。在Pixel 4 CPU上，它实现了80.4％的ImageNet top-1准确度，同时仍然可以实时运行（例如30ms/图像）。"
examples = [['catonnx.jpg']]
gr.Interface(inference, gr.Image(type="filepath"), "label", title=title, description=description, examples=examples).launch()
```

## 如何使用 ONNX 模型在 HF Spaces 上贡献 Gradio 演示

- 将模型添加到[onnx model zoo](https://github.com/onnx/models/blob/main/.github/PULL_REQUEST_TEMPLATE.md)
- 在 Hugging Face 上创建一个账号[here](https://huggingface.co/join).
- 要查看还有哪些模型需要添加到 ONNX 组织中，请参阅[Models list](https://github.com/onnx/models#models)中的列表
- 在您的用户名下添加 Gradio Demo，请参阅此[博文](https://huggingface.co/blog/gradio-spaces)以在 Hugging Face 上设置 Gradio Demo。
- 请求加入 ONNX 组织[here](https://huggingface.co/onnx).
- 一旦获准，将模型从您的用户名下转移到 ONNX 组织
- 在模型表中为模型添加徽章，在[Models list](https://github.com/onnx/models#models)中查看示例
