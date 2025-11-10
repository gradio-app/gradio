import gradio as gr

def fake_video_generator(text: str) -> str:
    return "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

demo = gr.Interface(
    fn=fake_video_generator,
    inputs=gr.Textbox(label="Text"),
    outputs=gr.Video(label="Video"),
    api_name="predict",
)

if __name__ == "__main__":
    demo.launch(mcp_server=True, mcp_app=True)