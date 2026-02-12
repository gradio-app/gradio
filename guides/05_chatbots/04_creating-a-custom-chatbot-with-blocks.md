# How to Create a Custom Chatbot with Gradio Blocks

Tags: NLP, TEXT, CHAT
Related spaces: https://huggingface.co/spaces/gradio/chatbot_streaming, https://huggingface.co/spaces/project-baize/Baize-7B,

## Introduction

**Important Note**: if you are getting started, we recommend using the `gr.ChatInterface` to create chatbots -- its a high-level abstraction that makes it possible to create beautiful chatbot applications fast, often with a single line of code. [Read more about it here](/guides/creating-a-chatbot-fast).

This tutorial will show how to make chatbot UIs from scratch with Gradio's low-level Blocks API. This will give you full control over your Chatbot UI. You'll start by first creating a a simple chatbot to display text, a second one to stream text responses, and finally a chatbot that can handle media files as well. The chatbot interface that we create will look something like this:

$demo_chatbot_streaming

**Prerequisite**: We'll be using the `gradio.Blocks` class to build our Chatbot demo.
You can [read the Guide to Blocks first](https://gradio.app/blocks-and-event-listeners) if you are not already familiar with it. Also please make sure you are using the **latest version** version of Gradio: `pip install --upgrade gradio`.

## A Simple Chatbot Demo

Let's start with recreating the simple demo above. As you may have noticed, our bot simply randomly responds "How are you?", "Today is a great day", or "I'm very hungry" to any input. Here's the code to create this with Gradio:

$code_chatbot_simple

There are three Gradio components here:

- A `Chatbot`, whose value stores the entire history of the conversation, as a list of response pairs between the user and bot.
- A `Textbox` where the user can type their message, and then hit enter/submit to trigger the chatbot response
- A `ClearButton` button to clear the Textbox and entire Chatbot history

We have a single function, `respond()`, which takes in the entire history of the chatbot, appends a random message, waits 1 second, and then returns the updated chat history. The `respond()` function also clears the textbox when it returns.

Of course, in practice, you would replace `respond()` with your own more complex function, which might call a pretrained model or an API, to generate a response.

$demo_chatbot_simple

Tip: For better type hinting and auto-completion in your IDE, you can use the `gr.ChatMessage` dataclass:

```python
from gradio import ChatMessage

def chat_function(message, history):
    history.append(ChatMessage(role="user", content=message))
    history.append(ChatMessage(role="assistant", content="Hello, how can I help you?"))
    return history
```

## Add Streaming to your Chatbot

There are several ways we can improve the user experience of the chatbot above. First, we can stream responses so the user doesn't have to wait as long for a message to be generated. Second, we can have the user message appear immediately in the chat history, while the chatbot's response is being generated. Here's the code to achieve that:

$code_chatbot_streaming

You'll notice that when a user submits their message, we now _chain_ two event events with `.then()`:

1. The first method `user()` updates the chatbot with the user message and clears the input field. Because we want this to happen instantly, we set `queue=False`, which would skip any queue had it been enabled. The chatbot's history is appended with `{"role": "user", "content": user_message}`.

2. The second method, `bot()` updates the chatbot history with the bot's response. Finally, we construct the message character by character and `yield` the intermediate outputs as they are being constructed. Gradio automatically turns any function with the `yield` keyword [into a streaming output interface](/guides/key-features/#iterative-outputs).


Of course, in practice, you would replace `bot()` with your own more complex function, which might call a pretrained model or an API, to generate a response.


## Adding Markdown, Images, Audio, or Videos

The `gr.Chatbot` component supports a subset of markdown including bold, italics, and code. For example, we could write a function that responds to a user's message, with a bold **That's cool!**, like this:

```py
def bot(history):
    response = {"role": "assistant", "content": "**That's cool!**"}
    history.append(response)
    return history
```

In addition, it can handle media files, such as images, audio, and video. You can use the `MultimodalTextbox` component to easily upload all types of media files to your chatbot. You can customize the `MultimodalTextbox` further by passing in the `sources` parameter, which is a list of sources to enable. To pass in a media file, we must pass in the file a dictionary with a `path` key pointing to a local file and an `alt_text` key. The `alt_text` is optional, so you can also just pass in a tuple with a single element `{"path": "filepath"}`, like this:

```python
def add_message(history, message):
    for x in message["files"]:
        history.append({"role": "user", "content": {"path": x}})
    if message["text"] is not None:
        history.append({"role": "user", "content": message["text"]})
    return history, gr.MultimodalTextbox(value=None, interactive=False, file_types=["image"], sources=["upload", "microphone"])
```

Putting this together, we can create a _multimodal_ chatbot with a multimodal textbox for a user to submit text and media files. The rest of the code looks pretty much the same as before:

$code_chatbot_multimodal
$demo_chatbot_multimodal

And you're done! That's all the code you need to build an interface for your chatbot model. Finally, we'll end our Guide with some links to Chatbots that are running on Spaces so that you can get an idea of what else is possible:

- [project-baize/Baize-7B](https://huggingface.co/spaces/project-baize/Baize-7B): A stylized chatbot that allows you to stop generation as well as regenerate responses.
- [MAGAer13/mPLUG-Owl](https://huggingface.co/spaces/MAGAer13/mPLUG-Owl): A multimodal chatbot that allows you to upvote and downvote responses.
