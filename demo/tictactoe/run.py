import gradio as gr

with gr.Blocks() as demo:
    turn = gr.Textbox("X", interactive=False, label="Turn")
    board = gr.Dataframe(value=[["", "", ""]] * 3, interactive=False, type="array")

    def place(board: list[list[int]], turn, evt: gr.SelectData):  # type: ignore
        if evt.value:
            return board, turn
        board[evt.index[0]][evt.index[1]] = turn
        turn = "O" if turn == "X" else "X"
        return board, turn

    board.select(place, [board, turn], [board, turn], show_progress="hidden")

if __name__ == "__main__":
    demo.launch()
