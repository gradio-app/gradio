import gradio as gr


def shout(text: str) -> str:
    return (text or "").upper()


def reverse(text: str) -> str:
    return (text or "")[::-1]


# Two outputs ("Loud" and "Reversed") fed by a shared "Text" input. Because they
# form a single connected subgraph, they're exposed as ONE API endpoint that
# returns both outputs as a tuple — see the "View API" panel in the app, or
# connect with the gradio_client.
demo = gr.Workflow(graph="workflow.json", bind={"shout": shout, "reverse": reverse})

if __name__ == "__main__":
    demo.launch()
