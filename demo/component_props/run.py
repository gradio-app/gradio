import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            gr.Markdown("### With Type Hint (gr.Number)")
            gr.Markdown("The function receives all component props including min, max, value, etc.")

            a = gr.Number(value=5, minimum=0, maximum=10, label="Input A", info="Enter a number between 0 and 10")
            output_a = gr.Textbox(label="Output", lines=10)

            def process_with_props(x: gr.Number):
                """Function that receives all component props"""
                result = []
                result.append(f"Type: {type(x).__name__}")
                result.append(f"Value: {x.value}")
                result.append(f"Minimum: {x.minimum}")
                result.append(f"Maximum: {x.maximum}")
                result.append(f"Label: {x.label}")
                result.append(f"Info: {x.info}")

                # Validate using component properties
                if x.value > x.maximum:
                    result.append(f"\nValidation Error: {x.value} is greater than maximum {x.maximum}!")
                elif x.value < x.minimum:
                    result.append(f"\nValidation Error: {x.value} is less than minimum {x.minimum}!")
                else:
                    result.append(f"\nValue {x.value} is within valid range [{x.minimum}, {x.maximum}]")

                # Calculate double
                doubled = 2 * x.value
                result.append(f"\nDoubled value: {doubled}")

                return "\n".join(result)

            a.submit(process_with_props, a, output_a)

        with gr.Column():
            gr.Markdown("### Without Type Hint")
            gr.Markdown("The function receives only the preprocessed value")

            b = gr.Number(value=5, minimum=0, maximum=10, label="Input B", info="Enter a number between 0 and 10")
            output_b = gr.Textbox(label="Output", lines=10)

            def process_without_props(x):
                """Function that receives only the value"""
                result = []
                result.append(f"Type: {type(x).__name__}")
                result.append(f"Value: {x}")

                # Cannot access component properties like min/max
                result.append("\nCannot access minimum or maximum!")
                result.append("(Only the value is available)")

                # Calculate triple
                tripled = 3 * x
                result.append(f"\nTripled value: {tripled}")

                return "\n".join(result)

            b.submit(process_without_props, b, output_b)

    gr.Markdown("---")

    with gr.Row():
        with gr.Column():
            gr.Markdown("### Multiple Inputs with Mixed Type Hints")
            gr.Markdown("You can mix type-hinted and non-type-hinted parameters")

            c = gr.Number(value=10, minimum=0, maximum=100, label="Number (with props)")
            d = gr.Textbox(value="hello", label="Text (just value)")
            output_c = gr.Textbox(label="Output", lines=8)

            def process_mixed(num: gr.Number, text):
                """Function with mixed parameter types"""
                result = []
                result.append(f"Number component type: {type(num).__name__}")
                result.append(f"Number value: {num.value}")
                result.append(f"Number range: [{num.minimum}, {num.maximum}]")
                result.append(f"\nText type: {type(text).__name__}")
                result.append(f"Text value: {text}")

                # Check if number is in valid range
                if num.minimum <= num.value <= num.maximum:
                    result.append(f"\nNumber {num.value} is valid!")
                    result.append(f"Text repeated {num.value} times: {text * int(num.value)}")

                return "\n".join(result)

            btn = gr.Button("Process")
            btn.click(process_mixed, [c, d], output_c)

if __name__ == "__main__":
    demo.launch()
