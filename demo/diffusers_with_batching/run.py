import torch
from diffusers import DiffusionPipeline
import gradio as gr

generator = DiffusionPipeline.from_pretrained("CompVis/ldm-text2im-large-256")
# move to GPU if available
if torch.cuda.is_available():
    generator = generator.to("cuda")

def generate(prompts):
  images = generator(list(prompts)).images
  return [images]

demo = gr.Interface(generate, 
             "textbox", 
             "image", 
             batch=True, 
             max_batch_size=4  # Set the batch size based on your CPU/GPU memory
).queue()

if __name__ == "__main__":
    demo.launch()
