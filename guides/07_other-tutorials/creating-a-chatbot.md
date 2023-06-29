# How to Create a Chatbot

Tags: NLP, TEXT, CHAT
Related spaces: https://huggingface.co/spaces/gradio/chatbot_streaming, https://huggingface.co/spaces/project-baize/Baize-7B, 

## Introduction

Chatbots are widely used in natural language processing (NLP) research and industry. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts.

Using `gradio`, you can easily build a demo of your chatbot model and share that with your users, or try it yourself using an intuitive chatbot GUI.

This tutorial will show how to make two kinds of chatbot UIs with Gradio: first a simple one to display text, and then a chatbot that can handle media files as well. 

**Prerequisite**: We'll be using the `gradio.Blocks` class to build our Chatbot demo.
You can [read the Guide to Blocks first](https://gradio.app/quickstart/#blocks-more-flexibility-and-control) if you are not already familiar with it. Also please make sure you are using the **latest version** version of Gradio: `pip install --upgrade gradio`. 

## A Simple Chatbot Demo

Let's start with recreating the simple demo above. As you may have noticed, our bot simply randomly responds "How are you?", "I love you", or "I'm very hungry" to any input. Here's the code to create this with Gradio:

$code_chatbot_simple

There are three Gradio components here:

* A `Chatbot`, whose value stores the entire history of the conversation, as a list of response pairs between the user and bot.
* A `Textbox` where the user can type their message, and then hit enter/submit to trigger the chatbot response
* A `ClearButton` button to clear the Textbox and entire Chatbot history

We have a single function, `respond()`, which takes in the entire history of the chatbot, appends a random message, waits 1 second, and then returns the updated chat history. The `respond()` function also clears the textbox when it returns. 

Of course, in practice, you would replace `respond()` with your own more complex function, which might call a pretrained model or an API, to generate a response.

$demo_chatbot_simple


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
