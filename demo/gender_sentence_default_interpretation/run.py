import gradio as gr

male_words, female_words = ["he", "his", "him"], ["she", "hers", "her"]


def gender_of_sentence(sentence):
    male_count = len([word for word in sentence.split() if word.lower() in male_words])
    female_count = len(
        [word for word in sentence.split() if word.lower() in female_words]
    )
    total = max(male_count + female_count, 1)
    return {"male": male_count / total, "female": female_count / total}


demo = gr.Interface(
    fn=gender_of_sentence,
    inputs=gr.Textbox(default_value="She went to his house to get her keys."),
    outputs="label",
    interpretation="default",
)

if __name__ == "__main__":
    demo.launch()
