from zipfile import ZipFile

import gradio as gr


def zip_two_files(file1, file2):
    with ZipFile("tmp.zip", "w") as zipObj:
        zipObj.write(file1.name, "file1")
        zipObj.write(file2.name, "file2")
    return "tmp.zip"


demo = gr.Interface(
    zip_two_files,
    ["file", "file"],
    "file",
    examples=[
        ["files/titanic.csv", "files/titanic.csv"],
    ],
)

if __name__ == "__main__":
    demo.launch()
