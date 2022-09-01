# URL: https://huggingface.co/spaces/gradio/text_generation
# imports
import gradio as gr
from transformers import pipeline, set_seed

# loading the model
generator = pipeline('text-generation', model='gpt2')
set_seed(42)


# defining the core function
def generate(text):
    result = generator(text, max_length=30, num_return_sequences=1)
    return result[0]["generated_text"]


# defining examples
examples = [
    ["The Moon's orbit around Earth has"],
    ["The smooth Borealis basin in the Northern Hemisphere covers 40%"],
]

# defining the interface
demo = gr.Interface(
    fn=generate,
    inputs=gr.inputs.Textbox(lines=5, label="Input Text"),
    outputs=gr.outputs.Textbox(label="Generated Text"),
    examples=examples
)

# launching
demo.launch()
