import gradio as gr


def func(how_many):
    x = (
        "We believe people shouldn't care about privacy. Not because it doesn't matter, but because it shouldn't be an issue! From data breaches and surveillance of cloud applications, to blockchain smart contracts where everything is public, doing things privately online is becoming increasingly complicated. The only way to solve this is to make everything encrypted end-to-end, regardless of where the application is running. And the only way this can happen is if homomorphic encryption becomes mainstream."
        * int(how_many)
    )
    return 42, x


demo = gr.Blocks()

with demo:
    gr.Markdown("Hey.")
    n = gr.Number(label="Answer to the universal question:", value=0, interactive=False)
    x = gr.Textbox(label="Random text", max_lines=2, interactive=False)
    how_many = gr.Number(label="Small: no bug, Large (eg, 20000): well", value=2)
    btn = gr.Button(value="Please press")
    btn.click(func, inputs=[how_many], outputs=[n, x])

if __name__ == "__main__":
    demo.launch(debug=True)