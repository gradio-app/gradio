import gradio as gr

css = """
/* CSSStyleRule */
* {
    font-family: 'SourceCodePro', sans-serif;
}

/* CSSKeyframesRule for animation */
@keyframes example {
    from {background-color: red;}
    to {background-color: blue;}
}

/* Applying the animation */
.cool-col {
    animation-name: example;
    animation-duration: 4s;
    animation-iteration-count: infinite;
    border-radius: 10px;
    padding: 20px;
}

.markdown {
    background-color: lightblue;
    padding: 20px;
}

.markdown p {
    color: royalblue;
}

/* CSSMediaRule */
@media screen and (max-width: 600px) {
    .markdown {
        background: blue;
    }
    .markdown p {
        color: lightblue;
    }
}

"""

with gr.Blocks(css=css) as demo:
    with gr.Column(elem_classes="cool-col"):
        gr.Markdown("### Gradio Demo with Custom CSS")
        gr.Markdown(elem_classes="markdown", value="Resize the browser window to see the CSS media query in action.")

if __name__ == "__main__":
    demo.launch()
