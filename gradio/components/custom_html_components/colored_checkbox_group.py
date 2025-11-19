import gradio as gr


class ColoredCheckboxGroup(gr.HTML):
    def __init__(
        self, choices: list[str], *, value: list[str] | None = None, colors: list[str]
    ):
        html_template = """
        <div class="colored-checkbox-group">
            ${choices.map((choice, i) => `
                <label style="color: ${colors[i] || 'black'};">
                    <input type="checkbox" value="${choice}" ${(value || []).includes(choice) ? 'checked' : ''}>
                    ${choice}
                </label>
            `).join('')}
        </div>
        """
        super().__init__(
            value=value or [],
            html_template=html_template,
            colors=colors
        )


if __name__ == "__main__":
    demo = gr.Interface(
        fn=lambda x: x,
        inputs=ColoredCheckboxGroup(
            choices=["a", "b", "c"], colors=["red", "green", "blue"]
        ),
        outputs=gr.Textbox(),
    )
    demo.launch()
