import gradio as gr

headers = ["Short", "Medium Column", "Long Description", "Also Long"]

short_row = ["id-1", "alpha", "small cell", "small cell"]
long_row = [
    "id-2",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    (
        "This is a deliberately very long cell value intended to exceed any "
        "reasonable column width so we can see truncation and wrapping behavior "
        "kick in. It keeps going and going and going so that the column must "
        "either truncate with an ellipsis or wrap across multiple lines."
    ),
    "The quick brown fox jumps over the lazy dog several times in a row.",
]
unbreakable_row = [
    "id-3",
    "ok",
    "Supercalifragilisticexpialidocious" * 4,
    "word " * 30,
]

data = [
    short_row,
    long_row,
    unbreakable_row,
    short_row,
    long_row,
    unbreakable_row,
    short_row,
    long_row,
    unbreakable_row,
]

with gr.Blocks(title="Dataframe widths & wrapping") as demo:
    gr.Markdown(
        """
        # Dataframe column widths and wrapping

        Demonstrates how `wrap` and `column_widths` interact. In every case the
        column's max width is capped at 100% of the dataframe's viewport so a
        single cell can never be wider than the scroll area.
        """
    )

    with gr.Row():
        with gr.Tab("Defaults (no wrap, auto widths)"):
            gr.Markdown(
                "No `wrap`, no `column_widths`. Columns size to the longest cell; "
                "anything longer than the viewport truncates with an ellipsis."
            )
            gr.Dataframe(value=data, headers=headers)

        with gr.Tab("wrap=True, auto widths"):
            gr.Markdown(
                "`wrap=True` and no `column_widths`. Columns still size to the "
                "longest cell, but content that would exceed the viewport wraps "
                "onto multiple lines instead of truncating."
            )
            gr.Dataframe(value=data, headers=headers, wrap=True)

        with gr.Tab("Fixed pixel widths"):
            gr.Markdown(
                "`column_widths=['80px', '160px', '240px', '200px']`. Pixel widths "
                "are honored exactly; long content truncates."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                column_widths=["80px", "160px", "240px", "200px"],
            )

        with gr.Tab("Fixed pixel widths + wrap"):
            gr.Markdown(
                "Same fixed widths but `wrap=True`. Long content wraps within the "
                "fixed column instead of truncating."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                column_widths=["80px", "160px", "240px", "200px"],
                wrap=True,
            )

        with gr.Tab("Percentage widths"):
            gr.Markdown(
                "`column_widths=['10%', '25%', '40%', '25%']`. Percentages resolve "
                "against the dataframe's viewport width, so they re-flow when you "
                "resize the window."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                column_widths=["10%", "25%", "40%", "25%"],
            )

        with gr.Tab("Percentage widths + wrap"):
            gr.Markdown("Same percentages, but with `wrap=True`.")
            gr.Dataframe(
                value=data,
                headers=headers,
                column_widths=["10%", "25%", "40%", "25%"],
                wrap=True,
            )

        with gr.Tab("Mixed widths (px / % / int)"):
            gr.Markdown(
                "`column_widths=[120, '20%', 'auto', '30%']`. Integers are treated "
                "as pixels; `'auto'` falls back to content-based sizing (capped at "
                "the viewport)."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                column_widths=[120, "20%", "auto", "30%"],
            )

        with gr.Tab("max_chars with wide data"):
            gr.Markdown(
                "`max_chars=20` truncates cell text to 20 characters with an "
                "ellipsis. The column is sized to the rendered (truncated) text "
                "rather than the full underlying value, so there's no wasted "
                "horizontal space."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                max_chars=20,
            )

        with gr.Tab("max_chars + fixed widths + wrap"):
            gr.Markdown(
                "`max_chars=15`, explicit pixel widths, and `wrap=True`. Text is "
                "first truncated by character count, then wrapped to fit the "
                "column."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                max_chars=15,
                column_widths=["80px", "160px", "200px", "200px"],
                wrap=True,
            )

    with gr.Row():
        with gr.Tab("Defaults (no wrap, auto widths)"):
            gr.Markdown(
                "No `wrap`, no `column_widths`. Columns size to the longest cell; "
                "anything longer than the viewport truncates with an ellipsis."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                interactive=True,
            )

        with gr.Tab("wrap=True, auto widths"):
            gr.Markdown(
                "`wrap=True` and no `column_widths`. Columns still size to the "
                "longest cell, but content that would exceed the viewport wraps "
                "onto multiple lines instead of truncating."
            )
            gr.Dataframe(
                value=data,
                headers=headers,
                wrap=True,
                interactive=True,
            )

        with gr.Tab("Fixed pixel widths"):
            gr.Markdown(
                "`column_widths=['80px', '160px', '240px', '200px']`. Pixel widths "
                "are honored exactly; long content truncates."
            )
            gr.Dataframe(
                interactive=True,
                value=data,
                headers=headers,
                column_widths=["80px", "160px", "240px", "200px"],
            )

        with gr.Tab("Fixed pixel widths + wrap"):
            gr.Markdown(
                "Same fixed widths but `wrap=True`. Long content wraps within the "
                "fixed column instead of truncating."
            )
            gr.Dataframe(
                interactive=True,
                value=data,
                headers=headers,
                column_widths=["80px", "160px", "240px", "200px"],
                wrap=True,
            )

        with gr.Tab("Percentage widths"):
            gr.Markdown(
                "`column_widths=['10%', '25%', '40%', '25%']`. Percentages resolve "
                "against the dataframe's viewport width, so they re-flow when you "
                "resize the window."
            )
            gr.Dataframe(
                interactive=True,
                value=data,
                headers=headers,
                column_widths=["10%", "25%", "40%", "25%"],
            )

        with gr.Tab("Percentage widths + wrap"):
            gr.Markdown("Same percentages, but with `wrap=True`.")
            gr.Dataframe(
                value=data,
                interactive=True,
                headers=headers,
                column_widths=["10%", "25%", "40%", "25%"],
                wrap=True,
            )

        with gr.Tab("Mixed widths (px / % / int)"):
            gr.Markdown(
                "`column_widths=[120, '20%', 'auto', '30%']`. Integers are treated "
                "as pixels; `'auto'` falls back to content-based sizing (capped at "
                "the viewport)."
            )
            gr.Dataframe(
                value=data,
                interactive=True,
                headers=headers,
                column_widths=[120, "20%", "auto", "30%"],
            )

        with gr.Tab("max_chars with wide data"):
            gr.Markdown(
                "`max_chars=20` truncates cell text to 20 characters with an "
                "ellipsis. The column is sized to the rendered (truncated) text "
                "rather than the full underlying value, so there's no wasted "
                "horizontal space."
            )
            gr.Dataframe(
                interactive=True,
                value=data,
                headers=headers,
                max_chars=20,
            )

        with gr.Tab("max_chars + fixed widths + wrap"):
            gr.Markdown(
                "`max_chars=15`, explicit pixel widths, and `wrap=True`. Text is "
                "first truncated by character count, then wrapped to fit the "
                "column."
            )
            gr.Dataframe(
                interactive=True,
                value=data,
                headers=headers,
                max_chars=15,
                column_widths=["80px", "160px", "200px", "200px"],
                wrap=True,
            )

if __name__ == "__main__":
    demo.launch()
