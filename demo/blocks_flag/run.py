import numpy as np
import gradio as gr

def sepia(input_img, strength):
    sepia_filter = strength * np.array(
        [[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]]
    ) + (1-strength) * np.identity(3)
    sepia_img = input_img.dot(sepia_filter.T)
    sepia_img /= sepia_img.max()
    return sepia_img

callback = gr.CSVLogger()

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            img_input = gr.Image()
            strength = gr.Slider(0, 1, 0.5)
        img_output = gr.Image()
    with gr.Row():
        btn = gr.Button("Flag")
        
    # This needs to be called at some point prior to the first call to callback.flag()
    callback.setup([img_input, strength, img_output], "flagged_data_points")

    img_input.change(sepia, [img_input, strength], img_output)
    strength.change(sepia, [img_input, strength], img_output)
    
    # We can choose which components to flag -- in this case, we'll flag all of them
    btn.click(lambda *args: callback.flag(args), [img_input, strength, img_output], None, _preprocess=False)

if __name__ == "__main__":
    demo.launch()
