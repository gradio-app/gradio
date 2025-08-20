import gradio as gr
import time


def greet():
    gr.Info("Warning in 1 second")
    time.sleep(1)
    gr.Warning("Error in 1 second")
    time.sleep(1)
    raise Exception("test")


with gr.Blocks() as demo:
    with gr.Row(height=1500):
        gr.Markdown("Scroll down to see UI.")
    greet_btn = gr.Button("Trigger toast")
    greet_btn.click(fn=greet)

    with gr.Accordion("Accordion"):
        gr.Markdown(
            """
## Accordion content
### Accordion content
#### Accordion content
##### Accordion content
###### Accordion content
 """
        )

if __name__ == "__main__":
    demo.launch()
