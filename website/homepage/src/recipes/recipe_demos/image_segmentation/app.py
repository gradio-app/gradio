# URL: https://huggingface.co/spaces/gradio/image_segmentation
# imports
import gradio as gr
import os
import torch
import torch.nn.functional as F
import torchvision.transforms as T
from mmseg.apis import init_segmentor, inference_segmentor, show_result_pyplot
from mmseg.core.evaluation import get_palette
import mmcv
from huggingface_hub import hf_hub_download

# load the model
device = "cpu"
checkpoint_file = hf_hub_download(repo_id="Andy1621/uniformer", filename="upernet_global_small.pth")
config_file = './exp/upernet_global_small/config.py'
model = init_segmentor(config_file, checkpoint_file, device='cpu')

# define core and helper functions
def set_example_image(example: list) -> dict:
    return gr.Image.update(value=example[0])
def inference(img):
    result = inference_segmentor(model, img)
    res_img = show_result_pyplot(model, img, result, get_palette('ade'))
    return res_img

# start a Block
demo = gr.Blocks()
with demo:
    # define Markdown that will render on the demo
    gr.Markdown(
        """
        # UniFormer-S
        Gradio demo for <a href='https://github.com/Sense-X/UniFormer' target='_blank'>UniFormer</a>: To use it, simply upload your image, or click one of the examples to load them. Read more at the links below.
        This is a simplified version of the original <a href='https://huggingface.co/spaces/Andy1621/uniformer_image_segmentation' target='_blank'>uniformer demo</a>.
        """
    )
    # define the layout 
    with gr.Box():
        with gr.Row():
                with gr.Column():
                    with gr.Row():
                        # define the input
                        input_image = gr.Image(label='Input Image', type='numpy')
                    with gr.Row():
                        # define the button
                        submit_button = gr.Button('Submit')
                with gr.Column():
                    # define the output
                    res_image = gr.Image(type='numpy', label='Segmentation Resutls')
        with gr.Row():
            # define the examples
            example_images = gr.Dataset(components=[input_image], samples=[['demo1.jpg'], ['demo2.jpg'], ['demo3.jpg']])
    # define the functions that will run when the submit button or an example image is clicked
    submit_button.click(fn=inference, inputs=input_image, outputs=res_image)
    example_images.click(fn=set_example_image, inputs=example_images, outputs=example_images.components)

# launch
demo.launch()