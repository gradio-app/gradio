# How to Create a Chatbot with Gradio

Tags: NLP, LLM, CHATBOT

## Introduction

Chatbots are a popular application of large language models (LLMs). Using Gradio, you can easily build a demo of your LLM and share that with your users, or try it yourself using an intuitive chatbot UI.

This tutorial uses `gr.ChatInterface()`, which is a high-level abstraction that allows you to create your chatbot UI fast, often with a single line of code. It can be easily adapted to support multimodal chatbots, or chatbots that require further customization.

**Prerequisites**: please make sure you are using the latest version version of Gradio:

```bash
$ pip install --upgrade gradio
```

## Defining a chat function

When working with `gr.ChatInterface()`, the first thing you should do is define your **chat function**. In the simplest case, your chat function should accept two arguments: `message` and `history` (the arguments can be named anything, but must be in this order).

- `message`: a `str` representing the user's input.
- `history`: a list of openai-style dictionaries with `role` and `content` keys, representing the previous conversation history. 

For example, the `history` could look like this:

```python
[
    {"role": "user", "content": "What is the capital of France?"},
    {"role": "assistant", "content": "Paris"}
]
```

In the simplest case, your function should return: 

* a single `str` response


which is the bot's response to the particular user input `message`. Your function can take into account the `history` of messages, as well as the current message.

Let's take a look at a few example chat functions:

**Example: a chatbot that randomly responds yes or no**

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

gr.ChatInterface(
    fn=random_response, 
    type="messages"
).launch()
```

Tip: Always type="messages" in gr.ChatInterface. The default value (type="tuples") is deprecated and will be removed in a future version of Gradio.

That's it! Here's our running demo, try it out:

$demo_chatinterface_random_response

**Example: a chatbot that alternatively agrees and disagrees**

Of course, the previous example was very simplistic, it didn't even take user input or the previous history into account! Here's another simple example showing how to incorporate a user's input as well as the history.

```python
import gradio as gr

def alternatingly_agree(message, history):
    if len([h for h in history if h['role'] == "assistant"]) % 2 == 0:
        return f"Yes, I do think that '{message}'"
    else:
        return "I don't think so"

gr.ChatInterface(
    fn=alternatingly_agree, 
    type="messages"
).launch()
```

We'll look at more realistic examples of chat functions in our next Guide, which shows [examples of using `gr.ChatInterface` with popular LLMs](). 

## Streaming chatbots

In your chat function, you can use `yield` to generate a sequence of partial responses, each replacing the previous ones. This way, you'll end up with a streaming chatbot. It's that simple!

```python
import time
import gradio as gr

def slow_echo(message, history):
    for i in range(len(message)):
        time.sleep(0.3)
        yield "You typed: " + message[: i+1]

gr.ChatInterface(
    fn=slow_echo, 
    type="messages"
).launch()
```

While the response is streaming, the "Submit" button turns into a "Stop" button that can be used to stop the generator function. You can customize the appearance of the "Stop" button using the `stop_btn` parameter.

Tip: Even though you are yielding the latest message at each iteration, Gradio only sends the "diff" of each message, which reduces latency and data consumption over your network.

## Customizing the Chat UI

If you're familiar with Gradio's `gr.Interface` class, the `gr.ChatInterface` includes many of the same arguments that you can use to customize the look and feel of your Chatbot. For example, you can:

- add a title and description above your chatbot using `title` and `description` arguments.
- add a theme or custom css using `theme` and `css` arguments respectively.
- add `examples` and even enable `cache_examples`, which make your Chatbot easier for users to try it out.

**Adding Examples**

You can add preset examples to your `gr.ChatInterface` with the `examples` parameter, which takes a list of string examples. Any examples will appear as "buttons" within the Chatbot before any messages are sent. If you'd like to include images or other files as part of your examples, you can do so by using this dictionary format for each example instead of a string: `{"text": "What's in this image?", "files": ["cheetah.jpg"]}`. Each file will be a separate message that is added to your Chatbot history 

You can change the displayed text for each example by using the `example_labels` argument. You can add icons to each example as well using the `example_icons` argument. Both of these arguments take a list of strings, which should be the same length as the `examples` list.

If you'd like to cache the examples so that they are pre-computed and the results appear instantly, set `cache_examples=True`.

**Customizing the Chatbot or Textbox**

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
    type="messages",
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
    type="messages",
    chatbot=gr.Chatbot(placeholder="<strong>Your Personal Yes-Man</strong><br>Ask Me Anything"),
...
```

The placeholder appears vertically and horizontally centered in the chatbot.

## Making a Multimodal Chat Interface

You may want to add multimodal capability to your chat interface. For example, you may want users to be able to easily upload images or files to your chatbot and ask questions about it. You can make your chatbot "multimodal" by passing in a single parameter (`multimodal=True`) to the `gr.ChatInterface` class.

When `multimodal=True`, the signature of `fn` changes slightly. The first parameter of your function should accept a dictionary consisting of the submitted text and uploaded files that looks like this: `{"text": "user input", "file": ["file_path1", "file_path2", ...]}`. 

```python
import gradio as gr

def count_files(message, history):
    num_files = len(message["files"])
    return f"You uploaded {num_files} files"

demo = gr.ChatInterface(
    fn=count_files, 
    type="messages", 
    examples=[{"text": "Hello", "files": []}], title="Echo Bot", multimodal=True
)

demo.launch()
```

There are some other changes to keep in mind: TODO

Similarly, any examples you provide should be in a dictionary of this form. Your function should still return a single `str` message. 

Files are stored in history differentl

If you'd like to customize the UI/UX of the textbox for your multimodal chatbot, you should pass in an instance of `gr.MultimodalTextbox` to the `textbox` argument of `ChatInterface` instead of an instance of `gr.Textbox`.

## Additional Inputs

You may want to add additional parameters to your chatbot and expose them to your users through the Chatbot UI. For example, suppose you want to add a textbox for a system prompt, or a slider that sets the number of tokens in the chatbot's response. The `ChatInterface` class supports an `additional_inputs` parameter which can be used to add additional input components.

The `additional_inputs` parameters accepts a component or a list of components. You can pass the component instances directly, or use their string shortcuts (e.g. `"textbox"` instead of `gr.Textbox()`). If you pass in component instances, and they have _not_ already been rendered, then the components will appear underneath the chatbot within a `gr.Accordion()`. You can set the label of this accordion using the `additional_inputs_accordion_name` parameter.

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
        echo, additional_inputs=[system_prompt, slider], type="messages"
    )

demo.launch()
```

If you need to create something even more custom, then its best to construct the chatbot UI using the low-level `gr.Blocks()` API. We have [a dedicated guide for that here](/guides/creating-a-custom-chatbot-with-blocks).

## Returning Complex Responses

We mentioned earlier that in the simplest case, your **chat function** should return a `str` response. However, you can also return more complex 

**Returning Image/Audio/Video Files**:

You can also return a dictionary with a `path` key that points to a local file or a publicly available URL.

```py
import gradio as gr

def fake(message, history):
    if message.strip():
        return {"role": "assistant", "content": {"path": "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav"}}
    else:
        return "Please provide the name of an artist"

gr.ChatInterface(
    fake,
    type="messages",
    textbox=gr.Textbox(placeholder="Which artist's music do you want to listen to?", scale=7),
    chatbot=gr.Chatbot(placeholder="Play music by any artist!"),
).launch()
```


**Returning Components**

The `Chatbot` component supports using many of the core Gradio components (such as `gr.Image`, `gr.Plot`, `gr.Audio`, and `gr.HTML`) inside of the chatbot. Simply return one of these components from your function to use it with `gr.ChatInterface`. Here's an example:

```py
import gradio as gr

def fake(message, history):
    if message.strip():
        return gr.Audio("https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav")
    else:
        return "Please provide the name of an artist"

gr.ChatInterface(
    fake,
    type="messages",
    textbox=gr.Textbox(placeholder="Which artist's music do you want to listen to?", scale=7),
    chatbot=gr.Chatbot(placeholder="Play music by any artist!"),
).launch()
```

**Returning Preset Options**

TODO:



## Using your chatbot via an API

Once you've built your Gradio chatbot and are hosting it on [Hugging Face Spaces](https://hf.space) or somewhere else, then you can query it with a simple API at the `/chat` endpoint. The endpoint just expects the user's message (and potentially additional inputs if you have set any using the `additional_inputs` parameter), and will return the response, internally keeping track of the messages sent so far.

[](https://github.com/gradio-app/gradio/assets/1778297/7b10d6db-6476-4e2e-bebd-ecda802c3b8f)

To use the endpoint, you should use either the [Gradio Python Client](/guides/getting-started-with-the-python-client) or the [Gradio JS client](/guides/getting-started-with-the-js-client).

What's next?
* More realistic examples
* Very custom
* Deploy to Discord

