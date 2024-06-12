
import gradio as gr
from gradio_mytextbox import MyTextbox


example = MyTextbox().example_value()

demo = gr.Interface(
    lambda x:x,
    MyTextbox(),  # interactive version of your component
    MyTextbox(),  # static version of your component
    # examples=[[example]],  # uncomment this line to view the "example version" of your component
)


if __name__ == "__main__":
    demo.launch()
