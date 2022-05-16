import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown(
        """
    # Animal Generator
    Once you select a species, the detail panel should be visible.
    """
    )

    species = gr.Radio(label="Animal Class", choices=["Mammal", "Fish", "Bird"])
    animal = gr.Dropdown(label="Animal", choices=[])

    with gr.Column(visible=False) as details_col:
        weight = gr.Slider(0, 20)
        details = gr.Textbox(label="Extra Details")
        generate_btn = gr.Button("Generate")
        output = gr.Textbox(label="Output")

    species_map = {
        "Mammal": ["Elephant", "Giraffe", "Hamster"],
        "Fish": ["Shark", "Salmon", "Tuna"],
        "Bird": ["Chicken", "Eagle", "Hawk"],
    }

    def filter_species(species):
        return gr.Dropdown.update(
            choices=species_map[species], value=species_map[species][1]
        ), gr.update(visible=True)

    species.change(filter_species, species, [animal, details_col])

    def filter_weight(animal):
        if animal in ("Elephant", "Shark", "Giraffe"):
            return gr.update(maximum=100)
        else:
            return gr.update(maximum=20)

    animal.change(filter_weight, animal, weight)
    weight.change(lambda w: gr.update(lines=int(w / 10) + 1), weight, details)

    generate_btn.click(lambda x: x, details, output)


if __name__ == "__main__":
    demo.launch()