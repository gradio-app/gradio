import gradio as gr


def reverse(text: str) -> str:
    return (text or "")[::-1]


# Three outputs ("Reversed", "Generated" and "Image") fed by a shared "Text"
# input: a local function, a HF Inference model and a HF Space. Because they
# form a single connected subgraph, they're exposed as ONE API endpoint that
# returns all three outputs as a tuple — see the "View API" panel in the app,
# or connect with the gradio_client.
demo = gr.Workflow(graph="workflow.json", bind={"reverse": reverse})

if __name__ == "__main__":
    demo.launch()
