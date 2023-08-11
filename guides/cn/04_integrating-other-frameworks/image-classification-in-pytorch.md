# PyTorch 图像分类

Related spaces: https://huggingface.co/spaces/abidlabs/pytorch-image-classifier, https://huggingface.co/spaces/pytorch/ResNet, https://huggingface.co/spaces/pytorch/ResNext, https://huggingface.co/spaces/pytorch/SqueezeNet
Tags: VISION, RESNET, PYTORCH

## 介绍

图像分类是计算机视觉中的一个核心任务。构建更好的分类器以区分图片中存在的物体是当前研究的一个热点领域，因为它的应用范围从自动驾驶车辆到医学成像等领域都很广泛。

这样的模型非常适合 Gradio 的 _image_ 输入组件，因此在本教程中，我们将使用 Gradio 构建一个用于图像分类的 Web 演示。我们将能够在 Python 中构建整个 Web 应用程序，效果如下（试试其中一个示例！）:

<iframe src="https://abidlabs-pytorch-image-classifier.hf.space" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

让我们开始吧！

### 先决条件

确保您已经[安装](/getting_started)了 `gradio` Python 包。我们将使用一个预训练的图像分类模型，所以您还应该安装了 `torch`。

## 第一步 - 设置图像分类模型

首先，我们需要一个图像分类模型。在本教程中，我们将使用一个预训练的 Resnet-18 模型，因为它可以从[PyTorch Hub](https://pytorch.org/hub/pytorch_vision_resnet/)轻松下载。您可以使用其他预训练模型或训练自己的模型。

```python
import torch

model = torch.hub.load('pytorch/vision:v0.6.0', 'resnet18', pretrained=True).eval()
```

由于我们将使用模型进行推断，所以我们调用了 `.eval()` 方法。

## 第二步 - 定义 `predict` 函数

接下来，我们需要定义一个函数，该函数接受*用户输入*，在本示例中是一张图片，并返回预测结果。预测结果应该以字典的形式返回，其中键是类别名称，值是置信度概率。我们将从这个[text 文件](https://git.io/JJkYN)中加载类别名称。

对于我们的预训练模型，它的代码如下：

```python
import requests
from PIL import Image
from torchvision import transforms

# 下载ImageNet的可读标签。
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def predict(inp):
  inp = transforms.ToTensor()(inp).unsqueeze(0)
  with torch.no_grad():
    prediction = torch.nn.functional.softmax(model(inp)[0], dim=0)
    confidences = {labels[i]: float(prediction[i]) for i in range(1000)}
  return confidences
```

让我们逐步来看一下这段代码。该函数接受一个参数：

- `inp`：输入图片，类型为 `PIL` 图像

然后，该函数将图像转换为 PIL 图像，最终转换为 PyTorch 的 `tensor`，将其输入模型，并返回：

- `confidences`：预测结果，以字典形式表示，其中键是类别标签，值是置信度概率

## 第三步 - 创建 Gradio 界面

现在我们已经设置好了预测函数，我们可以创建一个 Gradio 界面。

在本例中，输入组件是一个拖放图片的组件。为了创建这个输入组件，我们使用 `Image(type="pil")` 来创建该组件，并处理预处理操作将其转换为 `PIL` 图像。

输出组件将是一个 `Label`，它以良好的形式显示顶部标签。由于我们不想显示所有 1000 个类别标签，所以我们将其定制为只显示前 3 个标签，构造为 `Label(num_top_classes=3)`。

最后，我们添加了一个 `examples` 参数，允许我们预填一些预定义的示例到界面中。Gradio 的代码如下：

```python
import gradio as gr

gr.Interface(fn=predict,
             inputs=gr.Image(type="pil"),
             outputs=gr.Label(num_top_classes=3),
             examples=["lion.jpg", "cheetah.jpg"]).launch()
```

这将产生以下界面，您可以在浏览器中直接尝试（试试上传自己的示例图片！）：

<iframe src="https://abidlabs-pytorch-image-classifier.hf.space" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

---

完成了！这就是构建图像分类器 Web 演示所需的所有代码。如果您想与他人共享，请在 `launch()` 接口时设置 `share=True`！
