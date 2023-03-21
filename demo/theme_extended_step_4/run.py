import gradio as gr
import time

theme = gr.themes.Default(primary_hue="blue").set(
    loader_color="#FF0000",
    slider_color="#FF0000",
)

def repeat(name, count):
    time.sleep(3)
    return name * count

demo = gr.Interface(
    fn=repeat,
    inputs=[gr.Textbox(), gr.Slider(label="Count")],
    outputs=gr.Textbox(label="Output"),
    theme=theme,
)

if __name__ == "__main__":
    demo.launch()
