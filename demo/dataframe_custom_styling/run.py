import gradio as gr

data = [
    ["DeepSeek Coder", 79.3],
    ["Llama 3.3", 68.9],
    ["Qwen 2.5", 61.9],
    ["Gemma 2", 59.5],
    ["GPT 2", 18.3],
]

headers = ["Model", "% Correct (LeetCode Hard)"]

def get_styling(values):
    return [["", f"background: linear-gradient(90deg, rgba(220, 242, 220) {row[1]}%, transparent {row[1]}%)"] for row in values]

def get_display_value(values):
    display_values = []
    medals = ["🥇", "🥈", "🥉"]
    for i, row in enumerate(values):
        if i < 3:
            display_values.append([f"{medals[i]} {row[0]}", row[1]])
        else:
            display_values.append([row[0], row[1]])
    return display_values

styling = get_styling(data)
display_value = get_display_value(data)


value = {
    "data": data,
    "headers": headers,
    "metadata": {
        "styling": styling,
        "display_value": display_value,
    },
}

with gr.Blocks() as demo:
    gr.Dataframe(value, show_search="search")

if __name__ == "__main__":
    demo.launch()
