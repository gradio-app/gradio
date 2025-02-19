"""
This is a simple todo list app that allows you to add, remove, and mark tasks as complete.
All actions are performed on the client side.
"""
import gradio as gr

tasks = ["Get a job", "Marry a rich person", "", "", "", ""]
textboxes = []
rows = []

with gr.Blocks() as demo:
    gr.Markdown("# A Simple Interactive Todo List")
    for i in range(6):
        with gr.Row() as r:
            t = gr.Textbox(tasks[i], placeholder="Enter a task", show_label=False, container=False, scale=7, interactive=True)
            b = gr.Button("✔️", interactive=bool(tasks[i]))
        t.change(lambda : gr.Button(interactive=True), None, b)
        b.click(lambda : gr.Row(visible=False), None, r)

    # Add a button to add a new task


demo.launch()