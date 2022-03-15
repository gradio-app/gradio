# Adding Markdown and Other Text

related_spaces: https://huggingface.co/spaces/ThomasSimonini/Chat-with-Gandalf-GPT-J6B, https://huggingface.co/spaces/kingabzpro/Rick_and_Morty_Bot, https://huggingface.co/spaces/nateraw/cryptopunks-generator
tags: MARKDOWN, DESCRIPTION, ARTICLE

## Introduction

When an interface is shared, it is usually accompanied with some form of explanatory text, links or images. This guide will go over how to easily add these on gradio. 

For example, take a look at this fun chatbot interface below. It has a title, description, image as well as links in the bottom.  

<iframe src="https://hf.space/gradioiframe/kingabzpro/Rick_and_Morty_Bot/+" frameBorder="0" height="725" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## The parameters in `Interface`

There are three parameters in `Interface` where text can go:

* `Title`: which accepts text and can displays it at the very top of interface
* `Description`: which accepts text, markdown or HTML and places it right under the title.
* `Article`: which is also accepts text, markdown or HTML but places it below the interface.

![annotated](website/src/assets/img/guides/adding_markdown_and_other_text/annotated.png)

## Code example

Here's all the text-related code required to recreate the interface above. 

```python
import gradio as gr

title = "Talk To Me Morty"
description = """
<p>
<center>
The bot was trained on Rick and Morty dialogues Kaggle Dataset using DialoGPT.
<img src="https://huggingface.co/spaces/kingabzpro/Rick_and_Morty_Bot/resolve/main/img/rick.png" alt="rick" width="200"/>
</center>
</p>
"""
article = """
<p style='text-align: center'>
<a href='https://medium.com/geekculture/discord-bot-using-dailogpt-and-huggingface-api-c71983422701' target='_blank'>Complete Tutorial</a>
</p>

<p style='text-align: center'>
<a href='https://dagshub.com/kingabzpro/DailoGPT-RickBot' target='_blank'>Project is Available at DAGsHub</a>
</p>
"""
...

gr.Interface(fn=predict, ... , title=title, description=description, article=article).launch()  

```

Of course, you don't have to use HTML and can instead rely on markdown. Here's a neat [cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) with the most common markdown commands.
 
### That's all! Happy building :)