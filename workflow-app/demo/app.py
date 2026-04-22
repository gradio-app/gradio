import gradio as gr
from gradio_workflowcanvas import WorkflowCanvas

with gr.Blocks() as demo:
    WorkflowCanvas()

if __name__ == "__main__":
    demo.launch()
