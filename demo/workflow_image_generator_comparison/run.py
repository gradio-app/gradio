import gradio as gr

# Side-by-side comparison of two text-to-image models via HF inference
# providers: one shared prompt fans out to krea/Krea-2-Turbo and
# black-forest-labs/FLUX.1-dev, each ending in its own output image. Because
# both outputs share the same input, they're exposed as ONE API endpoint that
# returns both images as a tuple.
demo = gr.Workflow()

if __name__ == "__main__":
    demo.launch()
