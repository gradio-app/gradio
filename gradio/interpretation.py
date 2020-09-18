from gradio.inputs import Image
from gradio.inputs import Textbox
from gradio import processing_utils
from skimage.segmentation import slic
import numpy as np


def tokenize_text(text):
    leave_one_out_tokens = []
    tokens = text.split()
    for idx, _ in enumerate(tokens):
        new_token_array = tokens.copy()
        del new_token_array[idx]
        leave_one_out_tokens.append(new_token_array)
    return tokens, leave_one_out_tokens


def tokenize_image(image):
    image = np.array(processing_utils.decode_base64_to_image(image))
    segments_slic = slic(image, n_segments=20, compactness=10, sigma=1)
    leave_one_out_tokens = []
    for (i, segVal) in enumerate(np.unique(segments_slic)):
        mask = segments_slic == segVal
        white_screen = np.copy(image)
        white_screen[segments_slic == segVal] = 255
        leave_one_out_tokens.append((mask, white_screen))
    return leave_one_out_tokens


def score_text(interface, leave_one_out_tokens, text):
    tokens = text.split()

    input_text = " ".join(tokens)
    original_output = interface.process([input_text])
    output = {result["label"]: result["confidence"]
              for result in original_output[0][0]['confidences']}
    original_label = original_output[0][0]["label"]
    original_confidence = output[original_label]

    scores = []
    for idx, input_text in enumerate(leave_one_out_tokens):
        input_text = " ".join(input_text)
        raw_output = interface.process([input_text])
        output = {result["label"]: result["confidence"]
                  for result in raw_output[0][0]['confidences']}
        scores.append(original_confidence - output[original_label])

    scores_by_char = []
    for idx, token in enumerate(tokens):
        if idx != 0:
            scores_by_char.append((" ", 0))
        for char in token:
            scores_by_char.append((char, scores[idx]))
    return scores_by_char


def score_image(interface, leave_one_out_tokens, image):
    original_output = interface.process([image])
    output = {result["label"]: result["confidence"]
              for result in original_output[0][0]['confidences']}
    original_label = original_output[0][0]["label"]
    original_confidence = output[original_label]

    shape = processing_utils.decode_base64_to_image(image).size
    output_scores = np.full((shape[1], shape[0]), 0.0)

    for mask, input_image in leave_one_out_tokens:
        input_image_base64 = processing_utils.encode_array_to_base64(
            input_image)
        raw_output = interface.process([input_image_base64])
        output = {result["label"]: result["confidence"]
                  for result in raw_output[0][0]['confidences']}
        score = original_confidence - output[original_label]
        output_scores += score * mask
    max_val = np.max(np.abs(output_scores))
    if max_val > 0:
        output_scores = output_scores / max_val
    return output_scores.tolist()


def simple_interpretation(interface, x):
    if isinstance(interface.input_interfaces[0], Textbox):
        tokens, leave_one_out_tokens = tokenize_text(interface,
                                                     x[0])
        return [score_text(interface, tokens, leave_one_out_tokens, x[0])]
    elif isinstance(interface.input_interfaces[0], Image):
        leave_one_out_tokens = tokenize_image(x[0])
        return [score_image(interface, leave_one_out_tokens, x[0])]
    else:
        print("Not valid input type")


def interpret(interface, x):
    if interface.interpret_by == "default":
        return simple_interpretation(interface, x)
    else:
        preprocessed_x = [input_interface(x_i) for x_i, input_interface in
                          zip(x, interface.input_interfaces)]
        return interface.interpret_by(*preprocessed_x)
