import gradio as gr
import random
import time


with gr.Blocks() as demo:
    with gr.Row():
        text = gr.Textbox()
        textb = gr.Textbox()
    with gr.Row():
        load_set_btn = gr.Button("Load Set")
        load_random_btn = gr.Button("Load Random")
        clean_imgs_btn = gr.Button("Clean Images")
        wait_btn = gr.Button("Wait")
        do_all_btn = gr.Button("Do All")
    text2 = gr.Textbox()

    # tqdm over list
    def load_set(text, text2, progress=gr.Progress()):
        imgs = [None] * 24
        for img in progress.tqdm(imgs, message="Loading from list"):
            time.sleep(0.1)
        return "done"
    load_set_btn.click(load_set, [text, textb], text2)

    # tqdm over iterable of unknown length
    def load_random(data, progress=gr.Progress()):
        def yielder():
            for i in range(0, random.randint(15, 20)):
                time.sleep(0.1)
                yield None
        for img in progress.tqdm(yielder()):
            pass
        return "done"
    load_random_btn.click(load_random, {text, textb}, text2)
        
    # manual progress
    def clean_imgs(text, progress=gr.Progress()):
        progress(0.2, message="Collecting Images")
        time.sleep(1)
        progress(0.5, message="Cleaning Images")
        time.sleep(1.5)
        progress(0.8, message="Sending Images")
        time.sleep(1.5)
        return "done"
    clean_imgs_btn.click(clean_imgs, text, text2)

    # no progress
    def wait(text):
        time.sleep(4)
        return "done"
    wait_btn.click(wait, text, text2)

    # multiple progressions
    def do_all(data, progress=gr.Progress()):
        load_set(data[text], data[textb], progress)
        load_random(data, progress)
        clean_imgs(data[text], progress)
        progress(None)
        wait(text)
        return "done"
    do_all_btn.click(do_all, {text, textb}, text2)

if __name__ == "__main__":
    demo.queue().launch()
