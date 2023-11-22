# 实时语音识别

Related spaces: https://huggingface.co/spaces/abidlabs/streaming-asr-paused, https://huggingface.co/spaces/abidlabs/full-context-asr
Tags: ASR, SPEECH, STREAMING

## 介绍

自动语音识别（ASR）是机器学习中非常重要且蓬勃发展的领域，它将口语转换为文本。ASR 算法几乎在每部智能手机上都有运行，并越来越多地嵌入到专业工作流程中，例如护士和医生的数字助手。由于 ASR 算法是直接面向客户和最终用户设计的，因此在面对各种语音模式（不同的口音、音调和背景音频条件）时，验证它们的行为是否符合预期非常重要。

使用 `gradio`，您可以轻松构建一个 ASR 模型的演示，并与测试团队共享，或通过设备上的麦克风进行自行测试。

本教程将展示如何使用预训练的语音识别模型并在 Gradio 界面上部署。我们将从一个 **full-context 全文**模型开始，其中用户在进行预测之前要说完整段音频。然后，我们将调整演示以使其变为 **streaming 流式**，这意味着音频模型将在您说话时将语音转换为文本。我们创建的流式演示将如下所示（在下方尝试或[在新标签页中打开](https://huggingface.co/spaces/abidlabs/streaming-asr-paused)）：

<iframe src="https://abidlabs-streaming-asr-paused.hf.space" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>
实时 ASR 本质上是*有状态的*，即模型的预测结果取决于用户先前说的单词。因此，在本教程中，我们还将介绍如何在 Gradio 演示中使用 **state**。

### 先决条件

确保您已经[安装](/getting_started)了 `gradio` Python 包。您还需要一个预训练的语音识别模型。在本教程中，我们将从两个 ASR 库构建演示：

- Transformers（为此，`pip install transformers` 和 `pip install torch`）\* DeepSpeech（`pip install deepspeech==0.8.2`）

确保您至少安装了其中之一，以便您可以跟随本教程操作。如果您尚未安装 `ffmpeg`，请在[系统上下载并安装](https://www.ffmpeg.org/download.html)，以便从麦克风处理文件。

下面是构建实时语音识别（ASR）应用程序的步骤：

1. [设置 Transformers ASR 模型](#1-set-up-the-transformers-asr-model)
2. [使用 Transformers 创建一个全文 ASR 演示]
   (#2-create-a-full-context-asr-demo-with-transformers)
3. [使用 Transformers 创建一个流式 ASR 演示](#3-create-a-streaming-asr-demo-with-transformers)
4. [使用 DeepSpeech 创建一个流式 ASR 演示](#4-create-a-streaming-asr-demo-with-deepspeech)

## 1. 设置 Transformers ASR 模型

首先，您需要拥有一个 ASR 模型，您可以自己训练，或者需要下载一个预训练模型。在本教程中，我们将使用 Hugging Face 模型的预训练 ASR 模型 `Wav2Vec2`。

以下是从 Hugging Face 的 `transformers` 加载 `Wav2Vec2` 的代码：

```python
from transformers import pipeline
p = pipeline("automatic-speech-recognition")
```

就是这样！默认情况下，自动语音识别模型管道会加载 Facebook 的 `facebook/wav2vec2-base-960h` 模型。

## 2. 使用 Transformers 创建一个全文 ASR 演示

我们将首先创建一个*全文*ASR 演示，其中用户在使用 ASR 模型进行预测之前说完整段音频。使用 Gradio 非常简单，我们只需在上面的 `pipeline` 对象周围创建一个函数。

我们将使用 `gradio` 内置的 `Audio` 组件，配置从用户的麦克风接收输入并返回录制音频的文件路径。输出组件将是一个简单的 `Textbox`。

```python
import gradio as gr

def transcribe(audio):
    text = p(audio)["text"]
    return text

gr.Interface(
    fn=transcribe,
    inputs=gr.Audio(sources=["microphone"], type="filepath"),
    outputs="text").launch()
```

那么这里发生了什么？`transcribe` 函数接受一个参数 `audio`，它是用户录制的音频文件的文件路径。`pipeline` 对象期望一个文件路径，并将其转换为文本，然后返回到前端并在文本框中显示。

让我们看看它的效果吧！（录制一段短音频并点击提交，或[在新标签页打开](https://huggingface.co/spaces/abidlabs/full-context-asr)）：

<iframe src="https://abidlabs-full-context-asr.hf.space" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>
## 3. 使用 Transformers 创建一个流式 ASR 演示
太棒了！我们已经构建了一个对短音频剪辑效果良好的 ASR 模型。但是，如果您正在记录较长的音频剪辑，则可能需要一个*流式*界面，即在用户说话时逐句转录音频，而不仅仅在最后一次全部转录。

好消息是，我们可以很容易地调整刚刚创建的演示，使其成为流式的，使用相同的 `Wav2Vec2` 模型。

最大的变化是我们现在必须引入一个 `state` 参数，它保存到目前为止*转录的音频*。这样，我们只需处理最新的音频块，并将其简单地追加到先前转录的音频中。

在向 Gradio 演示添加状态时，您需要完成 3 件事：

- 在函数中添加 `state` 参数* 在函数末尾返回更新后的 `state`* 在 `Interface` 的 `inputs` 和 `outputs` 中添加 `"state"` 组件

以下是代码示例：

```python
def transcribe(audio, state=""):
    text = p(audio)["text"]
    state += text + " "
    return state, state

# Set the starting state to an empty string
gr.Interface(
    fn=transcribe,
    inputs=[
        gr.Audio(sources=["microphone"], type="filepath", streaming=True),
        "state"
    ],
    outputs=[
        "textbox",
        "state"
    ],
    live=True).launch()
```

请注意，我们还进行了另一个更改，即我们设置了 `live=True`。这使得 Gradio 接口保持持续运行，因此它可以自动转录音频，而无需用户反复点击提交按钮。

让我们看看它的效果（在下方尝试或[在新标签页中打开](https://huggingface.co/spaces/abidlabs/streaming-asr)）！

<iframe src="https://abidlabs-streaming-asr.hf.space" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

你可能注意到的一件事是，由于音频块非常小，所以转录质量下降了，它们缺乏正确转录所需的上下文。此问题的“hacky”解决方法是简单地增加 `transcribe()` 函数的运行时间，以便处理更长的音频块。我们可以通过在函数中添加 `time.sleep()` 来实现这一点，如下所示（接下来我们将看到一个正确的解决方法）

```python
from transformers import pipeline
import gradio as gr
import time

p = pipeline("automatic-speech-recognition")

def transcribe(audio, state=""):
    time.sleep(2)
    text = p(audio)["text"]
    state += text + " "
    return state, state

gr.Interface(
    fn=transcribe,
    inputs=[
        gr.Audio(sources=["microphone"], type="filepath", streaming=True),
        "state"
    ],
    outputs=[
        "textbox",
        "state"
    ],
    live=True).launch()
```

尝试下面的演示，查看差异（或[在新标签页中打开](https://huggingface.co/spaces/abidlabs/streaming-asr-paused)）！

<iframe src="https://abidlabs-streaming-asr-paused.hf.space" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## 4. 使用 DeepSpeech 创建流式 ASR 演示

您不仅限于使用 `transformers` 库中的 ASR 模型 - 您可以使用自己的模型或其他库中的模型。`DeepSpeech` 库包含专门用于处理流式音频数据的模型。这些模型在处理流式数据时表现非常好，因为它们能够考虑到先前的音频块在进行预测时产生的影响。

深入研究 DeepSpeech 库超出了本指南的范围（可以在[此处查看其优秀的文档](https://deepspeech.readthedocs.io/en/r0.9/)），但是您可以像使用 Transformer ASR 模型一样，使用 DeepSpeech ASR 模型使用类似的方法使用 Gradio。

下面是一个完整的示例（在 Linux 上）：

首先通过终端安装 DeepSpeech 库并下载预训练模型：

```bash
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.8.2/deepspeech-0.8.2-models.pbmm
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.8.2/deepspeech-0.8.2-models.scorer
apt install libasound2-dev portaudio19-dev libportaudio2 libportaudiocpp0 ffmpeg
pip install deepspeech==0.8.2
```

然后，创建与之前相似的 `transcribe()` 函数：

```python
from deepspeech import Model
import numpy as np

model_file_path = "deepspeech-0.8.2-models.pbmm"
lm_file_path = "deepspeech-0.8.2-models.scorer"
beam_width = 100
lm_alpha = 0.93
lm_beta = 1.18

model = Model(model_file_path)
model.enableExternalScorer(lm_file_path)
model.setScorerAlphaBeta(lm_alpha, lm_beta)
model.setBeamWidth(beam_width)


def reformat_freq(sr, y):
    if sr not in (
        48000,
        16000,
    ):  # Deepspeech only supports 16k, (we convert 48k -> 16k)
        raise ValueError("Unsupported rate", sr)
    if sr == 48000:
        y = (
            ((y / max(np.max(y), 1)) * 32767)
            .reshape((-1, 3))
            .mean(axis=1)
            .astype("int16")
        )
        sr = 16000
    return sr, y


def transcribe(speech, stream):
    _, y = reformat_freq(*speech)
    if stream is None:
        stream = model.createStream()
    stream.feedAudioContent(y)
    text = stream.intermediateDecode()
    return text, stream

```

然后，如前所述创建一个 Gradio 接口（唯一的区别是返回类型应该是 `numpy` 而不是 `filepath` 以与 DeepSpeech 模型兼容）

```python
import gradio as gr

gr.Interface(
    fn=transcribe,
    inputs=[
        gr.Audio(sources=["microphone"], type="numpy"),
        "state"
    ],
    outputs= [
        "text",
        "state"
    ],
    live=True).launch()
```

运行所有这些应该允许您使用一个漂亮的 GUI 部署实时 ASR 模型。尝试一下，看它在您那里运行得有多好。

---

你已经完成了！这就是构建用于 ASR 模型的基于 Web 的 GUI 所需的所有代码。

有趣的提示：您只需在 `launch()` 中设置 `share=True`，即可即时与他人共享 ASR 模型。
