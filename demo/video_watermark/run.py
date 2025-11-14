import gradio as gr


a = gr.get_video("a.mp4")
b = gr.get_video("b.mp4")
w1 = gr.get_image("logo.png")
w2 = gr.get_image("bus.png")

def generate_video(original_video, watermark, position):
    return gr.Video(original_video, watermark=gr.WatermarkOptions(watermark=watermark, position=position))


demo = gr.Interface(generate_video, [gr.Video(), gr.File(), gr.Dropdown(["top-left", "top-right", "bottom-left", "bottom-right"], label="Position")], gr.Video(),
                    examples=[[a, w1, "top-left"], [b, w2, "bottom-right"]], api_name="predict")

if __name__ == "__main__":
    demo.launch()
