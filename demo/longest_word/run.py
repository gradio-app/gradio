import gradio as gr

def longest_word(text):
    words = text.split(" ")
    lengths = [len(word) for word in words]
    return max(lengths)

ex = "The quick brown fox jumped over the lazy dog."

demo = gr.Interface(
    longest_word, "textbox", "label", examples=[[ex]],
    api_name="predict",
)

if __name__ == "__main__":
    demo.launch()
