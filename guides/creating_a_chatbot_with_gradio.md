## 💬 How to Create a Chatbot with Gradio

By [Abubakar Abid](https://huggingface.co/abidlabs) <br>
Published: 20 January 2022 <br>
Tested with: `gradio>=2.7.5`

## Introduction

Chatbots are widely studied in natural language processing (NLP) research and are one of the common applications of NLP in industry. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts. Using `gradio`, you can easily build a demo of your chatbot model and share that with a testing team, or test it yourself using an intuitive chatbot GUI.

This tutorial will show how to take a pretrained chatbot model and deploy it with a Gradio interface in 4 steps. The live chatbot interface that we create will look something like this:


Chatbots are *stateful*, meaning that the model's prediction can change depending on how the user has previously interacted with the model. Our tutorial will also describe how to use **state** with a Gradio demos. 

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
    response = tokenizer.decode(history[0]).replace("<|endoftext|>", "\n")
    
    return response, history
```

Let's break this down. The function takes two parameters:
* `user_input`: which is what the user enters (through the Gradio GUI) in a particular step of the conversation. 
* `history`: which represents the **state**, consisting of the list of user and bot responses. To create a stateful Gradio demo, we *must* pass in a parameter to represent the state, and we set the default value of this parameter to be the initial value of the state (in this case, the empty list since this is what we would like the chat history to be at the start).

Then, the function tokenizes the input and concatenates it with the tokens corresponding to the previous user and bot responses. Then, this is fed into the pretrained model to get a prediction. Finally, we do some cleaning up so that we can return two values from our function:

* `response`: which is a list of strings corresponding to all of the user and bot responses. This will be rendered as the output in the Gradio demo.
* `history` variable, which is the token representation of all of the user and bot responses. In stateful Gradio demos, we *must* return the updated state at the end of the function. 

## Step 3 — Creating a Gradio Interface

Now that we have our predictive function set up, we can create a Gradio Interface around it. 

In this case, our function takes in two values, a text input and a state input. The corresponding input components in `gradio` are `"text"` and `"state"`. 

The function also returns two values. For now, we will display the list of responses as `"text"` and use the `"state"` output component type for the second return value.

Note that the `"state"` input and output components are not displayed. 

```python
import gradio as gr

gr.Interface(fn=predict,
             inputs=["text", "state"],
             outputs=["text", "state"]).launch()
```

This produces the following interface, which you can try right here in your browser (try typing in some simple greetings like "Hi!" to get started):

<div id="chatbot-minimal">
<script defer="defer" id="gradio-library" src="www.gradio.app/gradio_static/bundle.js">
<script>
    launchGradioFromSpaces("abidlabs/chatbot-minimal", "#chatbot-minimal")
</script>

## Step 4 — Stylizing Your Interface 

The problem is that the output of the chatbot looks pretty ugly. No problem, we can make it prettier by using a little bit of CSS. We modify our function to return an HTML list instead:

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
    response.remove("")
    
    # write some HTML
    html = "<div class='chatbot'>"
    for m, msg in enumerate(response):
        cls = "user" if m%2 == 0 else "bot"
        html += "<div class='msg {}'> {}</div>".format(cls, msg)
    html += "</div>"
    
    return html, history
```

We change the first output component to be `"html"` instead, since now we are returning a string of HTML code. We also include some custom css to make the output prettier.

```python
import gradio as gr

css = """
.chatbox {display:flex;flex-direction:column}
.msg {padding:4px;margin-bottom:4px;border-radius:4px;width:80%}
.msg.user {background-color:cornflowerblue;color:white}
.msg.bot {background-color:lightgray;align-self:self-end}
"""

gr.Interface(fn=predict,
             inputs=["text", "state"],
             outputs=["html", "state"],
             css=css).launch()
```

Notice that we have also passed in a little bit of custom css using the `css` parameter, and we are good to go! Try it out below:

----------

And you're done! That's all the code you need to build an interface for your chatbot model. Here are some references that you may find useful:

* Gradio's ["Getting Started" guide]()
* The [chatbot demo]() and [complete code]() (on Hugging Face Spaces)


