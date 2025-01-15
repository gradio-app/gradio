import gradio as gr
import cv2

def get_video_shape(video):
    cap = cv2.VideoCapture(video)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    return {"width": width, "height": height}

def image_mod(image):
    width, height = image.size
    return {"width": width, "height": height}


video = gr.Interface(
    fn=get_video_shape,
    inputs=gr.Video(webcam_constraints={"video": {"width": 800, "height": 600}}, sources="webcam"),
    outputs=gr.JSON()
)

image = gr.Interface(
        image_mod,
        gr.Image(type="pil", webcam_constraints={"video": {"width": 800, "height": 600}}, sources="webcam"),
        gr.Json())

with gr.Blocks() as demo:
    gr.Markdown("""# Webcam Constraints
                The webcam constraints are set to 800x600 with the following syntax:
                ```python
                gr.Video(webcam_constraints={"video": {"width": 800, "height": 600}}, sources="webcam")
                ```
                """)
    with gr.Tabs():
        with gr.Tab("Video"):
            video.render()
        with gr.Tab("Image"):
            image.render()

if __name__ == "__main__":
    demo.launch()