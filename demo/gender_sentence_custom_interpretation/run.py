import re

import gradio as gr

male_words, female_words = ["he", "his", "him"], ["she", "hers", "her"]


def gender_of_sentence(sentence):
    male_count = len([word for word in sentence.split() if word.lower() in male_words])
    female_count = len(
        [word for word in sentence.split() if word.lower() in female_words]
    )
    total = max(male_count + female_count, 1)
    return {"male": male_count / total, "female": female_count / total}


def interpret_gender(sentence):
    result = gender_of_sentence(sentence)
    is_male = result["male"] > result["female"]
    interpretation = []
    for word in re.split("( )", sentence):
        score = 0
        token = word.lower()
        if (is_male and token in male_words) or (not is_male and token in female_words):
            score = 1
        elif (is_male and token in female_words) or (
            not is_male and token in male_words
        ):
            score = -1
        interpretation.append((word, score))
    return interpretation


demo = gr.Interface(
    fn=gender_of_sentence,
    inputs=gr.Textbox(default_value="She went to his house to get her keys."),
    outputs="label",
    interpretation=interpret_gender,
)

if __name__ == "__main__":
    demo.launch(auth=("a", "b"))
