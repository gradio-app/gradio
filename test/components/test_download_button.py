import gradio as gr


def test_download_button_sets_origname():
    value = gr.DownloadButton().postprocess("/home/image.png")
    assert value.orig_name == "image.png"  # type: ignore
