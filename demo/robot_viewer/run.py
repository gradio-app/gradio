import math
import time

import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# Robot Viewer Demo")
    gr.Markdown(
        "Upload a URDF or MJCF file to visualize an articulated robot. "
        "Click **Animate Joints** to see streaming joint updates."
    )

    viewer = gr.RobotViewer(
        label="Robot Viewer",
        height=500,
        interactive=True,
    )

    animate_btn = gr.Button("Animate Joints")
    stop_btn = gr.Button("Stop Animation")
    timer = gr.Timer(0.05, active=False)

    def start_animation():
        return gr.Timer(active=True)

    def stop_animation():
        return gr.Timer(active=False)

    def animate():
        t = time.time()
        return gr.RobotViewer(
            joint_states={
                "joint1": math.sin(t),
                "joint2": math.cos(t) * 0.5,
                "joint3": math.sin(t * 2) * 0.3,
                "joint4": math.cos(t * 1.5) * 0.7,
            }
        )

    animate_btn.click(start_animation, outputs=timer)
    stop_btn.click(stop_animation, outputs=timer)
    timer.tick(animate, outputs=viewer)

if __name__ == "__main__":
    demo.launch()
