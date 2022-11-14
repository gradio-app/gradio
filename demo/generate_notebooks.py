import nbformat as nbf
import os 

GRADIO_DEMO_DIR = os.getcwd()
DEMOS_TO_SKIP = {"all_demos", "reset_components", "custom_path", "kitchen_sink_random"}

demos = os.listdir(GRADIO_DEMO_DIR)
demos = [demo for demo in demos if demo not in DEMOS_TO_SKIP and os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo)) and  os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "run.py"))]

for demo in demos: 
    nb = nbf.v4.new_notebook()
    text = f"# Gradio Demo: {demo}"

    if os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "DESCRIPTION.md")):
        with open(os.path.join(GRADIO_DEMO_DIR, demo, "DESCRIPTION.md"), "r") as f:
            description = f.read()
        text += f"""\n### {description}
        """

    files = os.listdir(os.path.join(GRADIO_DEMO_DIR, demo))
    files = [file for file in files if file not in ["run.py", "run.ipynb", "setup.sh", ".gitignore", "requirements.txt", "DESCRIPTION.md", "screenshot.png", "screenshot.gif", ".DS_Store", "flagged", "__pycache__"]]
    if files: 
        get_files = "# Downloading files from the demo repo\nimport os"
        for file in files:
            if os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo, file)):
                get_files += f"\nos.mkdir('{file}')"
                for sub_file in os.listdir(os.path.join(GRADIO_DEMO_DIR, demo, file)):
                    get_files += f"\n!wget -q -O {file}/{sub_file} https://github.com/gradio-app/gradio/raw/main/demo/{demo}/{file}/{sub_file}"
            else:
                get_files += f"\n!wget -q https://github.com/gradio-app/gradio/raw/main/demo/{demo}/{file}"

    requirements = ""
    if os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "requirements.txt")):
        with open(os.path.join(GRADIO_DEMO_DIR, demo, "requirements.txt"), "r") as f:
            requirements = f.read().split("\n")
        requirements = " ".join(requirements)

    installs = f"!pip install -q gradio {requirements}"

    with open(os.path.join(GRADIO_DEMO_DIR, demo, "run.py"), "r") as f:
        code = f.read()
        code = code.replace("os.path.dirname(__file__)", "os.path.abspath('')")
    
    if files: 
        nb['cells'] = [nbf.v4.new_markdown_cell(text),
                    nbf.v4.new_code_cell(installs),
                    nbf.v4.new_code_cell(get_files),
                    nbf.v4.new_code_cell(code)]
    else:
        nb['cells'] = [nbf.v4.new_markdown_cell(text),
                nbf.v4.new_code_cell(installs),
                nbf.v4.new_code_cell(code)]
    
    output_notebook = os.path.join(GRADIO_DEMO_DIR, demo, "run.ipynb")

    with open(output_notebook, 'w') as f:
        nbf.write(nb, f)