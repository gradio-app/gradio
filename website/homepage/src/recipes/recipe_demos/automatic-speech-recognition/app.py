# URL: https://huggingface.co/spaces/gradio/automatic-speech-recognition
# imports
import gradio as gr
import logging
import os
import time
from datetime import datetime
import gradio as gr
import torchaudio
from examples import examples
from model import get_pretrained_model, language_to_models, sample_rate
languages = list(language_to_models.keys())

# define core and helper fns 
def convert_to_wav(in_filename: str) -> str:
    """Convert the input audio file to a wave file"""
    out_filename = in_filename + ".wav"
    logging.info(f"Converting '{in_filename}' to '{out_filename}'")
    _ = os.system(f"ffmpeg -hide_banner -i '{in_filename}' '{out_filename}'")
    return out_filename


def build_html_output(s: str, style: str = "result_item_success"):
    return f"""
    <div class='result'>
        <div class='result_item {style}'>
          {s}
        </div>
    </div>
    """


def process_uploaded_file(
    language: str,
    repo_id: str,
    decoding_method: str,
    num_active_paths: int,
    in_filename: str,
):
    if in_filename is None or in_filename == "":
        return "", build_html_output(
            "Please first upload a file and then click "
            'the button "submit for recognition"',
            "result_item_error",
        )

    logging.info(f"Processing uploaded file: {in_filename}")
    try:
        return process(
            in_filename=in_filename,
            language=language,
            repo_id=repo_id,
            decoding_method=decoding_method,
            num_active_paths=num_active_paths,
        )
    except Exception as e:
        logging.info(str(e))
        return "", build_html_output(str(e), "result_item_error")


def process_microphone(
    language: str,
    repo_id: str,
    decoding_method: str,
    num_active_paths: int,
    in_filename: str,
):
    if in_filename is None or in_filename == "":
        return "", build_html_output(
            "Please first click 'Record from microphone', speak, "
            "click 'Stop recording', and then "
            "click the button 'submit for recognition'",
            "result_item_error",
        )

    logging.info(f"Processing microphone: {in_filename}")
    try:
        return process(
            in_filename=in_filename,
            language=language,
            repo_id=repo_id,
            decoding_method=decoding_method,
            num_active_paths=num_active_paths,
        )
    except Exception as e:
        logging.info(str(e))
        return "", build_html_output(str(e), "result_item_error")


def process(
    language: str,
    repo_id: str,
    decoding_method: str,
    num_active_paths: int,
    in_filename: str,
):
    logging.info(f"language: {language}")
    logging.info(f"repo_id: {repo_id}")
    logging.info(f"decoding_method: {decoding_method}")
    logging.info(f"num_active_paths: {num_active_paths}")
    logging.info(f"in_filename: {in_filename}")

    filename = convert_to_wav(in_filename)

    now = datetime.now()
    date_time = now.strftime("%Y-%m-%d %H:%M:%S.%f")
    logging.info(f"Started at {date_time}")

    start = time.time()
    wave, wave_sample_rate = torchaudio.load(filename)

    if wave_sample_rate != sample_rate:
        logging.info(
            f"Expected sample rate: {sample_rate}. Given: {wave_sample_rate}. "
            f"Resampling to {sample_rate}."
        )

        wave = torchaudio.functional.resample(
            wave,
            orig_freq=wave_sample_rate,
            new_freq=sample_rate,
        )
    wave = wave[0]  # use only the first channel.

    hyp = get_pretrained_model(repo_id).decode_waves(
        [wave],
        decoding_method=decoding_method,
        num_active_paths=num_active_paths,
    )[0]

    date_time = now.strftime("%Y-%m-%d %H:%M:%S.%f")
    end = time.time()

    duration = wave.shape[0] / sample_rate
    rtf = (end - start) / duration

    logging.info(f"Finished at {date_time} s. Elapsed: {end - start: .3f} s")

    info = f"""
    Wave duration  : {duration: .3f} s <br/>
    Processing time: {end - start: .3f} s <br/>
    RTF: {end - start: .3f}/{duration: .3f} = {rtf:.3f} <br/>
    """
    if rtf > 1:
        info += (
            f"<br/>We are loading the model for the first run. "
            "Please run again to measure the real RTF.<br/>"
        )

    logging.info(info)
    logging.info(f"hyp:\n{hyp}")

    return hyp, build_html_output(info)


title = "# Automatic Speech Recognition with Next-gen Kaldi"
description = """
This space shows how to do automatic speech recognition with Next-gen Kaldi.

It is running on CPU within a docker container provided by Hugging Face.

See more information by visiting the following links:

- <https://github.com/k2-fsa/icefall>
- <https://github.com/k2-fsa/sherpa>
- <https://github.com/k2-fsa/k2>
- <https://github.com/lhotse-speech/lhotse>

If you want to deploy it locally, please see
<https://k2-fsa.github.io/sherpa/>
"""

# define css that will override defaults
css = """
.result {display:flex;flex-direction:column}
.result_item {padding:15px;margin-bottom:8px;border-radius:15px;width:100%}
.result_item_success {background-color:mediumaquamarine;color:white;align-self:start}
.result_item_error {background-color:#ff7070;color:white;align-self:start}
"""


def update_model_dropdown(language: str):
    if language in language_to_models:
        choices = language_to_models[language]
        return gr.Dropdown.update(choices=choices, value=choices[0])

    raise ValueError(f"Unsupported language: {language}")


# define block
demo = gr.Blocks(css=css)

# start block
with demo:
    # add text to page
    gr.Markdown(title)
    language_choices = list(language_to_models.keys())

    # define inputs
    language_radio = gr.Radio(
        label="Language",
        choices=language_choices,
        value=language_choices[0],
    )
    model_dropdown = gr.Dropdown(
        choices=language_to_models[language_choices[0]],
        label="Select a model",
        value=language_to_models[language_choices[0]][0],
    )

    # define what will run when radio input is changed
    language_radio.change(
        update_model_dropdown,
        inputs=language_radio,
        outputs=model_dropdown,
    )
    

    decoding_method_radio = gr.Radio(
        label="Decoding method",
        choices=["greedy_search", "modified_beam_search"],
        value="greedy_search",
    )

    num_active_paths_slider = gr.Slider(
        minimum=1,
        value=4,
        step=1,
        label="Number of active paths for modified_beam_search",
    )

    # define layout (two tabs)
    with gr.Tabs():
        with gr.TabItem("Upload from disk"):
            uploaded_file = gr.Audio(
                source="upload",  # Choose between "microphone", "upload"
                type="filepath",
                optional=False,
                label="Upload from disk",
            )
            upload_button = gr.Button("Submit for recognition")
            uploaded_output = gr.Textbox(label="Recognized speech from uploaded file")
            uploaded_html_info = gr.HTML(label="Info")

            gr.Examples(
                examples=examples,
                inputs=[
                    language_radio,
                    model_dropdown,
                    decoding_method_radio,
                    num_active_paths_slider,
                    uploaded_file,
                ],
                outputs=[uploaded_output, uploaded_html_info],
                fn=process_uploaded_file,
            )

        with gr.TabItem("Record from microphone"):
            microphone = gr.Audio(
                source="microphone",  # Choose between "microphone", "upload"
                type="filepath",
                optional=False,
                label="Record from microphone",
            )

            record_button = gr.Button("Submit for recognition")
            recorded_output = gr.Textbox(label="Recognized speech from recordings")
            recorded_html_info = gr.HTML(label="Info")

            gr.Examples(
                examples=examples,
                inputs=[
                    language_radio,
                    model_dropdown,
                    decoding_method_radio,
                    num_active_paths_slider,
                    microphone,
                ],
                outputs=[recorded_output, recorded_html_info],
                fn=process_microphone,
            )

        upload_button.click(
            process_uploaded_file,
            inputs=[
                language_radio,
                model_dropdown,
                decoding_method_radio,
                num_active_paths_slider,
                uploaded_file,
            ],
            outputs=[uploaded_output, uploaded_html_info],
        )

        record_button.click(
            process_microphone,
            inputs=[
                language_radio,
                model_dropdown,
                decoding_method_radio,
                num_active_paths_slider,
                microphone,
            ],
            outputs=[recorded_output, recorded_html_info],
        )
    gr.Markdown(description)

formatter = "%(asctime)s %(levelname)s [%(filename)s:%(lineno)d] %(message)s"

logging.basicConfig(format=formatter, level=logging.INFO)

# launch
demo.launch()
