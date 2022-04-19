import requests
import torch
from PIL import Image
from torchvision import transforms

import gradio as gr

model = torch.hub.load("pytorch/vision:v0.6.0", "resnet18", pretrained=True).eval()

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")


def predict(inp):
    inp = Image.fromarray(inp.astype("uint8"), "RGB")
    inp = transforms.ToTensor()(inp).unsqueeze(0)
    with torch.no_grad():
        prediction = torch.nn.functional.softmax(model(inp)[0], dim=0)
    return {labels[i]: float(prediction[i]) for i in range(1000)}


inputs = gr.Image()
outputs = gr.Label(num_top_classes=3)

demo = gr.Interface(fn=predict, inputs=inputs, outputs=outputs)

if __name__ == "__main__":
    demo.launch()
