## 💬 How to Create a Chatbot with Gradio

By [Abubakar Abid](https://huggingface.co/abidlabs) <br>
Published: 20 January 2022 <br>
Tested with: `gradio>=2.7.1`

## Introduction

Chatbots are widely studied in academic research and are one of the common applications of natural language in industry. Because chatbots are deployed in front of end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts. Using `gradio`, you can easily build a demo of your chatbot and share that with a testing team, or test it yourself using an intuitive chatbot GUI.

This tutorial will show how to take a pretrained chatbot model and deploy it with a Gradio interface in 4 steps. The live chatbot interface that we create will look something like this:


### Prerequisites

Make sure you have the `gradio` Python package installed, as described in the [Getting Started](/getting_started) guide.

## Step 1 — Setting up the Chatbot Model

First, you will need to have a chatbot model that you have either trained yourself or downloaded a pretrained model. We will use a pretrained chatbot model, `DialoGPT`, and its tokenizer from the [Hugging Face Hub](https://huggingface.co/microsoft/DialoGPT-medium), but you can replace this with your own model. 

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
def generate(user_input, history=[]):
    new_user_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')
    
    bot_input_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=-1) if step &gt; 0 else new_user_input_ids

    return responses, history
```

The function takes two parameters:
* `user_input`: which is what the user enters (through the Gradio GUI) in a particular step of the conversation. 
* `history`: which is the entire list of user and bot responses. *Importantly*, we set the default value of this parameter to be the empty list since this is what we would like the initial value of the chat history to be.

Notice that we return two values from our function:
* `responses`: which is a text representation of all of the user and bot responses. This will be rendered as the output in the Gradio demo.
* `history` variable. We need to do that that because we want to associate that with a persistent Gradio *state*, which is holds its value across multiple runs of the model for each user.

## Step 3 — Creating a Gradio Interface

Now that we have our predictive function set up, we can create a Gradio Interface around it. 

In this case, our function takes in two values

## Step 4 — Stylizing Your Interface 



