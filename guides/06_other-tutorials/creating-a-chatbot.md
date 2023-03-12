# How to Create a Chatbot

Related spaces: 
Tags: NLP, TEXT, CHAT

## Introduction

Chatbots are widely used in natural language processing (NLP) research and industry. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts. 

Using `gradio`, you can easily build a demo of your chatbot model and share that with a testing team, or test it yourself using an intuitive chatbot GUI.

This tutorial will show how to take a pretrained chatbot model and deploy it with a Gradio interface. The live chatbot interface that we create will look something like this:

$demo_chatbot_simple

## A Simple Chatbot Demo

Let's start with recreating the simple demo above. As you may have noticed, our bot simply randomly responds "yes" or "no" to any input. 

$code_chatbot_simple

The chatbot value stores the entire history of the conversation, as a list of response pairs between the user and bot. Note that we chain two event event listeners with `.then` after a user triggers a submit:

1. The first method updates the chatbot with the user message and clears the input field. Because we want this to happen instantly, we set `queue=False`, which would skip any queue if it had been enabled.
2. The second method waits for the bot to respond, and then updates the chatbot with the bot response.

The reason we split these events is so that the user can see their message appear in the chatbot immediately before the bot responds, which can take some time to process.

Note we pass the entire history of the chatbot to these functions and back to the component. To clear the chatbot, we pass it `None`.

## Using a Model or API

What if you'd like to build a real chatbot, capable of responding in human-like language? You need to use a language model. There are lots of great open-source language models you can download and run locally, or you can access one via an API. We'll use the former approach (a model).

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/quickstart). To use a pretrained chatbot model, also install `transformers` and `torch`. 

### 1. Set up the Chatbot Model

In this tutorial, you will use a pretrained chatbot model, `DialoGPT`, and its tokenizer from the [Hugging Face Hub](https://huggingface.co/microsoft/DialoGPT-medium), but you can replace this with your own model or API as well. 

Here is the code to load `DialoGPT` from Hugging Face `transformers`.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
```

### 2. Define a `predict` function

Next, you will need to define a function that takes in the *user input* as well as the previous *chat history* to generate a response.

In the case of our pretrained model, it will look like this:

```python
def predict(input, history=[]):
    # tokenize the new input sentence
    new_user_input_ids = tokenizer.encode(input + tokenizer.eos_token, return_tensors='pt')

    # append the new user input tokens to the chat history
    bot_input_ids = torch.cat([torch.LongTensor(history), new_user_input_ids], dim=-1)

    # generate a response 
    history = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id).tolist()

    # convert the tokens to text, and then split the responses into lines
    response = tokenizer.decode(history[0]).split("<|endoftext|>")
    response = [(response[i], response[i+1]) for i in range(0, len(response)-1, 2)]  # convert to tuples of list
    return response, history
```

Let's break this down. The function takes two parameters:

* `input`: which is what the user enters (through the Gradio GUI) in a particular step of the conversation. 
* `history`: which represents the **state**, consisting of the list of user and bot responses. To create a stateful Gradio demo, we *must* pass in a parameter to represent the state, and we set the default value of this parameter to be the initial value of the state (in this case, the empty list since this is what we would like the chat history to be at the start).

Then, the function tokenizes the input and concatenates it with the tokens corresponding to the previous user and bot responses. Then, this is fed into the pretrained model to get a prediction. Finally, we do some cleaning up so that we can return two values from our function:

* `response`: which is a list of tuples of strings corresponding to all of the user and bot responses. This will be rendered as the output in the Gradio demo.
* `history` variable, which is the token representation of all of the user and bot responses. In stateful Gradio demos, we *must* return the updated state at the end of the function. 

## 3. Create a Gradio Demo using Blocks

Now that we have our predictive function set up, we can create a Gradio demo around it. 

In this case, our function takes in two values, a text input and a state input. The corresponding input components in `gradio` are `"text"` and `"state"`. 

The function also returns two values. We will display the list of responses using the dedicated `"chatbot"` component and use the `"state"` output component type for the second return value.

Note that the `"state"` input and output components are not displayed. 

```python
with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    state = gr.State([])
    
    with gr.Row():
        txt = gr.Textbox(show_label=False, placeholder="Enter text and press enter").style(container=False)
            
    txt.submit(predict, [txt, state], [chatbot, state])
            
demo.launch()
```

This produces the following demo, which you can try right here in your browser (try typing in some simple greetings like "Hi!" to get started):

<iframe src="https://dawood-chatbot-guide.hf.space" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>



## 4. Adding Markdown, Images, Audio, or Videos 


The `gr.Chatbot` also supports a subset of markdown including bold, italics, and code. In addition, it can also handle media files, such as images, audio, and video. 

```python
def add_image(state, image):
    state = state + [(f"![](/file={image.name})", "Cool pic!")]
    return state, state
```


Notice the `add_image` function takes in both the `state` and `image` and appends the user submitted image to `state` by using markdown. 


```python
import gradio as gr

def add_text(state, text):
    state = state + [(text, text + "?")]
    return state, state

def add_image(state, image):
    state = state + [(f"![](/file={image.name})", "Cool pic!")]
    return state, state


with gr.Blocks(css="#chatbot .overflow-y-auto{height:500px}") as demo:
    chatbot = gr.Chatbot(elem_id="chatbot")
    state = gr.State([])
    
    with gr.Row():
        with gr.Column(scale=0.85):
            txt = gr.Textbox(show_label=False, placeholder="Enter text and press enter, or upload an image").style(container=False)
        with gr.Column(scale=0.15, min_width=0):
            btn = gr.UploadButton("🖼️", file_types=["image"])
            
    txt.submit(add_text, [state, txt], [state, chatbot])
    txt.submit(lambda :"", None, txt)
    btn.upload(add_image, [state, btn], [state, chatbot])
            
demo.launch()
```

This is the code for a chatbot with a textbox for a user to submit text and an image upload button to submit images. The rest of the demo code is creating an interface using blocks; basically adding a couple more components compared to section 3.

This code will produce a demo like the one below:

<iframe src="https://dawood-chatbot-guide-multimodal.hf.space" frameBorder="0" height="650" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

And you're done! That's all the code you need to build an interface for your chatbot model. Here are some references that you may find useful:

* Gradio's [Quickstart guide](https://gradio.app/quickstart/)
* The first chatbot demo [chatbot demo](https://huggingface.co/spaces/dawood/chatbot-guide) and [complete code](https://huggingface.co/spaces/dawood/chatbot-guide/blob/main/app.py) (on Hugging Face Spaces)
* The final chatbot with markdown support [chatbot demo](https://huggingface.co/spaces/dawood/chatbot-guide-multimodal) and [complete code](https://huggingface.co/spaces/dawood/chatbot-guide-multimodal/blob/main/app.py) (on Hugging Face Spaces)
