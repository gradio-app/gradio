import math
import os
import time

import gradio as gr

DIR = os.path.dirname(os.path.abspath(__file__))
URDF_FILE = os.path.join(DIR, "files", "simple_arm.urdf")
MJCF_FILE = os.path.join(DIR, "files", "humanoid.xml")

# Joint names for each model
URDF_JOINTS = {
    "shoulder_pan", "shoulder_lift", "elbow",
    "forearm_roll", "wrist", "gripper_rotate",
}
MJCF_JOINTS = {
    "neck", "right_shoulder_x", "right_elbow",
    "left_shoulder_x", "left_elbow", "hip_bend",
    "right_hip_x", "right_knee", "right_ankle",
    "left_hip_x", "left_knee", "left_ankle",
}


def animate(viewer_value):
    if viewer_value is None:
        return gr.skip()

    t = time.time()
    name = os.path.basename(viewer_value) if isinstance(viewer_value, str) else ""

    if name.endswith(".urdf"):
        states = {
            "shoulder_pan": math.sin(t * 0.8) * 1.0,
            "shoulder_lift": math.sin(t * 0.5) * 0.6,
            "elbow": math.cos(t * 0.7) * 1.2,
            "forearm_roll": math.sin(t * 1.2) * 1.5,
            "wrist": math.cos(t * 0.9) * 0.8,
            "gripper_rotate": math.sin(t * 2.0) * 1.0,
        }
    else:
        # Default to humanoid-style animation (works for MJCF)
        states = {
            "neck": math.sin(t * 0.5) * 0.3,
            "right_shoulder_x": math.sin(t) * 0.8,
            "right_elbow": -abs(math.sin(t * 0.8)) * 1.5,
            "left_shoulder_x": math.sin(t + 3.14) * 0.8,
            "left_elbow": -abs(math.sin(t * 0.8 + 3.14)) * 1.5,
            "hip_bend": math.sin(t * 0.3) * 0.2,
            "right_hip_x": math.sin(t * 0.7) * 0.4,
            "right_knee": -abs(math.sin(t * 0.7)) * 1.0,
            "right_ankle": math.sin(t * 0.7) * 0.3,
            "left_hip_x": math.sin(t * 0.7 + 3.14) * 0.4,
            "left_knee": -abs(math.sin(t * 0.7 + 3.14)) * 1.0,
            "left_ankle": math.sin(t * 0.7 + 3.14) * 0.3,
        }

    return gr.RobotViewer(joint_states=states)


with gr.Blocks() as demo:
    gr.Markdown("# Robot Viewer Demo")

    viewer = gr.RobotViewer(
        value=MJCF_FILE,
        label="Robot Viewer",
        height=500,
        interactive=True,
    )

    with gr.Row():
        animate_btn = gr.Button("Animate Joints")
        stop_btn = gr.Button("Stop")

    timer = gr.Timer(0.05, active=False)

    animate_btn.click(lambda: gr.Timer(active=True), outputs=timer)
    stop_btn.click(lambda: gr.Timer(active=False), outputs=timer)
    timer.tick(animate, inputs=viewer, outputs=viewer)

    gr.Examples(
        examples=[MJCF_FILE, URDF_FILE],
        inputs=viewer,
    )

if __name__ == "__main__":
    demo.launch()
