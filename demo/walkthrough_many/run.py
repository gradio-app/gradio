import gradio as gr


def process_step(step_num):
    return f"You are on step {step_num}"


with gr.Blocks() as demo:
    gr.Markdown("# Stepper - Many Steps")

    with gr.Walkthrough(selected=0) as walkthrough:
        with gr.Step("Introduction", id=0):
            gr.Markdown("This is the introduction step.")
            output1 = gr.Textbox(label="Step 1 Output")
            next1 = gr.Button("Next Step")
            next1.click(lambda: gr.Walkthrough(selected=1), outputs=walkthrough)

        with gr.Step("Basic Information", id=1):
            gr.Markdown("Enter your basic information.")
            output2 = gr.Textbox(label="Step 2 Output")
            next2 = gr.Button("Next Step")
            next2.click(lambda: gr.Walkthrough(selected=2), outputs=walkthrough)

        with gr.Step("Preferences", id=2):
            gr.Markdown("Set your preferences.")
            output3 = gr.Textbox(label="Step 3 Output")
            next3 = gr.Button("Next Step")
            next3.click(lambda: gr.Walkthrough(selected=3), outputs=walkthrough)

        with gr.Step("Advanced Settings", id=3):
            gr.Markdown("Configure advanced settings.")
            output4 = gr.Textbox(label="Step 4 Output")
            next4 = gr.Button("Next Step")
            next4.click(lambda: gr.Walkthrough(selected=4), outputs=walkthrough)

        with gr.Step("Review", id=4):
            gr.Markdown("Review your choices.")
            output5 = gr.Textbox(label="Step 5 Output")
            next5 = gr.Button("Next Step")
            next5.click(lambda: gr.Walkthrough(selected=5), outputs=walkthrough)

        with gr.Step("Confirmation", id=5):
            gr.Markdown("Confirm and submit.")
            output6 = gr.Textbox(label="Step 6 Output")
            next6 = gr.Button("Next Step")
            next6.click(lambda: gr.Walkthrough(selected=6), outputs=walkthrough)

        with gr.Step("Additional Options", id=6):
            gr.Markdown("Additional options if needed.")
            output7 = gr.Textbox(label="Step 7 Output")
            next7 = gr.Button("Next Step")
            next7.click(lambda: gr.Walkthrough(selected=7), outputs=walkthrough)

        with gr.Step("Final Step", id=7):
            gr.Markdown("This is the final step!")
            output8 = gr.Textbox(label="Step 8 Output")
            gr.Button("Complete")

if __name__ == "__main__":
    demo.launch()
