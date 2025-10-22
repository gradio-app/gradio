import gradio as gr


def greet(name):
    return "Hello " + name + "!"


demo = gr.Interface(fn=greet, inputs="textbox", outputs="textbox", api_name="predict")

if __name__ == "__main__":
    demo.launch()
