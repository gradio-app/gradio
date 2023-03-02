import gradio as gr


def greet(name):
    return "Hello " + name + "!"


theme = gr.themes.Default(primary_hue=gr.themes.utils.purple).set(loader_color="orange")

demo = gr.Interface(fn=greet, inputs="text", outputs="text", theme=theme)

if __name__ == "__main__":
    demo.launch()
