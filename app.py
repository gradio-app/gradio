from transformers import pipeline
import gradio as gr



# Example of a transformers pipeline
# pipe = pipeline(model="deepset/roberta-base-squad2")


# print([c.__name__ for c in pipe.__class__.__mro__])



# for name in parent_class_name:
#     print(name.__name__)
# print(parent_class_name)


# demo = gr.Interface.from_pipeline(pipe)
# demo.launch()


import torch
from diffusers import StableDiffusionPipeline

diff_pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16)
diff_pipe = diff_pipe.to("mps")

# diff_demo = gr.Interface.from_pipeline(diff_pipe)
# diff_demo.launch()