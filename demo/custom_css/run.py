import gradio as gr

css = """
/* CSSKeyframesRule for animation */
@keyframes animation {
    from {background-color: red;}
    to {background-color: blue;}
}

.cool-col {
    background-color: red;
    animation-name: animation;
    animation-duration: 4s;
    animation-delay: 2s;
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

/* CSSFontFaceRule */
@font-face {
    font-family: "test-font";
    src: url("https://mdn.github.io/css-examples/web-fonts/VeraSeBd.ttf") format("truetype");
}

.cool-col {
    font-family: "test-font";
}

/* CSSImportRule */
@import url("https://fonts.googleapis.com/css2?family=Protest+Riot&display=swap");

.markdown {
  font-family: "Protest Riot", sans-serif;
}
"""

with gr.Blocks(css=css) as demo:
    with gr.Column(elem_classes="cool-col"):
        gr.Markdown("### Gradio Demo with Custom CSS", elem_classes="darktest")
        gr.Markdown(
            elem_classes="markdown",
            value="Resize the browser window to see the CSS media query in action.",
        )

if __name__ == "__main__":
    demo.launch()
