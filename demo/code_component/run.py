import gradio as gr

demo = gr.Interface(
    lambda x: x,
    gr.Code(language="python"),
    gr.Code(language="python"),
    examples=[
        ["print('Hello, World!')"],
        ["def add(a, b):\n    return a + b"],
        ["for i in range(3):\n    print(i)"],
    ],
)

if __name__ == "__main__":
    demo.launch()
