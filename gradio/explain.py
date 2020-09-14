from gradio.inputs import Textbox
from gradio.inputs import Image

from skimage.color import rgb2gray
from skimage.filters import sobel
from skimage.segmentation import slic
from skimage.util import img_as_float
from skimage import io
import numpy as np


def tokenize_text(text):
    leave_one_out_tokens = []
    tokens = text.split()
    leave_one_out_tokens.append(tokens)
    for idx, _ in enumerate(tokens):
        new_token_array = tokens.copy()
        del new_token_array[idx]
        leave_one_out_tokens.append(new_token_array)
    return leave_one_out_tokens

def tokenize_image(image):
    img = img_as_float(image[::2, ::2])
    segments_slic = slic(img, n_segments=20, compactness=10, sigma=1)
    leave_one_out_tokens = []
    for (i, segVal) in enumerate(np.unique(segments_slic)):
        mask = np.copy(img)
        mask[segments_slic == segVal] = 255
        leave_one_out_tokens.append(mask)
    return leave_one_out_tokens

def score(outputs):
    print(outputs)

def simple_explanation(interface, input_interfaces,
                       output_interfaces, input):
    if isinstance(input_interfaces[0], Textbox):
        leave_one_out_tokens = tokenize_text(input[0])
        outputs = []
        for input_text in leave_one_out_tokens:
            input_text = " ".join(input_text)
            print("Input Text: ", input_text)
            output = interface.process(input_text)
            outputs.extend(output)
            print("Output: ", output)
        score(outputs)

    elif isinstance(input_interfaces[0], Image):
        leave_one_out_tokens = tokenize_image(input[0])
        outputs = []
        for input_text in leave_one_out_tokens:
            input_text = " ".join(input_text)
            print("Input Text: ", input_text)
            output = interface.process(input_text)
            outputs.extend(output)
            print("Output: ", output)
        score(outputs)
    else:
        print("Not valid input type")
