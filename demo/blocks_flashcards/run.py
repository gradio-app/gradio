import random

import gradio as gr

demo = gr.Blocks()

with demo:
    gr.Markdown(
        "Load the flashcards in the table below, then use the Practice tab to practice."
    )

    with gr.Tabs():
        with gr.TabItem("Word Bank"):
            flashcards_table = gr.Dataframe(headers=["front", "back"], type="array")
        with gr.TabItem("Practice"):
            with gr.Row():
                front = gr.Textbox(label="Prompt")
                answer_row = gr.Row(visible=False)
                with answer_row:
                    back = gr.Textbox(label="Answer")
            with gr.Row():
                new_btn = gr.Button("New Card").style(full_width=True)
                flip_btn = gr.Button("Flip Card").style(full_width=True)
                selected_card = gr.Variable()
                feedback_row = gr.Row(visible=False)
                with feedback_row:
                    correct_btn = gr.Button(
                        "Correct",
                    ).style(bg_color="green", text_color="black", full_width=True)
                    incorrect_btn = gr.Button("Incorrect").style(
                        bg_color="pink", text_color="black", full_width=True
                    )
        with gr.TabItem("Results"):
            results = gr.Variable(value={})
            correct_field = gr.Markdown("# Correct: 0")
            incorrect_field = gr.Markdown("# Incorrect: 0")
            gr.Markdown("Card Statistics: ")
            results_table = gr.Dataframe(headers=["Card", "Correct", "Incorrect"])

        def load_new_card(flashcards):
            card = random.choice(flashcards)
            return card, card[0], False, False

        new_btn.click(
            load_new_card,
            [flashcards_table],
            [selected_card, front, answer_row, feedback_row],
        )

        def flip_card(card):
            return card[1], True, True

        flip_btn.click(flip_card, [selected_card], [back, answer_row, feedback_row])

        def mark_correct(card, results):
            if card[0] not in results:
                results[card[0]] = [0, 0]
            results[card[0]][0] += 1
            correct_count = sum(result[0] for result in results.values())
            return (
                results,
                f"# Correct: {correct_count}",
                [[front, scores[0], scores[1]] for front, scores in results.items()],
            )

        def mark_incorrect(card, results):
            if card[0] not in results:
                results[card[0]] = [0, 0]
            results[card[0]][1] += 1
            incorrect_count = sum(result[1] for result in results.values())
            return (
                results,
                f"# Inorrect: {incorrect_count}",
                [[front, scores[0], scores[1]] for front, scores in results.items()],
            )

        correct_btn.click(
            mark_correct,
            [selected_card, results],
            [results, correct_field, results_table],
        )

        incorrect_btn.click(
            mark_incorrect,
            [selected_card, results],
            [results, incorrect_field, results_table],
        )

if __name__ == "__main__":
    demo.launch()
