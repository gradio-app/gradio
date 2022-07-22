import gradio as gr

get_name = gr.Interface(lambda name: name, inputs="textbox", outputs="textbox")
prepend_hello = gr.Interface(lambda name: f"Hello {name}!", inputs="textbox", outputs="textbox")
append_nice = gr.Interface(lambda greeting: f"{greeting} Nice to meet you!",
                           inputs="textbox", outputs=gr.Textbox(label="Greeting"))
demo = gr.Series(get_name, prepend_hello, append_nice)

if __name__ == "__main__":
    demo.launch()