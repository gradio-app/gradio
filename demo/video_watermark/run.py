import gradio as gr
import os

a = os.path.join(os.path.dirname(__file__), "files/a.mp4")
b = os.path.join(os.path.dirname(__file__), "files/b.mp4")
w1 = os.path.join(os.path.dirname(__file__), "files/w1.jpg")
w2 = os.path.join(os.path.dirname(__file__), "files/w2.png")

def generate_video(original_video, watermark):
    return gr.Video(original_video, watermark=watermark)


demo = gr.Interface(generate_video, [gr.Video(), gr.File()], gr.Video(),
                    examples=[[a, w1], [b, w2]])

if __name__ == "__main__":
    demo.launch()
