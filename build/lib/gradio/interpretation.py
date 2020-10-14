from gradio.outputs import Label

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

