import gradio as gr
import os, sys
file_folder = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(file_folder, "utils"))
from FCN8s_keras import FCN
from PIL import Image
import cv2
import tensorflow as tf
from drive import download_file_from_google_drive
import numpy as np

weights = os.path.join(file_folder, "face_seg_model_weights.h5")
if not os.path.exists(weights):
    file_id = "1IerDF2DQqmJWqyvxYZOICJT1eThnG8WR"
    download_file_from_google_drive(file_id, weights)

model1 = FCN()
model1.load_weights(weights)


def segment_face(inp):
    im = Image.fromarray(np.uint8(inp))
    im = im.resize((500, 500))
    in_ = np.array(im, dtype=np.float32)    
    in_ = in_[:, :, ::-1]
    in_ -= np.array((104.00698793,116.66876762,122.67891434))
    in_ = in_[np.newaxis,:]    
    out = model1.predict(in_)
    
    out_resized = cv2.resize(np.squeeze(out), (inp.shape[1], inp.shape[0]))
    out_resized_clipped = np.clip(out_resized.argmax(axis=2), 0, 1).astype(np.float64)    
    result = (out_resized_clipped[:, :, np.newaxis] + 0.25)/1.25 * inp.astype(np.float64).astype(np.uint8)
    return result / 255


iface = gr.Interface(segment_face, gr.inputs.Image(source="webcam", tool=None), "image", capture_session=True)

if __name__ == "__main__":
    iface.launch()