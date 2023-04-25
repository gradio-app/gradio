import gradio as gr


def create_demo():
    # demo = gr.Interface(
    #     lambda x: x,
    #     gr.Image(type="filepath"),
    #     "image",
    # )

    demo = gr.Interface(
        lambda x: x.name,
        "file",
        "file",
    )

    return demo


demo = create_demo()
if __name__ == "__main__":
    try:
        demo.launch()
    finally:
        demo.deconstruct()
