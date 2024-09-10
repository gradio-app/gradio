# TensorFlow 和 Keras 中的图像分类

相关空间：https://huggingface.co/spaces/abidlabs/keras-image-classifier
标签：VISION, MOBILENET, TENSORFLOW

## 简介

图像分类是计算机视觉中的一项核心任务。构建更好的分类器来识别图像中的物体是一个研究的热点领域，因为它在交通控制系统到卫星成像等应用中都有广泛的应用。

这样的模型非常适合与 Gradio 的 _image_ 输入组件一起使用，因此在本教程中，我们将使用 Gradio 构建一个用于图像分类的 Web 演示。我们可以在 Python 中构建整个 Web 应用程序，它的界面将如下所示（试试其中一个例子！）：

<iframe src="https://abidlabs-keras-image-classifier.hf.space" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

让我们开始吧！

### 先决条件

确保您已经[安装](/getting_started)了 `gradio` Python 包。我们将使用一个预训练的 Keras 图像分类模型，因此您还应该安装了 `tensorflow`。

## 第一步 —— 设置图像分类模型

首先，我们需要一个图像分类模型。在本教程中，我们将使用一个预训练的 Mobile Net 模型，因为它可以从[Keras](https://keras.io/api/applications/mobilenet/)轻松下载。您也可以使用其他预训练模型或训练自己的模型。

```python
import tensorflow as tf

inception_net = tf.keras.applications.MobileNetV2()
```

此行代码将使用 Keras 库自动下载 MobileNet 模型和权重。

## 第二步 —— 定义 `predict` 函数

接下来，我们需要定义一个函数，该函数接收*用户输入*作为参数（在本例中为图像），并返回预测结果。预测结果应以字典形式返回，其中键是类名，值是置信概率。我们将从这个[text 文件](https://git.io/JJkYN)中加载类名。

对于我们的预训练模型，函数将如下所示：

```python
import requests

# 从ImageNet下载可读性标签。
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def classify_image(inp):
  inp = inp.reshape((-1, 224, 224, 3))
  inp = tf.keras.applications.mobilenet_v2.preprocess_input(inp)
  prediction = inception_net.predict(inp).flatten()
  confidences = {labels[i]: float(prediction[i]) for i in range(1000)}
  return confidences
```

让我们来详细了解一下。该函数接受一个参数：

- `inp`：输入图像的 `numpy` 数组

然后，函数添加一个批次维度，通过模型进行处理，并返回：

- `confidences`：预测结果，以字典形式表示，其中键是类标签，值是置信概率

## 第三步 —— 创建 Gradio 界面

现在我们已经设置好了预测函数，我们可以围绕它创建一个 Gradio 界面。

在这种情况下，输入组件是一个拖放图像组件。要创建此输入组件，我们可以使用 `"gradio.inputs.Image"` 类，该类创建该组件并处理预处理以将其转换为 numpy 数组。我们将使用一个参数来实例化该类，该参数会自动将输入图像预处理为 224 像素 x224 像素的大小，这是 MobileNet 所期望的尺寸。

输出组件将是一个 `"label"`，它以美观的形式显示顶部标签。由于我们不想显示所有的 1,000 个类标签，所以我们将自定义它只显示前 3 个标签。

最后，我们还将添加一个 `examples` 参数，它允许我们使用一些预定义的示例预填充我们的接口。Gradio 的代码如下所示：

```python
import gradio as gr

gr.Interface(fn=classify_image,
             inputs=gr.Image(width=224, height=224),
             outputs=gr.Label(num_top_classes=3),
             examples=["banana.jpg", "car.jpg"]).launch()
```

这将生成以下界面，您可以在浏览器中立即尝试（尝试上传您自己的示例！）：

<iframe src="https://abidlabs-keras-image-classifier.hf.space" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

---

完成！这就是构建图像分类器的 Web 演示所需的所有代码。如果您想与他人分享，请尝试在启动接口时设置 `share=True`！
