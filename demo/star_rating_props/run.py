import gradio as gr

with gr.Blocks() as demo:
    star_rating = gr.HTML(
        7, 
        size=40,
        max_stars=10,
        html_template="""
        <h2>Star Rating:</h2>
        ${Array.from({length: max_stars}, (_, i) => `<img class='${i < value ? '' : 'faded'}' src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>`).join('')}""", 
        css_template="""
            img { height: ${size}px; display: inline-block; }
            .faded { filter: grayscale(100%); opacity: 0.3; }
        """
    )
    rating_slider = gr.Slider(0, 10, step=1, label="Select Rating")
    rating_slider.change(fn=lambda x: x, inputs=rating_slider, outputs=star_rating)

    size_slider = gr.Slider(20, 100, 40, step=1, label="Select Size")
    size_slider.change(fn=lambda x: gr.HTML(size=x), inputs=size_slider, outputs=star_rating)

if __name__ == "__main__":
    demo.launch()