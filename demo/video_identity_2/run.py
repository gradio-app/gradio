import gradio as gr

def video_identity(video):
    return video

demo = gr.Interface(video_identity,
                    gr.Video(),
                    "playable_video",
                    api_name="predict"
                    )

if __name__ == "__main__":
    demo.launch()
