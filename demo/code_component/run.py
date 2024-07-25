import gradio as gr

demo = gr.Interface(
    lambda x: x,
    gr.Code(language="python"),
    gr.Code(language="python"),
    examples=[[("/Users/freddy/sources/gradio/demo/code_component/run.py",)],
               ["print('Hello, World!')"],
               [("/Users/freddy/sources/gradio/demo/code/run.py", )]]
)

if __name__ == "__main__":
    demo.launch()
