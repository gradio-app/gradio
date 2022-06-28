import os
from zipfile import ZipFile

import gradio as gr


def zip_two_files(file1, file2):
    with ZipFile("tmp.zip", "w") as zipObj:
        zipObj.write(file1.name, "file1")
        zipObj.write(file2.name, "file2")
    return "tmp.zip"


demo = gr.Interface(
    zip_two_files,
    [gr.File(file_count="multiple"), gr.File(file_count="multiple")],
    "file",
    examples=[
        [os.path.join(os.path.dirname(__file__),"files/titanic.csv"), 
         os.path.join(os.path.dirname(__file__),"files/titanic.csv")],
    ],
)

if __name__ == "__main__":
    demo.launch()
