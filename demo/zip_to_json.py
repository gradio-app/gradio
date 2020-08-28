import gradio as gr
from zipfile import ZipFile


def zip_to_json(file_obj):
    files = []
    with ZipFile(file_obj.name) as zfile:
        for zinfo in zfile.infolist():
            files.append({
                "name": zinfo.filename,
                "file_size": zinfo.file_size,
                "compressed_size": zinfo.compress_size,
            })
    return files


io = gr.Interface(zip_to_json, "file", "json")

io.test_launch()
io.launch()
