import gradio as gr

def reverse_note(note):
    return note[::-1]

demo = gr.Interface(
    fn=reverse_note,
    inputs=gr.Textbox(label="Enter your note", placeholder="Type a note here..."),
    outputs="textbox",
    title="Note Reverser"
)

demo.launch()