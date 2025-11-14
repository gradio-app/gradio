import gradio as gr
from gradio.media import get_image, get_audio, get_video, MEDIA_PATHS


with gr.Blocks() as demo:
    set_button = gr.Button("Set Values")
    counter = gr.Number(label="Change counter")
    with gr.Row():
        gr.Markdown("# Enter Here")
        gr.Markdown("# ON:INPUT/UPLOAD")
        gr.Markdown("# ON:CHANGE")
        gr.Markdown("# ON:CHANGE x2")
    # with gr.Row():
    #     text = gr.Textbox()
    #     text_in = gr.Textbox()
    #     text_ch = gr.Textbox()
    #     text_ch2 = gr.Textbox()
    # with gr.Row():
    #     num = gr.Number()
    #     num_in = gr.Number()
    #     num_ch = gr.Number()
    #     num_ch2 = gr.Number()
    # with gr.Row():
    #     slider = gr.Slider()
    #     slider_in = gr.Slider()
    #     slider_ch = gr.Slider()
    #     slider_ch2 = gr.Slider()
    # with gr.Row():
    #     checkbox = gr.Checkbox()
    #     checkbox_in = gr.Checkbox()
    #     checkbox_ch = gr.Checkbox()
    #     checkbox_ch2 = gr.Checkbox()
    # with gr.Row():
    #     checkbox_group = gr.CheckboxGroup(["a", "b", "c"])
    #     checkbox_group_in = gr.CheckboxGroup(["a", "b", "c"])
    #     checkbox_group_ch = gr.CheckboxGroup(["a", "b", "c"])
    #     checkbox_group_ch2 = gr.CheckboxGroup(["a", "b", "c"])
    # with gr.Row():
    #     radio = gr.Radio(["a", "b", "c"])
    #     radio_in = gr.Radio(["a", "b", "c"])
    #     radio_ch = gr.Radio(["a", "b", "c"])
    #     radio_ch2 = gr.Radio(["a", "b", "c"])
    # with gr.Row():
    #     dropdown = gr.Dropdown(["a", "b", "c"])
    #     dropdown_in = gr.Dropdown(["a", "b", "c"])
    #     dropdown_ch = gr.Dropdown(["a", "b", "c"])
    #     dropdown_ch2 = gr.Dropdown(["a", "b", "c"])
    # with gr.Row():
    #     colorpicker = gr.ColorPicker()
    #     colorpicker_in = gr.ColorPicker()
    #     colorpicker_ch = gr.ColorPicker()
    #     colorpicker_ch2 = gr.ColorPicker()
    with gr.Row():
        code = gr.Code()
        code_in = gr.Code()
        code_ch = gr.Code()
        code_ch2 = gr.Code()
    # with gr.Row():
    #     dataframe = gr.Dataframe()
    #     dataframe_in = gr.Dataframe()
    #     dataframe_ch = gr.Dataframe()
    #     dataframe_ch2 = gr.Dataframe()
    # with gr.Row():
    #     image = gr.Image(elem_id="image-original")
    #     image_up = gr.Image(elem_id="image-upload")
    #     image_ch = gr.Image(elem_id="image-change")
    #     image_ch2 = gr.Image(elem_id="image-change-2")
    # with gr.Row():
    #     audio = gr.Audio(elem_id="audio-original")
    #     audio_up = gr.Audio(elem_id="audio-upload")
    #     audio_ch = gr.Audio(elem_id="audio-change")
    #     audio_ch2 = gr.Audio(elem_id="audio-change-2")
    # with gr.Row():
    #     video = gr.Video(elem_id="video-original")
    #     video_up = gr.Video(elem_id="video-upload")
    #     video_ch = gr.Video(elem_id="video-change")
    #     video_ch2 = gr.Video(elem_id="video-change-2")

    lion = get_image("lion.jpg")
    cantina = get_audio("cantina.wav")
    world = get_video("world.mp4")

    set_button.click(
        lambda: [
            "asdf",
            555,
            12,
            True,
            ["a", "c"],
            "b",
            "b",
            "#FF0000",
            "import gradio as gr",
            [["a", "b", "c", "d"], ["1", "2", "3", "4"]],
            lion,
            cantina,
            world,
        ],
        None,
        [
            text,
            num,
            slider,
            checkbox,
            checkbox_group,
            radio,
            dropdown,
            colorpicker,
            code,
            dataframe,
            image,
            audio,
            video,
        ],
    )

    text.input(lambda x: x, text, text_in)
    num.input(lambda x: x, num, num_in)
    slider.input(lambda x: x, slider, slider_in)
    checkbox.input(lambda x: x, checkbox, checkbox_in)
    checkbox_group.input(lambda x: x, checkbox_group, checkbox_group_in)
    radio.input(lambda x: x, radio, radio_in)
    dropdown.input(lambda x: x, dropdown, dropdown_in)
    colorpicker.input(lambda x: x, colorpicker, colorpicker_in)
    code.input(lambda x: x, code, code_in)
    dataframe.input(lambda x: x, dataframe, dataframe_in)
    image.upload(lambda x: x, image, image_up)
    audio.upload(lambda x: x, audio, audio_up)
    video.upload(lambda x: x, video, video_up)

    text.change(lambda x, y: (x, y + 1), [text, counter], [text_ch, counter])
    num.change(lambda x, y: (x, y + 1), [num, counter], [num_ch, counter])
    slider.change(lambda x, y: (x, y + 1), [slider, counter], [slider_ch, counter])
    checkbox.change(
        lambda x, y: (x, y + 1), [checkbox, counter], [checkbox_ch, counter]
    )
    checkbox_group.change(
        lambda x, y: (x, y + 1), [checkbox_group, counter], [checkbox_group_ch, counter]
    )
    radio.change(lambda x, y: (x, y + 1), [radio, counter], [radio_ch, counter])
    dropdown.change(
        lambda x, y: (x, y + 1), [dropdown, counter], [dropdown_ch, counter]
    )
    colorpicker.change(
        lambda x, y: (x, y + 1), [colorpicker, counter], [colorpicker_ch, counter]
    )
    code.change(lambda x, y: (x, y + 1), [code, counter], [code_ch, counter])
    dataframe.change(
        lambda x, y: (x, y + 1), [dataframe, counter], [dataframe_ch, counter]
    )
    image.change(lambda x, y: (x, y + 1), [image, counter], [image_ch, counter])
    audio.change(lambda x, y: (x, y + 1), [audio, counter], [audio_ch, counter])
    video.change(lambda x, y: (x, y + 1), [video, counter], [video_ch, counter])

    text_ch.change(lambda x: x, text_ch, text_ch2)
    num_ch.change(lambda x: x, num_ch, num_ch2)
    slider_ch.change(lambda x: x, slider_ch, slider_ch2)
    checkbox_ch.change(lambda x: x, checkbox_ch, checkbox_ch2)
    checkbox_group_ch.change(lambda x: x, checkbox_group_ch, checkbox_group_ch2)
    radio_ch.change(lambda x: x, radio_ch, radio_ch2)
    dropdown_ch.change(lambda x: x, dropdown_ch, dropdown_ch2)
    colorpicker_ch.change(lambda x: x, colorpicker_ch, colorpicker_ch2)
    code_ch.change(lambda x: x, code_ch, code_ch2)
    dataframe_ch.change(lambda x: x, dataframe_ch, dataframe_ch2)
    image_ch.change(lambda x: x, image_ch, image_ch2)
    audio_ch.change(lambda x: x, audio_ch, audio_ch2)
    video_ch.change(lambda x: x, video_ch, video_ch2)

if __name__ == "__main__":
    demo.launch(allowed_paths=MEDIA_PATHS)
