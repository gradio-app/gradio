import gradio as gr

with gr.Blocks() as demo:
    date1 = gr.DateTime(include_time=True, label="Date and Time", type="datetime", elem_id="date1")
    date2 = gr.DateTime(include_time=False, label="Date Only", type="string", elem_id="date2")
    date3 = gr.DateTime(elem_id="date3", timezone="Europe/Paris")

    with gr.Row():
        btn1 = gr.Button("Load Date 1")
        btn2 = gr.Button("Load Date 2")
        btn3 = gr.Button("Load Date 3")

    click_output = gr.Textbox(label="Last Load")
    change_output = gr.Textbox(label="Last Change")
    submit_output = gr.Textbox(label="Last Submit")

    btn1.click(lambda x:x, date1, click_output)
    btn2.click(lambda x:x, date2, click_output)
    btn3.click(lambda x:x, date3, click_output)

    for item in [date1, date2, date3]:
        item.change(lambda x:x, item, change_output)
        item.submit(lambda x:x, item, submit_output)

if __name__ == "__main__":
    demo.launch()
