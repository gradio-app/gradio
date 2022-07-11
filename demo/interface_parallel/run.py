import gradio as gr

greeter_1 = gr.Interface(lambda name: f"Hello {name}!", inputs="textbox", outputs=gr.Textbox(label="Greeter 1"))
greeter_2 = gr.Interface(lambda name: f"Greetings {name}!", inputs="textbox", outputs=gr.Textbox(label="Greeter 2"))
demo = gr.Parallel(greeter_1, greeter_2)

if __name__ == "__main__":
    demo.launch()