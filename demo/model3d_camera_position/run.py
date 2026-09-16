import gradio as gr
import matplotlib.pyplot as plt
import numpy as np
from gradio.media import get_model3d

MODEL = get_model3d("Bunny.obj")
# Babylon is Y-up, matplotlib is Z-up, so swap the last two axes on the way in.
POINTS = np.array(
    [[float(n) for n in ln.split()[1:4]] for ln in open(MODEL) if ln.startswith("v ")]
)[:, [0, 2, 1]]


def snapshot(viewer: gr.Model3D):
    alpha, beta, radius = viewer.camera_position
    fig = plt.figure(figsize=(4, 4))
    ax = fig.add_subplot(projection="3d")
    ax.scatter(*POINTS.T, s=1, c=POINTS[:, 2], cmap="viridis")
    # The viewer is right-handed, so its alpha runs opposite matplotlib's azimuth.
    ax.view_init(elev=90 - beta, azim=-alpha)
    center, half = POINTS.mean(axis=0), radius / 4
    ax.set(
        xlim=(center[0] - half, center[0] + half),
        ylim=(center[1] - half, center[1] + half),
        zlim=(center[2] - half, center[2] + half),
    )
    ax.set_box_aspect(None, zoom=1.4)
    ax.set_axis_off()
    fig.canvas.draw()
    return np.asarray(fig.canvas.buffer_rgba())


demo = gr.Interface(
    snapshot,
    gr.Model3D(
        MODEL,
        camera_position=(90, 60, 0.4),
        interactive=False,
        label="Orbit and zoom me",
    ),
    gr.Image(label="Snapshot from your viewpoint"),
    description="Orbit the model, then hit Submit to photograph it from the view you are looking at.",
    clear_btn=None,
    flagging_mode="never",
)

if __name__ == "__main__":
    demo.launch()
