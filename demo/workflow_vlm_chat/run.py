"""Ask a vision-language model about an image.

Drop in an image, type a question, run. The VLM answers in text. Uses the
`chat_completion` schema so the workflow works with any image-text-to-text
model regardless of which Inference Provider serves it.
"""

import gradio as gr

demo = gr.Workflow(graph="workflow.json")

if __name__ == "__main__":
    demo.launch()
