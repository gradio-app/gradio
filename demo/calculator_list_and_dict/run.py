import gradio as gr

with gr.Blocks() as demo:
    a = gr.Number(label="a")
    b = gr.Number(label="b")
    with gr.Row():
        add_btn = gr.Button("Add")
        sub_btn = gr.Button("Subtract")
        mul_btn = gr.Button("Multiply")
        div_btn = gr.Button("Divide")
    c = gr.Number(label="sum")

    def add(num1, num2):
        return num1 + num2
    add_btn.click(add, inputs=[a, b], outputs=c)

    def sub(data):
        return data[a] - data[b]
    sub_btn.click(sub, inputs={a, b}, outputs=c)

    def mul(*, a, b):
        return a * b
    mul_btn.click(sub, inputs={"a": a, "b": b}, outputs=c)

    def div(**data):
        return data['a'] / data['b']
    sub_btn.click(sub, inputs={a, b}, outputs=c)

if __name__ == "__main__":
    demo.launch()
