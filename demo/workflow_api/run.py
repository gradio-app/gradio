import gradio as gr


def shout(text: str) -> str:
    return (text or "").upper()


def reverse(text: str) -> str:
    return (text or "")[::-1]


# Two outputs ("Loud" and "Reversed") fed by a shared "Text" input. Each output
# is exposed as its own API endpoint (/loud, /reversed) — see the "View API"
# panel in the app, or connect with the gradio_client.
demo = gr.Workflow(graph="workflow.json", bind={"shout": shout, "reverse": reverse})

if __name__ == "__main__":
    demo.launch()
