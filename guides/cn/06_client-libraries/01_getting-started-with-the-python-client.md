# 使用 Gradio Python 客户端入门

Tags: CLIENT, API, SPACES

Gradio Python 客户端使得将任何 Gradio 应用程序作为 API 使用变得非常容易。例如，考虑一下从麦克风录制的[Whisper 音频文件](https://huggingface.co/spaces/abidlabs/whisper)的转录。

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/whisper-screenshot.jpg)

使用 `gradio_client` 库，我们可以轻松地将 Gradio 用作 API，以编程方式转录音频文件。

下面是完成此操作的整个代码：

```python
from gradio_client import Client

client = Client("abidlabs/whisper")
client.predict("audio_sample.wav")

>> "这是Whisper语音识别模型的测试。"
```

Gradio 客户端适用于任何托管在 Hugging Face Spaces 上的 Gradio 应用程序，无论是图像生成器、文本摘要生成器、有状态聊天机器人、税金计算器还是其他任何应用程序！Gradio 客户端主要用于托管在[Hugging Face Spaces](https://hf.space)上的应用程序，但你的应用程序可以托管在任何地方，比如你自己的服务器。

**先决条件**：要使用 Gradio 客户端，你不需要详细了解 `gradio` 库。但是，了解 Gradio 的输入和输出组件的概念会有所帮助。

## 安装

如果你已经安装了最新版本的 `gradio`，那么 `gradio_client` 就作为依赖项包含在其中。

否则，可以使用 pip（或 pip3）安装轻量级的 `gradio_client` 包，并且已经测试可以在 Python 3.9 或更高版本上运行：

```bash
$ pip install gradio_client
```

## 连接到运行中的 Gradio 应用程序

首先创建一个 `Client` 对象，并将其连接到运行在 Hugging Face Spaces 上或其他任何地方的 Gradio 应用程序。

## 连接到 Hugging Face 空间

```python
from gradio_client import Client

client = Client("abidlabs/en2fr")  # 一个将英文翻译为法文的Space
```

你还可以通过在 `hf_token` 参数中传递你的 HF 令牌来连接到私有空间。你可以在这里获取你的 HF 令牌：https://huggingface.co/settings/tokens

```python
from gradio_client import Client

client = Client("abidlabs/my-private-space", hf_token="...")
```

## 复制空间以供私人使用

虽然你可以将任何公共空间用作 API，但如果你发出太多请求，你可能会受到 Hugging Face 的频率限制。要无限制地使用一个空间，只需将其复制以创建一个私有空间，然后可以根据需要进行多个请求！

`gradio_client` 包括一个类方法：`Client.duplicate()`，使这个过程变得简单（你需要传递你的[Hugging Face 令牌](https://huggingface.co/settings/tokens)或使用 Hugging Face CLI 登录）：

```python
import os
from gradio_client import Client

HF_TOKEN = os.environ.get("HF_TOKEN")

client = Client.duplicate("abidlabs/whisper", hf_token=HF_TOKEN)
client.predict("audio_sample.wav")

>> "This is a test of the whisper speech recognition model."
```

> > " 这是 Whisper 语音识别模型的测试。"

如果之前已复制了一个空间，重新运行 `duplicate()` 将*不会*创建一个新的空间。相反，客户端将连接到之前创建的空间。因此，多次运行 `Client.duplicate()` 方法是安全的。

**注意：** 如果原始空间使用了 GPU，你的私有空间也将使用 GPU，并且你的 Hugging Face 账户将根据 GPU 的价格计费。为了降低费用，在 1 小时没有活动后，你的空间将自动休眠。你还可以使用 `duplicate()` 的 `hardware` 参数来设置硬件。

## 连接到通用 Gradio 应用程序

如果你的应用程序运行在其他地方，只需提供完整的 URL，包括 "http://" 或 "https://"。下面是一个在共享 URL 上运行的 Gradio 应用程序进行预测的示例：

```python
from gradio_client import Client

client = Client("https://bec81a83-5b5c-471e.gradio.live")
```

## 检查 API 端点

一旦连接到 Gradio 应用程序，可以通过调用 `Client.view_api()` 方法查看可用的 API 端点。对于 Whisper 空间，我们可以看到以下信息：

```bash
Client.predict() Usage Info
---------------------------
Named API endpoints: 1

 - predict(input_audio, api_name="/predict") -> value_0
    Parameters:
     - [Audio] input_audio: str (filepath or URL)
    Returns:
     - [Textbox] value_0: str (value)
```

这显示了在此空间中有 1 个 API 端点，并显示了如何使用 API 端点进行预测：我们应该调用 `.predict()` 方法（我们将在下面探讨），提供类型为 `str` 的参数 `input_audio`，它是一个`文件路径或 URL`。

我们还应该提供 `api_name='/predict'` 参数给 `predict()` 方法。虽然如果一个 Gradio 应用程序只有一个命名的端点，这不是必需的，但它允许我们在单个应用程序中调用不同的端点（如果它们可用）。如果一个应用程序有无名的 API 端点，可以通过运行 `.view_api(all_endpoints=True)` 来显示它们。

## 进行预测

进行预测的最简单方法是只需使用相应的参数调用 `.predict()` 函数：

```python
from gradio_client import Client

client = Client("abidlabs/en2fr", api_name='/predict')
client.predict("Hello")

>> Bonjour
```

如果有多个参数，那么你应该将它们作为单独的参数传递给 `.predict()`，就像这样：

````python
from gradio_client import Client

client = Client("gradio/calculator")
client.predict(4, "add", 5)

>> 9.0


对于某些输入，例如图像，你应该传递文件的文件路径或URL。同样，对应的输出类型，你将获得一个文件路径或URL。


```python
from gradio_client import Client

client = Client("abidlabs/whisper")
client.predict("https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3")

>> "My thought I have nobody by a beauty and will as you poured. Mr. Rochester is serve in that so don't find simpus, and devoted abode, to at might in a r—"

````

## 异步运行任务（Running jobs asynchronously）

应注意`.predict()`是一个*阻塞*操作，因为它在返回预测之前等待操作完成。

在许多情况下，直到你需要预测结果之前，你最好让作业在后台运行。你可以通过使用`.submit()`方法创建一个`Job`实例，然后稍后调用`.result()`在作业上获取结果。例如：

```python
from gradio_client import Client

client = Client(space="abidlabs/en2fr")
job = client.submit("Hello", api_name="/predict")  # 这不是阻塞的

# 做其他事情

job.result()  # 这是阻塞的

>> Bonjour
```

## 添加回调 （Adding callbacks）

或者，可以添加一个或多个回调来在作业完成后执行操作，像这样：

```python
from gradio_client import Client

def print_result(x):
    print(" 翻译的结果是：{x}")

client = Client(space="abidlabs/en2fr")

job = client.submit("Hello", api_name="/predict", result_callbacks=[print_result])

# 做其他事情

>> 翻译的结果是：Bonjour

```

## 状态 （Status）

`Job`对象还允许您通过调用`.status()`方法获取运行作业的状态。这将返回一个`StatusUpdate`对象，具有以下属性：`code`（状态代码，其中之一表示状态的一组定义的字符串。参见`utils.Status`类）、`rank`（此作业在队列中的当前位置）、`queue_size`（总队列大小）、`eta`（此作业将完成的预计时间）、`success`（表示作业是否成功完成的布尔值）和`time`（生成状态的时间）。

```py
from gradio_client import Client

client = Client(src="gradio/calculator")
job = client.submit(5, "add", 4, api_name="/predict")
job.status()

>> <Status.STARTING: 'STARTING'>
```

_注意_：`Job`类还有一个`.done()`实例方法，返回一个布尔值，指示作业是否已完成。

## 取消作业 （Cancelling Jobs）

`Job`类还有一个`.cancel()`实例方法，取消已排队但尚未开始的作业。例如，如果你运行：

```py
client = Client("abidlabs/whisper")
job1 = client.submit("audio_sample1.wav")
job2 = client.submit("audio_sample2.wav")
job1.cancel()  # 将返回 False，假设作业已开始
job2.cancel()  # 将返回 True，表示作业已取消
```

如果第一个作业已开始处理，则它将不会被取消。如果第二个作业尚未开始，则它将成功取消并从队列中删除。

## 生成器端点 （Generator Endpoints）

某些Gradio API端点不返回单个值，而是返回一系列值。你可以随时从这样的生成器端点获取返回的一系列值，方法是运行`job.outputs()`：

```py
from gradio_client import Client

client = Client(src="gradio/count_generator")
job = client.submit(3, api_name="/count")
while not job.done():
    time.sleep(0.1)
job.outputs()

>> ['0', '1', '2']
```

请注意，在生成器端点上运行`job.result()`只会获得端点返回的*第一个*值。

`Job`对象还是可迭代的，这意味着您可以使用它按照从端点返回的结果逐个显示生成器函数的结果。以下是使用`Job`作为生成器的等效示例：

```py
from gradio_client import Client

client = Client(src="gradio/count_generator")
job = client.submit(3, api_name="/count")

for o in job:
    print(o)

>> 0
>> 1
>> 2
```

你还可以取消具有迭代输出的作业，在这种情况下，作业将在当前迭代完成运行后完成。

```py
from gradio_client import Client
import time

client = Client("abidlabs/test-yield")
job = client.submit("abcdef")
time.sleep(3)
job.cancel()  # 作业在运行 2 个迭代后取消
```
