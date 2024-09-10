# 主要特点

让我们来介绍一下 Gradio 最受欢迎的一些功能！这里是 Gradio 的主要特点：

1. [添加示例输入](#example-inputs)
2. [传递自定义错误消息](#errors)
3. [添加描述内容](#descriptive-content)
4. [设置旗标](#flagging)
5. [预处理和后处理](#preprocessing-and-postprocessing)
6. [样式化演示](#styling)
7. [排队用户](#queuing)
8. [迭代输出](#iterative-outputs)
9. [进度条](#progress-bars)
10. [批处理函数](#batch-functions)
11. [在协作笔记本上运行](#colab-notebooks)

## 示例输入

您可以提供用户可以轻松加载到 "Interface" 中的示例数据。这对于演示模型期望的输入类型以及演示数据集和模型一起探索的方式非常有帮助。要加载示例数据，您可以将嵌套列表提供给 Interface 构造函数的 `examples=` 关键字参数。外部列表中的每个子列表表示一个数据样本，子列表中的每个元素表示每个输入组件的输入。有关每个组件的示例数据格式在[Docs](https://gradio.app/docs/components)中有说明。

$code_calculator
$demo_calculator

您可以将大型数据集加载到示例中，通过 Gradio 浏览和与数据集进行交互。示例将自动分页（可以通过 Interface 的 `examples_per_page` 参数进行配置）。

继续了解示例，请参阅[更多示例](https://gradio.app/more-on-examples)指南。

## 错误

您希望向用户传递自定义错误消息。为此，with `gr.Error("custom message")` 来显示错误消息。如果在上面的计算器示例中尝试除以零，将显示自定义错误消息的弹出模态窗口。了解有关错误的更多信息，请参阅[文档](https://gradio.app/docs/error)。

## 描述性内容

在前面的示例中，您可能已经注意到 Interface 构造函数中的 `title=` 和 `description=` 关键字参数，帮助用户了解您的应用程序。

Interface 构造函数中有三个参数用于指定此内容应放置在哪里：

- `title`：接受文本，并可以将其显示在界面的顶部，也将成为页面标题。
- `description`：接受文本、Markdown 或 HTML，并将其放置在标题正下方。
- `article`：也接受文本、Markdown 或 HTML，并将其放置在界面下方。

![annotated](/assets/guides/annotated.png)

如果您使用的是 `Blocks` API，则可以 with `gr.Markdown(...)` 或 `gr.HTML(...)` 组件在任何位置插入文本、Markdown 或 HTML，其中描述性内容位于 `Component` 构造函数内部。

另一个有用的关键字参数是 `label=`，它存在于每个 `Component` 中。这修改了每个 `Component` 顶部的标签文本。还可以为诸如 `Textbox` 或 `Radio` 之类的表单元素添加 `info=` 关键字参数，以提供有关其用法的进一步信息。

```python
gr.Number(label='年龄', info='以年为单位，必须大于0')
```

## 旗标

默认情况下，"Interface" 将有一个 "Flag" 按钮。当用户测试您的 `Interface` 时，如果看到有趣的输出，例如错误或意外的模型行为，他们可以将输入标记为您进行查看。在由 `Interface` 构造函数的 `flagging_dir=` 参数提供的目录中，将记录标记的输入到一个 CSV 文件中。如果界面涉及文件数据，例如图像和音频组件，将创建文件夹来存储这些标记的数据。

例如，对于上面显示的计算器界面，我们将在下面的旗标目录中存储标记的数据：

```directory
+-- calculator.py
+-- flagged/
|   +-- logs.csv
```

_flagged/logs.csv_

```csv
num1,operation,num2,Output
5,add,7,12
6,subtract,1.5,4.5
```

与早期显示的冷色界面相对应，我们将在下面的旗标目录中存储标记的数据：

```directory
+-- sepia.py
+-- flagged/
|   +-- logs.csv
|   +-- im/
|   |   +-- 0.png
|   |   +-- 1.png
|   +-- Output/
|   |   +-- 0.png
|   |   +-- 1.png
```

_flagged/logs.csv_

```csv
im,Output
im/0.png,Output/0.png
im/1.png,Output/1.png
```

如果您希望用户提供旗标原因，可以将字符串列表传递给 Interface 的 `flagging_options` 参数。用户在进行旗标时必须选择其中一个字符串，这将作为附加列保存到 CSV 中。

## 预处理和后处理 (Preprocessing and Postprocessing)

![annotated](/assets/img/dataflow.svg)

如您所见，Gradio 包括可以处理各种不同数据类型的组件，例如图像、音频和视频。大多数组件都可以用作输入或输出。

当组件用作输入时，Gradio 自动处理*预处理*，将数据从用户浏览器发送的类型（例如网络摄像头快照的 base64 表示）转换为您的函数可以接受的形式（例如 `numpy` 数组）。

同样，当组件用作输出时，Gradio 自动处理*后处理*，将数据从函数返回的形式（例如图像路径列表）转换为可以在用户浏览器中显示的形式（例如以 base64 格式显示图像的 `Gallery`）。

您可以使用构建图像组件时的参数控制*预处理*。例如，如果您使用以下参数实例化 `Image` 组件，它将将图像转换为 `PIL` 类型，并将其重塑为`(100, 100)`，而不管提交时的原始大小如何：

```py
img = gr.Image(width=100, height=100, type="pil")
```

相反，这里我们保留图像的原始大小，但在将其转换为 numpy 数组之前反转颜色：

```py
img = gr.Image(invert_colors=True, type="numpy")
```

后处理要容易得多！Gradio 自动识别返回数据的格式（例如 `Image` 是 `numpy` 数组还是 `str` 文件路径？），并将其后处理为可以由浏览器显示的格式。

请查看[文档](https://gradio.app/docs)，了解每个组件的所有与预处理相关的参数。

## 样式 (Styling)

Gradio 主题是自定义应用程序外观和感觉的最简单方法。您可以选择多种主题或创建自己的主题。要这样做，请将 `theme=` 参数传递给 `Interface` 构造函数。例如：

```python
demo = gr.Interface(..., theme=gr.themes.Monochrome())
```

Gradio 带有一组预先构建的主题，您可以从 `gr.themes.*` 加载。您可以扩展这些主题或从头开始创建自己的主题 - 有关更多详细信息，请参阅[主题指南](https://gradio.app/theming-guide)。

要增加额外的样式能力，您可以 with `css=` 关键字将任何 CSS 传递给您的应用程序。
Gradio 应用程序的基类是 `gradio-container`，因此以下是一个更改 Gradio 应用程序背景颜色的示例：

```python
with `gr.Interface(css=".gradio-container {background-color: red}") as demo:
    ...
```

## 队列 (Queuing)

如果您的应用程序预计会有大量流量，请 with `queue()` 方法来控制处理速率。这将排队处理调用，因此一次只处理一定数量的请求。队列使用 Websockets，还可以防止网络超时，因此如果您的函数的推理时间很长（> 1 分钟），应使用队列。

with `Interface`：

```python
demo = gr.Interface(...).queue()
demo.launch()
```

with `Blocks`：

```python
with gr.Blocks() as demo：
    #...
demo.queue()
demo.launch()
```

您可以通过以下方式控制一次处理的请求数量：

```python
demo.queue(concurrency_count=3)
```

查看有关配置其他队列参数的[队列文档](/docs/#queue)。

在 Blocks 中指定仅对某些函数进行排队：

```python
with gr.Blocks() as demo2：
    num1 = gr.Number()
    num2 = gr.Number()
    output = gr.Number()
    gr.Button("Add").click(
        lambda a, b: a + b, [num1, num2], output)
    gr.Button("Multiply").click(
        lambda a, b: a * b, [num1, num2], output, queue=True)
demo2.launch()
```

## 迭代输出 (Iterative Outputs)

在某些情况下，您可能需要传输一系列输出而不是一次显示单个输出。例如，您可能有一个图像生成模型，希望显示生成的每个步骤的图像，直到最终图像。或者您可能有一个聊天机器人，它逐字逐句地流式传输响应，而不是一次返回全部响应。

在这种情况下，您可以将**生成器**函数提供给 Gradio，而不是常规函数。在 Python 中创建生成器非常简单：函数不应该有一个单独的 `return` 值，而是应该 with `yield` 连续返回一系列值。通常，`yield` 语句放置在某种循环中。下面是一个简单示例，生成器只是简单计数到给定数字：

```python
def my_generator(x):
    for i in range(x):
        yield i
```

您以与常规函数相同的方式将生成器提供给 Gradio。例如，这是一个（虚拟的）图像生成模型，它在输出图像之前生成数个步骤的噪音：

$code_fake_diffusion
$demo_fake_diffusion

请注意，我们在迭代器中添加了 `time.sleep(1)`，以创建步骤之间的人工暂停，以便您可以观察迭代器的步骤（在真实的图像生成模型中，这可能是不必要的）。

将生成器提供给 Gradio **需要**在底层 Interface 或 Blocks 中启用队列（请参阅上面的队列部分）。

## 进度条

Gradio 支持创建自定义进度条，以便您可以自定义和控制向用户显示的进度更新。要启用此功能，只需为方法添加一个默认值为 `gr.Progress` 实例的参数即可。然后，您可以直接调用此实例并传入 0 到 1 之间的浮点数来更新进度级别，或者 with `Progress` 实例的 `tqdm()` 方法来跟踪可迭代对象上的进度，如下所示。必须启用队列以进行进度更新。

$code_progress_simple
$demo_progress_simple

如果您 with `tqdm` 库，并且希望从函数内部的任何 `tqdm.tqdm` 自动报告进度更新，请将默认参数设置为 `gr.Progress(track_tqdm=True)`！

## 批处理函数 (Batch Functions)

Gradio 支持传递*批处理*函数。批处理函数只是接受输入列表并返回预测列表的函数。

例如，这是一个批处理函数，它接受两个输入列表（一个单词列表和一个整数列表），并返回修剪过的单词列表作为输出：

```python
import time

def trim_words(words, lens):
    trimmed_words = []
    time.sleep(5)
    for w, l in zip(words, lens):
        trimmed_words.append(w[:int(l)])
    return [trimmed_words]
    for w, l in zip(words, lens):
```

使用批处理函数的优点是，如果启用了队列，Gradio 服务器可以自动*批处理*传入的请求并并行处理它们，从而可能加快演示速度。以下是 Gradio 代码的示例（请注意 `batch=True` 和 `max_batch_size=16` - 这两个参数都可以传递给事件触发器或 `Interface` 类）

with `Interface`：

```python
demo = gr.Interface(trim_words, ["textbox", "number"], ["output"],
                    batch=True, max_batch_size=16)
demo.queue()
demo.launch()
```

with `Blocks`：

```python
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        word = gr.Textbox(label="word")
        leng = gr.Number(label="leng")
        output = gr.Textbox(label="Output")
    with gr.Row():
        run = gr.Button()

    event = run.click(trim_words, [word, leng], output, batch=True, max_batch_size=16)

demo.queue()
demo.launch()
```

在上面的示例中，可以并行处理 16 个请求（总推理时间为 5 秒），而不是分别处理每个请求（总推理时间为 80 秒）。许多 Hugging Face 的 `transformers` 和 `diffusers` 模型在 Gradio 的批处理模式下自然工作：这是[使用批处理生成图像的示例演示](https://github.com/gradio-app/gradio/blob/main/demo/diffusers_with_batching/run.py)

注意：使用 Gradio 的批处理函数 **requires** 在底层 Interface 或 Blocks 中启用队列（请参阅上面的队列部分）。

## Gradio 笔记本 (Colab Notebooks)

Gradio 可以在任何运行 Python 的地方运行，包括本地 Jupyter 笔记本和协作笔记本，如[Google Colab](https://colab.research.google.com/)。对于本地 Jupyter 笔记本和 Google Colab 笔记本，Gradio 在本地服务器上运行，您可以在浏览器中与之交互。（注意：对于 Google Colab，这是通过[服务工作器隧道](https://github.com/tensorflow/tensorboard/blob/master/docs/design/colab_integration.md)实现的，您的浏览器需要启用 cookies。）对于其他远程笔记本，Gradio 也将在服务器上运行，但您需要使用[SSH 隧道](https://coderwall.com/p/ohk6cg/remote-access-to-ipython-notebooks-via-ssh)在本地浏览器中查看应用程序。通常，更简单的选择是使用 Gradio 内置的公共链接，[在下一篇指南中讨论](/sharing-your-app/#sharing-demos)。
