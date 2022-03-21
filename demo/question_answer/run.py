import gradio as gr

examples = [
    [
        "The Amazon rainforest is a moist broadleaf forest that covers most of the Amazon basin of South America",
        "Which continent is the Amazon rainforest in?",
    ]
]

gr.Interface.load(
    "huggingface/deepset/roberta-base-squad2",
    inputs=[
        gr.inputs.Textbox(lines=5, placeholder="Type a sentence or paragraph here.", label="Context"),
        gr.inputs.Textbox(lines=2, placeholder="Ask a question based on the context.", label="Question"),
    ],
    outputs=[gr.outputs.Textbox(label="Answer"), gr.outputs.Label(label="Probability")],
    examples=examples,
).launch()
