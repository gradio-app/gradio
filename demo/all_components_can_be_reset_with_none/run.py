import gradio as gr
import inspect

classes_to_check = gr.components.IOComponent.__subclasses__()
io_components = []

while classes_to_check:
    subclass = classes_to_check.pop()
    children = subclass.__subclasses__()

    if children:
        classes_to_check.extend(children)
    if "value" in inspect.signature(subclass).parameters:
        io_components.append(subclass)


io_components = [c() for c in io_components if (c is not gr.Variable) and (c is not gr.Chatbot)]

with gr.Blocks() as demo:
    for component in io_components:
        component.render()
    reset = gr.Button(value="Reset")
    reset.click(lambda: [gr.update(value=None) for _ in io_components], inputs=[], outputs=io_components)


if __name__ == "__main__":
    demo.launch()