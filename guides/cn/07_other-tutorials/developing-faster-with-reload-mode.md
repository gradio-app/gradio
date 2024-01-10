# 通过自动重载实现更快的开发

**先决条件**：本指南要求您了解块的知识。请确保[先阅读块指南](https://gradio.app/blocks-and-event-listeners)。

本指南介绍了自动重新加载、在 Python IDE 中重新加载以及在 Jupyter Notebooks 中使用 gradio 的方法。

## 为什么要使用自动重载？

当您构建 Gradio 演示时，特别是使用 Blocks 构建时，您可能会发现反复运行代码以测试更改很麻烦。

为了更快速、更便捷地编写代码，我们已经简化了在 **Python IDE**（如 VS Code、Sublime Text、PyCharm 等）中开发或从终端运行 Python 代码时“重新加载”Gradio 应用的方式。我们还开发了一个类似的“魔法命令”，使您可以更快速地重新运行单元格，如果您使用 Jupyter Notebooks（或类似的环境，如 Colab）的话。

这个简短的指南将涵盖这两种方法，所以无论您如何编写 Python 代码，您都将知道如何更快地构建 Gradio 应用程序。

## Python IDE 重载 🔥

如果您使用 Python IDE 构建 Gradio Blocks，那么代码文件（假设命名为 `run.py`）可能如下所示：

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# 来自Gradio的问候！")
    inp = gr.Textbox(placeholder="您叫什么名字？")
    out = gr.Textbox()

    inp.change(fn=lambda x: f"欢迎，{x}！",
               inputs=inp,
               outputs=out)

if __name__ == "__main__":
    demo.launch()
```

问题在于，每当您想要更改布局、事件或组件时，都必须通过编写 `python run.py` 来关闭和重新运行应用程序。

而不是这样做，您可以通过更改 1 个单词来以**重新加载模式**运行代码：将 `python` 更改为 `gradio`：

在终端中运行 `gradio run.py`。就是这样！

现在，您将看到类似于这样的内容：

```bash
Launching in *reload mode* on: http://127.0.0.1:7860 (Press CTRL+C to quit)

Watching...

WARNING:  The --reload flag should not be used in production on Windows.
```

这里最重要的一行是 `正在观察 ...`。这里发生的情况是 Gradio 将观察 `run.py` 文件所在的目录，如果文件发生更改，它将自动为您重新运行文件。因此，您只需专注于编写代码，Gradio 演示将自动刷新 🥳

⚠️ 警告：`gradio` 命令不会检测传递给 `launch()` 方法的参数，因为在重新加载模式下从未调用 `launch()` 方法。例如，设置 `launch()` 中的 `auth` 或 `show_error` 不会在应用程序中反映出来。

当您使用重新加载模式时，请记住一件重要的事情：Gradio 专门查找名为 `demo` 的 Gradio Blocks/Interface 演示。如果您将演示命名为其他名称，您需要在代码中的第二个参数中传入演示的 FastAPI 应用程序的名称。对于 Gradio 演示，可以使用 `.app` 属性访问 FastAPI 应用程序。因此，如果您的 `run.py` 文件如下所示：

```python
import gradio as gr

with gr.Blocks() as my_demo:
    gr.Markdown("# 来自Gradio的问候！")
    inp = gr.Textbox(placeholder="您叫什么名字？")
    out = gr.Textbox()

    inp.change(fn=lambda x: f"欢迎，{x}！",
               inputs=inp,
               outputs=out)

if __name__ == "__main__":
    my_demo.launch()
```

那么您可以这样启动它：`gradio run.py my_demo.app`。

Gradio默认使用UTF-8编码格式。对于**重新加载模式**，如果你的脚本使用的是除UTF-8以外的编码（如GBK）：

1. 在Python脚本的编码声明处指定你想要的编码格式，如：`# -*- coding: gbk -*-`
2. 确保你的代码编辑器识别到该格式。 
3. 执行：`gradio run.py --encoding gbk`

🔥 如果您的应用程序接受命令行参数，您也可以传递它们。下面是一个例子：

```python
import gradio as gr
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--name", type=str, default="User")
args, unknown = parser.parse_known_args()

with gr.Blocks() as demo:
    gr.Markdown(f"# 欢迎 {args.name}！")
    inp = gr.Textbox()
    out = gr.Textbox()

    inp.change(fn=lambda x: x, inputs=inp, outputs=out)

if __name__ == "__main__":
    demo.launch()
```

您可以像这样运行它：`gradio run.py --name Gretel`

作为一个小提示，只要更改了 `run.py` 源代码或 Gradio 源代码，自动重新加载就会发生。这意味着如果您决定[为 Gradio 做贡献](https://github.com/gradio-app/gradio/blob/main/CONTRIBUTING.md)，这将非常有用 ✅

## Jupyter Notebook 魔法命令🔮

如果您使用 Jupyter Notebooks（或 Colab Notebooks 等）进行开发，我们也为您提供了一个解决方案！

我们开发了一个 **magic command 魔法命令**，可以为您创建和运行一个 Blocks 演示。要使用此功能，在笔记本顶部加载 gradio 扩展：

`%load_ext gradio`

然后，在您正在开发 Gradio 演示的单元格中，只需在顶部写入魔法命令**`%%blocks`**，然后像平常一样编写布局和组件：

```py
%%blocks

import gradio as gr

gr.Markdown("# 来自Gradio的问候！")
inp = gr.Textbox(placeholder="您叫什么名字？")
out = gr.Textbox()

inp.change(fn=lambda x: f"欢迎，{x}！",
           inputs=inp,
           outputs=out)
```

请注意：

- 您不需要放置样板代码 `with gr.Blocks() as demo:` 和 `demo.launch()` — Gradio 会自动为您完成！

- 每次重新运行单元格时，Gradio 都将在相同的端口上重新启动您的应用程序，并使用相同的底层网络服务器。这意味着您将比正常重新运行单元格更快地看到变化。

下面是在 Jupyter Notebook 中的示例：

![](https://i.ibb.co/nrszFws/Blocks.gif)

🪄这在 colab 笔记本中也适用！[这是一个 colab 笔记本](https://colab.research.google.com/drive/1jUlX1w7JqckRHVE-nbDyMPyZ7fYD8488?authuser=1#scrollTo=zxHYjbCTTz_5)，您可以在其中看到 Blocks 魔法效果。尝试进行一些更改并重新运行带有 Gradio 代码的单元格！

Notebook Magic 现在是作者构建 Gradio 演示的首选方式。无论您如何编写 Python 代码，我们都希望这两种方法都能为您提供更好的 Gradio 开发体验。

---

## 下一步

既然您已经了解了如何使用 Gradio 快速开发，请开始构建自己的应用程序吧！

如果你正在寻找灵感，请尝试浏览其他人用 Gradio 构建的演示，[浏览 Hugging Face Spaces](http://hf.space/) 🤗
