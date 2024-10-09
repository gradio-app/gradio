import gradio as gr


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem("ImageEditor", interactive=True):
            gr.ImageEditor(label="Highlighted Text", interactive=True)
        with gr.TabItem("Subtabs"):
            with gr.Tabs():
                with gr.TabItem("Textbox", interactive=True):
                    gr.Textbox(label="Name", interactive=True)
                with gr.TabItem("Accordion", interactive=True):
                    with gr.Accordion("Accordion"):
                        gr.Textbox(label="Name", interactive=True)
        with gr.TabItem("AnnotatedImage", interactive=True):
            gr.AnnotatedImage(label="Annotated Image")
        with gr.TabItem("Audio", interactive=True):
            gr.Audio(label="Audio", interactive=True)
        with gr.TabItem("ChatInterface", interactive=True):
            gr.ChatInterface(
                lambda x: "Hello " + x + "!",
            )
        with gr.TabItem("BarPlot", interactive=True):
            gr.BarPlot(label="Bar Plot", interactive=True)
        with gr.TabItem("Button", interactive=True):
            gr.Button("Box Plot", interactive=True)
        with gr.TabItem("Chatbot", interactive=True):
            gr.Chatbot(label="Canvas")
        with gr.TabItem("Checkbox", interactive=True):
            gr.Checkbox(label="Checkbox", interactive=True)
        with gr.TabItem("CheckboxGroup", interactive=True):
            gr.CheckboxGroup(label="Checkbox Group", interactive=True)
        with gr.TabItem("ChatInterface2", interactive=True):
            gr.ChatInterface(
                lambda x: "Hello " + x + "!",
            )
        with gr.TabItem("Code", interactive=True):
            gr.Code(label="Code", interactive=True)
        with gr.TabItem("ColorPicker", interactive=True):
            gr.ColorPicker(label="Code Editor", interactive=True)
        with gr.TabItem("DataFrame", interactive=True):
            gr.DataFrame(label="Data Frame", interactive=True)
        with gr.TabItem("Dropdown", interactive=True):
            gr.Dropdown(label="Dropdown", interactive=True)
        with gr.TabItem("DateTime", interactive=True):
            gr.DateTime(label="Date Time")
        with gr.TabItem("File", interactive=True):
            gr.File(label="File", interactive=True)
        with gr.TabItem("File2", interactive=True):
            gr.File(label="File", interactive=True)
        with gr.TabItem("FileExplorer", interactive=True):
            gr.FileExplorer(label="File Explorer", interactive=True)
        with gr.TabItem("Gallery", interactive=True):
            gr.Gallery(label="Gallery", interactive=True)

        with gr.TabItem("Image", interactive=True):
            gr.Image(label="Highlighted Text", interactive=True)
        with gr.TabItem("HighlightedText", interactive=True):
            gr.HighlightedText(label="Highlighted Text", interactive=True)
        with gr.TabItem("HighlightedText2", interactive=True):
            gr.HighlightedText(label="Highlighted Text", interactive=True)

if __name__ == "__main__":
    demo.launch()
