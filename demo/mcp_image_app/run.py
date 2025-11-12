import gradio as gr
import tempfile
from PIL import Image
import numpy as np


@gr.mcp.tool(
    _meta={
        "openai/outputTemplate": "ui://widget/app.html",
        "openai/resultCanProduceWidget": True,
        "openai/widgetAccessible": True,
    }
)

def power_law_image(input_path: str, gamma: float = 0.75) -> str:
    """
    Applies a power-law (gamma) transformation to an image file and saves
    the result to a temporary file.

    Args:
        input_path (str): Path to the input image.
        gamma (float): Power-law exponent. <1 brightens, >1 darkens.

    Returns:
        str: Path to the saved temporary output image.
    """
    img = Image.open(input_path).convert("RGB")
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.power(arr, gamma)
    arr = np.clip(arr * 255, 0, 255).astype(np.uint8)
    out_img = Image.fromarray(arr)

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    out_img.save(tmp_file.name)
    tmp_file.close()

    return tmp_file.name


@gr.mcp.resource("ui://widget/app.html", mime_type="text/html+skybridge")
def app_html():
    visual = """
    <div id="image-upscaler"></div>
    <script>
    </script>
    """
    return visual


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            original_image = gr.Image(label="Original Image", type="filepath")
            btn = gr.Button("Brighten Image")
        with gr.Column():
            output_image = gr.Image(label="Output Image", type="filepath")
            html = gr.Code(language="html", max_lines=20)

    btn.click(power_law_image, inputs=original_image, outputs=output_image)
    btn.click(app_html, outputs=html)

if __name__ == "__main__":
    demo.launch(mcp_server=True, share=True)
