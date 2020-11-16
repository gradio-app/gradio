# Demo: (Textbox) -> (Label)

import gradio as gr

def longest_word(text):
    words = text.split(" ")
    lengths = [len(word) for word in words]
    return max(lengths)

ex = "The quick brown fox jumped over the lazy dog."

iface = gr.Interface(longest_word, "textbox", "label",
                  interpretation="default", examples=[[ex]])

iface.test_launch()

if __name__ == "__main__":
    iface.launch()
