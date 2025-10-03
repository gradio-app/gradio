from zipfile import ZipFile

import gradio as gr

def zip_files(files):
    with ZipFile("tmp.zip", "w") as zip_obj:
        for file in files:
            zip_obj.write(file.name, file.name.split("/")[-1])
    return "tmp.zip"

demo = gr.Interface(
    zip_files,
    gr.File(file_count="multiple", file_types=["text", ".json", ".csv"]),
    "file",
    examples=[[[gr.get_file("titanic.csv"),
    gr.get_file("titanic.csv"),
    gr.get_file("titanic.csv")]]],
    cache_examples=True
)

if __name__ == "__main__":
    demo.launch()
