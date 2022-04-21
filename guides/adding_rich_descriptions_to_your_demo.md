# Adding Rich Descriptions to Your Demo

related_spaces: https://huggingface.co/spaces/ThomasSimonini/Chat-with-Gandalf-GPT-J6B, https://huggingface.co/spaces/kingabzpro/Rick_and_Morty_Bot, https://huggingface.co/spaces/nateraw/cryptopunks-generator
tags: MARKDOWN, DESCRIPTION, ARTICLE

## Introduction

When an interface is shared, it is usually accompanied with some form of explanatory text, links or images. This guide will go over how to easily add these on gradio. 

For example, take a look at this fun chatbot interface below. It has a title, description, image as well as a link in the bottom.  

<iframe src="https://hf.space/embed/aliabd/rick-and-morty/+" frameBorder="0" height="875" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## The parameters in `Interface`

There are three parameters in `Interface` where text can go:

* `title`: which accepts text and can displays it at the very top of interface
* `description`: which accepts text, markdown or HTML and places it right under the title.
* `article`: which is also accepts text, markdown or HTML but places it below the interface.

![annotated](website/src/assets/img/guides/adding_rich_descriptions_to_your_demo/annotated.png)

## Code example

Here's all the text-related code required to recreate the interface shown above. 

```python
import gradio as gr

title = "Ask Rick a Question"
description = """
<center>
The bot was trained to answer questions based on Rick and Morty dialogues. Ask Rick anything!
<img src="https://huggingface.co/spaces/course-demos/Rick_and_Morty_QA/resolve/main/rick.png" width=200px>
</center>
"""

article = "Check out [the original Rick and Morty Bot](https://huggingface.co/spaces/kingabzpro/Rick_and_Morty_Bot) that this demo is based off of."

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

tokenizer = AutoTokenizer.from_pretrained("ericzhou/DialoGPT-Medium-Rick_v2")
model = AutoModelForCausalLM.from_pretrained("ericzhou/DialoGPT-Medium-Rick_v2")

def predict(input):
    # tokenize the new input sentence
    new_user_input_ids = tokenizer.encode(input + tokenizer.eos_token, return_tensors='pt')

    # generate a response 
    history = model.generate(new_user_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id).tolist()

    # convert the tokens to text, and then split the responses into the right format
    response = tokenizer.decode(history[0]).split("<|endoftext|>")
    return response[1]

gr.Interface(fn = predict, inputs = ["textbox"], outputs = ["text"], title = title, description = description, article = article).launch() 

```

Of course, you don't have to use HTML and can instead rely on markdown, like we've done in the `article` parameter above. 

The table below shows the syntax for the most common markdown commands. 

| Type      | Syntax |
| ----------- | ----------- |
| Header      | # Heading 1 ## Heading 2 ### Heading 3        |
| Link   | \[gradio's website](https://gradio.app)        |
| Image   | !\[gradio's logo](https://gradio.app/assets/img/logo.png)        |
| Text Formatting   | \_italic_ \*\*bold**         |
| List | \* Item 1 \* Item 2 |
| Quote | \> this is a quote |
| Code | Inline \`code\` has \`back-ticks around\` it. |



Here's a neat [cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) with more.

 
### That's all! Happy building :)