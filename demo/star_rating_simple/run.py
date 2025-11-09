import gradio as gr

with gr.Blocks() as demo:
    three_star_rating = gr.HTML("""
        <h2>Star Rating:</h2>
        <img src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>
        <img src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>
        <img src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>
        <img class='faded' src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>
        <img class='faded' src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>
    """, css_template="""
        img { height: 50px; display: inline-block; }
        .faded { filter: grayscale(100%); opacity: 0.3; }
    """)

if __name__ == "__main__":
    demo.launch()