import gradio as gr
import random

with gr.Blocks() as demo:
    number_of_boxes = gr.Slider(1, 5, step=1, value=3, label="Number of Boxes")

    @gr.render(inputs=[number_of_boxes])
    def create_boxes(number_of_boxes):
        for i in range(number_of_boxes):
            with gr.Row(key=f'row-{i}'):
                number_box = gr.Textbox(
                    label=f"Default Label", 
                    info="Default Info", 
                    key=f"box-{i}", 
                    preserved_by_key=["label", "value"], 
                    interactive=True
                )
                change_label_btn = gr.Button("Change Label", key=f"btn-{i}")

                change_label_btn.click(
                    lambda: gr.Textbox(label=random.choice("ABCDE"), info=random.choice("ABCDE")), outputs=number_box
                )

if __name__ == "__main__":
    demo.launch()