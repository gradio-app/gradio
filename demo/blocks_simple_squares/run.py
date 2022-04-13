import gradio as gr

test = gr.Blocks()

with test:
    num = gr.Variable(default_value=0)
    squared = gr.Number(default_value=0)
    btn = gr.Button("Next Square")

    def increase(var):
        var += 1
        return var, var**2

    btn.click(increase, [num], [num, squared])

test.launch()
