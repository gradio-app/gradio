# How to Create a Chatbot

Tags: NLP, TEXT, CHAT

## Introduction

Chatbots are widely used in natural language processing (NLP) research and industry. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts. 

Using `gradio`, you can easily build a demo of your chatbot model and share that with a testing team, or test it yourself using an intuitive chatbot GUI.

This tutorial will show how to make two kinds of chatbot UIs with Gradio: a simple one to display text and a more sophisticated one that can handle media files as well. The simple chatbot interface that we create will look something like this:

$demo_chatbot_simple

**Prerequisite**: We'll be using the `gradio.Blocks` class to build our Chatbot demo.
You can [read the Guide to Blocks first](https://gradio.app/quickstart/#blocks-more-flexibility-and-control) if you are not already familiar with it.

## A Simple Chatbot Demo

Let's start with recreating the simple demo above. As you may have noticed, our bot simply randomly responds "yes" or "no" to any input. Here's the code to create this with Gradio:

$code_chatbot_simple

There are three Gradio components here:
* A `Chatbot`, whose value stores the entire history of the conversation, as a list of response pairs between the user and bot. 
* A `Textbox` where the user can type their message, and then hit enter/submit to trigger the chatbot response
* A `Clear` button to clear the entire Chatbot history

Note that when a user submits their message, we chain two event events with `.then`:

1. The first method `user()` updates the chatbot with the user message and clears the input field. Because we want this to happen instantly, we set `queue=False`, which would skip any queue if it had been enabled. The chatbot's history is appended with `(user_message, None)`, the `None` signifying that the bot has not responded.

2. The second method, `bot()` waits for the bot to respond, and then updates the chatbot with the bot's response. Instead of creating a new message, we just replace the previous `None` message with the bot's response. We add a `time.sleep` to simulate the bot's processing time.

The reason we split these events is so that the user can see their message appear in the chatbot immediately before the bot responds, which can take some time to process.

Note we pass the entire history of the chatbot to these functions and back to the component. To clear the chatbot, we pass it `None`.

Of course, in practice, you would replace `bot()` with your own more complex function, which might call a pretrained model or an API, to generate a response.


## Adding Markdown, Images, Audio, or Videos 

The `gradio.Chatbot` component supports a subset of markdown including bold, italics, and code. For example, we could write a function that responds to a user's message, with a bold **That's cool!**, like this:

```py
def bot(history):
    response = "**That's cool!**"
    history[-1][1] = response
    return history
```

In addition, it can handle media files, such as images, audio, and video. To pass in a media file, we must pass in the file as a tuple of two strings, like this: `(filepath, alt_text)`. The `alt_text` is optional, so you can also just pass in a tuple with a single element `(filepath,)`, like this:

```python
def add_file(history, file):
    history = history + [((file.name,), None)]
    return history
```

Putting this together, we can create a *multimodal* chatbot with a textbox for a user to submit text and an file upload button to submit images / audio / video files. The rest of the code looks pretty much the same as before:


$code_chatbot_multimodal
$demo_chatbot_multimodal

And you're done! That's all the code you need to build an interface for your chatbot model. 