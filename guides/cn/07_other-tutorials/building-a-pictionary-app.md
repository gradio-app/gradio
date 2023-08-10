# 构建一个 Pictionary 应用程序

相关空间：https://huggingface.co/spaces/nateraw/quickdraw
标签：SKETCHPAD，LABELS，LIVE

## 简介

一个算法能够有多好地猜出你在画什么？几年前，Google 发布了 **Quick Draw** 数据集，其中包含人类绘制的各种物体的图画。研究人员使用这个数据集训练模型来猜测 Pictionary 风格的图画。

这样的模型非常适合与 Gradio 的 _sketchpad_ 输入一起使用，因此在本教程中，我们将使用 Gradio 构建一个 Pictionary 网络应用程序。我们将能够完全使用 Python 构建整个网络应用程序，并且将如下所示（尝试画点什么！）：

<iframe src="https://abidlabs-draw2.hf.space" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

让我们开始吧！本指南介绍了如何构建一个 pictionary 应用程序（逐步）：

1. [设置 Sketch Recognition 模型](#1-set-up-the-sketch-recognition-model)
2. [定义 `predict` 函数](#2-define-a-predict-function)
3. [创建 Gradio 界面](#3-create-a-gradio-interface)

### 先决条件

确保您已经[安装](/getting_started)了 `gradio` Python 包。要使用预训练的草图模型，还需要安装 `torch`。

## 1. 设置 Sketch Recognition 模型

首先，您将需要一个草图识别模型。由于许多研究人员已经在 Quick Draw 数据集上训练了自己的模型，在本教程中，我们将使用一个预训练模型。我们的模型是一个由 Nate Raw 训练的轻量级 1.5MB 模型，您可以在此处[下载](https://huggingface.co/spaces/nateraw/quickdraw/blob/main/pytorch_model.bin)。

如果您感兴趣，这是用于训练模型的[代码](https://github.com/nateraw/quickdraw-pytorch)。我们将简单地使用 PyTorch 加载预训练的模型，如下所示：

```python
import torch
from torch import nn

model = nn.Sequential(
    nn.Conv2d(1, 32, 3, padding='same'),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(32, 64, 3, padding='same'),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(64, 128, 3, padding='same'),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(1152, 256),
    nn.ReLU(),
    nn.Linear(256, len(LABELS)),
)
state_dict = torch.load('pytorch_model.bin',    map_location='cpu')
model.load_state_dict(state_dict, strict=False)
model.eval()
```

## 2. 定义 `predict` 函数

接下来，您需要定义一个函数，该函数接受*用户输入*（在本例中是一个涂鸦图像）并返回预测结果。预测结果应该作为一个字典返回，其中键是类名，值是置信度概率。我们将从这个[文本文件](https://huggingface.co/spaces/nateraw/quickdraw/blob/main/class_names.txt)加载类名。

对于我们的预训练模型，代码如下所示：

```python
from pathlib import Path

LABELS = Path('class_names.txt').read_text().splitlines()

def predict(img):
    x = torch.tensor(img, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 255.
    with torch.no_grad():
        out = model(x)
    probabilities = torch.nn.functional.softmax(out[0], dim=0)
    values, indices = torch.topk(probabilities, 5)
    confidences = {LABELS[i]: v.item() for i, v in zip(indices, values)}
    return confidences
```

让我们分解一下。该函数接受一个参数：

- `img`：输入图像，作为一个 `numpy` 数组

然后，函数将图像转换为 PyTorch 的 `tensor`，将其通过模型，并返回：

- `confidences`：前五个预测的字典，其中键是类别标签，值是置信度概率

## 3. 创建一个 Gradio 界面

现在我们已经设置好预测函数，我们可以在其周围创建一个 Gradio 界面。

在本例中，输入组件是一个 `sketchpad`，使用方便的字符串快捷方式 `"sketchpad"` 创建一个用户可以在其上绘制的画布，并处理将其转换为 numpy 数组的预处理。

输出组件将是一个 `"label"`，以良好的形式显示前几个标签。

最后，我们将添加一个额外的参数，设置 `live=True`，允许我们的界面实时运行，每当用户在涂鸦板上绘制时，就会调整其预测结果。Gradio 的代码如下所示：

```python
import gradio as gr

gr.Interface(fn=predict,
             inputs="sketchpad",
             outputs="label",
             live=True).launch()
```

这将产生以下界面，您可以在浏览器中尝试（尝试画一些东西，比如 "snake" 或 "laptop"）：

<iframe src="https://abidlabs-draw2.hf.space" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

---

完成！这就是构建一个 Pictionary 风格的猜词游戏所需的所有代码。玩得开心，并尝试找到一些边缘情况🧐
