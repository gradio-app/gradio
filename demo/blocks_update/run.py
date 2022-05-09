import gradio as gr

with gr.Blocks() as block:
    gr.Markdown("""
    # Animal Generator
    Once you select a species, the detail panel should be visible.
    """)

    species = gr.Radio(label="Animal Class", choices=["Mammal", "Fish", "Bird"])
    animal = gr.Dropdown(label="Animal", choices=[])

    with gr.Column(visible=False) as details_col:
        weight = gr.Slider(0, minimum=0, maximum=20)
        details = gr.Textbox(label="Extra Details")
        generate_btn = gr.Button("Generate")
        output = gr.Textbox(label="Output")

    def filter_species(species):
        return ({
            "Mammal": ["Elephant", "Giraffe", "Hamster"],
            "Fish": ["Shark", "Salmon", "Tuna"],
            "Bird": ["Chicken", "Eagle", "Hawk"]
        })[species], gr.update(visible=True)

    species.change(filter_species, species, [animal, details_col])

    def filter_weight(animal):
        if animal in ("Elephant", "Shark", "Giraffe"):
            return gr.update(maximum=100)
        else:
            return gr.update(maximum=20)

    animal.change(filter_weight, animal, animal)
    weight.change(lambda w: gr.update(lines=int(w/ 10) + 1), weight, details)

    generate_btn.click(lambda x: x, details, output)

block.launch()
