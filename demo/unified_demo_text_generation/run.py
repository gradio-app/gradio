from transformers import pipeline
import gradio as gr

generator = pipeline('text-generation', model = 'gpt2')

def generate_text(text_prompt):
  response = generator(text_prompt, max_length = 30, num_return_sequences=5)
  return response[0]['generated_text']

blocks = gr.Blocks()

with blocks as demo:
  textbox_in_out = gr.Textbox(placeholder="Hello, I'm a language model", label="Enter your initial text here") 
  btn_generate = gr.Button("Generate Text")
  btn_generate.click(generate_text,inputs=textbox_in_out, outputs=textbox_in_out )

if __name__ == "__main__":
    demo.launch()