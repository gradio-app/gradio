from gradio.outputs import Label, Textbox
import math

def diff(original, perturbed):
    try:  # try computing numerical difference
        score = float(original) - float(perturbed)
    except ValueError:  # otherwise, look at strict difference in label
        score = int(not(original == perturbed))
    return score

def quantify_difference_in_label(interface, original_output, perturbed_output):
    output_component = interface.output_components[0]
    post_original_output = output_component.postprocess(original_output[0])
    post_perturbed_output = output_component.postprocess(perturbed_output[0])

    if isinstance(output_component, Label):
        original_label = post_original_output["label"]
        perturbed_label = post_perturbed_output["label"]

        # Handle different return types of Label interface
        if "confidences" in post_original_output:
            original_confidence = original_output[0][original_label]
            perturbed_confidence = perturbed_output[0][original_label]
            score = original_confidence - perturbed_confidence
        else:
            score = diff(original_label, perturbed_label)
        return score

    elif isinstance(output_component, Textbox):
        score = diff(post_original_output, post_perturbed_output)
        return score
    
    else:
        raise ValueError("This interpretation method doesn't support the Output component: {}".format(output_component))

def get_regression_or_classification_value(interface, original_output, perturbed_output):
    """Used to combine regression/classification for Shap interpretation method."""
    output_component = interface.output_components[0]
    post_original_output = output_component.postprocess(original_output[0])
    post_perturbed_output = output_component.postprocess(perturbed_output[0])

    if type(output_component) == Label:
        original_label = post_original_output["label"]
        perturbed_label = post_perturbed_output["label"]

        # Handle different return types of Label interface
        if "confidences" in post_original_output:
            if math.isnan(perturbed_output[0][original_label]):
                return 0
            return perturbed_output[0][original_label]
        else:
            score = diff(perturbed_label, original_label)  # Intentionall inverted order of arguments.
        return score

    else:
        raise ValueError("This interpretation method doesn't support the Output component: {}".format(output_component))

