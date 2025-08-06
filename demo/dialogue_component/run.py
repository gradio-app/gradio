import gradio as gr

def formatter(speaker, text):
    speaker = speaker.split(" ")[1]
    return f"[S{speaker}] {text}"

def unformatter(line):
    if line.startswith("[S") and "]" in line:
        bracket_end = line.index("]")
        speaker = line[2:bracket_end]
        text = line[bracket_end + 1:].strip()
        return {"speaker": f"Speaker {speaker}", "text": text}
    else:
        return {"speaker": "Unknown", "text": line}

with gr.Blocks() as demo:
    dd = gr.Dialogue(speakers=["Speaker 1", "Speaker 2"],
                     tags=["(laughs)", "(sighs)", "(clears throat)"],
                value=[
                    {"speaker": "Speaker 1", "text": "Hello, how are you?"},
                    {"speaker": "Speaker 2", "text": "I'm fine, thank you!"},
                ], separator="\n", interactive=True, formatter=formatter, unformatter=unformatter)
    output = gr.Textbox(label="Output", value="")
    dd.submit(lambda x: x, inputs=dd, outputs=output)
demo.launch()
