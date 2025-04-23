import gradio as gr

def letter_counter(word, letter):
    """
    Count the number of occurrences of a letter in a word or text.

    Args:
        word (str): The input text to search through
        letter (str): The letter to search for

    Returns:
        str: A message indicating how many times the letter appears
    """
    word = word.lower()
    letter = letter.lower()
    count = word.count(letter)
    return count

# Create and launch the Gradio interface
demo = gr.Interface(
    fn=letter_counter,
    inputs=["textbox", "textbox"],
    outputs="number",
    title="Letter Counter",
    description="Enter text and a letter to count how many times the letter appears in the text."
)

if __name__ == "__main__":
    demo.launch(mcp_server=True, share=True)
