import gradio as gr

user_db = {"admin": "admin", "foo": "bar"}


def greet(name):
    return "Hello " + name + "!!"


demo = gr.Interface(fn=greet, inputs="text", outputs="text")
if __name__ == "__main__":
    demo.launch(auth=lambda u, p: user_db.get(u) == p)
