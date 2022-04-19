import gradio as gr

examples = [
    [
        "The Amazon rainforest is a moist broadleaf forest that covers most of the Amazon basin of South America",
        "Which continent is the Amazon rainforest in?",
    ]
]

demo = gr.Interface.load(
    "huggingface/deepset/roberta-base-squad2",
    inputs=[
        gr.Textbox(
            lines=5, label="Context", placeholder="Type a sentence or paragraph here."
        ),
        gr.Textbox(
            lines=2,
            label="Question",
            placeholder="Ask a question based on the context.",
        ),
    ],
    outputs=[gr.Textbox(label="Answer"), gr.Label(label="Probability")],
    examples=examples,
)

if __name__ == "__main__":
    demo.launch()
