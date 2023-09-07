import gradio as gr

get_name = gr.Interface(lambda name: name, inputs="textbox", outputs="textbox")
prepend_hello = gr.Interface(lambda name: f"Hello {name}!", inputs="textbox", outputs="textbox")
append_nice = gr.Interface(lambda greeting: f"Nice to meet you!",
                           inputs="textbox", outputs=gr.Textbox(label="Greeting"))
translator = gr.Interface(lambda s: "https://gradio-builds.s3.amazonaws.com/diffusion_image/cute_dog.jpg", gr.Textbox(), gr.Image())
demo = gr.Series(get_name, translator, append_nice)

if __name__ == "__main__":
    demo.launch()