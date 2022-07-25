import gradio as gr
import random

secret_word = "gradio"

with gr.Blocks() as demo:    
    used_letters_var = gr.Variable([])
    with gr.Row() as row:
        with gr.Column():
            input_letter = gr.Textbox(label="Enter letter")
            btn = gr.Button("Guess Letter")
        with gr.Column():
            hangman = gr.Textbox(
                label="Hangman",
                value="_"*len(secret_word)
            )
            used_letters_box = gr.Textbox(label="Used Letters")

    def guess_letter(letter, used_letters):
        used_letters.append(letter)
        answer = "".join([
            (letter if letter in used_letters else "_")
            for letter in secret_word
        ])
        return {
            used_letters_var: used_letters,
            used_letters_box: ", ".join(used_letters),
            hangman: answer
        }
    btn.click(
        guess_letter, 
        [input_letter, used_letters_var],
        [used_letters_var, used_letters_box, hangman]
        )
if __name__ == "__main__":
    demo.launch()