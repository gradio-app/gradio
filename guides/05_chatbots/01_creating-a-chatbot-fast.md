# How to Create a Chatbot with Gradio

Tags: LLM, CHATBOT, NLP

## Introduction

Chatbots are a popular application of large language models (LLMs). Using Gradio, you can easily build a demo of your LLM and share that with your users, or try it yourself using an intuitive chatbot UI.

This tutorial uses `gr.ChatInterface()`, which is a high-level abstraction that allows you to create your chatbot UI fast, often with a _single line of Python_. It can be easily adapted to support multimodal chatbots, or chatbots that require further customization.

**Prerequisites**: please make sure you are using the latest version of Gradio:

```bash
$ pip install --upgrade gradio
```

## Defining a chat function

When working with `gr.ChatInterface()`, the first thing you should do is define your **chat function**. In the simplest case, your chat function should accept two arguments: `message` and `history` (the arguments can be named anything, but must be in this order).

- `message`: a `str` representing the user's most recent message.
- `history`: a list of openai-style dictionaries with `role` and `content` keys, representing the previous conversation history. May also include additional keys representing message metadata.

For example, the `history` could look like this:

```python
[
    {"role": "user", "content": "What is the capital of France?"},
    {"role": "assistant", "content": "Paris"}
]
```

Your chat function simply needs to return: 

* a `str` value, which is the chatbot's response based on the chat `history` and most recent `message`.

Let's take a look at a few example chat functions:

**Example: a chatbot that randomly responds with yes or no**

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

Tip: Always set type="messages" in gr.ChatInterface. The default value (type="tuples") is deprecated and will be removed in a future version of Gradio.

That's it! Here's our running demo, try it out:

$demo_chatinterface_random_response

**Example: a chatbot that alternates between agreeing and disagreeing**

Of course, the previous example was very simplistic, it didn't take user input or the previous history into account! Here's another simple example showing how to incorporate a user's input as well as the history.

```python
import gradio as gr

def alternatingly_agree(message, history):
    if len([h for h in history if h['role'] == "assistant"]) % 2 == 0:
        return f"Yes, I do think that: {message}"
    else:
        return "I don't think so"

gr.ChatInterface(
    fn=alternatingly_agree, 
    type="messages"
).launch()
```

We'll look at more realistic examples of chat functions in our next Guide, which shows [examples of using `gr.ChatInterface` with popular LLMs](../guides/chatinterface-examples). 

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

While the response is streaming, the "Submit" button turns into a "Stop" button that can be used to stop the generator function.

Tip: Even though you are yielding the latest message at each iteration, Gradio only sends the "diff" of each message from the server to the frontend, which reduces latency and data consumption over your network.

## Customizing the Chat UI

If you're familiar with Gradio's `gr.Interface` class, the `gr.ChatInterface` includes many of the same arguments that you can use to customize the look and feel of your Chatbot. For example, you can:

- add a title and description above your chatbot using `title` and `description` arguments.
- add a theme or custom css using `theme` and `css` arguments respectively.
- add `examples` and even enable `cache_examples`, which make your Chatbot easier for users to try it out.
- customize the chatbot (e.g. to change the height or add a placeholder) or textbox (e.g. to add a max number of characters or add a placeholder).

**Adding examples**

You can add preset examples to your `gr.ChatInterface` with the `examples` parameter, which takes a list of string examples. Any examples will appear as "buttons" within the Chatbot before any messages are sent. If you'd like to include images or other files as part of your examples, you can do so by using this dictionary format for each example instead of a string: `{"text": "What's in this image?", "files": ["cheetah.jpg"]}`. Each file will be a separate message that is added to your Chatbot history.

You can change the displayed text for each example by using the `example_labels` argument. You can add icons to each example as well using the `example_icons` argument. Both of these arguments take a list of strings, which should be the same length as the `examples` list.

If you'd like to cache the examples so that they are pre-computed and the results appear instantly, set `cache_examples=True`.

**Customizing the chatbot or textbox component**

If you want to customize the `gr.Chatbot` or `gr.Textbox` that compose the `ChatInterface`, then you can pass in your own chatbot or textbox components. Here's an example of how we to apply the parameters we've discussed in this section:

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
    theme="ocean",
    examples=["Hello", "Am I cool?", "Are tomatoes vegetables?"],
    cache_examples=True,
).launch()
```

Here's another example that adds a "placeholder" for your chat interface, which appears before the user has started chatting. The `placeholder` argument of `gr.Chatbot` accepts Markdown or HTML:

```python
gr.ChatInterface(
    yes_man,
    type="messages",
    chatbot=gr.Chatbot(placeholder="<strong>Your Personal Yes-Man</strong><br>Ask Me Anything"),
...
```

The placeholder appears vertically and horizontally centered in the chatbot.

## Multimodal Chat Interface

You may want to add multimodal capabilities to your chat interface. For example, you may want users to be able to upload images or files to your chatbot and ask questions about them. You can make your chatbot "multimodal" by passing in a single parameter (`multimodal=True`) to the `gr.ChatInterface` class.

When `multimodal=True`, the signature of your chat function changes slightly: the first parameter of your function (what we referred to as `message` above) should accept a dictionary consisting of the submitted text and uploaded files that looks like this: 

```py
{
    "text": "user input", 
    "files": [
        "updated_file_1_path.ext",
        "updated_file_2_path.ext", 
        ...
    ]
}
```

This second parameter of your chat function, `history`, will be in the same openai-style dictionary format as before. However, if the history contains uploaded files, the `content` key for a file will be not a string, but rather a single-element tuple consisting of the filepath. Each file will be a separate message in the history. So after uploading two files and asking a question, your history might look like this:

```python
[
    {"role": "user", "content": ("cat1.png")},
    {"role": "user", "content": ("cat2.png")},
    {"role": "user", "content": "What's the difference between these two images?"},
]
```

The return type of your chat function does *not change* when setting `multimodal=True` (i.e. in the simplest case, you should still return a string value). We discuss more complex cases, e.g. returning files [below](#returning-complex-responses).

If you are customizing a multimodal chat interface, you should pass in an instance of `gr.MultimodalTextbox` to the `textbox` parameter. Here's an example that illustrates how to set up and customize and multimodal chat interface:
 

```python
import gradio as gr

def count_images(message, history):
    num_images = len(message["files"])
    total_images = 0
    for message in history:
        if isinstance(message["content"], tuple):
            total_images += 1
    return f"You just uploaded {num_images} images, total uploaded: {total_images+num_images}"

demo = gr.ChatInterface(
    fn=count_images, 
    type="messages", 
    examples=[
        {"text": "No files", "files": []}
    ], 
    multimodal=True,
    textbox=gr.MultimodalTextbox(file_count="multiple", file_types=["image"])
)

demo.launch()
```

## Additional Inputs

You may want to add additional inputs to your chat function and expose them to your users through the chat UI. For example, you could add a textbox for a system prompt, or a slider that sets the number of tokens in the chatbot's response. The `gr.ChatInterface` class supports an `additional_inputs` parameter which can be used to add additional input components.

The `additional_inputs` parameters accepts a component or a list of components. You can pass the component instances directly, or use their string shortcuts (e.g. `"textbox"` instead of `gr.Textbox()`). If you pass in component instances, and they have _not_ already been rendered, then the components will appear underneath the chatbot within a `gr.Accordion()`. 

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

**Examples with additional inputs**

You can also add example values for your additional inputs. Pass in a list of lists to the `examples` parameter, where each inner list represents one sample, and each inner list should be `1 + len(additional_inputs)` long. The first element in the inner list should be the example value for the chat message, and each subsequent element should be an example value for one of the additional inputs, in order. When additional inputs are provided, examples are rendered in a table underneath the chat interface.

If you need to create something even more custom, then its best to construct the chatbot UI using the low-level `gr.Blocks()` API. We have [a dedicated guide for that here](/guides/creating-a-custom-chatbot-with-blocks).

## Returning Complex Responses

We mentioned earlier that in the simplest case, your chat function should return a `str` response, which will be rendered as text in the chatbot. However, you can also return more complex responses as we discuss below:

**Returning Gradio components**

Currently, the following Gradio components can be displayed inside the chat interface:
* `gr.Image`
* `gr.Plot`
* `gr.Audio`
* `gr.HTML`
* `gr.Video`
* `gr.Gallery`

Simply return one of these components from your function to use it with `gr.ChatInterface`. Here's an example:

```py
import gradio as gr

def music(message, history):
    if message.strip():
        return gr.Audio("https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav")
    else:
        return "Please provide the name of an artist"

gr.ChatInterface(
    fake,
    type="messages",
    textbox=gr.Textbox(placeholder="Which artist's music do you want to listen to?", scale=7),
).launch()
```


**Returning image, audio, video, or other files**:

Sometimes, you don't want to return a complete Gradio component, but rather simply an image/audio/video/other file to be displayed inside the chatbot. You can do this by returning a complete openai-style dictionary from your chat function. The dictionary should consist of the following keys:

* `role`: set to `"assistant"`
* `content`: set to a dictionary with key `path` and value the filepath or URL you'd like to return

Here is an example:

```py
import gradio as gr

def fake(message, history):
    if message.strip():
        return {
            "role": "assistant", 
            "content": {
                "path": "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav"
                }
            }
    else:
        return "Please provide the name of an artist"

gr.ChatInterface(
    fake,
    type="messages",
    textbox=gr.Textbox(placeholder="Which artist's music do you want to listen to?", scale=7),
    chatbot=gr.Chatbot(placeholder="Play music by any artist!"),
).launch()
```


**Providing preset responses**

You may want to provide preset responses that a user can choose between when conversing with your chatbot. You can add the `options` key to the dictionary returned from your chat function to set these responses. The value corresponding to the `options` key should be a list of dictionaries, each with a `value` (a string that is the value that should be sent to the chat function when this response is clicked) and an optional `label` (if provided, is the text displayed as the preset response instead of the `value`). 

This example illustrates how to use preset responses:

```python
import gradio as gr

example_code = '''
Here's the code I generated:

def greet(x):
    return f"Hello, {x}!"

Is this correct?
'''

def chat(message, history):
    if message == "Yes, that's correct.":
        return "Great!"
    else:
        return {
            "role": "assistant",
            "content": example_code,
            "options": [
                {"value": "Yes, that's correct.", "label": "Yes"},
                {"value": "No"}
                ]
            }

demo = gr.ChatInterface(
    chat,
    type="messages",
    examples=["Write a Python function that takes a string and returns a greeting."]
)

if __name__ == "__main__":
    demo.launch()

```
## Using Your Chatbot via API

Once you've built your Gradio chat interface and are hosting it on [Hugging Face Spaces](https://hf.space) or somewhere else, then you can query it with a simple API at the `/chat` endpoint. The endpoint just expects the user's message (and potentially additional inputs if you have set any using the `additional_inputs` parameter), and will return the response, internally keeping track of the messages sent so far.

[](https://github.com/gradio-app/gradio/assets/1778297/7b10d6db-6476-4e2e-bebd-ecda802c3b8f)

To use the endpoint, you should use either the [Gradio Python Client](/guides/getting-started-with-the-python-client) or the [Gradio JS client](/guides/getting-started-with-the-js-client). Or, you can deploy your Chat Interface to other platforms, such as [Discord](../guides/creating-a-discord-bot-from-a-gradio-app).

## What's Next?

Now that you've learned about the `gr.ChatInterface` class and how it can be used to create chatbot UIs quickly, we recommend reading one of the following:

* [Our next Guide](../guides/chatinterface-examples) shows examples of how to use `gr.ChatInterface` with popular LLM libraries.
* If you'd like to build very custom chat applications from scratch, you can build them using the low-level Blocks API, as [discussed in this Guide](../guides/creating-a-custom-chatbot-with-blocks).
* Once you've deployed your Gradio Chat Interface, its easy to use it other applications because of the built-in API. Here's a tutorial on [how to deploy a Gradio chat interface as a Discord bot](../guides/creating-a-discord-bot-from-a-gradio-app).


