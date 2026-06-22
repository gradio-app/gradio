import gradio as gr

gr.set_static_paths(paths=["test/test_files/bus.png", "test/test_files/cheetah1.jpg"])


def fn(im):
    return im, "test/test_files/cheetah1.jpg"


demo = gr.Interface(
    fn=fn,
    inputs=gr.Image("test/test_files/bus.png", label="InputImage"),
    outputs=[gr.Image(label="Loopback"), gr.Image(label="RemoteImage")],
    examples=[["test/test_files/bus.png"]],
)

if __name__ == "__main__":
    demo.launch()
