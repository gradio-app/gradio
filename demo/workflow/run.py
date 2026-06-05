import os
import random

import gradio as gr


def describe_product(image) -> str:
    if image is None:
        return "a premium product"
    img_path = image.get("path") if isinstance(image, dict) else str(image)
    img_url = image.get("url", "") if isinstance(image, dict) else str(image)
    try:
        from gradio_client import Client, handle_file
        source = img_path if (img_path and os.path.exists(img_path)) else img_url
        if not source:
            return "a premium product"
        client = Client("vikhyatk/moondream2", verbose=False)
        result = client.predict(
            handle_file(source),
            "Describe this product briefly and concisely. What is it?",
            api_name="/answer_question",
        )
        return str(result).strip() if result else "a premium product"
    except Exception:
        return "a premium product"


def craft_marketing_prompt(caption: str) -> str:
    if not caption:
        caption = "a premium product"
    caption = caption.strip().rstrip(".")
    styles = [
        (
            f"Professional product advertisement photograph of {caption}, "
            "studio lighting, clean white background, commercial photography, "
            "ultra-sharp, 8K quality"
        ),
        (
            f"Cinematic product shot of {caption}, dramatic lighting, "
            "aspirational lifestyle context, premium brand aesthetic, "
            "shot on Hasselblad, magazine cover quality"
        ),
        (
            f"Bold marketing campaign visual of {caption}, vibrant colors, "
            "dynamic composition, modern editorial style, "
            "award-winning commercial photography"
        ),
    ]
    return random.choice(styles)


demo = gr.Workflow(bind=[describe_product, craft_marketing_prompt])

if __name__ == "__main__":
    demo.launch()
