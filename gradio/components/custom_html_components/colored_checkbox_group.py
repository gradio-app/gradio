import gradio as gr


class ColoredCheckboxGroup(gr.HTML):
    def __init__(
        self,
        choices: list[str],
        *,
        value: list[str] | None = None,
        colors: list[str],
        label: str | None = None,
        **kwargs,
    ):
        html_template = """
        <div class="colored-checkbox-container">
            ${label ? `<label class="container-label">${label}</label>` : ''}
            <div class="colored-checkbox-group">
                ${choices.map((choice, i) => `
                    <label class="checkbox-label" data-color-index="${i}">
                        <input type="checkbox" value="${choice}" ${(value || []).includes(choice) ? 'checked' : ''}>
                        ${choice}
                    </label>
                `).join('')}
            </div>
        </div>
        """

        css_template = """
        .colored-checkbox-container {
            border: 1px solid var(--border-color-primary);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
        }
        .container-label { display: block; margin-bottom: var(--spacing-md); }
        .colored-checkbox-group { display: flex; flex-direction: column; gap: 6px; }
        .checkbox-label { display: flex; align-items: center; cursor: pointer; }
        .checkbox-label input { margin-right: 8px; }
        ${choices.map((choice, i) => `.checkbox-label[data-color-index="${i}"] { color: ${colors[i]}; }`).join(' ')}
        """

        js_on_load = """
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                props.value = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
            });
        });
        """

        super().__init__(
            value=value or [],
            html_template=html_template,
            css_template=css_template,
            js_on_load=js_on_load,
            choices=choices,
            colors=colors,
            label=label,
            **kwargs,
        )

    def api_info(self):
        return {
            "items": {"enum": self.choices, "type": "string"},  # type: ignore
            "title": "Checkbox Group",
            "type": "array",
        }


if __name__ == "__main__":

    def update_colors(color: str):
        if color.startswith("rgb"):
            rgb_values = (
                color.replace("rgba", "").replace("rgb", "").strip("()").split(",")
            )
            r, g, b = (
                int(float(rgb_values[0])),
                int(float(rgb_values[1])),
                int(float(rgb_values[2])),
            )
            medium = f"#{r:02x}{g:02x}{b:02x}"
        else:
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            medium = color

        dark = f"#{int(r * 0.6):02x}{int(g * 0.6):02x}{int(b * 0.6):02x}"
        light = f"#{int(r + (255 - r) * 0.4):02x}{int(g + (255 - g) * 0.4):02x}{int(b + (255 - b) * 0.4):02x}"

        return ColoredCheckboxGroup(
            choices=["a", "b", "c"],
            colors=[dark, medium, light],
            label="Select options",
        )

    with gr.Blocks() as demo:
        with gr.Row():
            with gr.Column():
                cp = gr.ColorPicker(value="#FF0000")
            with gr.Column(scale=2):
                cg = ColoredCheckboxGroup(
                    choices=["a", "b", "c"],
                    colors=["#990000", "#FF0000", "#FF6666"],
                    label="Select options",
                )
                gr.Interface(
                    fn=lambda x: " ".join(x),
                    inputs=cg,
                    outputs=gr.Textbox(label="output"),
                )
        cp.change(update_colors, inputs=cp, outputs=cg, show_progress="hidden")
    demo.launch()
