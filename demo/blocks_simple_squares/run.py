import gradio as gr

demo = gr.Blocks()

with demo:
    num = gr.Variable(default_value=0)
    squared = gr.Number(default_value=0)
    btn = gr.Button("Next Square")

    def increase(var):
        var += 1
        return var, var**2

    btn.click(increase, [num], [num, squared])

if __name__ == "__main__":
    demo.launch()
