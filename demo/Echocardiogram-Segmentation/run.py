import os
from os.path import splitext
import numpy as np
import sys
import matplotlib.pyplot as plt
import torch
import torchvision
import wget 


destination_folder = "output"
destination_for_weights = "weights"

if os.path.exists(destination_for_weights):
    print("The weights are at", destination_for_weights)
else:
    print("Creating folder at ", destination_for_weights, " to store weights")
    os.mkdir(destination_for_weights)
    
segmentationWeightsURL = 'https://github.com/douyang/EchoNetDynamic/releases/download/v1.0.0/deeplabv3_resnet50_random.pt'

if not os.path.exists(os.path.join(destination_for_weights, os.path.basename(segmentationWeightsURL))):
    print("Downloading Segmentation Weights, ", segmentationWeightsURL," to ",os.path.join(destination_for_weights, os.path.basename(segmentationWeightsURL)))
    filename = wget.download(segmentationWeightsURL, out = destination_for_weights)
else:
    print("Segmentation Weights already present")

torch.cuda.empty_cache()

def collate_fn(x):
    x, f = zip(*x)
    i = list(map(lambda t: t.shape[1], x))
    x = torch.as_tensor(np.swapaxes(np.concatenate(x, 1), 0, 1))
    return x, f, i

model = torchvision.models.segmentation.deeplabv3_resnet50(pretrained=False, aux_loss=False)
model.classifier[-1] = torch.nn.Conv2d(model.classifier[-1].in_channels, 1, kernel_size=model.classifier[-1].kernel_size)

print("loading weights from ", os.path.join(destination_for_weights, "deeplabv3_resnet50_random"))

if torch.cuda.is_available():
    print("cuda is available, original weights")
    device = torch.device("cuda")
    model = torch.nn.DataParallel(model)
    model.to(device)
    checkpoint = torch.load(os.path.join(destination_for_weights, os.path.basename(segmentationWeightsURL)))
    model.load_state_dict(checkpoint['state_dict'])
else:
    print("cuda is not available, cpu weights")
    device = torch.device("cpu")
    checkpoint = torch.load(os.path.join(destination_for_weights, os.path.basename(segmentationWeightsURL)), map_location = "cpu")
    state_dict_cpu = {k[7:]: v for (k, v) in checkpoint['state_dict'].items()}
    model.load_state_dict(state_dict_cpu)

model.eval()

def segment(input):
    inp = input
    x = inp.transpose([2, 0, 1])  #  channels-first
    x = np.expand_dims(x, axis=0)  # adding a batch dimension    
    
    mean = x.mean(axis=(0, 2, 3))
    std = x.std(axis=(0, 2, 3))
    x = x - mean.reshape(1, 3, 1, 1)
    x = x / std.reshape(1, 3, 1, 1)
    
    with torch.no_grad():
        x = torch.from_numpy(x).type('torch.FloatTensor').to(device)
        output = model(x)    
    
    y = output['out'].numpy()
    y = y.squeeze()
    
    out = y>0    
    
    mask = inp.copy()
    mask[out] = np.array([0, 0, 255])
    
    return mask

import gradio as gr

i = gr.inputs.Image(shape=(112, 112), label="Echocardiogram")
o = gr.outputs.Image(label="Segmentation Mask")

examples = [["img1.jpg"], ["img2.jpg"]]
title = None #"Left Ventricle Segmentation"
description = "This semantic segmentation model identifies the left ventricle in echocardiogram images."
# videos. Accurate evaluation of the motion and size of the left ventricle is crucial for the assessment of cardiac function and ejection fraction. In this interface, the user inputs apical-4-chamber images from echocardiography videos and the model will output a prediction of the localization of the left ventricle in blue. This model was trained on the publicly released EchoNet-Dynamic dataset of 10k echocardiogram videos with 20k expert annotations of the left ventricle and published as part of ‘Video-based AI for beat-to-beat assessment of cardiac function’ by Ouyang et al. in Nature, 2020."
thumbnail = "https://raw.githubusercontent.com/gradio-app/hub-echonet/master/thumbnail.png"
gr.Interface(segment, i, o, examples=examples, allow_flagging=False, analytics_enabled=False, thumbnail=thumbnail, cache_examples=False).launch()
