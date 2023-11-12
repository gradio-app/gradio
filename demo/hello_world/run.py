import gradio as gr

with gr.Blocks() as demo:
    text1 = gr.Textbox(label="Textbox 1")
    text2 = gr.Textbox(label="Textbox 2")
    text = gr.Textbox(label="Output")

    def test(evt: gr.SelectData):
        return 'You selected '+ evt.value + '  in ' + evt.target.label
 
        # Output textbox displays 'You selected some text in Textbox 1' 
        # regardless of which textbox the selection is actually occuring in.

    gr.on(
        triggers=[text1.select, text2.select],
        fn=test,
        outputs=text
    )
    
demo.launch()
