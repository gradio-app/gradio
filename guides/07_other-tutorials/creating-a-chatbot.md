# How to Create a Chatbot

Tags: NLP, TEXT, CHAT
Related spaces: https://huggingface.co/spaces/gradio/chatbot_streaming, https://huggingface.co/spaces/project-baize/Baize-7B, 

## Introduction

Chatbots are widely used in natural language processing (NLP) research and industry. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts.

Using `gradio`, you can easily build a demo of your chatbot model and share that with your users, or try it yourself using an intuitive chatbot GUI.

This tutorial will show how to make several kinds of chatbot UIs with Gradio: first a simple one to display text, second one to stream text responses, and finally a chatbot that can handle media files as well. The chatbot interface that we create will look something like this:

$demo_chatbot_streaming

**Prerequisite**: We'll be using the `gradio.Blocks` class to build our Chatbot demo.
You can [read the Guide to Blocks first](https://gradio.app/quickstart/#blocks-more-flexibility-and-control) if you are not already familiar with it.

## A Simple Chatbot Demo

Let's start with recreating the simple demo above. As you may have noticed, our bot simply randomly responds "How are you?", "I love you", or "I'm very hungry" to any input. Here's the code to create this with Gradio:

$code_chatbot_simple

There are three Gradio components here:

* A `Chatbot`, whose value stores the entire history of the conversation, as a list of response pairs between the user and bot.
* A `Textbox` where the user can type their message, and then hit enter/submit to trigger the chatbot response
* A `Clear` button to clear the entire Chatbot history

We have a single function, `respond()`, which takes in the entire history of the chatbot, appends a random message, waits 1 second, and then returns the updated chat history. The `respond()` function also clears the textbox when it returns. 

Of course, in practice, you would replace `respond()` with your own more complex function, which might call a pretrained model or an API, to generate a response.

Finally, when the `Clear` button is clicked, we assign `None` to the value of the `Chatbot` to clear its entire history. Try out this chatbot here: 

$demo_chatbot_simple


## Add Streaming to your Chatbot

There are several ways we can improve the user experience of the chatbot above. First, we can stream responses so the user doesn't have to wait as long for a message to be generated. Second, we can have the user message appear immediately in the chat history, while the chatbot's response is being generated. Here's the code to achieve that: 

$code_chatbot_streaming


You'll notice that when a user submits their message, we now *chain* two event events with `.then()`:

1. The first method `user()` updates the chatbot with the user message and clears the input field. Because we want this to happen instantly, we set `queue=False`, which would skip any queue if it had been enabled. The chatbot's history is appended with `(user_message, None)`, the `None` signifying that the bot has not responded.

2. The second method, `bot()` updates the chatbot history with the bot's response. Instead of creating a new message, we just replace the previously-created `None` message with the bot's response. Finally, we construct the message character by character and `yield` the intermediate outputs as they are being constructed. Gradio automatically turns any function with the `yield` keyword [into a streaming output interface](/key-features/#iterative-outputs).

Of course, in practice, you would replace `bot()` with your own more complex function, which might call a pretrained model or an API, to generate a response.

Finally, we enable queuing by running `demo.queue()`, which is required for streaming intermediate outputs. You can try the improved chatbot by scrolling to the demo at the top of this page.

## Adding Markdown, Images, Audio, or Videos

The `gr.Chatbot` component supports a subset of markdown including bold, italics, and code. For example, we could write a function that responds to a user's message, with a bold **That's cool!**, like this:

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

And you're done! That's all the code you need to build an interface for your chatbot model. Finally, we'll end our Guide with some links to Chatbots that are running on Spaces so that you can get an idea of what else is possible:

* [project-baize/Baize-7B](https://huggingface.co/spaces/project-baize/Baize-7B): A stylized chatbot that allows you to stop generation as well as regenerate responses. 
* [MAGAer13/mPLUG-Owl](https://huggingface.co/spaces/MAGAer13/mPLUG-Owl): A multimodal chatbot that allows you to upvote and downvote responses. 
