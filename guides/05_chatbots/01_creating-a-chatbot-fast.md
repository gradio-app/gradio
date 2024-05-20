# How to Create a Chatbot with Gradio

Tags: NLP, TEXT, CHAT

## Introduction

Chatbots are a popular application of large language models. Using `gradio`, you can easily build a demo of your chatbot model and share that with your users, or try it yourself using an intuitive chatbot UI.

This tutorial uses `gr.ChatInterface()`, which is a high-level abstraction that allows you to create your chatbot UI fast, often with a single line of code. The chatbot interface that we create will look something like this:

$demo_chatinterface_streaming_echo

We'll start with a couple of simple examples, and then show how to use `gr.ChatInterface()` with real language models from several popular APIs and libraries, including `langchain`, `openai`, and Hugging Face.

**Prerequisites**: please make sure you are using the **latest version** version of Gradio:

```bash
$ pip install --upgrade gradio
```

## Defining a chat function

When working with `gr.ChatInterface()`, the first thing you should do is define your chat function. Your chat function should take two arguments: `message` and then `history` (the arguments can be named anything, but must be in this order).

- `message`: a `str` representing the user's input.
- `history`: a `list` of `list` representing the conversations up until that point. Each inner list consists of two `str` representing a pair: `[user input, bot response]`.

Your function should return a single string response, which is the bot's response to the particular user input `message`. Your function can take into account the `history` of messages, as well as the current message.

Let's take a look at a few examples.

## Example: a chatbot that responds yes or no

Let's write a chat function that responds `Yes` or `No` randomly.

Here's our chat function:

```python
import random

def random_response(message, history):
    return random.choice(["Yes", "No"])
```

Now, we can plug this into `gr.ChatInterface()` and call the `.launch()` method to create the web interface:

```python
import gradio as gr

gr.ChatInterface(random_response).launch()
```

That's it! Here's our running demo, try it out:

$demo_chatinterface_random_response

## Another example using the user's input and history

Of course, the previous example was very simplistic, it didn't even take user input or the previous history into account! Here's another simple example showing how to incorporate a user's input as well as the history.

```python
import random
import gradio as gr

def alternatingly_agree(message, history):
    if len(history) % 2 == 0:
        return f"Yes, I do think that '{message}'"
    else:
        return "I don't think so"

gr.ChatInterface(alternatingly_agree).launch()
```

## Streaming chatbots

In your chat function, you can use `yield` to generate a sequence of partial responses, each replacing the previous ones. This way, you'll end up with a streaming chatbot. It's that simple!

```python
import time
import gradio as gr

def slow_echo(message, history):
    for i in range(len(message)):
        time.sleep(0.3)
        yield "You typed: " + message[: i+1]

gr.ChatInterface(slow_echo).launch()
```


Tip: While the response is streaming, the "Submit" button turns into a "Stop" button that can be used to stop the generator function. You can customize the appearance and behavior of the "Stop" button using the `stop_btn` parameter.

## Customizing your chatbot

If you're familiar with Gradio's `Interface` class, the `gr.ChatInterface` includes many of the same arguments that you can use to customize the look and feel of your Chatbot. For example, you can:

- add a title and description above your chatbot using `title` and `description` arguments.
- add a theme or custom css using `theme` and `css` arguments respectively.
- add `examples` and even enable `cache_examples`, which make it easier for users to try it out .
- You can change the text or disable each of the buttons that appear in the chatbot interface: `submit_btn`, `retry_btn`, `undo_btn`, `clear_btn`.

If you want to customize the `gr.Chatbot` or `gr.Textbox` that compose the `ChatInterface`, then you can pass in your own chatbot or textbox as well. Here's an example of how we can use these parameters:

```python
import gradio as gr

def yes_man(message, history):
    if message.endswith("?"):
        return "Yes"
    else:
        return "Ask me anything!"

gr.ChatInterface(
    yes_man,
    chatbot=gr.Chatbot(height=300),
    textbox=gr.Textbox(placeholder="Ask me a yes or no question", container=False, scale=7),
    title="Yes Man",
    description="Ask Yes Man any question",
    theme="soft",
    examples=["Hello", "Am I cool?", "Are tomatoes vegetables?"],
    cache_examples=True,
    retry_btn=None,
    undo_btn="Delete Previous",
    clear_btn="Clear",
).launch()
```

In particular, if you'd like to add a "placeholder" for your chat interface, which appears before the user has started chatting, you can do so using the `placeholder` argument of `gr.Chatbot`, which accepts Markdown or HTML. 

```python
gr.ChatInterface(
    yes_man,
    chatbot=gr.Chatbot(placeholder="<strong>Your Personal Yes-Man</strong><br>Ask Me Anything"),
...
```

The placeholder appears vertically and horizontally centered in the chatbot.

## Add Multimodal Capability to your chatbot

You may want to add multimodal capability to your chatbot. For example, you may want users to be able to easily upload images or files to your chatbot and ask questions about it. You can make your chatbot "multimodal" by passing in a single parameter (`multimodal=True`) to the `gr.ChatInterface` class.


```python
import gradio as gr
import time

def count_files(message, history):
    num_files = len(message["files"])
    return f"You uploaded {num_files} files"

demo = gr.ChatInterface(fn=count_files, examples=[{"text": "Hello", "files": []}], title="Echo Bot", multimodal=True)

demo.launch()
```

When `multimodal=True`, the signature of `fn` changes slightly. The first parameter of your function should accept a dictionary consisting of the submitted text and uploaded files that looks like this: `{"text": "user input", "file": ["file_path1", "file_path2", ...]}`. Similarly, any examples you provide should be in a dictionary of this form. Your function should still return a single `str` message. 

Tip: If you'd like to customize the UI/UX of the textbox for your multimodal chatbot, you should pass in an instance of `gr.MultimodalTextbox` to the `textbox` argument of `ChatInterface` instead of an instance of `gr.Textbox`.

## Additional Inputs

You may want to add additional parameters to your chatbot and expose them to your users through the Chatbot UI. For example, suppose you want to add a textbox for a system prompt, or a slider that sets the number of tokens in the chatbot's response. The `ChatInterface` class supports an `additional_inputs` parameter which can be used to add additional input components.

The `additional_inputs` parameters accepts a component or a list of components. You can pass the component instances directly, or use their string shortcuts (e.g. `"textbox"` instead of `gr.Textbox()`). If you pass in component instances, and they have _not_ already been rendered, then the components will appear underneath the chatbot (and any examples) within a `gr.Accordion()`. You can set the label of this accordion using the `additional_inputs_accordion_name` parameter.

Here's a complete example:

$code_chatinterface_system_prompt

If the components you pass into the `additional_inputs` have already been rendered in a parent `gr.Blocks()`, then they will _not_ be re-rendered in the accordion. This provides flexibility in deciding where to lay out the input components. In the example below, we position the `gr.Textbox()` on top of the Chatbot UI, while keeping the slider underneath.

```python
import gradio as gr
import time

def echo(message, history, system_prompt, tokens):
    response = f"System prompt: {system_prompt}\n Message: {message}."
    for i in range(min(len(response), int(tokens))):
        time.sleep(0.05)
        yield response[: i+1]

with gr.Blocks() as demo:
    system_prompt = gr.Textbox("You are helpful AI.", label="System Prompt")
    slider = gr.Slider(10, 100, render=False)

    gr.ChatInterface(
        echo, additional_inputs=[system_prompt, slider]
    )

demo.launch()
```

If you need to create something even more custom, then its best to construct the chatbot UI using the low-level `gr.Blocks()` API. We have [a dedicated guide for that here](/guides/creating-a-custom-chatbot-with-blocks).

## Using your chatbot via an API

Once you've built your Gradio chatbot and are hosting it on [Hugging Face Spaces](https://hf.space) or somewhere else, then you can query it with a simple API at the `/chat` endpoint. The endpoint just expects the user's message (and potentially additional inputs if you have set any using the `additional_inputs` parameter), and will return the response, internally keeping track of the messages sent so far.

[](https://github.com/gradio-app/gradio/assets/1778297/7b10d6db-6476-4e2e-bebd-ecda802c3b8f)

To use the endpoint, you should use either the [Gradio Python Client](/guides/getting-started-with-the-python-client) or the [Gradio JS client](/guides/getting-started-with-the-js-client).

## A `langchain` example

Now, let's actually use the `gr.ChatInterface` with some real large language models. We'll start by using `langchain` on top of `openai` to build a general-purpose streaming chatbot application in 19 lines of code. You'll need to have an OpenAI key for this example (keep reading for the free, open-source equivalent!)

```python
from langchain.chat_models import ChatOpenAI
from langchain.schema import AIMessage, HumanMessage
import openai
import gradio as gr

os.environ["OPENAI_API_KEY"] = "sk-..."  # Replace with your key

llm = ChatOpenAI(temperature=1.0, model='gpt-3.5-turbo-0613')

def predict(message, history):
    history_langchain_format = []
    for human, ai in history:
        history_langchain_format.append(HumanMessage(content=human))
        history_langchain_format.append(AIMessage(content=ai))
    history_langchain_format.append(HumanMessage(content=message))
    gpt_response = llm(history_langchain_format)
    return gpt_response.content

gr.ChatInterface(predict).launch()
```

## A streaming example using `openai`

Of course, we could also use the `openai` library directy. Here a similar example, but this time with streaming results as well:

```python
from openai import OpenAI
import gradio as gr

api_key = "sk-..."  # Replace with your key
client = OpenAI(api_key=api_key)

def predict(message, history):
    history_openai_format = []
    for human, assistant in history:
        history_openai_format.append({"role": "user", "content": human })
        history_openai_format.append({"role": "assistant", "content":assistant})
    history_openai_format.append({"role": "user", "content": message})
  
    response = client.chat.completions.create(model='gpt-3.5-turbo',
    messages= history_openai_format,
    temperature=1.0,
    stream=True)

    partial_message = ""
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
              partial_message = partial_message + chunk.choices[0].delta.content
              yield partial_message

gr.ChatInterface(predict).launch()
```

## Example using a local, open-source LLM with Hugging Face

Of course, in many cases you want to run a chatbot locally. Here's the equivalent example using Together's RedePajama model, from Hugging Face (this requires you to have a GPU with CUDA).

```python
import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, StoppingCriteria, StoppingCriteriaList, TextIteratorStreamer
from threading import Thread

tokenizer = AutoTokenizer.from_pretrained("togethercomputer/RedPajama-INCITE-Chat-3B-v1")
model = AutoModelForCausalLM.from_pretrained("togethercomputer/RedPajama-INCITE-Chat-3B-v1", torch_dtype=torch.float16)
model = model.to('cuda:0')

class StopOnTokens(StoppingCriteria):
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        stop_ids = [29, 0]
        for stop_id in stop_ids:
            if input_ids[0][-1] == stop_id:
                return True
        return False

def predict(message, history):
    history_transformer_format = history + [[message, ""]]
    stop = StopOnTokens()

    messages = "".join(["".join(["\n<human>:"+item[0], "\n<bot>:"+item[1]])
                for item in history_transformer_format])

    model_inputs = tokenizer([messages], return_tensors="pt").to("cuda")
    streamer = TextIteratorStreamer(tokenizer, timeout=10., skip_prompt=True, skip_special_tokens=True)
    generate_kwargs = dict(
        model_inputs,
        streamer=streamer,
        max_new_tokens=1024,
        do_sample=True,
        top_p=0.95,
        top_k=1000,
        temperature=1.0,
        num_beams=1,
        stopping_criteria=StoppingCriteriaList([stop])
        )
    t = Thread(target=model.generate, kwargs=generate_kwargs)
    t.start()

    partial_message = ""
    for new_token in streamer:
        if new_token != '<':
            partial_message += new_token
            yield partial_message

gr.ChatInterface(predict).launch()
```

With those examples, you should be all set to create your own Gradio Chatbot demos soon! For building even more custom Chatbot applications, check out [a dedicated guide](/guides/creating-a-custom-chatbot-with-blocks) using the low-level `gr.Blocks()` API.
