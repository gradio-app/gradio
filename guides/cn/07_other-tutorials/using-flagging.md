# 使用标记

相关空间：https://huggingface.co/spaces/gradio/calculator-flagging-crowdsourced, https://huggingface.co/spaces/gradio/calculator-flagging-options, https://huggingface.co/spaces/gradio/calculator-flag-basic
标签：标记，数据

## 简介

当您演示一个机器学习模型时，您可能希望收集试用模型的用户的数据，特别是模型行为不如预期的数据点。捕获这些“困难”数据点是有价值的，因为它允许您改进机器学习模型并使其更可靠和稳健。

Gradio 通过在每个“界面”中包含一个**标记**按钮来简化这些数据的收集。这使得用户或测试人员可以轻松地将数据发送回运行演示的机器。样本会保存在一个 CSV 日志文件中（默认情况下）。如果演示涉及图像、音频、视频或其他类型的文件，则这些文件会单独保存在一个并行目录中，并且这些文件的路径会保存在 CSV 文件中。

## 在 `gradio.Interface` 中使用**标记**按钮

使用 Gradio 的 `Interface` 进行标记特别简单。默认情况下，在输出组件下方有一个标记为**标记**的按钮。当用户测试您的模型时，如果看到有趣的输出，他们可以点击标记按钮将输入和输出数据发送回运行演示的机器。样本会保存在一个 CSV 日志文件中（默认情况下）。如果演示涉及图像、音频、视频或其他类型的文件，则这些文件会单独保存在一个并行目录中，并且这些文件的路径会保存在 CSV 文件中。

在 `gradio.Interface` 中有[四个参数](https://gradio.app/docs/interface#initialization)控制标记的工作方式。我们将详细介绍它们。

- `allow_flagging`：此参数可以设置为 `"manual"`（默认值），`"auto"` 或 `"never"`。
  - `manual`：用户将看到一个标记按钮，只有在点击按钮时样本才会被标记。
  - `auto`：用户将不会看到一个标记按钮，但每个样本都会自动被标记。
  - `never`：用户将不会看到一个标记按钮，并且不会标记任何样本。
- `flagging_options`：此参数可以是 `None`（默认值）或字符串列表。
  - 如果是 `None`，则用户只需点击**标记**按钮，不会显示其他选项。
  - 如果提供了一个字符串列表，则用户会看到多个按钮，对应于提供的每个字符串。例如，如果此参数的值为`[" 错误 ", " 模糊 "]`，则会显示标记为**标记为错误**和**标记为模糊**的按钮。这仅适用于 `allow_flagging` 为 `"manual"` 的情况。
  - 所选选项将与输入和输出一起记录。
- `flagging_dir`：此参数接受一个字符串。
  - 它表示标记数据存储的目录名称。
- `flagging_callback`：此参数接受 `FlaggingCallback` 类的子类的实例
  - 使用此参数允许您编写在点击标记按钮时运行的自定义代码
  - 默认情况下，它设置为 `gr.CSVLogger` 的一个实例
  - 一个示例是将其设置为 `gr.HuggingFaceDatasetSaver` 的一个实例，这样您可以将任何标记的数据导入到 HuggingFace 数据集中（参见下文）。

## 标记的数据会发生什么？

在 `flagging_dir` 参数提供的目录中，将记录标记的数据的 CSV 文件。

以下是一个示例：下面的代码创建了嵌入其中的计算器界面：

```python
import gradio as gr


def calculator(num1, operation, num2):
    if operation == "add":
        return num1 + num2
    elif operation == "subtract":
        return num1 - num2
    elif operation == "multiply":
        return num1 * num2
    elif operation == "divide":
        return num1 / num2


iface = gr.Interface(
    calculator,
    ["number", gr.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    allow_flagging="manual"
)

iface.launch()
```

<gradio-app space="gradio/calculator-flag-basic/"></gradio-app>

当您点击上面的标记按钮时，启动界面的目录将包括一个新的标记子文件夹，其中包含一个 CSV 文件。该 CSV 文件包括所有被标记的数据。

```directory
+-- flagged/
|   +-- logs.csv
```

_flagged/logs.csv_

```csv
num1,operation,num2,Output,timestamp
5,add,7,12,2022-01-31 11:40:51.093412
6,subtract,1.5,4.5,2022-01-31 03:25:32.023542
```

如果界面涉及文件数据，例如图像和音频组件，还将创建文件夹来存储这些标记的数据。例如，将 `image` 输入到 `image` 输出界面将创建以下结构。

```directory
+-- flagged/
|   +-- logs.csv
|   +-- image/
|   |   +-- 0.png
|   |   +-- 1.png
|   +-- Output/
|   |   +-- 0.png
|   |   +-- 1.png
```

_flagged/logs.csv_

```csv
im,Output timestamp
im/0.png,Output/0.png,2022-02-04 19:49:58.026963
im/1.png,Output/1.png,2022-02-02 10:40:51.093412
```

如果您希望用户为标记提供一个原因，您可以将字符串列表传递给 Interface 的 `flagging_options` 参数。用户在标记时必须选择其中一项，选项将作为附加列保存在 CSV 文件中。

如果我们回到计算器示例，下面的代码将创建嵌入其中的界面。

```python
iface = gr.Interface(
    calculator,
    ["number", gr.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    allow_flagging="manual",
    flagging_options=["wrong sign", "off by one", "other"]
)

iface.launch()
```

<gradio-app space="gradio/calculator-flagging-options/"></gradio-app>

当用户点击标记按钮时，CSV 文件现在将包括指示所选选项的列。

_flagged/logs.csv_

```csv
num1,operation,num2,Output,flag,timestamp
5,add,7,-12,wrong sign,2022-02-04 11:40:51.093412
6,subtract,1.5,3.5,off by one,2022-02-04 11:42:32.062512
```

## HuggingFaceDatasetSaver 回调

有时，将数据保存到本地 CSV 文件是不合理的。例如，在 Hugging Face Spaces 上
，开发者通常无法访问托管 Gradio 演示的底层临时机器。这就是为什么，默认情况下，在 Hugging Face Space 中关闭标记的原因。然而，
您可能希望对标记的数据做其他处理。
you may want to do something else with the flagged data.

通过 `flagging_callback` 参数，我们使这变得非常简单。

例如，下面我们将会将标记的数据从我们的计算器示例导入到 Hugging Face 数据集中，以便我们可以构建一个“众包”数据集：

```python
import os

HF_TOKEN = os.getenv('HF_TOKEN')
hf_writer = gr.HuggingFaceDatasetSaver(HF_TOKEN, "crowdsourced-calculator-demo")

iface = gr.Interface(
    calculator,
    ["number", gr.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    description="Check out the crowd-sourced dataset at: [https://huggingface.co/datasets/aliabd/crowdsourced-calculator-demo](https://huggingface.co/datasets/aliabd/crowdsourced-calculator-demo)",
    allow_flagging="manual",
    flagging_options=["wrong sign", "off by one", "other"],
    flagging_callback=hf_writer
)

iface.launch()
```

注意，我们使用我们的 Hugging Face 令牌和
要保存样本的数据集的名称，定义了我们自己的
`gradio.HuggingFaceDatasetSaver` 的实例。此外，我们还将 `allow_flagging="manual"` 设置为了
，因为在 Hugging Face Spaces 中，`allow_flagging` 默认设置为 `"never"`。这是我们的演示：

<gradio-app space="gradio/calculator-flagging-crowdsourced/"></gradio-app>

您现在可以在这个[公共的 Hugging Face 数据集](https://huggingface.co/datasets/aliabd/crowdsourced-calculator-demo)中看到上面标记的所有示例。

![flagging callback hf](/assets/guides/flagging-callback-hf.png)

我们创建了 `gradio.HuggingFaceDatasetSaver` 类，但只要它继承自[此文件](https://github.com/gradio-app/gradio/blob/master/gradio/flagging.py)中定义的 `FlaggingCallback`，您可以传递自己的自定义类。如果您创建了一个很棒的回调，请将其贡献给该存储库！

## 使用 Blocks 进行标记

如果您正在使用 `gradio.Blocks`，又该怎么办呢？一方面，使用 Blocks 您拥有更多的灵活性
--您可以编写任何您想在按钮被点击时运行的 Python 代码，
并使用 Blocks 中的内置事件分配它。

同时，您可能希望使用现有的 `FlaggingCallback` 来避免编写额外的代码。
这需要两个步骤：

1. 您必须在代码中的某个位置运行您的回调的 `.setup()` 方法
   在第一次标记数据之前
2. 当点击标记按钮时，您触发回调的 `.flag()` 方法，
   确保正确收集参数并禁用通常的预处理。

下面是一个使用默认的 `CSVLogger` 标记图像怀旧滤镜 Blocks 演示的示例：
data using the default `CSVLogger`:

$code_blocks_flag
$demo_blocks_flag

## 隐私

重要提示：请确保用户了解他们提交的数据何时被保存以及您计划如何处理它。当您使用 `allow_flagging=auto`（当通过演示提交的所有数据都被标记时），这一点尤为重要

### 这就是全部！祝您建设愉快 :)
