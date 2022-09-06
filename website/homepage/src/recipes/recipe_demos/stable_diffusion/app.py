# URL: https://huggingface.co/spaces/gradio/stable-diffusion
# imports
import gradio as gr
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline
from datasets import load_dataset
from PIL import Image  
import re
import os

# load the model
model_id = "CompVis/stable-diffusion-v1-4"
device = "cuda"
pipe = StableDiffusionPipeline.from_pretrained(model_id, use_auth_token=True, revision="fp16", torch_dtype=torch.float16)
pipe = pipe.to(device)
word_list_dataset = load_dataset("stabilityai/word-list", data_files="list.txt", use_auth_token=os.environ['auth_token'])
word_list = word_list_dataset["train"]['text']

# define the core function
def infer(prompt, samples, steps, scale, seed):
    #When running locally you can also remove this filter
    for filter in word_list:
        if re.search(rf"\b{filter}\b", prompt):
            raise gr.Error("Unsafe content found. Please try again with different prompts.")
        
    generator = torch.Generator(device=device).manual_seed(seed)
    
    #If you are running locally with CPU, you can remove the `with autocast("cuda")`
    with autocast("cuda"):
        images_list = pipe(
            [prompt] * samples,
            num_inference_steps=steps,
            guidance_scale=scale,
            generator=generator,
        )
    images = []
    safe_image = Image.open(r"unsafe.png")
    for i, image in enumerate(images_list["sample"]):
        if(images_list["nsfw_content_detected"][i]):
            images.append(safe_image)
        else:
            images.append(image)
    return images
    
# define a block
block = gr.Blocks()

# define the examples
examples = [
    [
        'A high tech solarpunk utopia in the Amazon rainforest',
        4,
        45,
        7.5,
        1024,
    ],
    [
        'A pikachu fine dining with a view to the Eiffel Tower',
        4,
        45,
        7,
        1024,
    ],
    [
        'A mecha robot in a favela in expressionist style',
        4,
        45,
        7,
        1024,
    ],
    [
        'an insect robot preparing a delicious meal',
        4,
        45,
        7,
        1024,
    ],
    [
        "A small cabin on top of a snowy mountain in the style of Disney, artstation",
        4,
        45,
        7,
        1024,
    ],
]

# start the block
with block:
    # define the layout
    with gr.Group():
        with gr.Box():
            with gr.Row().style(mobile_collapse=False, equal_height=True):
                # define the input textbox
                text = gr.Textbox(
                    label="Enter your prompt",
                    show_label=False,
                    max_lines=1,
                    placeholder="Enter your prompt",
                ).style(
                    border=(True, False, True, True),
                    rounded=(True, False, False, True),
                    container=False,
                )
                # define the button
                btn = gr.Button("Generate image").style(
                    margin=False,
                    rounded=(False, True, True, False),
                )
        # define the output gallery
        gallery = gr.Gallery(
            label="Generated images", show_label=False, elem_id="gallery"
        ).style(grid=[2], height="auto")

        # define the advanced button
        advanced_button = gr.Button("Advanced options", elem_id="advanced-btn")

        # define the advanced section sliders
        with gr.Row(elem_id="advanced-options"):
            samples = gr.Slider(label="Images", minimum=1, maximum=4, value=4, step=1)
            steps = gr.Slider(label="Steps", minimum=1, maximum=50, value=45, step=1)
            scale = gr.Slider(
                label="Guidance Scale", minimum=0, maximum=50, value=7.5, step=0.1
            )
            seed = gr.Slider(
                label="Seed",
                minimum=0,
                maximum=2147483647,
                step=1,
                randomize=True,
            )

        ex = gr.Examples(examples=examples, fn=infer, inputs=[text, samples, steps, scale, seed], outputs=gallery, cache_examples=True)
        ex.dataset.headers = [""]

        # define what will happen when the buttons are selected
        text.submit(infer, inputs=[text, samples, steps, scale, seed], outputs=gallery)
        btn.click(infer, inputs=[text, samples, steps, scale, seed], outputs=gallery)
        advanced_button.click(
            None,
            [],
            text,
        )
        
# launch
block.launch()