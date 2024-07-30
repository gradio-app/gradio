import gradio as gr

def fn(im):
    return im, "https://picsum.photos/400/300"

demo = gr.Interface(
    fn=fn,
    inputs=gr.Image("https://picsum.photos/300/200", label="InputImage"),
    outputs=[gr.Image(label="Loopback"), gr.Image(label="RemoteImage")],
    examples=[
        ["https://picsum.photos/640/480"]
    ]
)

if __name__ == "__main__":
    demo.launch()
