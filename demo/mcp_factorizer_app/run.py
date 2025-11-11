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
    <html>
    <head>
        <style>
            .certificate {
                background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
                border: 15px solid #d4af37;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                padding: 60px 80px;
                max-width: 700px;
                position: relative;
            }
            
            .certificate::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                border: 2px solid #d4af37;
                border-radius: 5px;
                pointer-events: none;
            }
            
            .certificate-header {
                font-family: 'Georgia', serif;
                font-size: 42px;
                font-weight: bold;
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
                text-transform: uppercase;
                letter-spacing: 3px;
            }
            
            .certificate-body {
                font-family: 'Georgia', serif;
                font-size: 24px;
                color: #34495e;
                text-align: center;
                line-height: 1.8;
                margin: 30px 0;
            }
            
            .factored-number {
                font-size: 48px;
                font-weight: bold;
                color: #d4af37;
                margin: 20px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                text-align: center;
            }
            
            .seal {
                text-align: center;
                margin-top: 40px;
                font-size: 60px;
                color: #d4af37;
            }
            
            .factor-more-btn {
                position: absolute;
                bottom: 10px;
                right: 10px;
                padding: 8px 16px;
                background-color: rgba(212, 175, 55, 0.3);
                color: #2c3e50;
                text-decoration: none;
                border-radius: 5px;
                font-family: 'Georgia', serif;
                font-size: 14px;
                transition: background-color 0.3s ease, color 0.3s ease;
                z-index: 100;
            }
            
            .factor-more-btn:hover {
                background-color: rgba(212, 175, 55, 0.8);
                color: #ffffff;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="certificate-header">Certificate of Achievement</div>
            
            <div class="certificate-body">
                This certificate is awarded for<br>
                successfully factoring
            </div>
            
            <div class="factored-number" id="factored-number">Loading...</div>
            
            <div class="seal">★</div>
            
            <a href="{{APP_URL}}" class="factor-more-btn">Factor More in the Gradio App</a>
        </div>
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const numberElement = document.getElementById("factored-number");
                const inputNumber = window.openai?.toolInput?.n || "??????";
                numberElement.innerText = inputNumber;
            });
        </script>
    </body>
    </html>
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
