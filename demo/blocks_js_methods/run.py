import gradio as gr

blocks = gr.Blocks()

with blocks:
    subject = gr.Textbox(placeholder="subject")
    verb = gr.Radio(["ate", "loved", "hated"])
    object = gr.Textbox(placeholder="object")

    with gr.Row():
        btn = gr.Button("Create sentence.")
        reverse_btn = gr.Button("Reverse sentence.")
        foo_bar_btn = gr.Button("Foo bar.")
    
    def sentence_maker(w1, w2, w3):
        return f"{w1} {w2} {w3}"

    output1 = gr.Textbox(label="output 1")
    output2 = gr.Textbox(label="verb")
    output3 = gr.Textbox(label="verb reversed")

    btn.click(sentence_maker, [subject, verb, object], output1)
    reverse_btn.click(None, [subject, verb, object], output2, _js="(s, v, o) => o + ' ' + v + ' ' + s")
    verb.change(lambda x: x, verb, output3, _js="(x) => [...x].reverse().join('')")
    foo_bar_btn.click(lambda x: x + " bar", subject, subject, _js="(x) => x + ' foo'")

blocks.launch()