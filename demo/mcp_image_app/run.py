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

def power_law_image(input_path: str, gamma: float = 0.5) -> str:
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
    <style>
        #image-container {
            position: relative;
            display: inline-block;
            max-width: 100%;
        }
        #image-display {
            max-width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
        }
        #brighten-btn {
            position: absolute;
            bottom: 16px;
            right: 26px;
            padding: 12px 24px;
            background: #1a1a1a;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        #brighten-btn:hover {
            background: #000000;
        }
    </style>
    <div id="image-container">
        <img id="image-display" alt="Processed image" />
        <button id="brighten-btn">Brighten</button>
    </div>
    <script>
        const imageEl = document.getElementById('image-display');
        const btnEl = document.getElementById('brighten-btn');

        function extractImageUrl(data) {
            if (data?.text?.startsWith('Image URL: ')) {
                return data.text.substring('Image URL: '.length).trim();
            }
            if (data?.content) {
                for (const item of data.content) {
                    if (item.type === 'text' && item.text?.startsWith('Image URL: ')) {
                        return item.text.substring('Image URL: '.length).trim();
                    }
                }
            }
        }

        function render() {
            const url = extractImageUrl(window.openai?.toolOutput);
            if (url) imageEl.src = url;
        }

        async function brightenImage() {
            btnEl.disabled = true;
            btnEl.textContent = 'Brightening...';
            const result = await window.openai.callTool('power_law_image', {
                input_path: imageEl.src
            });
            const newUrl = extractImageUrl(result);
            if (newUrl) imageEl.src = newUrl;
            btnEl.disabled = false;
            btnEl.textContent = 'Brighten';
        }

        btnEl.addEventListener('click', brightenImage);
        window.addEventListener("openai:set_globals", (event) => {
            if (event.detail?.globals?.toolOutput) render();
        }, { passive: true });

        render();
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

    btn.click(power_law_image, inputs=original_image, outputs=original_image)
    btn.click(app_html, outputs=html)

if __name__ == "__main__":
    demo.launch(mcp_server=True, share=True)
