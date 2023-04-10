# Gradio & LangChain Agents 🤝

The [gradio_tool](https://github.com/freddyaboulton/gradio-tool) can turn any [Gradio](https://github.com/gradio-app/gradio) application into a [tool](https://python.langchain.com/en/latest/modules/agents/tools.html) that a [LangChain agent](https://docs.langchain.com/docs/components/agents/agent) can use to complete its task.

This guide will show how you can use gradio_tool to grant your LLM Agent access to the cutting edge Gradio applications hosted in the world.

## Some background

### What are agents?

A [LangChain agent](https://docs.langchain.com/docs/components/agents/agent) is a Large Language Model (LLM) that takes user input and reports an output based on using one of many tools at its disposal.

### What is Gradio?
[Gradio](https://github.com/gradio-app/gradio) is the defacto standard tool for building Machine Learning Web Applications and sharing them with the world - all with just python! 🐍

## gradio_client - how it works

The core abstraction is the `GradioTool`, which lets you define a new tool for your LLM as long as you implement a standard interface:

```python
class GradioTool(BaseTool):
    name = "GradioTool"
    description: str
    client: grc.Client
    
    @abstractmethod
    def create_job(self, query: str) -> Job:
        pass

    @abstractmethod
    def postprocess(self, output: Tuple[Any]) -> str:
        pass
```

The requirements are:
1. The name for your tool. This is the user-facing name printed to the console of the LLM agent.
2. The description for your tool. This is crucial! Agents decide which tool to use based on their description. Be precise and be sure to inclue example of what the input and the output of the tool should look like.
3. The [gradio client](https://github.com/gradio-app/gradio/blob/main/client/python/README.md) instance. Gradio Tools leverage gradio applications via API and the gradio client makes that super easy. Be sure to click the link and learn more about the gradio client library if you are not familiar with it.
4. create_job - Given a string, this method should parse that string and return a job from the client. Most times, this is as simple as passing the string to the `submit` function of the client. More info on creating jobs [here](https://github.com/gradio-app/gradio/blob/main/client/python/README.md#making-a-prediction)
5. postprocess - Given the result of the job, convert it to a string the LLM can display to the user.

And that's it!

## Example tool - Stable Diffusion

Here is the code for a tool that queries a stable diffusion space to generate images from text:

```python
import gradio_client as grc
from gradio_tool import GradioTool
from pydantic import Field
import os

class StableDiffusionTool(GradioTool):
    """Tool for calling stable diffusion from llm"""

    name = "StableDiffusion"
    description = ("An image generator. Use this to generate images based on "
                   "text input. Input should be a description of what the image should "
                   "look like. The output will be a path to an image file. "
                   "If the output is the string QUEUE_FULL you should try this action again and never stop until you don't see this message.")
    client: grc.Client = Field(default_factory=lambda: grc.Client(src="stabilityai/stable-diffusion"))

    def create_job(self, query: str) -> Job:
        return self.client.submit(query, "", 9, fn_index=1)
    
    def postprocess(self, output: Tuple[Any]) -> str:
        return [os.path.join(output, i) for i in os.listdir(output) if not i.endswith("json")][0]
```

Some notes on this implementation:
1. GradioTools inherit from LangChain's BaseTool, which themselves are [pydantic models](https://docs.pydantic.dev/). The fact `name`, `description` and `client` are defined in the body of the class is standard syntax for pydantic.
2. We use `Field` and `default_factory` from pydantic since we want a new instance of the client to be created for every new instance of the tool. Otherwise all instance of StableDiffusionTool would share the same client!
3. `create_job` just passes the query string to the `submit` function of the client with some other parameters hardcoded, i.e. the negative prompt sting and the guidance scale. We could modify our tool to also accept these values from the input string in a subsequent version.
4. The `postprocess` method simply returns the first image from the gallery of images created by the stavle diffusion space. We use the `os` module to get the full path of the image.

The code for defining custom tools is pretty compact! The StableDiffusionTool is already built into the `gradio_tool` library along with these other tools:

1. ImageCaptionTool - Caption an image by providing a filepath based on Niels Rogge's [HuggingFace Space](https://huggingface.co/spaces/nielsr/comparing-captioning-models)
2. ImageToMusicTool - Create an audio clip that matches the style of a given image file based on Sylvain Filoni's [HuggingFace Space](https://huggingface.co/spaces/fffiloni/img-to-music)


## End to End Example

Simply import the desired tools from `gradio_tool` (or create your own!) and pass to `initialize_agent` from LangChain.

In this example, we use some pre-built tools to generate images, caption them, and create a music clip to match its artistic style!

Run with `python <script-name>.py` - don't forget to specify your OpenAI API key.

```python
os.environ["OPENAI_API_KEY"] = "<Secret Key>"

from langchain.agents import initialize_agent
from langchain.llms import OpenAI
import os
from gradio_tool.tool import StableDiffusionTool, ImageCaptioningTool, ImageToMusicTool
from langchain.memory import ConversationBufferMemory

llm = OpenAI(temperature=0)
memory = ConversationBufferMemory(memory_key="chat_history")
tools = [StableDiffusionTool(), ImageCaptioningTool(), ImageToMusicTool()]


agent = initialize_agent(tools, llm, memory=memory, agent="conversational-react-description", verbose=True)
output = agent.run(input=("I would please like a photo of a dog riding a skateboard. "
                          "Please caption this image and create a song for it."))
```
