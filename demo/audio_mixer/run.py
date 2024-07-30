import gradio as gr

with gr.Blocks() as demo:
    track_count = gr.State(1)
    add_track_btn = gr.Button("Add Track")

    add_track_btn.click(lambda count: count + 1, track_count, track_count)

    @gr.render(inputs=track_count)
    def render_tracks(count):
        audios = []
        volumes = []
        with gr.Row():
            for i in range(count):
                with gr.Column(variant="panel", min_width=200):
                    gr.Textbox(placeholder="Track Name", key=f"name-{i}", show_label=False)
                    track_audio = gr.Audio(label=f"Track {i}", key=f"track-{i}")
                    track_volume = gr.Slider(0, 100, value=100, label="Volume", key=f"volume-{i}")
                    audios.append(track_audio)
                    volumes.append(track_volume)

            def merge(data):
                sr, output = None, None
                for audio, volume in zip(audios, volumes):
                    sr, audio_val = data[audio]
                    volume_val = data[volume]
                    final_track = audio_val * (volume_val / 100)
                    if output is None:
                        output = final_track
                    else:
                        min_shape = tuple(min(s1, s2) for s1, s2 in zip(output.shape, final_track.shape))
                        trimmed_output = output[:min_shape[0], ...][:, :min_shape[1], ...] if output.ndim > 1 else output[:min_shape[0]]
                        trimmed_final = final_track[:min_shape[0], ...][:, :min_shape[1], ...] if final_track.ndim > 1 else final_track[:min_shape[0]]
                        output += trimmed_output + trimmed_final
                return (sr, output)

            merge_btn.click(merge, set(audios + volumes), output_audio)

    merge_btn = gr.Button("Merge Tracks")
    output_audio = gr.Audio(label="Output", interactive=False)

if __name__ == "__main__":
    demo.launch()
