import gradio as gr
import torch
from torchvision import transforms
from PIL import Image
import json
from os.path import dirname, realpath, join

# Load human-readable labels for Resnet.
current_dir = dirname(realpath(__file__))
with open(join(current_dir, "files/imagenet_labels.json")) as labels_file:
    labels = json.load(labels_file)

model = torch.hub.load('pytorch/vision:v0.6.0', 'resnet18', pretrained=True).eval()

def predict(inp):
  inp = Image.fromarray(inp.astype('uint8'), 'RGB')
  inp = transforms.ToTensor()(inp).unsqueeze(0)
  with torch.no_grad():
    prediction = torch.nn.functional.softmax(model(inp)[0], dim=0)
  return {labels[i]: float(prediction[i]) for i in range(1000)}

inputs = gr.inputs.Image()
outputs = gr.outputs.Label(num_top_classes=3)
gr.Interface(fn=predict, inputs=inputs, outputs=outputs).launch()