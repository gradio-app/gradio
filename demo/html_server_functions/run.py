import os

import gradio as gr


def list_files(path):
    try:
        return os.listdir(path)
    except (FileNotFoundError, PermissionError) as e:
        return [f"Error: {e}"]


with gr.Blocks() as demo:
    gr.Markdown(
        "# Server Functions Demo\nClick 'Load Files' to list files in the directory."
    )
    filetree = gr.HTML(
        value=os.path.dirname(__file__),
        html_template="""
            <div>
                <p>Directory: <strong>${value}</strong></p>
                <div class='tree'></div>
                <button class='load-btn'>Load Files</button>
            </div>
        """,
        js_on_load="""
            const loadBtn = element.querySelector('.load-btn');
            const tree = element.querySelector('.tree');
            loadBtn.addEventListener('click', async () => {
                const files = await server.list_files(props.value);
                tree.innerHTML = '';
                files.forEach(file => {
                    const fileEl = document.createElement('div');
                    fileEl.textContent = file;
                    tree.appendChild(fileEl);
                });
            });
        """,
        server_functions=[list_files],
    )


if __name__ == "__main__":
    demo.launch()
