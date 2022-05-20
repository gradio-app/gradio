import gradio as gr

demo = gr.Blocks(css="#btn {color: red}")

with demo:
    num = gr.Variable(value=0)
    squared = gr.Number(value=0)
    btn = gr.Button("Next Square", elem_id="btn").style(rounded=False)

    def increase(var):
        var += 1
        return var, var**2

    btn.click(increase, [num], [num, squared])

if __name__ == "__main__":
    demo.launch()
