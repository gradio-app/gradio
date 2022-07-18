# How to Create a Chatbot

Related spaces: https://huggingface.co/spaces/abidlabs/chatbot-minimal, https://huggingface.co/spaces/ThomasSimonini/Chat-with-Gandalf-GPT-J6B, https://huggingface.co/spaces/gorkemgoknar/moviechatbot, https://huggingface.co/spaces/Kirili4ik/chat-with-Kirill
Tags: NLP, TEXT, HTML
Docs: textbox, state

## Introduction

Chatbots are widely studied in natural language processing (NLP) research and are a common use case of NLP in industry. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts. 

Using `gradio`, you can easily build a demo of your chatbot model and share that with a testing team, or test it yourself using an intuitive chatbot GUI.

This tutorial will show how to take a pretrained chatbot model and deploy it with a Gradio interface in 4 steps. The live chatbot interface that we create will look something like this (try it!):

<iframe src="https://hf.space/embed/abidlabs/chatbot-stylized/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

Chatbots are *stateful*, meaning that the model's prediction can change depending on how the user has previously interacted with the model. So, in this tutorial, we will also cover how to use **state** with Gradio demos. 

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). To use a pretrained chatbot model, also install `transformers` and `torch`.

## Step 1 — Setting up the Chatbot Model

First, you will need to have a chatbot model that you have either trained yourself or you will need to download a pretrained model. In this tutorial, we will use a pretrained chatbot model, `DialoGPT`, and its tokenizer from the [Hugging Face Hub](https://huggingface.co/microsoft/DialoGPT-medium), but you can replace this with your own model. 

Here is the code to load `DialoGPT` from Hugging Face `transformers`.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
```

## Step 2 — Defining a `predict` function

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

## Step 3 — Creating a Gradio Interface

Now that we have our predictive function set up, we can create a Gradio Interface around it. 

In this case, our function takes in two values, a text input and a state input. The corresponding input components in `gradio` are `"text"` and `"state"`. 

The function also returns two values. We will display the list of responses using the dedicated `"chatbot"` component and use the `"state"` output component type for the second return value.

Note that the `state` input and output components are not displayed.

```python
import gradio as gr

gr.Interface(fn=predict,
             inputs=["text", "state"],
             outputs=["chatbot", "state"]).launch()
```

This produces the following interface, which you can try right here in your browser (try typing in some simple greetings like "Hi!" to get started):

<iframe src="https://hf.space/embed/abidlabs/chatbot-minimal/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


----------

And you're done! That's all the code you need to build an interface for your chatbot model. Here are some references that you may find useful:

* Gradio's ["Getting Started" guide](https://gradio.app/getting_started/)
* The final [chatbot demo](https://huggingface.co/spaces/abidlabs/chatbot-stylized) and [complete code](https://huggingface.co/spaces/abidlabs/chatbot-stylized/tree/main) (on Hugging Face Spaces)


