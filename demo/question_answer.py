import gradio as gr
import os, sys
file_folder = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(file_folder, "utils"))
from bert import QA

model = QA('bert-large-uncased-whole-word-masking-finetuned-squad')
def qa_func(paragraph, question):
    return model.predict(paragraph, question)["answer"]

iface = gr.Interface(qa_func, 
    [
        gr.inputs.Textbox(lines=7, label="Context", default="Victoria has a written constitution enacted in 1975, but based on the 1855 colonial constitution, passed by the United Kingdom Parliament as the Victoria Constitution Act 1855, which establishes the Parliament as the state's law-making body for matters coming under state responsibility. The Victorian Constitution can be amended by the Parliament of Victoria, except for certain 'entrenched' provisions that require either an absolute majority in both houses, a three-fifths majority in both houses, or the approval of the Victorian people in a referendum, depending on the provision."), 
        gr.inputs.Textbox(lines=1, label="Question", default="When did Victoria enact its constitution?"), 
    ], 
    gr.outputs.Textbox(label="Answer"))
if __name__ == "__main__":
    iface.launch()
