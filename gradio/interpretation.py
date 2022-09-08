import copy
import math

import numpy as np

from gradio import utils
from gradio.components import Label, Number, Textbox


async def run_interpret(interface, raw_input):
    """
    Runs the interpretation command for the machine learning model. Handles both the "default" out-of-the-box
    interpretation for a certain set of UI component types, as well as the custom interpretation case.
    Parameters:
    raw_input: a list of raw inputs to apply the interpretation(s) on.
    """
    if isinstance(interface.interpretation, list):  # Either "default" or "shap"
        processed_input = [
            input_component.preprocess(raw_input[i])
            for i, input_component in enumerate(interface.input_components)
        ]
        original_output = await interface.call_function(0, processed_input)
        original_output = original_output["prediction"]

        if len(interface.output_components) == 1:
            original_output = [original_output]

        scores, alternative_outputs = [], []

        for i, (x, interp) in enumerate(zip(raw_input, interface.interpretation)):
            if interp == "default":
                input_component = interface.input_components[i]
                neighbor_raw_input = list(raw_input)
                if input_component.interpret_by_tokens:
                    tokens, neighbor_values, masks = input_component.tokenize(x)
                    interface_scores = []
                    alternative_output = []
                    for neighbor_input in neighbor_values:
                        neighbor_raw_input[i] = neighbor_input
                        processed_neighbor_input = [
                            input_component.preprocess(neighbor_raw_input[i])
                            for i, input_component in enumerate(
                                interface.input_components
                            )
                        ]

                        neighbor_output = await interface.call_function(
                            0, processed_neighbor_input
                        )
                        neighbor_output = neighbor_output["prediction"]
                        if len(interface.output_components) == 1:
                            neighbor_output = [neighbor_output]
                        processed_neighbor_output = [
                            output_component.postprocess(neighbor_output[i])
                            for i, output_component in enumerate(
                                interface.output_components
                            )
                        ]

                        alternative_output.append(processed_neighbor_output)
                        interface_scores.append(
                            quantify_difference_in_label(
                                interface, original_output, neighbor_output
                            )
                        )
                    alternative_outputs.append(alternative_output)
                    scores.append(
                        input_component.get_interpretation_scores(
                            raw_input[i],
                            neighbor_values,
                            interface_scores,
                            masks=masks,
                            tokens=tokens,
                        )
                    )
                else:
                    (
                        neighbor_values,
                        interpret_kwargs,
                    ) = input_component.get_interpretation_neighbors(x)
                    interface_scores = []
                    alternative_output = []
                    for neighbor_input in neighbor_values:
                        neighbor_raw_input[i] = neighbor_input
                        processed_neighbor_input = [
                            input_component.preprocess(neighbor_raw_input[i])
                            for i, input_component in enumerate(
                                interface.input_components
                            )
                        ]
                        neighbor_output = await interface.call_function(
                            0, processed_neighbor_input
                        )
                        neighbor_output = neighbor_output["prediction"]
                        if len(interface.output_components) == 1:
                            neighbor_output = [neighbor_output]
                        processed_neighbor_output = [
                            output_component.postprocess(neighbor_output[i])
                            for i, output_component in enumerate(
                                interface.output_components
                            )
                        ]

                        alternative_output.append(processed_neighbor_output)
                        interface_scores.append(
                            quantify_difference_in_label(
                                interface, original_output, neighbor_output
                            )
                        )
                    alternative_outputs.append(alternative_output)
                    interface_scores = [-score for score in interface_scores]
                    scores.append(
                        input_component.get_interpretation_scores(
                            raw_input[i],
                            neighbor_values,
                            interface_scores,
                            **interpret_kwargs
                        )
                    )
            elif interp == "shap" or interp == "shapley":
                try:
                    import shap  # type: ignore
                except (ImportError, ModuleNotFoundError):
                    raise ValueError(
                        "The package `shap` is required for this interpretation method. Try: `pip install shap`"
                    )
                input_component = interface.input_components[i]
                if not (input_component.interpret_by_tokens):
                    raise ValueError(
                        "Input component {} does not support `shap` interpretation".format(
                            input_component
                        )
                    )

                tokens, _, masks = input_component.tokenize(x)

                # construct a masked version of the input
                def get_masked_prediction(binary_mask):
                    masked_xs = input_component.get_masked_inputs(tokens, binary_mask)
                    preds = []
                    for masked_x in masked_xs:
                        processed_masked_input = copy.deepcopy(processed_input)
                        processed_masked_input[i] = input_component.preprocess(masked_x)
                        new_output = utils.synchronize_async(
                            interface.call_function, 0, processed_masked_input
                        )
                        new_output = new_output["prediction"]
                        if len(interface.output_components) == 1:
                            new_output = [new_output]
                        pred = get_regression_or_classification_value(
                            interface, original_output, new_output
                        )
                        preds.append(pred)
                    return np.array(preds)

                num_total_segments = len(tokens)
                explainer = shap.KernelExplainer(
                    get_masked_prediction, np.zeros((1, num_total_segments))
                )
                shap_values = explainer.shap_values(
                    np.ones((1, num_total_segments)),
                    nsamples=int(interface.num_shap * num_total_segments),
                    silent=True,
                )
                scores.append(
                    input_component.get_interpretation_scores(
                        raw_input[i], None, shap_values[0], masks=masks, tokens=tokens
                    )
                )
                alternative_outputs.append([])
            elif interp is None:
                scores.append(None)
                alternative_outputs.append([])
            else:
                raise ValueError("Unknown intepretation method: {}".format(interp))
        return scores, alternative_outputs
    else:  # custom interpretation function
        processed_input = [
            input_component.preprocess(raw_input[i])
            for i, input_component in enumerate(interface.input_components)
        ]
        interpreter = interface.interpretation
        interpretation = interpreter(*processed_input)
        if len(raw_input) == 1:
            interpretation = [interpretation]
        return interpretation, []


def diff(original, perturbed):
    try:  # try computing numerical difference
        score = float(original) - float(perturbed)
    except ValueError:  # otherwise, look at strict difference in label
        score = int(not (original == perturbed))
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

    elif isinstance(output_component, Number):
        score = diff(post_original_output, post_perturbed_output)
        return score

    else:
        raise ValueError(
            "This interpretation method doesn't support the Output component: {}".format(
                output_component
            )
        )


def get_regression_or_classification_value(
    interface, original_output, perturbed_output
):
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
            score = diff(
                perturbed_label, original_label
            )  # Intentionally inverted order of arguments.
        return score

    else:
        raise ValueError(
            "This interpretation method doesn't support the Output component: {}".format(
                output_component
            )
        )
