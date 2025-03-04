"""
This is a simple todo list app that allows you to edit tasks and mark tasks as complete.
All actions are performed on the client side.
"""
import gradio as gr

tasks = ["Get a job", "Marry rich", "", "", "", ""]
textboxes = []
buttons = []
with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column(scale=3):
            gr.Markdown("# A Simple Interactive Todo List")
        with gr.Column(scale=2):
            with gr.Row():
                freeze_button = gr.Button("Freeze tasks", variant="stop")
                edit_button = gr.Button("Edit tasks")
    for i in range(6):
        with gr.Row() as r:
            t = gr.Textbox(tasks[i], placeholder="Enter a task", show_label=False, container=False, scale=7, interactive=True)
            b = gr.Button("✔️", interactive=bool(tasks[i]), variant="primary" if tasks[i] else "secondary")
            textboxes.append(t)
            buttons.append(b)
        t.change(lambda : gr.Button(interactive=True, variant="primary"), None, b, js=True)
        b.click(lambda : gr.Row(visible=False), None, r, js=True)
    freeze_button.click(lambda : [gr.Textbox(interactive=False), gr.Textbox(interactive=False), gr.Textbox(interactive=False), gr.Textbox(interactive=False), gr.Textbox(interactive=False), gr.Textbox(interactive=False)], None, textboxes, js=True)
    edit_button.click(lambda : [gr.Textbox(interactive=True), gr.Textbox(interactive=True), gr.Textbox(interactive=True), gr.Textbox(interactive=True), gr.Textbox(interactive=True), gr.Textbox(interactive=True)], None, textboxes, js=True)
    freeze_button.click(lambda : [gr.Button(visible=False), gr.Button(visible=False), gr.Button(visible=False), gr.Button(visible=False), gr.Button(visible=False), gr.Button(visible=False)], None, buttons, js=True)
    edit_button.click(lambda : [gr.Button(visible=True), gr.Button(visible=True), gr.Button(visible=True), gr.Button(visible=True), gr.Button(visible=True), gr.Button(visible=True)], None, buttons, js=True)

if __name__ == "__main__":
    demo.launch()
