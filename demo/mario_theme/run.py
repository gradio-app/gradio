import gradio as gr
from gradio.themes.mario import Mario

theme = Mario()

with gr.Blocks(title="Super Mario Theme") as demo:
    gr.Markdown("# WORLD 1-1\n### A Super Mario Bros. Gradio Theme")

    with gr.Row():
        with gr.Column():
            name = gr.Textbox(label="PLAYER NAME", placeholder="Enter your name...", value="MARIO")
            lives = gr.Number(label="LIVES", value=3)
            difficulty = gr.Radio(
                ["EASY", "NORMAL", "HARD"],
                label="DIFFICULTY",
                value="NORMAL",
            )
        with gr.Column():
            world = gr.Dropdown(
                ["1-1", "1-2", "1-3", "1-4", "2-1", "4-1", "8-4"],
                label="SELECT WORLD",
                value="1-1",
            )
            powerup = gr.CheckboxGroup(
                ["MUSHROOM", "FIRE FLOWER", "STAR", "1-UP"],
                label="POWER-UPS",
                value=["MUSHROOM"],
            )
            coins = gr.Slider(0, 99, value=42, step=1, label="COINS")

    with gr.Row():
        start_btn = gr.Button("START GAME", variant="primary")
        pause_btn = gr.Button("PAUSE", variant="secondary")
        quit_btn = gr.Button("GAME OVER", variant="stop")

    output = gr.Textbox(label="GAME STATUS", lines=3, interactive=False)

    def start_game(player, lives_count, diff, selected_world, powers, coin_count):
        power_text = ", ".join(powers) if powers else "NONE"
        return (
            f"PLAYER: {player}\n"
            f"WORLD {selected_world} - {diff} MODE\n"
            f"LIVES: {'♥ ' * int(lives_count)}  COINS: {int(coin_count)}  POWER-UPS: {power_text}"
        )

    start_btn.click(
        start_game,
        inputs=[name, lives, difficulty, world, powerup, coins],
        outputs=output,
    )

    with gr.Accordion("HIGH SCORES", open=False):
        gr.Dataframe(
            headers=["RANK", "PLAYER", "SCORE", "WORLD"],
            value=[
                ["1", "MARIO", "999999", "8-4"],
                ["2", "LUIGI", "875000", "8-3"],
                ["3", "PEACH", "650000", "7-4"],
                ["4", "TOAD", "420000", "5-2"],
            ],
            interactive=False,
        )

if __name__ == "__main__":
    demo.launch(theme=theme, css=Mario.css())
