import gradio as gr 

demo = gr.Interface.load(
             "huggingface/facebook/deit-base-distilled-patch16-224",  
             inputs = "image",
             outputs = "label",
             title="Standard demos- With input and output")

if __name__ == "__main__":
    demo.launch()