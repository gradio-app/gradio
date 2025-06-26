import gradio as gr

if gr.NO_RELOAD:
    def eat(food):
        if food > 0:
            return {food_box: food - 1, status_box: "full"}
        else:
            return {status_box: "hungry"}
else:
    def eat(food):
        return {status_box: "reloaded"}


with gr.Blocks() as demo:
    food_box = gr.Number(value=10, label="Food Count!!")
    status_box = gr.Textbox(label="Status")

    gr.Button("Eat").click(fn=eat,
                           inputs=food_box,
                           outputs=[food_box, status_box])

demo.launch()
