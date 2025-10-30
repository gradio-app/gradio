import gradio as gr

with gr.Blocks() as demo:
    star_rating = gr.HTML(
        value=3, 
        html_template="""
        <h2>Star Rating:</h2>
        {% for i in range(5) %}
            <img class='{{ '' if i < value else 'faded' }}' src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>
        {% endfor %}
        <button id='submit-btn'>Submit Rating</button>    
        """, 
        css_template="""
            img { height: 50px; display: inline-block; cursor: pointer; }
            .faded { filter: grayscale(100%); opacity: 0.3; }
        """,
        js_on_load="""
            const imgs = element.querySelectorAll('img');
            imgs.forEach((img, index) => {
                img.addEventListener('click', () => {
                    props.value = index + 1;
                });
            });
            const submitBtn = element.querySelector('#submit-btn');
            submitBtn.addEventListener('click', () => {
                trigger('submit');
            });
        """)
    rating_output = gr.Textbox(label="Submitted Rating")
    star_rating.submit(lambda x: x, inputs=star_rating, outputs=rating_output)

if __name__ == "__main__":
    demo.launch()