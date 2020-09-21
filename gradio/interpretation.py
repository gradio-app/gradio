from gradio.inputs import Image, Textbox
from gradio.outputs import Label
from gradio import processing_utils
from skimage.segmentation import slic
import numpy as np

expected_types = {
    Image: "numpy",
}

def default(separator=" ", n_segments=20):
    """
    Basic "default" interpretation method that uses "leave-one-out" to explain predictions for
    the following inputs: Image, Text, and the following outputs: Label. In case of multiple
    inputs and outputs, uses the first component.
    """
    def tokenize_text(text):
        leave_one_out_tokens = []
        tokens = text.split(separator)
        for idx, _ in enumerate(tokens):
            new_token_array = tokens.copy()
            del new_token_array[idx]
            leave_one_out_tokens.append(new_token_array)
        return leave_one_out_tokens

    def tokenize_image(image):
        segments_slic = slic(image, n_segments=20, compactness=10, sigma=1)
        leave_one_out_tokens = []
        replace_color = np.mean(image, axis=(0, 1))
        for (i, segVal) in enumerate(np.unique(segments_slic)):
            mask = segments_slic == segVal
            white_screen = np.copy(image)
            white_screen[segments_slic == segVal] = replace_color
            leave_one_out_tokens.append((mask, white_screen))
        return leave_one_out_tokens

    def score_text(interface, leave_one_out_tokens, text):
        tokens = text.split(separator)
        original_output = interface.run_prediction([text])

        scores_by_words = []
        for idx, input_text in enumerate(leave_one_out_tokens):
            perturbed_text = separator.join(input_text)
            perturbed_output = interface.run_prediction([perturbed_text])
            score = quantify_difference_in_label(interface, original_output, perturbed_output)
            scores_by_words.append(score)

        scores_by_char = []
        for idx, token in enumerate(tokens):
            if idx != 0:
                scores_by_char.append((" ", 0))
            for char in token:
                scores_by_char.append((char, scores_by_words[idx]))
        
        return scores_by_char

    def score_image(interface, leave_one_out_tokens, image):
        output_scores = np.zeros((image.shape[0], image.shape[1]))
        original_output = interface.run_prediction([image])

        for mask, perturbed_image in leave_one_out_tokens:
            perturbed_output = interface.run_prediction([perturbed_image])
            score = quantify_difference_in_label(interface, original_output, perturbed_output)
            output_scores += score * mask

        max_val, min_val = np.max(output_scores), np.min(output_scores)
        if max_val > 0:
            output_scores = (output_scores - min_val) / (max_val - min_val)
        return output_scores.tolist()

    def quantify_difference_in_label(interface, original_output, perturbed_output):
        post_original_output = interface.output_interfaces[0].postprocess(original_output[0])
        post_perturbed_output = interface.output_interfaces[0].postprocess(perturbed_output[0])
        original_label = post_original_output["label"]
        perturbed_label = post_perturbed_output["label"]

        # Handle different return types of Label interface
        if "confidences" in post_original_output:
            original_confidence = original_output[0][original_label]
            perturbed_confidence = perturbed_output[0][original_label]
            score = original_confidence - perturbed_confidence
        else:
            try:  # try computing numerical difference
                score = float(original_label) - float(perturbed_label)
            except ValueError:  # otherwise, look at strict difference in label
                score = int(not(perturbed_label == original_label))
        return score

    def default_interpretation(interface, x):
        if isinstance(interface.input_interfaces[0], Textbox) \
                and isinstance(interface.output_interfaces[0], Label):
            leave_one_out_tokens = tokenize_text(x[0])
            return [score_text(interface, leave_one_out_tokens, x[0])]
        if isinstance(interface.input_interfaces[0], Image) \
                and isinstance(interface.output_interfaces[0], Label):
            leave_one_out_tokens = tokenize_image(x[0])
            return [score_image(interface, leave_one_out_tokens, x[0])]
        else:
            print("Not valid input or output types for 'default' interpretation")

    return default_interpretation

