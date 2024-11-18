import gradio as gr

# sample md stolen from https://dillinger.io/

md = """# Dillinger
## _The Last Markdown Editor, Ever_

This is some `inline code`, it is good.

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Dillinger is a cloud-enabled, mobile-ready, offline-storage compatible,
AngularJS-powered HTML5 Markdown editor.

- Type some Markdown on the left
- See HTML in the right
- ✨Magic ✨
"""

def copy_callback(copy_data: gr.CopyData):
    return copy_data.value

with gr.Blocks() as demo:
    textbox = gr.Textbox(label="Copied text")
    with gr.Row():
        markdown = gr.Markdown(value=md, header_links=True, height=400, show_copy_button=True)
        chatbot = gr.Chatbot([("Hello", "World"), ("Goodbye", "World")], show_copy_button=True)
        textbox2 = gr.Textbox("Write something here", interactive=True)

        gr.on(
            [markdown.copy, chatbot.copy, textbox2.copy],
            copy_callback,
            outputs=textbox
        )

demo.launch()
