# How to Create a Chatbot

Related spaces: 
Tags: NLP, TEXT, CHAT

## Introduction

Chatbots are widely used in natural language processing (NLP) research and industry. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts. 

Using `gradio`, you can easily build a demo of your chatbot model and share that with a testing team, or test it yourself using an intuitive chatbot GUI.

This tutorial will show how to take a pretrained chatbot model and deploy it with a Gradio interface. The chatbot interface that we create will look something like this:

$demo_chatbot_simple

**Prerequisite**: We'll be using the `gradio.Blocks` class to build our Chatbot demo.
You can [read the Guide to Blocks first](https://gradio.app/quickstart/#blocks-more-flexibility-and-control) if you are not already familiar with it.

## A Simple Chatbot Demo

Let's start with recreating the simple demo above. As you may have noticed, our bot simply randomly responds "yes" or "no" to any input. Here's the code to create this with Gradio:

$code_chatbot_simple

There are three Gradio components:
* A `Chatbot`, whose value stores the entire history of the conversation, as a list of response pairs between the user and bot. 
* A `Textbox` where the user can type their message, and then hit enter/submit to trigger the chatbot response
* A `Clear` button to clear the entire Chatbot history

Note that when a user submits their message, we chain two event events with `.then`:

1. The first method `.user()` updates the chatbot with the user message and clears the input field. Because we want this to happen instantly, we set `queue=False`, which would skip any queue if it had been enabled. The chatbot's value is appended with `(user_message, None)`, the `None` signifying that the bot has not responded yet.

2. The second method, `.bot()` waits for the bot to respond, and then updates the chatbot with the bot's response. Instead of creating a new message, we just replace the previous `None` message with the bot's response. We add a `time.sleep` to simulate the bot's processing time.

The reason we split these events is so that the user can see their message appear in the chatbot immediately before the bot responds, which can take some time to process.

Note we pass the entire history of the chatbot to these functions and back to the component. To clear the chatbot, we pass it `None`.

Of course, in practice, you would replace `.bot()` with your own function, which might call a pretrained model or an API, to generate a response.


## Adding Markdown, Images, Audio, or Videos 

The `gradio.Chatbot` component supports a subset of markdown including bold, italics, and code. For example, we could write a function that responds to a user's message, with a bold **That's cool!**, like this:




In addition, it can handle media files, such as images, audio, and video. 

```python
def add_image(state, image):
    state = state + [(f"![](/file={image.name})", "Cool pic!")]
    return state, state
```


Notice the `add_image` function takes in both the `state` and `image` and appends the user submitted image to `state` by using markdown. 



This is the code for a chatbot with a textbox for a user to submit text and an image upload button to submit images. The rest of the demo code is creating an interface using blocks; basically adding a couple more components compared to section 3.

This code will produce a demo like the one below:

<iframe src="https://dawood-chatbot-guide-multimodal.hf.space" frameBorder="0" height="650" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

And you're done! That's all the code you need to build an interface for your chatbot model. Here are some references that you may find useful:

* Gradio's [Quickstart guide](https://gradio.app/quickstart/)
* The first chatbot demo [chatbot demo](https://huggingface.co/spaces/dawood/chatbot-guide) and [complete code](https://huggingface.co/spaces/dawood/chatbot-guide/blob/main/app.py) (on Hugging Face Spaces)
* The final chatbot with markdown support [chatbot demo](https://huggingface.co/spaces/dawood/chatbot-guide-multimodal) and [complete code](https://huggingface.co/spaces/dawood/chatbot-guide-multimodal/blob/main/app.py) (on Hugging Face Spaces)
