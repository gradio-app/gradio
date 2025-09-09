# import gradio as gr
# import subprocess
# import cv2
# import os
# import tempfile
# import mutagen
# from mutagen.id3 import ID3, APIC
# import numpy as np

# def pick_thumbnail_frames(video_path, num_thumbnails):
#     cap = cv2.VideoCapture(video_path)
#     frames = []
#     frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
#     if frame_count <= 0:
#         cap.release()
#         return frames

#     count = int(num_thumbnails)
#     indices = np.linspace(0, frame_count - 1, count, dtype=int)
#     for idx in indices:
#         cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
#         ret, frame = cap.read()
#         if not ret:
#             continue
#         frames.append(frame)
#         if len(frames) >= count:
#             break

#     cap.release()
#     return frames


# def extract_audio_and_add_thumbnail(video, thumbnail):
#     temp_dir = tempfile.mkdtemp(prefix="gradio_thumb_")
#     output_mp3 = os.path.join(temp_dir, "output.mp3")

#     subprocess.run([
#         "ffmpeg",
#         "-i", video,
#         "-vn",          # no video
#         "-acodec", "mp3",
#         output_mp3
#     ], check=True)

#     if isinstance(thumbnail, str) and os.path.exists(thumbnail):
#         img = cv2.imread(thumbnail)
#         if img is not None:
#             success, buffer = cv2.imencode('.jpg', img)
#             if success:
#                 image_bytes = buffer.tobytes()
#                 audio = mutagen.File(output_mp3)
#                 if audio is None:
#                     audio = ID3()
#                 if not isinstance(audio, ID3):
#                     try:
#                         audio = ID3(output_mp3)
#                     except Exception:
#                         audio = ID3()
#                 audio.add(APIC(encoding=3, mime='image/jpeg', type=3, desc='Cover', data=image_bytes))
#                 audio.save(output_mp3)

#     return output_mp3, output_mp3

# def select_image(evt: gr.SelectData):
#     return evt.value

# with gr.Blocks() as demo:
#     with gr.Walkthrough(selected=0) as walkthrough:
#         with gr.Step("Upload a Video", id=0):
#             video = gr.Video(height=300)
#             num_thumbnails = gr.Number(value=5, label="Number of candidate thumbnails")
#             next_button = gr.Button("Next", variant="primary", interactive=False)
#             video.upload(lambda: gr.Button(interactive=True), outputs=[next_button])
#         with gr.Step("Select a thumbnail", id=1):
#             gr.Markdown("## Select the thumbnail you want to use for the audio")
#             selected_image = gr.State()
#             thumbnail_candidates = gr.Gallery(preview=True)
#             generate_audio_button = gr.Button("Generate audio", variant="primary")
#             thumbnail_candidates.select(select_image, outputs=selected_image)
#             generate_audio_button.click(lambda: gr.Walkthrough(selected=2), outputs=walkthrough)
#         with gr.Step("Download Audio", id=2):
#             audio = gr.Audio()
#             download_audio_file = gr.File()

#     next_button.click(lambda: gr.Walkthrough(selected=1), outputs=walkthrough).then(
#         pick_thumbnail_frames, inputs=[video, num_thumbnails], outputs=[thumbnail_candidates]
#     )

#     generate_audio_button.click(
#         extract_audio_and_add_thumbnail,
#         inputs=[video, selected_image],
#         outputs=[audio, download_audio_file],
#     )

# if __name__ == "__main__":
#     demo.launch()


import gradio as gr

with gr.Blocks() as demo:
    with gr.Walkthrough(selected=0) as walkthrough:
        with gr.Step("Upload a Video", id=0):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=1), outputs=walkthrough
            )
            pass
        with gr.Step("Select a thumbnail", id=1):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=2), outputs=walkthrough
            )
            pass
        with gr.Step("Download Audio", id=2):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=3), outputs=walkthrough
            )
            pass
        with gr.Step("Upload a Video", id=3):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=4), outputs=walkthrough
            )
            pass
        with gr.Step("Select a thumbnail", id=4):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=5), outputs=walkthrough
            )
            pass
        with gr.Step("Download Audio", id=5):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=6), outputs=walkthrough
            )
            pass
        with gr.Step("Download Audio", id=6):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=7), outputs=walkthrough
            )
            pass
        with gr.Step("Download Audio", id=7):
            gr.Button("Next").click(
                lambda: gr.Walkthrough(selected=8), outputs=walkthrough
            )
            pass
        with gr.Step("Download Audio", id=8):
            pass


if __name__ == "__main__":
    demo.launch()
