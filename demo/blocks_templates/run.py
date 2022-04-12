import gradio as gr
user_db = {"admin": "admin", "foo": "bar"}


def greet(name):
    return "Hello " + name + "!!"


demo = gr.Interface(fn=greet, inputs=gr.Templates.Textbox(), outputs=gr.Templates.Textbox())
if __name__ == "__main__":
    demo.launch()
