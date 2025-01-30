import gradio as gr
import random

def generate_pet_name(animal_type, personality):
    cute_prefixes = ["Fluffy", "Ziggy", "Bubbles", "Pickle", "Waffle", "Mochi", "Cookie", "Pepper"]
    animal_suffixes = {
        "Cat": ["Whiskers", "Paws", "Mittens", "Purrington"],
        "Dog": ["Woofles", "Barkington", "Waggins", "Pawsome"],
        "Bird": ["Feathers", "Wings", "Chirpy", "Tweets"],
        "Rabbit": ["Hops", "Cottontail", "Bouncy", "Fluff"]
    }

    prefix = random.choice(cute_prefixes)
    suffix = random.choice(animal_suffixes[animal_type])

    if personality == "Silly":
        prefix = random.choice(["Sir", "Lady", "Captain", "Professor"]) + " " + prefix
    elif personality == "Royal":
        suffix += " the " + random.choice(["Great", "Magnificent", "Wise", "Brave"])

    return f"{prefix} {suffix}"

with gr.Blocks(theme=gr.themes.Soft()) as demo:
    with gr.Sidebar():
        gr.Markdown("# 🐾 Pet Name Generator")
        gr.Markdown("Use the options below to generate a unique pet name!")

        animal_type = gr.Dropdown(
            choices=["Cat", "Dog", "Bird", "Rabbit"],
            label="Choose your pet type",
            value="Cat"
        )
        personality = gr.Image(
        )

    name_output = gr.Textbox(label="Your pet's fancy name:", lines=2)
    generate_btn = gr.Button("Generate Name! 🎲", variant="primary")
    generate_btn.click(
        fn=generate_pet_name,
        inputs=[animal_type, personality],
        outputs=name_output
    )

if __name__ == "__main__":
    demo.launch()
