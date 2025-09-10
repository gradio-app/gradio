import gradio as gr
import tempfile
import os
from pathlib import Path

def create_test_files():
    """Create a temporary directory with various test files"""
    temp_dir = tempfile.mkdtemp()
    
    # Create various file types
    test_files = [
        "document1.txt",
        "document2.txt", 
        "image1.png",
        "image2.jpg",
        "image3.jpeg",
        "script.py",
        "data.json",
        "styles.css",
        "index.html",
        "README.md"
    ]
    
    # Create files in root
    for file in test_files:
        Path(temp_dir, file).touch()
    
    # Create a subdirectory with more files
    subdir = Path(temp_dir, "subfolder")
    subdir.mkdir()
    for file in ["nested.txt", "nested.png", "nested.py"]:
        (subdir / file).touch()
    
    return temp_dir

def handle_selection(files):
    if not files:
        return "No files selected"
    if isinstance(files, str):
        return f"Selected: {Path(files).name}"
    return f"Selected {len(files)} files: {', '.join([Path(f).name for f in files])}"

# Create test directory
test_dir = create_test_files()

with gr.Blocks(title="FileExplorer Bugfixes Demo") as demo:
    gr.Markdown(f"""
    # FileExplorer Bugfixes Demo
    
    This demo showcases the bugfixes made to the FileExplorer component:
    
    **Test directory created at:** `{test_dir}`
    
    ## Fixes:
    1. **Fixed show_label=False** - No empty label containers when labels are hidden
    2. **Better permission error handling** - Component doesn't crash on access denied
    """)
    
    with gr.Row():
        with gr.Column():
            gr.Markdown("### Text Files Only")
            text_files = gr.FileExplorer(
                label="Text files only",
                show_label=True,
                glob="**/*.txt",
                root_dir=test_dir,
                file_count="multiple",
                height=300
            )
            
        with gr.Column():
            gr.Markdown("### Image Files Only")
            image_files = gr.FileExplorer(
                label="Image files only",
                show_label=True,
                glob="**/*.png",
                root_dir=test_dir,
                file_count="multiple",
                height=300
            )
    
    with gr.Row():
        with gr.Column():
            gr.Markdown("### With Label")
            with_label = gr.FileExplorer(
                label="Files with visible label",
                show_label=True,
                glob="**/*",
                root_dir=test_dir,
                file_count="single",
                height=200
            )
            
        with gr.Column():
            gr.Markdown("### Without Label (Fixed - no empty box)")
            without_label = gr.FileExplorer(
                label="Files with hidden label", 
                show_label=False,
                glob="**/*",
                root_dir=test_dir,
                file_count="single",
                height=200
            )
    
    # Output areas
    with gr.Row():
        output1 = gr.Textbox(label="Text files selection")
        output2 = gr.Textbox(label="Image files selection")
        output3 = gr.Textbox(label="With label selection")
        output4 = gr.Textbox(label="Without label selection")
    
    # Event handlers
    text_files.change(handle_selection, text_files, output1)
    image_files.change(handle_selection, image_files, output2)
    with_label.change(handle_selection, with_label, output3)
    without_label.change(handle_selection, without_label, output4)
    
    gr.Markdown("---")
    gr.Markdown("### Testing show_label=False on other components")
    gr.Markdown("These components should not show empty label containers:")
    
    with gr.Row():
        # Test other components with show_label=False
        gr.Textbox(label="Hidden textbox label", show_label=False, value="No label above")
        gr.Slider(label="Hidden slider label", show_label=False, minimum=0, maximum=100, value=50)
        gr.Dropdown(label="Hidden dropdown label", show_label=False, choices=["Option 1", "Option 2"], value="Option 1")

if __name__ == "__main__":
    demo.launch()