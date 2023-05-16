import gradio as gr

with gr.Blocks() as demo:
    set_button = gr.Button("Set Values")
    with gr.Row():
        with gr.Column():
            gr.Markdown("# Enter Here")
            text = gr.Textbox()
            num = gr.Number()
            slider = gr.Slider()
            checkbox = gr.Checkbox()
            checkbox_group = gr.CheckboxGroup(["a", "b", "c"])
            radio = gr.Radio(["a", "b", "c"])
            dropdown = gr.Dropdown(["a", "b", "c"])
            colorpicker = gr.ColorPicker()
            code = gr.Code()
            dataframe = gr.Dataframe()

        with gr.Column():
            gr.Markdown("# ON:INPUT")
            text_in = gr.Textbox()
            num_in = gr.Number()
            slider_in = gr.Slider()
            checkbox_in = gr.Checkbox()
            checkbox_group_in = gr.CheckboxGroup(["a", "b", "c"])
            radio_in = gr.Radio(["a", "b", "c"])
            dropdown_in = gr.Dropdown(["a", "b", "c"])
            colorpicker_in = gr.ColorPicker()
            code_in = gr.Code()
            dataframe_in = gr.Dataframe()

        with gr.Column():
            gr.Markdown("# ON:CHANGE")
            text_ch = gr.Textbox()
            num_ch = gr.Number()
            slider_ch = gr.Slider()
            checkbox_ch = gr.Checkbox()
            checkbox_group_ch = gr.CheckboxGroup(["a", "b", "c"])
            radio_ch = gr.Radio(["a", "b", "c"])
            dropdown_ch = gr.Dropdown(["a", "b", "c"])
            colorpicker_ch = gr.ColorPicker()
            code_ch = gr.Code()
            dataframe_ch = gr.Dataframe()

        set_button.click(
            lambda: ["asdf", 555, 12, True, ["a", "c"], "b", "b", "#FF0000", "import gradio as gr", [["a", "b", "c", "d"], ["1", "2", "3", "4"]]], 
            None, 
            [text, num, slider, checkbox, checkbox_group, radio, dropdown, colorpicker, code, dataframe])

        text.input(lambda x:x, text, text_in)
        num.input(lambda x:x, num, num_in)
        slider.input(lambda x:x, slider, slider_in)
        checkbox.input(lambda x:x, checkbox, checkbox_in)
        checkbox_group.input(lambda x:x, checkbox_group, checkbox_group_in)
        radio.input(lambda x:x, radio, radio_in)
        dropdown.input(lambda x:x, dropdown, dropdown_in)
        colorpicker.input(lambda x:x, colorpicker, colorpicker_in)
        code.input(lambda x:x, code, code_in)
        dataframe.input(lambda x:x, dataframe, dataframe_in)

        text.change(lambda x:x, text, text_ch)
        num.change(lambda x:x, num, num_ch)
        slider.change(lambda x:x, slider, slider_ch)
        checkbox.change(lambda x:x, checkbox, checkbox_ch)
        checkbox_group.change(lambda x:x, checkbox_group, checkbox_group_ch)
        radio.change(lambda x:x, radio, radio_ch)
        dropdown.change(lambda x:x, dropdown, dropdown_ch)
        colorpicker.change(lambda x:x, colorpicker, colorpicker_ch)
        code.change(lambda x:x, code, code_ch)
        dataframe.change(lambda x:x, dataframe, dataframe_ch)

if __name__ == "__main__":
    demo.launch()