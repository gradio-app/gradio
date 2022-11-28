import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown(
    r"""
    # Hello World! $\frac{\sqrt{x + y}}{4}$ is today's lesson

    ## the $\sqrt{x + y}$ is first

    Start with $\frac{\frac{x+1}{x+2}}{x+3}$ then we get $x+2$
    
    There are three formulas to know:
    
    the first is $\gamma^2 + \theta^2 = \omega^2$
    
    $\sqrt{x^2+1}$ is next
    
    Integral $\int_{a}^{b} x^2 \,dx$ is last

    Start typing below to see the output.
    """)

if __name__ == "__main__":
    demo.launch()