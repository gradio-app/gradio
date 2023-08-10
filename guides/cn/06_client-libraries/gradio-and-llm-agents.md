# Gradio & LLM Agents 🤝

非常强大的大型语言模型（LLM），如果我们能赋予它们完成专门任务的技能，它们将变得更加强大。

[gradio_tools](https://github.com/freddyaboulton/gradio-tools)库可以将任何[Gradio](https://github.com/gradio-app/gradio)应用程序转化为[工具](https://python.langchain.com/en/latest/modules/agents/tools.html)，供[代理](https://docs.langchain.com/docs/components/agents/agent)使用以完成任务。例如，一个LLM可以使用Gradio工具转录在网上找到的语音记录，然后为您summarize它。或者它可以使用不同的Gradio工具对您的Google Drive上的文档应用OCR，然后回答相关问题。

本指南将展示如何使用`gradio_tools`让您的LLM代理访问全球托管的最先进的Gradio应用程序。尽管`gradio_tools`与不止一个代理框架兼容，但本指南将重点介绍[Langchain代理](https://docs.langchain.com/docs/components/agents/)。

## 一些背景信息

### 代理是什么？

[LangChain代理](https://docs.langchain.com/docs/components/agents/agent)是一个大型语言模型（LLM），它根据使用其众多工具之一的输入来生成输出。

### Gradio是什么？

[Gradio](https://github.com/gradio-app/gradio)是用于构建机器学习Web应用程序并与全球共享的事实上的标准框架-完全由Python驱动！🐍

## gradio_tools - 一个端到端的示例

要开始使用`gradio_tools`，您只需要导入和初始化工具，然后将其传递给langchain代理！

在下面的示例中，我们导入`StableDiffusionPromptGeneratorTool`以创建一个良好的稳定扩散提示，
`StableDiffusionTool`以使用我们改进的提示创建一张图片，`ImageCaptioningTool`以为生成的图片加上标题，以及
`TextToVideoTool`以根据提示创建一个视频。

然后，我们告诉我们的代理创建一张狗正在滑板的图片，但在使用图像生成器之前请先改进我们的提示。我们还要求
它为生成的图片添加标题并创建一个视频。代理可以根据需要决定使用哪个工具，而不需要我们明确告知。

```python
import os

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY 必须设置 ")

from langchain.agents import initialize_agent
from langchain.llms import OpenAI
from gradio_tools import (StableDiffusionTool, ImageCaptioningTool, StableDiffusionPromptGeneratorTool,
                          TextToVideoTool)

from langchain.memory import ConversationBufferMemory

llm = OpenAI(temperature=0)
memory = ConversationBufferMemory(memory_key="chat_history")
tools = [StableDiffusionTool().langchain, ImageCaptioningTool().langchain,
         StableDiffusionPromptGeneratorTool().langchain, TextToVideoTool().langchain]

agent = initialize_agent(tools, llm, memory=memory, agent="conversational-react-description", verbose=True)
output = agent.run(input=("Please create a photo of a dog riding a skateboard "
                          "but improve my prompt prior to using an image generator."
                          "Please caption the generated image and create a video for it using the improved prompt."))
```

您会注意到我们正在使用一些与`gradio_tools`一起提供的预构建工具。请参阅此[文档](https://github.com/freddyaboulton/gradio-tools#gradio-tools-gradio--llm-agents)以获取完整的`gradio_tools`工具列表。
如果您想使用当前不在`gradio_tools`中的工具，很容易添加您自己的工具。下一节将介绍如何添加自己的工具。

## gradio_tools - 创建自己的工具

核心抽象是`GradioTool`，它允许您为LLM定义一个新的工具，只要您实现标准接口：

```python
class GradioTool(BaseTool):

    def __init__(self, name: str, description: str, src: str) -> None:

    @abstractmethod
    def create_job(self, query: str) -> Job:
        pass

    @abstractmethod
    def postprocess(self, output: Tuple[Any] | Any) -> str:
        pass
```

需要满足的要求是：

1. 工具的名称
2. 工具的描述。这非常关键！代理根据其描述决定使用哪个工具。请确切描述输入和输出应该是什么样的，最好包括示例。
3. Gradio应用程序的url或space id，例如`freddyaboulton/calculator`。基于该值，`gradio_tool`将通过API创建一个[gradio客户端](https://github.com/gradio-app/gradio/blob/main/client/python/README.md)实例来查询上游应用程序。如果您不熟悉gradio客户端库，请确保点击链接了解更多信息。
4. create_job - 给定一个字符串，该方法应该解析该字符串并从客户端返回一个job。大多数情况下，这只需将字符串传递给客户端的`submit`函数即可。有关创建job的更多信息，请参阅[这里](https://github.com/gradio-app/gradio/blob/main/client/python/README.md#making-a-prediction)
5. postprocess - 给定作业的结果，将其转换为LLM可以向用户显示的字符串。
6. _Optional可选_ - 某些库，例如[MiniChain](https://github.com/srush/MiniChain/tree/main)，可能需要一些关于工具使用的底层gradio输入和输出类型的信息。默认情况下，这将返回gr.Textbox()，但如果您想提供更准确的信息，请实现工具的`_block_input(self, gr)`和`_block_output(self, gr)`方法。`gr`变量是gradio模块（通过`import gradio as gr`获得的结果）。`GradiTool`父类将自动引入`gr`并将其传递给`_block_input`和`_block_output`方法。

就是这样！

一旦您创建了自己的工具，请在`gradio_tools`存储库上发起拉取请求！我们欢迎所有贡献。

## 示例工具 - 稳定扩散

以下是作为示例的稳定扩散工具代码：

from gradio_tool import GradioTool
import os

class StableDiffusionTool(GradioTool):
"""Tool for calling stable diffusion from llm"""

    def __init__(
        self,
        name="StableDiffusion",
        description=(
            "An image generator. Use this to generate images based on "
            "text input. Input should be a description of what the image should "
            "look like. The output will be a path to an image file."
        ),
        src="gradio-client-demos/stable-diffusion",
        hf_token=None,
    ) -> None:
        super().__init__(name, description, src, hf_token)

    def create_job(self, query: str) -> Job:
        return self.client.submit(query, "", 9, fn_index=1)

    def postprocess(self, output: str) -> str:
        return [os.path.join(output, i) for i in os.listdir(output) if not i.endswith("json")][0]

    def _block_input(self, gr) -> "gr.components.Component":
        return gr.Textbox()

    def _block_output(self, gr) -> "gr.components.Component":
        return gr.Image()

```
关于此实现的一些注意事项：
1. 所有的 `GradioTool` 实例都有一个名为 `client` 的属性，它指向底层的 [gradio 客户端](https://github.com/gradio-app/gradio/tree/main/client/python#gradio_client-use-a-gradio-app-as-an-api----in-3-lines-of-python)，这就是您在 `create_job` 方法中应该使用的内容。

2. `create_job` 方法只是将查询字符串传递给客户端的 `submit` 函数，并硬编码了一些其他参数，即负面提示字符串和指南缩放。我们可以在后续版本中修改我们的工具，以便从输入字符串中接受这些值。

3. `postprocess` 方法只是返回由稳定扩散空间创建的图库中的第一个图像。我们使用 `os` 模块获取图像的完整路径。

## Conclusion

现在，您已经知道如何通过数千个运行在野外的 gradio 空间来扩展您的 LLM 的能力了！
同样，我们欢迎对 [gradio_tools](https://github.com/freddyaboulton/gradio-tools) 库的任何贡献。我们很兴奋看到大家构建的工具！
```
