import gradio as gr

with gr.Blocks() as demo:
    a = gr.Number(value=5, minimum=0, maximum=10, label="Input A", info="Enter a number between 0 and 10")
    output_a = gr.JSON(label="Output", elem_id="output")
    with gr.Row():
        show_value_btn = gr.Button("Show Value")
        double_btn = gr.Button("Double Value and Maximum")
        reset_btn = gr.Button("Reset")

    def process_with_props(x: gr.Number):
        return {
            "value": x.value,
            "maximum": x.maximum,
            "minimum": x.minimum,
        }
    show_value_btn.click(process_with_props, a, output_a)

    def double_value_and_max(x: gr.Number):
        x.maximum *= 2
        x.value *= 2
        return x
    
    double_btn.click(double_value_and_max, a, a).then(
        process_with_props, a, output_a
    )

    def reset(x: gr.Number):
        x.maximum = 10
        x.value = 5
        return x

    reset_btn.click(reset, a, a).then(
        process_with_props, a, output_a
    )


if __name__ == "__main__":
    demo.launch()
