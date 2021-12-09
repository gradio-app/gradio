import gradio as gr

examples = [
    ["The Amazon rainforest is a moist broadleaf forest that covers most of the Amazon basin of South America", 
     "Which continent is the Amazon rainforest in?"]
]

gr.Interface.load("huggingface/deepset/roberta-base-squad2", 
                  inputs=[gr.inputs.Textbox(lines=5, label="Context", placeholder="Type a sentence or paragraph here."), 
                          gr.inputs.Textbox(lines=2, label="Question", placeholder="Ask a question based on the context.")],
                  outputs=[gr.outputs.Textbox(label="Answer"), 
                          gr.outputs.Label(label="Probability")],                  
                  examples=examples).launch()
