import gradio as gr

css = """
/* CSSKeyframesRule for animation */
@keyframes animation {
    from {background-color: red;}
    to {background-color: blue;}
}

.cool-col {
    animation-name: animation;
    animation-duration: 4s;
    animation-iteration-count: infinite;
    border-radius: 10px;
    padding: 20px;
}

/* CSSStyleRule */
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

.dark .markdown {
    background: pink;
}

.darktest h3 {
    color: black;
}

.dark .darktest h3 {
    color: yellow;
}

"""

with gr.Blocks(css=css) as demo:
    with gr.Column(elem_classes="cool-col"):
        gr.Markdown("### Gradio Demo with Custom CSS", elem_classes="darktest")
        gr.Markdown(elem_classes="markdown", value="Resize the browser window to see the CSS media query in action.")

if __name__ == "__main__":
    demo.launch(allowed_paths=['./'])
