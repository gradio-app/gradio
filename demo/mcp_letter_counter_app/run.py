import gradio as gr


@gr.mcp.tool(
    _meta={
        "openai/outputTemplate": "ui://widget/app.html",
        "openai/resultCanProduceWidget": True,
        "openai/widgetAccessible": True,
    }
)
def letter_counter(word: str, letter: str) -> int:
    """
    Count the number of letters in a word or phrase.

    Parameters:
        word (str): The word or phrase to count the letters of.
        letter (str): The letter to count the occurrences of.
    """
    return word.count(letter)


@gr.mcp.resource("ui://widget/app.html", mime_type="text/html+skybridge")
def app_html():
    visual = """
    <div id="letter-card-container"></div>
    <script>
        const container = document.getElementById('letter-card-container');

        function render() {
            const word = window.openai?.toolInput?.word || "strawberry";
            const letter = window.openai?.toolInput?.letter || "r";

            let letterHTML = '';
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const color = char.toLowerCase() === letter.toLowerCase() ? '#b8860b' : '#000000';
                letterHTML += `<span style="color: ${color};">${char}</span>`;
            }

            container.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #f5f5dc 0%, #e8e4d0 100%);
                    background-image:
                        repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139, 121, 94, 0.03) 2px, rgba(139, 121, 94, 0.03) 4px),
                        linear-gradient(135deg, #f5f5dc 0%, #e8e4d0 100%);
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
                    max-width: 600px;
                    margin: 20px auto;
                    font-family: 'Georgia', serif;
                    text-align: center;
                ">
                    <div style="
                        font-size: 48px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        line-height: 1.5;
                    ">
                        ${letterHTML}
                    </div>
                </div>
            `;
        }
        render();
        window.addEventListener("openai:set_globals", (event) => {
            if (event.detail?.globals?.toolInput) {
                render();
            }
        }, { passive: true });
    </script>
    """
    return visual


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            word = gr.Textbox(label="Word")
            letter = gr.Textbox(label="Letter")
            btn = gr.Button("Count Letters")
        with gr.Column():
            count = gr.Number(label="Count")
            html = gr.Code(language="html", max_lines=20)

    btn.click(letter_counter, inputs=[word, letter], outputs=count)
    btn.click(app_html, outputs=html)

if __name__ == "__main__":
    demo.launch(mcp_server=True, share=True)
