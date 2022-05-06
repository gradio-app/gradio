import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

import gradio as gr


def plot(v, a):
    g = 9.81
    theta = a / 180 * 3.14
    tmax = ((2 * v) * np.sin(theta)) / g
    timemat = tmax * np.linspace(0, 1, 40)[:, None]

    x = (v * timemat) * np.cos(theta)
    y = ((v * timemat) * np.sin(theta)) - ((0.5 * g) * (timemat**2))

    fig = plt.figure()
    plt.scatter(x=x, y=y, marker=".")
    plt.xlim(0, 100)
    plt.ylim(0, 60)
    return fig


demo = gr.Blocks()

with demo:
    gr.Markdown(
        "Let's do some kinematics! Choose the speed and angle to see the trajectory."
    )

    with gr.Row():
        speed = gr.Slider(25, min=1, max=30, label="Speed")
        angle = gr.Slider(45, min=0, max=90, label="Angle")
    output = gr.Image(type="plot")
    btn = gr.Button("Run")
    btn.click(plot, [speed, angle], output)

if __name__ == "__main__":
    demo.launch()
