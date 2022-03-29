from zipfile import ZipFile

import gradio as gr


def zip_to_json(file_obj):
    files = []
    with ZipFile(file_obj.name) as zfile:
        for zinfo in zfile.infolist():
            files.append(
                {
                    "name": zinfo.filename,
                    "file_size": zinfo.file_size,
                    "compressed_size": zinfo.compress_size,
                }
            )
    return files


demo = gr.Interface(zip_to_json, "file", "json")

if __name__ == "__main__":
    demo.launch()
