import gradio as gr
from pathlib import Path

# Get the directory where this script is located
demo_dir = Path(__file__).parent

with gr.Blocks() as demo:
    with gr.Tab("Audio"):
        gr.Markdown("## Audio Playback Position")
        gr.Markdown("Click the button to see the current playback position of the audio.")

        audio = gr.Audio(
            value=str(demo_dir / "sax.wav"),
            playback_position=2.0
        )
        audio_btn = gr.Button("Get Audio Playback Position")
        audio_textbox = gr.Textbox(label="Current Playback Position (seconds)")

        def print_audio_playback_pos(a: gr.Audio):
            return f"Audio playback position: {a.playback_position:.2f} seconds"

        audio_btn.click(print_audio_playback_pos, inputs=audio, outputs=audio_textbox)

        set_audio_time_btn = gr.Button("Set Audio Playback Position to 10 seconds")
        def set_audio_playback_pos():
            return gr.Audio(playback_position=10.0)
        
        set_audio_time_btn.click(set_audio_playback_pos, outputs=audio)

    with gr.Tab("Video"):
        gr.Markdown("## Video Playback Position")
        gr.Markdown("Click the button to see the current playback position of the video.")

        video = gr.Video(
            value=str(demo_dir / "world.mp4"),
            playback_position=5.0
        )
        video_btn = gr.Button("Get Video Playback Position")
        video_textbox = gr.Textbox(label="Current Playback Position (seconds)")

        def print_video_playback_pos(v: gr.Video):
            return f"Video playback position: {v.playback_position:.2f} seconds"

        video_btn.click(print_video_playback_pos, inputs=video, outputs=video_textbox)

        set_video_time_btn = gr.Button("Set Video Playback Position to 8 seconds")
        def set_video_playback_pos():
            return gr.Video(playback_position=8.0)
        
        set_video_time_btn.click(set_video_playback_pos, outputs=video)        

if __name__ == "__main__":
    demo.launch()
