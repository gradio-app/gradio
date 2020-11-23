# Demo: (Image) -> (Image)

import gradio as gr

def detect(image):
    # return image
    return (image, [("sign", 210, 80, 280, 150), ("train", 100, 100, 180, 150)])


iface = gr.Interface(detect, 
             gr.inputs.Image(type="pil"), 
            #  "image", 
             "segmented_image", 
             examples=[
                 ["images/stop_1.jpg"],
                 ["images/stop_2.jpg"],
             ])

iface.test_launch()

if __name__ == "__main__":
    iface.launch()
