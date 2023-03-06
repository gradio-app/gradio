import gradio as gr
import torch
from torchaudio.sox_effects import apply_effects_file
from transformers import AutoFeatureExtractor, AutoModelForAudioXVector
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

OUTPUT_OK = (
    """
    <div class="container">
        <div class="row"><h1 style="text-align: center">The speakers are</h1></div>
        <div class="row"><h1 class="display-1 text-success" style="text-align: center">{:.1f}%</h1></div>
        <div class="row"><h1 style="text-align: center">similar</h1></div>
        <div class="row"><h1 class="text-success" style="text-align: center">Welcome, human!</h1></div>
        <div class="row"><small style="text-align: center">(You must get at least 85% to be considered the same person)</small><div class="row">
    </div>
"""
)
OUTPUT_FAIL = (
    """
    <div class="container">
        <div class="row"><h1 style="text-align: center">The speakers are</h1></div>
        <div class="row"><h1 class="display-1 text-danger" style="text-align: center">{:.1f}%</h1></div>
        <div class="row"><h1 style="text-align: center">similar</h1></div>
        <div class="row"><h1 class="text-danger" style="text-align: center">You shall not pass!</h1></div>
        <div class="row"><small style="text-align: center">(You must get at least 85% to be considered the same person)</small><div class="row">
    </div>
"""
)

EFFECTS = [
    ["remix", "-"],
    ["channels", "1"],
    ["rate", "16000"],
    ["gain", "-1.0"],
    ["silence", "1", "0.1", "0.1%", "-1", "0.1", "0.1%"],
    ["trim", "0", "10"],
]

THRESHOLD = 0.85

model_name = "microsoft/unispeech-sat-base-plus-sv"
feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
model = AutoModelForAudioXVector.from_pretrained(model_name).to(device)
cosine_sim = torch.nn.CosineSimilarity(dim=-1)


def similarity_fn(path1, path2):
    if not (path1 and path2):
        return '<b style="color:red">ERROR: Please record audio for *both* speakers!</b>'

    wav1, _ = apply_effects_file(path1, EFFECTS)
    wav2, _ = apply_effects_file(path2, EFFECTS)
    print(wav1.shape, wav2.shape)

    input1 = feature_extractor(wav1.squeeze(0), return_tensors="pt", sampling_rate=16000).input_values.to(device)
    input2 = feature_extractor(wav2.squeeze(0), return_tensors="pt", sampling_rate=16000).input_values.to(device)

    with torch.no_grad():
        emb1 = model(input1).embeddings
        emb2 = model(input2).embeddings
    emb1 = torch.nn.functional.normalize(emb1, dim=-1).cpu()
    emb2 = torch.nn.functional.normalize(emb2, dim=-1).cpu()
    similarity = cosine_sim(emb1, emb2).numpy()[0]

    if similarity >= THRESHOLD:
        output = OUTPUT_OK.format(similarity * 100)
    else:
        output = OUTPUT_FAIL.format(similarity * 100)

    return output

inputs = [
    gr.inputs.Audio(source="microphone", type="filepath", optional=True, label="Speaker #1"),
    gr.inputs.Audio(source="microphone", type="filepath", optional=True, label="Speaker #2"),
]
output = gr.outputs.HTML(label="")


description = (
    "This demo from Microsoft will compare two speech samples and determine if they are from the same speaker. "
    "Try it with your own voice!"
)
article = (
    "<p style='text-align: center'>"
    "<a href='https://huggingface.co/microsoft/unispeech-sat-large-sv' target='_blank'>🎙️ Learn more about UniSpeech-SAT</a> | "
    "<a href='https://arxiv.org/abs/2110.05752' target='_blank'>📚 UniSpeech-SAT paper</a> | "
    "<a href='https://www.danielpovey.com/files/2018_icassp_xvectors.pdf' target='_blank'>📚 X-Vector paper</a>"
    "</p>"
)
examples = [
    ["samples/cate_blanch.mp3", "samples/cate_blanch_2.mp3"],
    ["samples/cate_blanch.mp3", "samples/heath_ledger.mp3"],
]

interface = gr.Interface(
    fn=similarity_fn,
    inputs=inputs,
    outputs=output,
    layout="horizontal",
    allow_flagging=False,
    live=False,
    examples=examples,
    cache_examples=False
)
interface.launch()
