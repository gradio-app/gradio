import gradio as gr

generator = gr.load("huggingface/gpt2")
translator = gr.load("huggingface/t5-small")

demo = gr.Series(generator, translator, description="This demo combines two Spaces: a text generator (`huggingface/gpt2`) and a text translator (`huggingface/t5-small`). The first Space takes a prompt as input and generates a text. The second Space takes the generated text as input and translates it into another language.")

if __name__ == "__main__":
    demo.launch()