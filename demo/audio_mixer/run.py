import gradio as gr

with gr.Blocks() as demo:
    track_count = gr.State(1)
    add_track_btn = gr.Button("Add Track")

    @gr.render(inputs=track_count)
    def render_tracks(count):
        tracks = []
        with gr.Row():
            for i in range(count):
                with gr.Column(variant="panel", scale=0):
                    track_name = gr.Textbox(placeholder="Track Name", key=f"name-{i}", show_label=False)
                    track_audio = gr.Audio(label=f"Track {i}", key=f"track-{i}")
                    track_volume = gr.Slider(0, 1, step=0.01, label="Volume", key=f"volume-{i}")

if __name__ == "__main__":
    demo.launch()