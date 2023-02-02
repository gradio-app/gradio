# %%
import gradio as gr


TEST_VIDEO_A = "mp4/a.mp4"
TEST_VIDEO_B = "mp4/b.mp4"

TEST_IMAGE_A = "img/a.jpg"
TEST_IMAGE_B = "img/b.jpg"


def alert_change(component, value):
    print(f"Detected {component} change, {type(value)}")

    if type(value) == list or type(value) == str:
        print(value)


def change_interactive(state):
    return gr.update(interactive=not state), not state


with gr.Blocks() as demo:
    with gr.Tab(label="Text change"):
        with gr.Row():
            with gr.Column():
                textbox1 = gr.Textbox()
                textbox2 = gr.Textbox(interactive=True)

            with gr.Column():
                btn = gr.Button()

        def btn_click(state):
            return state

        def text_change(value):
            print("text_change", value)

        btn.click(fn=btn_click, inputs=textbox1, outputs=textbox2)
        textbox2.change(fn=alert_change, inputs=[gr.State("Text"), textbox2])

    with gr.Tab(label="Video change, play, pause"):
        with gr.Row():
            with gr.Column():
                radio1 = gr.Radio(
                    choices=[TEST_VIDEO_A, TEST_VIDEO_B],
                    interactive=True,
                    type="index",
                )

                video_btn = gr.Button("Change interactive")

            with gr.Column():
                video1 = gr.Video(value=TEST_VIDEO_A, interactive=False)
                video1_interactive = gr.State(value=False)

        def change_video(index):
            if index == 0:
                return TEST_VIDEO_A
            elif index == 1:
                return TEST_VIDEO_B

        def video_play():
            print("video_play")

        def video_pause():
            print("video_pause")

        def video_stop():
            print("video_stop")

        video1.play(fn=video_play)
        video1.pause(fn=video_pause)
        video1.stop(fn=video_stop)

        radio1.change(fn=change_video, inputs=radio1, outputs=video1)
        video1.change(fn=alert_change, inputs=[gr.State("Video"), video1])

        video_btn.click(
            fn=change_interactive,
            inputs=video1_interactive,
            outputs=[video1, video1_interactive],
        )

    with gr.Tab(label="Image change"):
        with gr.Row():
            with gr.Column():
                radio2 = gr.Radio(
                    choices=[TEST_IMAGE_A, TEST_IMAGE_B],
                    interactive=True,
                    type="index",
                )

            with gr.Column():
                image1 = gr.Image(value=TEST_IMAGE_A, interactive=True)

        def change_image(index):
            if index == 0:
                return TEST_IMAGE_A
            elif index == 1:
                return TEST_IMAGE_B

        radio2.change(fn=change_image, inputs=radio2, outputs=image1)
        image1.change(fn=alert_change, inputs=[gr.State("Image"), image1])

    with gr.Tab(label="File"):
        with gr.Row():
            with gr.Column():
                radio3 = gr.Radio(
                    choices=["A", "B", "AB"],
                    interactive=True,
                    type="index",
                )

                file_btn = gr.Button("Change interactive")

            with gr.Column():
                file1 = gr.File(
                    value=[TEST_IMAGE_A, TEST_IMAGE_B],
                    interactive=False,
                    file_count="multiple",
                )
                file1_interactive = gr.State(value=False)

        def change_file(index):
            if index == 0:
                return [TEST_IMAGE_A]
            elif index == 1:
                return [TEST_IMAGE_A]
            elif index == 2:
                return [TEST_IMAGE_A, TEST_IMAGE_B]

        radio3.change(fn=change_file, inputs=radio3, outputs=file1)
        file1.change(fn=alert_change, inputs=[gr.State("File"), file1])

        file_btn.click(
            fn=change_interactive,
            inputs=file1_interactive,
            outputs=[file1, file1_interactive],
        )

demo.launch()
