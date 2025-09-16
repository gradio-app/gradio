import gradio as gr
import time


def greet():
    gr.Info("Warning in 1 second")
    time.sleep(1)
    gr.Warning("Error in 1 second")
    time.sleep(1)
    raise Exception("test")


with gr.Blocks() as demo:
    with gr.Tab("Accordions"):
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
    with gr.Tab("Images"):
        gr.Image(value="./cheetah.jpg")
        gr.Image(value="./cheetah copy.jpg")
        gr.Image(value="./cheetah copy 2.jpg")
        gr.Image(value="./cheetah copy 3.jpg")
        gr.Image(value="./cheetah copy 4.jpg")
        gr.Image(value="./cheetah copy 5.jpg")
        gr.Image(value="./cheetah copy 6.jpg")
        gr.Image(value="./cheetah copy 7.jpg")
        gr.Image(value="./cheetah copy 8.jpg")
        gr.Image(value="./cheetah copy 9.jpg")
        gr.Image(value="./cheetah copy 10.jpg")
        gr.Image(value="./cheetah copy 11.jpg")


if __name__ == "__main__":
    demo.launch()
