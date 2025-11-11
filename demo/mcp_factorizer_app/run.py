import gradio as gr
from urllib.parse import urlparse

@gr.mcp.tool(_meta={"openai/outputTemplate": "ui://widget/app.html", "openai/resultCanProduceWidget": True, "openai/widgetAccessible": True})
def prime_factors(n: str) -> list[str]:
    """
    Compute the prime factorization of a positive integer.

    Args:
        n (str): The integer to factorize. Must be greater than 1.
    """
    n_int = int(n)
    if n_int <= 1:
        return ["1"]

    factors = []
    while n_int % 2 == 0:
        factors.append("2")
        n_int //= 2

    divisor = 3
    while divisor * divisor <= n_int:
        while n_int % divisor == 0:
            factors.append(str(divisor))
            n_int //= divisor
        divisor += 2

    if n_int > 1:
        factors.append(str(n_int))

    return factors

@gr.mcp.resource("ui://widget/app.html", mime_type="text/html+skybridge")
def app_html(request: gr.Request):
    visual = """
    ...
    """
    parsed_url = urlparse(str(request.url))
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    return visual.replace("{{APP_URL}}", base_url)

with gr.Blocks() as demo:
    with gr.Row():
        number = gr.Textbox(label="Number")
        factors = gr.Textbox(label="Factors")
    with gr.Row():
        btn = gr.Button("Factorize")
        html = gr.Code(language="html", max_lines=20)
        btn.click(prime_factors, number, factors)
        btn.click(app_html, outputs=html)

if __name__ == "__main__":
    demo.launch(mcp_server=True, share=True, strict_cors=False)
