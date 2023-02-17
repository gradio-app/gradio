from diffusers import DiffusionPipeline
import gradio as gr

generator = DiffusionPipeline.from_pretrained("CompVis/ldm-text2im-large-256")
# generator.to("cuda")  # If you have a GPU, uncomment this line

def generate(prompts):
  images = generator(list(prompts)).images
  return [images]

gr.Interface(generate, 
             "textbox", 
             "image", 
             batch=True, 
             max_batch_size=4  # Set the batch size based on your CPU/GPU memory
).queue().launch()
