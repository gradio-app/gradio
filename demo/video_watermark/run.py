import gradio as gr
import os

a = os.path.join(os.path.dirname(__file__), "files/a.mp4")  # Video
b = os.path.join(os.path.dirname(__file__), "files/b.mp4")  # Video
w1 = os.path.join(os.path.dirname(__file__), "files/w1.jpg")  # Watermark
w2 = os.path.join(os.path.dirname(__file__), "files/w2.png")  # Watermark

def generate_video(original_video, watermark_file):
    return gr.Video(a, watermark_file=watermark_file)


demo = gr.Interface(generate_video, [gr.Textbox(), gr.File()], gr.Video(),
                    examples=[[a, w1], [b, w2]])

if __name__ == "__main__":
    demo.launch()