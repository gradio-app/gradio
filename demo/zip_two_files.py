# Demo: (File, File) -> (File)

import gradio as gr
from zipfile import ZipFile

def zip_two_files(file1, file2):
    with ZipFile('tmp.zip', 'w') as zipObj:
        zipObj.write(file1.name, "file1")
        zipObj.write(file2.name, "file2")
    return "tmp.zip"

gr.Interface(zip_two_files, ["file", "file"], "file").launch()