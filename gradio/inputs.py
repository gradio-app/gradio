"""
This module defines various classes that can serve as the `input` to an interface. Each class must inherit from
`InputComponent`, and each class must define a path to its template. All of the subclasses of `InputComponent` are
automatically added to a registry, which allows them to be easily referenced in other parts of the code.
"""

import datetime
import json
import os
import shutil
import time
import warnings
from gradio.component import Component
import base64
import numpy as np
import PIL
import scipy.io.wavfile
from gradio import processing_utils, test_data
import pandas as pd
from ffmpy import FFmpeg
import math
import tempfile
from pandas.api.types import is_bool_dtype, is_numeric_dtype, is_string_dtype
from pathlib import Path


class InputComponent(Component):
    """
    Input Component. All input components subclass this.
    """
    def __init__(self, label, requires_permissions=False):
        self.set_interpret_parameters()
        super().__init__(label, requires_permissions)

    def preprocess(self, x):
        """
        Any preprocessing needed to be performed on function input.
        """
        return x

    def preprocess_example(self, x):
        """
        Any preprocessing needed to be performed on an example before being passed to the main function.
        """
        return x

    def set_interpret_parameters(self):
        '''
        Set any parameters for interpretation.
        '''
        return self

    def get_interpretation_neighbors(self, x):
        '''
        Generates values similar to input to be used to interpret the significance of the input in the final output.
        Parameters:
        x (Any): Input to interface
        Returns: (neighbor_values, interpret_kwargs, interpret_by_removal)
        neighbor_values (List[Any]): Neighboring values to input x to compute for interpretation
        interpret_kwargs (Dict[Any]): Keyword arguments to be passed to get_interpretation_scores
        interpret_by_removal (bool): If True, returned neighbors are values where the interpreted subsection was removed. If False, returned neighbors are values where the interpreted subsection was modified to a different value.
        '''
        pass

    def get_interpretation_scores(self, x, neighbors, scores, **kwargs):
        '''
        Arrange the output values from the neighbors into interpretation scores for the interface to render.
        Parameters:
        x (Any): Input to interface
        neighbors (List[Any]): Neighboring values to input x used for interpretation.
        scores (List[float]): Output value corresponding to each neighbor in neighbors
        kwargs (Dict[str, Any]): Any additional arguments passed from get_interpretation_neighbors.
        Returns:
        (List[Any]): Arrangement of interpretation scores for interfaces to render.
        '''
        pass

    def embed(self, x):
        """
        Return a default embedding for the *preprocessed* input to the interface. Used to compute similar inputs.
        x (Any): Input to interface
        Returns:
        (List[Float]): An embedding vector as a list or numpy array of floats
        """
        pass

class Textbox(InputComponent):
    """
    Component creates a textbox for user to enter input. Provides a string as an argument to the wrapped function.
    Input type: str
    """

    def __init__(self, lines=1, placeholder=None, default="", numeric=False, type="str", label=None):
        """
        Parameters:
        lines (int): number of line rows to provide in textarea.
        placeholder (str): placeholder hint to provide behind textarea.
        default (str): default text to provide in textarea.
        numeric (bool): DEPRECATED. Whether the input should be parsed as a number instead of a string.        
        type (str): DEPRECATED. Type of value to be returned by component. "str" returns a string, "number" returns a float value. Use Number component in place of number type.
        label (str): component name in interface.
        """
        self.lines = lines
        self.placeholder = placeholder
        self.default = default
        if numeric or type == "number":
            warnings.warn("The 'numeric' type has been deprecated. Use the Number input component instead.", DeprecationWarning)
            self.type = "number"
        else:
            self.type = type
        if default == "":
            self.test_input = {
                "str": "the quick brown fox jumped over the lazy dog",
                "number": 786.92,
            }[type]
        else:
            self.test_input = default
        self.interpret_by_tokens = True
        super().__init__(label)

    def get_template_context(self):
        return {
            "lines": self.lines,
            "placeholder": self.placeholder,
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "text": {},
            "textbox": {"lines": 7},
        }

    def preprocess(self, x):
        if self.type == "str":
            return x
        elif self.type == "number":
            return float(x)
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'str', 'number'.")

    def preprocess_example(self, x):
        """
        Returns:
        (str): Text representing function input
        """
        return x

    def set_interpret_parameters(self, separator=" ", replacement=None):
        """
        Calculates interpretation score of characters in input by splitting input into tokens, then using a "leave one out" method to calculate the score of each token by removing each token and measuring the delta of the output value.
        Parameters:
        separator (str): Separator to use to split input into tokens.
        replacement (str): In the "leave one out" step, the text that the token should be replaced with.
        """
        self.interpretation_separator = separator
        self.interpretation_replacement = replacement
        return self

    def tokenize(self, x):
        """
        Tokenizes an input string by dividing into "words" delimited by self.interpretation_separator
        """
        tokens = x.split(self.interpretation_separator)
        leave_one_out_strings = []
        for index in range(len(tokens)):
            leave_one_out_set = list(tokens)
            if self.interpretation_replacement is None:
                leave_one_out_set.pop(index)
            else:
                leave_one_out_set[index] = self.interpretation_replacement
            leave_one_out_strings.append(self.interpretation_separator.join(leave_one_out_set))
        return tokens, leave_one_out_strings, None

    def get_masked_inputs(self, tokens, binary_mask_matrix):
        """
        Constructs partially-masked sentences for SHAP interpretation
        """
        masked_inputs = []
        for binary_mask_vector in binary_mask_matrix:
            masked_input = np.array(tokens)[np.array(binary_mask_vector, dtype=bool)]
            masked_inputs.append(self.interpretation_separator.join(masked_input))
        return masked_inputs
    
    def get_interpretation_scores(self, x, neighbors, scores, tokens, masks=None):
        """
        Returns:
        (List[Tuple[str, float]]): Each tuple set represents a set of characters and their corresponding interpretation score.
        """
        result = []
        for token, score in zip(tokens, scores):
            result.append((token, score))
            result.append((self.interpretation_separator, 0))
        return result

    def _embed_text(self, text):
        """
        Figures out a "reasonable" embedding for any particular text. Did it this way to avoid loading any 
        external machine learning models, which would be slow and require additional dependencies.
        """
        top_english_words = ['find', 'new', 'work', 'part', 'take', 'get', 'place', 'made', 'live', 'where', 'after', 'back', 'little', 'only', 'round', 'man', 'year', 'came', 'show', 'every', 'good', 'me', 'give', 'our', 'under', 'name', 'very', 'through', 'just', 'form', 'sentence', 'great', 'think', 'say', 'help', 'low', 'line', 'differ', 'turn', 'cause', 'much', 'mean', 'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'tell', 'does', 'set', 'three', 'want', 'air', 'well', 'also', 'play', 'small', 'end', 'put', 'home', 'read', 'hand', 'port', 'large', 'spell', 'add', 'even', 'land', 'here', 'must', 'big', 'high', 'such', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'us', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self', 'earth', 'father', 'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'between', 'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left', 'late', 'run', 'don\'t', 'while', 'press', 'close', 'night', 'real', 'life', 'few', 'north', 'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk', 'example', 'ease', 'paper', 'group', 'always', 'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'book', 'carry', 'took', 'science', 'eat', 'room', 'friend', 'began', 'idea', 'fish', 'mountain', 'stop', 'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face', 'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best', 'hour', 'better', 'true', 'during', 'hundred', 'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan', 'figure', 'star', 'box', 'noun', 'field', 'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood', 'contain', 'front', 'teach', 'week', 'final', 'gave', 'green', 'oh', 'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'multiply', 'nothing', 'course', 'stay', 'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'record', 'boat', 'common', 'gold', 'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'thousand', 'ago', 'ran', 'check', 'game', 'shape', 'equate', 'hot', 'miss', 'brought', 'heat', 'snow', 'tire', 'bring', 'yes', 'distant', 'fill', 'east', 'paint', 'language', 'among', 'grand', 'ball', 'yet', 'wave', 'drop', 'heart', 'am', 'present', 'heavy', 'dance', 'engine', 'position', 'arm', 'wide', 'sail', 'material', 'size', 'vary', 'settle', 'speak', 'weight', 'general', 'ice', 'matter', 'circle', 'pair', 'include', 'divide', 'syllable', 'felt', 'perhaps', 'pick', 'sudden', 'count', 'square', 'reason', 'length', 'represent', 'art', 'subject', 'region', 'energy', 'hunt', 'probable', 'bed', 'brother', 'egg', 'ride', 'cell', 'believe', 'fraction', 'forest', 'sit', 'race', 'window', 'store', 'summer', 'train', 'sleep', 'prove', 'lone', 'leg', 'exercise', 'wall', 'catch', 'mount', 'wish', 'sky', 'board', 'joy', 'winter', 'sat', 'written', 'wild', 'instrument', 'kept', 'glass', 'grass', 'cow', 'job', 'edge', 'sign', 'visit', 'past', 'soft', 'fun', 'bright', 'gas', 'weather', 'month', 'million', 'bear', 'finish', 'happy', 'hope', 'flower', 'clothe', 'strange', 'gone', 'jump', 'baby', 'eight', 'village', 'meet', 'root', 'buy', 'raise', 'solve', 'metal', 'whether', 'push', 'seven', 'paragraph', 'third', 'shall', 'held', 'hair', 'describe', 'cook', 'floor', 'either', 'result', 'burn', 'hill', 'safe', 'cat', 'century', 'consider', 'type', 'law', 'bit', 'coast', 'copy', 'phrase', 'silent', 'tall', 'sand', 'soil', 'roll', 'temperature', 'finger', 'industry', 'value', 'fight', 'lie', 'beat', 'excite', 'natural', 'view', 'sense', 'ear', 'else', 'quite', 'broke', 'case', 'middle', 'kill', 'son', 'lake', 'moment', 'scale', 'loud', 'spring', 'observe', 'child', 'straight', 'consonant', 'nation', 'dictionary', 'milk', 'speed', 'method', 'organ', 'pay', 'age', 'section', 'dress', 'cloud', 'surprise', 'quiet', 'stone', 'tiny', 'climb', 'cool', 'design', 'poor', 'lot', 'experiment', 'bottom', 'key', 'iron', 'single', 'stick', 'flat', 'twenty', 'skin', 'smile', 'crease', 'hole', 'trade', 'melody', 'trip', 'office', 'receive', 'row', 'mouth', 'exact', 'symbol', 'die', 'least', 'trouble', 'shout', 'except', 'wrote', 'seed', 'tone', 'join', 'suggest', 'clean', 'break', 'lady', 'yard', 'rise', 'bad', 'blow', 'oil', 'blood', 'touch', 'grew', 'cent', 'mix', 'team', 'wire', 'cost', 'lost', 'brown', 'wear', 'garden', 'equal', 'sent', 'choose', 'fell', 'fit', 'flow', 'fair', 'bank', 'collect', 'save', 'control', 'decimal', 'gentle', 'woman', 'captain', 'practice', 'separate', 'difficult', 'doctor', 'please', 'protect', 'noon', 'whose', 'locate', 'ring', 'character', 'insect', 'caught', 'period', 'indicate', 'radio', 'spoke', 'atom', 'human', 'history', 'effect', 'electric', 'expect', 'crop', 'modern', 'element', 'hit', 'student', 'corner', 'party', 'supply', 'bone', 'rail', 'imagine', 'provide', 'agree', 'thus', 'capital', 'won\'t', 'chair', 'danger', 'fruit', 'rich', 'thick', 'soldier', 'process', 'operate', 'guess', 'necessary', 'sharp', 'wing', 'create', 'neighbor', 'wash', 'bat', 'rather', 'crowd', 'corn', 'compare', 'poem', 'string', 'bell', 'depend', 'meat', 'rub', 'tube', 'famous', 'dollar', 'stream', 'fear', 'sight', 'thin', 'triangle', 'planet', 'hurry', 'chief', 'colony', 'clock', 'mine', 'tie', 'enter', 'major', 'fresh', 'search', 'send', 'yellow', 'gun', 'allow', 'print', 'dead', 'spot', 'desert', 'suit', 'current', 'lift', 'rose', 'continue', 'block', 'chart', 'hat', 'sell', 'success', 'company', 'subtract', 'event', 'particular', 'deal', 'swim', 'term', 'opposite', 'wife', 'shoe', 'shoulder', 'spread', 'arrange', 'camp', 'invent', 'cotton', 'born', 'determine', 'quart', 'nine', 'truck', 'noise', 'level', 'chance', 'gather', 'shop', 'stretch', 'throw', 'shine', 'property', 'column', 'molecule', 'select', 'wrong', 'gray', 'repeat', 'require', 'broad', 'prepare', 'salt', 'nose', 'plural', 'anger', 'claim', 'continent', 'oxygen', 'sugar', 'death', 'pretty', 'skill', 'women', 'season', 'solution', 'magnet', 'silver', 'thank', 'branch', 'match', 'suffix', 'especially', 'fig', 'afraid', 'huge', 'sister', 'steel', 'discuss', 'forward', 'similar', 'guide', 'experience', 'score', 'apple', 'bought', 'led', 'pitch', 'coat', 'mass', 'card', 'band', 'rope', 'slip', 'win', 'dream', 'evening', 'condition', 'feed', 'tool', 'total', 'basic', 'smell', 'valley', 'nor', 'double', 'seat', 'arrive', 'master', 'track', 'parent', 'shore', 'division', 'sheet', 'substance', 'favor', 'connect', 'post', 'spend', 'chord', 'fat', 'glad', 'original', 'share', 'station', 'dad', 'bread', 'charge', 'proper', 'bar', 'offer', 'segment', 'slave', 'duck', 'instant', 'market', 'degree', 'populate', 'chick', 'dear', 'enemy', 'reply', 'drink', 'occur', 'support', 'speech', 'nature', 'range', 'steam', 'motion', 'path', 'liquid', 'log', 'meant', 'quotient', 'teeth', 'shell', 'neck']
        words = text.split(' ')
        return np.array([w in words for w in top_english_words])

    def embed(self, x):
        """
        Embeds an arbitrary text based on word frequency
        """
        if self.type == "str":
            return self._embed_text(x)
        elif self.type == "number":
            return [float(x)]
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'str', 'number'.")


class Number(InputComponent):
    """
    Component creates a field for user to enter numeric input. Provides a nuber as an argument to the wrapped function.
    Input type: float
    """

    def __init__(self, default=None, label=None):
        '''
        Parameters:
        default (float): default value.
        label (str): component name in interface.
        '''
        self.default = default
        self.test_input = default if default is not None else 1
        self.interpret_by_tokens = False
        super().__init__(label)

    def get_template_context(self):
        return {
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "number": {},
        }

    def preprocess(self, x):
        """
        Returns:
        (float): Number representing function input
        """
        return float(x)

    def preprocess_example(self, x):
        """
        Returns:
        (float): Number representing function input
        """
        return x

    def set_interpret_parameters(self, steps=3, delta=1, delta_type="percent"):
        """
        Calculates interpretation scores of numeric values close to the input number.
        Parameters:
        steps (int): Number of nearby values to measure in each direction (above and below the input number).
        delta (float): Size of step in each direction between nearby values.
        delta_type (str): "percent" if delta step between nearby values should be a calculated as a percent, or "absolute" if delta should be a constant step change.
        """
        self.interpretation_steps = steps
        self.interpretation_delta = delta
        self.interpretation_delta_type = delta_type
        return self
        
    def get_interpretation_neighbors(self, x):
        x = float(x)
        neighbors = []
        if self.interpretation_delta_type == "percent":
            delta = 1.0 * self.interpretation_delta * x / 100
        elif self.interpretation_delta_type == "absolute":
            delta = self.interpretation_delta
        negatives = (x + np.arange(-self.interpretation_steps, 0) * delta).tolist()
        positives = (x + np.arange(1, self.interpretation_steps+1) * delta).tolist()
        return negatives + positives, {}

    def get_interpretation_scores(self, x, neighbors, scores):
        """
        Returns:
        (List[Tuple[float, float]]): Each tuple set represents a numeric value near the input and its corresponding interpretation score.
        """
        interpretation = list(zip(neighbors, scores))
        interpretation.insert(int(len(interpretation) / 2), [x, None])
        return interpretation

    def embed(self, x):
        return [float(x)]


class Slider(InputComponent):
    """
    Component creates a slider that ranges from `minimum` to `maximum`. Provides a number as an argument to the wrapped function.
    Input type: float
    """

    def __init__(self, minimum=0, maximum=100, step=None, default=None, label=None):
        '''
        Parameters:
        minimum (float): minimum value for slider.
        maximum (float): maximum value for slider.
        step (float): increment between slider values.
        default (float): default value.
        label (str): component name in interface.
        '''
        self.minimum = minimum
        self.maximum = maximum
        if step is None:
            difference = maximum - minimum
            power = math.floor(math.log10(difference) - 2)
            step = 10 ** power
        self.step = step
        self.default = minimum if default is None else default
        self.test_input = self.default
        self.interpret_by_tokens = False        
        super().__init__(label)

    def get_template_context(self):
        return {
            "minimum": self.minimum,
            "maximum": self.maximum,
            "step": self.step,
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "slider": {},
        }

    def preprocess_example(self, x):
        """
        Returns:
        (float): Number representing function input
        """
        return x

    def set_interpret_parameters(self, steps=8):
        """
        Calculates interpretation scores of numeric values ranging between the minimum and maximum values of the slider.
        Parameters:
        steps (int): Number of neighboring values to measure between the minimum and maximum values of the slider range.
        """
        self.interpretation_steps = steps
        return self

    def get_interpretation_neighbors(self, x):
        return np.linspace(self.minimum, self.maximum, self.interpretation_steps).tolist(), {}

    def get_interpretation_scores(self, x, neighbors, scores):
        """
        Returns:
        (List[float]): Each value represents the score corresponding to an evenly spaced range of inputs between the minimum and maximum slider values.
        """
        return scores

    def embed(self, x):
        return [float(x)]



class Checkbox(InputComponent):
    """
    Component creates a checkbox that can be set to `True` or `False`. Provides a boolean as an argument to the wrapped function.
    Input type: bool
    """

    def __init__(self, default=False, label=None):
        """
        Parameters:
        label (str): component name in interface.
        default (bool): default value.
        """
        self.test_input = True
        self.default = default
        self.interpret_by_tokens = False        
        super().__init__(label)
    
    def get_template_context(self):
        return {
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "checkbox": {},
        }

    def preprocess_example(self, x):
        """
        Returns:
        (bool): Boolean representing function input
        """
        return x

    def set_interpret_parameters(self):
        """
        Calculates interpretation score of the input by comparing the output against the output when the input is the inverse boolean value of x.
        """
        return self

    def get_interpretation_neighbors(self, x):
        return [not x], {}

    def get_interpretation_scores(self, x, neighbors, scores):
        """
        Returns:
        (Tuple[float, float]): The first value represents the interpretation score if the input is False, and the second if the input is True.
        """
        if x:
            return scores[0], None
        else:
            return None, scores[0]

    def embed(self, x):
        return [float(x)]



class CheckboxGroup(InputComponent):
    """
    Component creates a set of checkboxes of which a subset can be selected. Provides a list of strings representing the selected choices as an argument to the wrapped function.
    Input type: Union[List[str], List[int]]
    """

    def __init__(self, choices, default=[], type="value", label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        default (List[str]): default selected list of options.
        type (str): Type of value to be returned by component. "value" returns the list of strings of the choices selected, "index" returns the list of indicies of the choices selected.
        label (str): component name in interface.
        '''
        self.choices = choices
        self.default = default
        self.type = type
        self.test_input = self.choices
        self.interpret_by_tokens = False        
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            "default": self.default,
            **super().get_template_context()
        }

    def preprocess(self, x):
        if self.type == "value":
            return x
        elif self.type == "index":
            return [self.choices.index(choice) for choice in x]
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'value', 'index'.")

    def set_interpret_parameters(self):
        """
        Calculates interpretation score of each choice in the input by comparing the output against the outputs when each choice in the input is independently either removed or added.
        """
        return self

    def get_interpretation_neighbors(self, x):
        leave_one_out_sets = []
        for choice in self.choices:
            leave_one_out_set = list(x)
            if choice in leave_one_out_set:
                leave_one_out_set.remove(choice)
            else:
                leave_one_out_set.append(choice)
            leave_one_out_sets.append(leave_one_out_set)
        return leave_one_out_sets, {}

    def get_interpretation_scores(self, x, neighbors, scores):
        """
        Returns:
        (List[Tuple[float, float]]): For each tuple in the list, the first value represents the interpretation score if the input is False, and the second if the input is True.
        """
        final_scores = []
        for choice, score in zip(self.choices, scores):
            if choice in x:
                score_set = [score, None]
            else:
                score_set = [None, score]
            final_scores.append(score_set)
        return final_scores

    def embed(self, x):
        if self.type == "value":
            return [float(choice in x) for choice in self.choices]
        elif self.type == "index":
            return [float(index in x) for index in range(len(self.choices))]
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'value', 'index'.")

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (List[str]])
        """
        return json.dumps(data)

    def restore_flagged(self, data):
        return json.loads(data)


class Radio(InputComponent):
    """
    Component creates a set of radio buttons of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: Union[str, int]
    """

    def __init__(self, choices, type="value", default=None, label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        default (str): default value.
        label (str): component name in interface.
        '''
        self.choices = choices
        self.type = type
        self.test_input = self.choices[0]
        self.default = default if default is not None else self.choices[0]
        self.interpret_by_tokens = False        
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            "default": self.default,
            **super().get_template_context()
        }

    def preprocess(self, x):
        if self.type == "value":
            return x
        elif self.type == "index":
            return self.choices.index(x)
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'value', 'index'.")

    def set_interpret_parameters(self):
        """
        Calculates interpretation score of each choice by comparing the output against each of the outputs when alternative choices are selected.
        """
        return self

    def get_interpretation_neighbors(self, x):
        choices = list(self.choices)
        choices.remove(x)
        return choices, {}

    def get_interpretation_scores(self, x, neighbors, scores):        
        """
        Returns:
        (List[float]): Each value represents the interpretation score corresponding to each choice.
        """
        scores.insert(self.choices.index(x), None)
        return scores

    def embed(self, x):
        if self.type == "value":
            return [float(choice==x) for choice in self.choices]
        elif self.type == "index":
            return [float(index==x) for index in range(len(self.choices))]
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'value', 'index'.")


class Dropdown(InputComponent):
    """
    Component creates a dropdown of which only one can be selected. Provides string representing selected choice as an argument to the wrapped function.
    Input type: Union[str, int]
    """

    def __init__(self, choices, type="value", default=None, label=None):
        '''
        Parameters:
        choices (List[str]): list of options to select from.
        type (str): Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
        default (str): default value.
        label (str): component name in interface.
        '''
        self.choices = choices
        self.type = type
        self.test_input = self.choices[0]
        self.default = default if default is not None else self.choices[0]
        self.interpret_by_tokens = False        
        super().__init__(label)

    def get_template_context(self):
        return {
            "choices": self.choices,
            "default": self.default,
            **super().get_template_context()
        }

    def preprocess(self, x):
        if self.type == "value":
            return x
        elif self.type == "index":
            return self.choices.index(x)
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'value', 'index'.")

    def set_interpret_parameters(self):
        """
        Calculates interpretation score of each choice by comparing the output against each of the outputs when alternative choices are selected.
        """
        return self

    def get_interpretation_neighbors(self, x):
        choices = list(self.choices)
        choices.remove(x)
        return choices, {}

    def get_interpretation_scores(self, x, neighbors, scores):
        """
        Returns:
        (List[float]): Each value represents the interpretation score corresponding to each choice.
        """
        scores.insert(self.choices.index(x), None)
        return scores

    def embed(self, x):
        if self.type == "value":
            return [float(choice==x) for choice in self.choices]
        elif self.type == "index":
            return [float(index==x) for index in range(len(self.choices))]
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'value', 'index'.")


class Image(InputComponent):
    """
    Component creates an image upload box with editing capabilities. 
    Input type: Union[numpy.array, PIL.Image, file-object]
    """

    def __init__(self, shape=None, image_mode='RGB', invert_colors=False, source="upload", tool="editor", labeled_segments=False, type="numpy", label=None):
        '''
        Parameters:
        shape (Tuple[int, int]): (width, height) shape to crop and resize image to; if None, matches input image size.
        image_mode (str): "RGB" if color, or "L" if black and white.
        invert_colors (bool): whether to invert the image as a preprocessing step.
        source (str): Source of image. "upload" creates a box where user can drop an image file, "webcam" allows user to take snapshot from their webcam, "canvas" defaults to a white image that can be edited and drawn upon with tools.
        tool (str): Tools used for editing. "editor" allows a full screen editor, "select" provides a cropping and zoom tool.
        type (str): Type of value to be returned by component. "numpy" returns a numpy array with shape (width, height, 3) and values from 0 to 255, "pil" returns a PIL image object, "file" returns a temporary file object whose path can be retrieved by file_obj.name.
        label (str): component name in interface.
        '''
        self.shape = shape
        self.image_mode = image_mode
        self.source = source
        requires_permissions = source == "webcam" 
        self.tool = tool
        self.type = type
        self.invert_colors = invert_colors
        self.test_input = test_data.BASE64_IMAGE
        self.interpret_by_tokens = True
        super().__init__(label, requires_permissions)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "image": {},
            "webcam": {"source": "webcam"},
            "sketchpad": {"image_mode": "L", "source": "canvas", "shape": (28, 28), "invert_colors": True},
        }

    def get_template_context(self):
        return {
            "image_mode": self.image_mode,
            "shape": self.shape,
            "source": self.source,
            "tool": self.tool,
            **super().get_template_context()
        }

    def preprocess(self, x):
        im = processing_utils.decode_base64_to_image(x)
        fmt = im.format
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            im = im.convert(self.image_mode)
        if self.shape is not None:
            im = processing_utils.resize_and_crop(im, self.shape)
        if self.invert_colors:
            im = PIL.ImageOps.invert(im)
        if self.type == "pil":
            return im
        elif self.type == "numpy":
            return np.array(im)
        elif self.type == "file":
            file_obj = tempfile.NamedTemporaryFile(delete=False, suffix=("."+fmt.lower() if fmt is not None else ".png"))
            im.save(file_obj.name)
            return file_obj
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'numpy', 'pil', 'file'.")

    def preprocess_example(self, x):
        return processing_utils.encode_file_to_base64(x)

    def set_interpret_parameters(self, segments=16):
        """
        Calculates interpretation score of image subsections by splitting the image into subsections, then using a "leave one out" method to calculate the score of each subsection by whiting out the subsection and measuring the delta of the output value.
        Parameters:
        segments (int): Number of interpretation segments to split image into.
        """
        self.interpretation_segments = segments
        return self

    def _segment_by_slic(self, x):
        """
        Helper method that segments an image into superpixels using slic.
        Parameters:
        x: base64 representation of an image
        """
        x = processing_utils.decode_base64_to_image(x)
        if self.shape is not None:
            x = processing_utils.resize_and_crop(x, self.shape)
        resized_and_cropped_image = np.array(x)
        try:
            from skimage.segmentation import slic
        except (ImportError, ModuleNotFoundError):
            raise ValueError("Error: running this interpretation for images requires scikit-image, please install it first.")
        try:
            segments_slic = slic(
                resized_and_cropped_image, self.interpretation_segments, compactness=10, 
                sigma=1, start_label=1)
        except TypeError:  # For skimage 0.16 and older
            segments_slic = slic(
                resized_and_cropped_image, self.interpretation_segments, compactness=10, 
                sigma=1)
        return segments_slic, resized_and_cropped_image

    def tokenize(self, x):
        """
        Segments image into tokens, masks, and leave-one-out-tokens
        Parameters:
        x: base64 representation of an image
        Returns:
        tokens: list of tokens, used by the get_masked_input() method
        leave_one_out_tokens: list of left-out tokens, used by the get_interpretation_neighbors() method
        masks: list of masks, used by the get_interpretation_neighbors() method
        """
        segments_slic, resized_and_cropped_image = self._segment_by_slic(x)
        tokens, masks, leave_one_out_tokens = [], [], []
        replace_color = np.mean(resized_and_cropped_image, axis=(0, 1))
        for (i, segment_value) in enumerate(np.unique(segments_slic)):
            mask = (segments_slic == segment_value)
            image_screen = np.copy(resized_and_cropped_image)
            image_screen[segments_slic == segment_value] = replace_color
            leave_one_out_tokens.append(
                processing_utils.encode_array_to_base64(image_screen))
            token = np.copy(resized_and_cropped_image)
            token[segments_slic != segment_value] = 0
            tokens.append(token)
            masks.append(mask)
        return tokens, leave_one_out_tokens, masks

    def get_masked_inputs(self, tokens, binary_mask_matrix):
        masked_inputs = []
        for binary_mask_vector in binary_mask_matrix:
            masked_input = np.zeros_like(tokens[0], dtype=int)
            for token, b in zip(tokens, binary_mask_vector):
                masked_input = masked_input + token*int(b)
            masked_inputs.append(processing_utils.encode_array_to_base64(masked_input))
        return masked_inputs

    def get_interpretation_scores(self, x, neighbors, scores, masks, tokens=None):
        """
        Returns:
        (List[List[float]]): A 2D array representing the interpretation score of each pixel of the image.
        """
        x = processing_utils.decode_base64_to_image(x)
        if self.shape is not None:
            x = processing_utils.resize_and_crop(x, self.shape)
        x = np.array(x)
        output_scores = np.zeros((x.shape[0], x.shape[1]))

        for score, mask in zip(scores, masks):
            output_scores += score * mask

        max_val, min_val = np.max(output_scores), np.min(output_scores)
        if max_val > 0:
            output_scores = (output_scores - min_val) / (max_val - min_val)
        return output_scores.tolist()

    def embed(self, x):
        shape = (100, 100) if self.shape is None else self.shape  
        if self.type == "pil":
            im = x
        elif self.type == "numpy":
            im = PIL.Image.fromarray(x)
        elif self.type == "file":
            im = PIL.Image.open(x)
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'numpy', 'pil', 'file'.")
        im = processing_utils.resize_and_crop(im, (shape[0], shape[1]))
        return np.asarray(im).flatten()

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to image file
        """
        return self.save_flagged_file(dir, label, data, encryption_key)


class Video(InputComponent):
    """
    Component creates a video file upload that is converted to a file path.
    Input type: filepath
    """

    def __init__(self, type="avi", label=None):
        '''
        Parameters:
        type (str): Type of video format to be returned by component, such as 'avi' or 'mp4'. If set to None, video will keep uploaded format.
        label (str): component name in interface.
        '''
        self.type = type
        super().__init__(label)

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "video": {},
        }

    def get_template_context(self):
        return {
            **super().get_template_context()
        }

    def preprocess(self, x):
        file = processing_utils.decode_base64_to_file(x)
        file_name = file.name
        uploaded_format = file_name.split(".")[-1].lower()
        if self.type is not None and uploaded_format != self.type:
            ff = FFmpeg(
                inputs={file_name: None},
                outputs={file_name + "." + self.type: None}
            )
            file_name += "." + self.type
            ff.run()
        return file_name

    def preprocess_example(self, x):
        return processing_utils.encode_file_to_base64(x)

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to video file
        """
        return self.save_flagged_file(dir, label, data, encryption_key)

class Audio(InputComponent):
    """
    Component accepts audio input files. 
    Input type: Union[Tuple[int, numpy.array], file-object, numpy.array]
    """

    def __init__(self, source="upload", type="numpy", label=None):
        """
        Parameters:
        source (str): Source of audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input.
        type (str): Type of value to be returned by component. "numpy" returns a 2-set tuple with an integer sample_rate and the data numpy.array of shape (samples, 2), "file" returns a temporary file object whose path can be retrieved by file_obj.name, "mfcc" returns the mfcc coefficients of the input audio.
        label (str): component name in interface.
        """
        self.source = source
        requires_permissions = source == "microphone" 
        self.type = type
        self.test_input = test_data.BASE64_AUDIO
        self.interpret_by_tokens = True
        super().__init__(label, requires_permissions)

    def get_template_context(self):
        return {
            "source": self.source,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "audio": {},
            "microphone": {"source": "microphone"}
        }

    def preprocess(self, x):
        """
        By default, no pre-processing is applied to a microphone input file
        """
        file_obj = processing_utils.decode_base64_to_file(x)
        if self.type == "file":
            return file_obj
        elif self.type == "numpy":
            return scipy.io.wavfile.read(file_obj.name)
        elif self.type == "mfcc":
            return processing_utils.generate_mfcc_features_from_audio_file(file_obj.name)

    def preprocess_example(self, x):
        return processing_utils.encode_file_to_base64(x, type="audio")

    def set_interpret_parameters(self, segments=8):
        """
        Calculates interpretation score of audio subsections by splitting the audio into subsections, then using a "leave one out" method to calculate the score of each subsection by removing the subsection and measuring the delta of the output value.
        Parameters:
        segments (int): Number of interpretation segments to split audio into.
        """
        self.interpretation_segments = segments
        return self
    
    def tokenize(self, x):
        file_obj = processing_utils.decode_base64_to_file(x)
        x = scipy.io.wavfile.read(file_obj.name)
        sample_rate, data = x
        leave_one_out_sets = []
        tokens = []
        masks = []
        duration = data.shape[0]
        boundaries = np.linspace(0, duration, self.interpretation_segments + 1).tolist()
        boundaries = [round(boundary) for boundary in boundaries]
        for index in range(len(boundaries) - 1):
            start, stop = boundaries[index], boundaries[index + 1]
            masks.append((start, stop))
            # Handle the leave one outs
            leave_one_out_data = np.copy(data)
            leave_one_out_data[start:stop] = 0
            file = tempfile.NamedTemporaryFile(delete=False)
            scipy.io.wavfile.write(file, sample_rate, leave_one_out_data)                
            out_data = processing_utils.encode_file_to_base64(file.name, type="audio", ext="wav")
            leave_one_out_sets.append(out_data)
            # Handle the tokens
            token = np.copy(data)
            token[0:start] = 0
            token[stop:] = 0
            file = tempfile.NamedTemporaryFile(delete=False)
            scipy.io.wavfile.write(file, sample_rate, token)                
            token_data = processing_utils.encode_file_to_base64(file.name, type="audio", ext="wav")
            tokens.append(token_data)
        return tokens, leave_one_out_sets, masks

    def get_masked_inputs(self, tokens, binary_mask_matrix):
        # create a "zero input" vector and get sample rate
        x = tokens[0]
        file_obj = processing_utils.decode_base64_to_file(x)
        sample_rate, data = scipy.io.wavfile.read(file_obj.name)
        zero_input = np.zeros_like(data, dtype=int)
        # decode all of the tokens
        token_data = []
        for token in tokens:
            file_obj = processing_utils.decode_base64_to_file(token)
            _, data = scipy.io.wavfile.read(file_obj.name)
            token_data.append(data)
        # construct the masked version
        masked_inputs = []
        for binary_mask_vector in binary_mask_matrix:
            masked_input = np.copy(zero_input)
            for t, b in zip(token_data, binary_mask_vector):
                masked_input = masked_input + t*int(b)
            file = tempfile.NamedTemporaryFile(delete=False)
            scipy.io.wavfile.write(file, sample_rate, masked_input)
            masked_data = processing_utils.encode_file_to_base64(file.name, type="audio", ext="wav")
            masked_inputs.append(masked_data)
        return masked_inputs

    def get_interpretation_scores(self, x, neighbors, scores, masks=None, tokens=None):
        """
        Returns:
        (List[float]): Each value represents the interpretation score corresponding to an evenly spaced subsection of audio.
        """
        return list(scores)

    def embed(self, x):
        """
        Resamples each audio signal to be 1,000 frames and then returns the flattened vectors
        """
        num_frames = 1000
        if self.type == "file":
            filename = x.name
            mfcc = processing_utils.generate_mfcc_features_from_audio_file(filename, downsample_to=num_frames)
            return mfcc.flatten() 
        elif self.type == "numpy":
            sample_rate, signal = x
            mfcc = processing_utils.generate_mfcc_features_from_audio_file(wav_filename=None, sample_rate=sample_rate, signal=signal, downsample_to=num_frames)
            return mfcc.flatten() 
        elif self.type == "mfcc":
            mfcc = scipy.signal.resample(x, num_frames, axis=1)
            return mfcc.flatten()
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'numpy', 'mfcc', 'file'.")

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to audio file
        """
        return self.save_flagged_file(dir, label, data, encryption_key)


class File(InputComponent):
    """
    Component accepts generic file uploads.
    Input type: Union[file-object, bytes, List[Union[file-object, bytes]]]
    """

    def __init__(self, file_count="single", type="file", label=None, keep_filename=True):
        '''
        Parameters:
        file_count (str): if single, allows user to upload one file. If "multiple", user uploads multiple files. If "directory", user uploads all files in selected directory. Return type will be list for each file in case of "multiple" or "directory".
        type (str): Type of value to be returned by component. "file" returns a temporary file object whose path can be retrieved by file_obj.name, "binary" returns an bytes object.
        keep_filename (bool): whether to keep the original filename in the f.name field upon upload. If true, will place 'originalfilename' + a '_' before the unique temporary safe filename string and extension
        label (str): component name in interface.
        '''
        self.file_count = file_count
        self.type = type
        self.test_input = None
        self.keep_filename = keep_filename
        super().__init__(label)

    def get_template_context(self):
        return {
            "file_count": self.file_count,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "file": {},
            "files": {"file_count": "multiple"},
        }

    def preprocess(self, x):
        def process_single_file(f):
            name, data, is_local_example = f["name"], f["data"], f["is_local_example"]            
            if self.type == "file":
                if is_local_example:
                    return open(name)
                else:
                    if self.keep_filename: 
                        filename_prefix=Path(name).stem+'_'
                    else: 
                        filename_prefix=""
                    return processing_utils.decode_base64_to_file(data, filename_prefix=filename_prefix)
            elif self.type == "bytes":
                if is_local_example:
                    with open(name, "rb") as file_data:
                        return file_data.read()
                return processing_utils.decode_base64_to_binary(data)[0]
            else:
                raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'file', 'bytes'.")
        if self.file_count == "single":
            if isinstance(x, list): 
                return process_single_file(x[0])
            else: 
                return process_single_file(x)
        else:
            return [process_single_file(f) for f in x]


    def embed(self, x):
        raise NotImplementedError("File doesn't currently support embeddings")

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (str) path to file
        """
        return self.save_flagged_file(dir, label, data["data"], encryption_key)


class Dataframe(InputComponent):
    """
    Component accepts 2D input through a spreadsheet interface.
    Input type: Union[pandas.DataFrame, numpy.array, List[Union[str, float]], List[List[Union[str, float]]]]
    """

    def __init__(self, headers=None, row_count=3, col_count=3, datatype="str", col_width=None, default=None, type="pandas", label=None):
        """
        Parameters:
        headers (List[str]): Header names to dataframe.
        row_count (int): Limit number of rows for input.
        col_count (int): Limit number of columns for input. If equal to 1, return data will be one-dimensional. Ignored if `headers` is provided.
        datatype (Union[str, List[str]]): Datatype of values in sheet. Can be provided per column as a list of strings, or for the entire sheet as a single string. Valid datatypes are "str", "number", "bool", and "date".
        col_width (Union[int, List[int]]): Width of columns in pixels. Can be provided as single value or list of values per column.
        default (List[List[Any]]): Default value
        type (str): Type of value to be returned by component. "pandas" for pandas dataframe, "numpy" for numpy array, or "array" for a Python array.
        label (str): component name in interface.
        """
        self.headers = headers
        self.datatype = datatype
        self.row_count = row_count
        self.col_count = len(headers) if headers else col_count
        self.col_width = col_width
        self.type = type
        self.default = default if default is not None else [[None for _ in range(self.col_count)] for _ in range(self.row_count)]
        sample_values = {"str": "abc", "number": 786, "bool": True, "date": "02/08/1993"}
        column_dtypes = [datatype]*self.col_count if isinstance(datatype, str) else datatype
        self.test_input = [[sample_values[c] for c in column_dtypes] for _ in range(row_count)]

        super().__init__(label)

    def get_template_context(self):
        return {
            "headers": self.headers,
            "datatype": self.datatype,
            "row_count": self.row_count,
            "col_count": self.col_count,
            "col_width": self.col_width,
            "default": self.default,
            **super().get_template_context()
        }

    @classmethod
    def get_shortcut_implementations(cls):
        return {
            "dataframe": {"type": "pandas"},
            "numpy": {"type": "numpy"},
            "matrix": {"type": "array"},
            "list": {"type": "array", "col_count": 1},
        }

    def preprocess(self, x):
        if self.type == "pandas":
            if self.headers:
                return pd.DataFrame(x, columns=self.headers)
            else:
                return pd.DataFrame(x)
        if self.col_count == 1:
            x = [row[0] for row in x]
        if self.type == "numpy":
            return np.array(x)
        elif self.type == "array":
            return x
        else:
            raise ValueError("Unknown type: " + str(self.type) + ". Please choose from: 'pandas', 'numpy', 'array'.")

    # def set_interpret_parameters(self):
    #     """
    #     Calculates interpretation score of each cell in the Dataframe by using a "leave one out" method to calculate the score of each cell by removing the cell and measuring the delta of the output value.
    #     """
    #     return self

    # def get_interpretation_neighbors(self, x):
    #     x = pd.DataFrame(x)
    #     leave_one_out_sets = []
    #     shape = x.shape
    #     for i in range(shape[0]):
    #         for j in range(shape[1]):
    #             scalar = x.iloc[i, j]
    #             leave_one_out_df = x.copy()
    #             if is_bool_dtype(scalar):
    #                 leave_one_out_df.iloc[i, j] = not scalar
    #             elif is_numeric_dtype(scalar):
    #                 leave_one_out_df.iloc[i, j] = 0
    #             elif is_string_dtype(scalar):
    #                 leave_one_out_df.iloc[i, j] = ""
    #             leave_one_out_sets.append(leave_one_out_df.values.tolist())
    #     return leave_one_out_sets, {"shape": x.shape}

    # def get_interpretation_scores(self, x, neighbors, scores, shape):
    #     """
    #     Returns:
    #     (List[List[float]]): A 2D array where each value corrseponds to the interpretation score of each cell.
    #     """
    #     return np.array(scores).reshape((shape)).tolist()

    def embed(self, x):
        raise NotImplementedError("DataFrame doesn't currently support embeddings")

    def save_flagged(self, dir, label, data, encryption_key):
        """
        Returns: (List[List[Union[str, float]]]) 2D array
        """
        return json.dumps(data)

    def restore_flagged(self, data):
        return json.loads(data)


def get_input_instance(iface):
    if isinstance(iface, str):
        shortcut = InputComponent.get_all_shortcut_implementations()[
                                                                    iface]
        return shortcut[0](**shortcut[1])
    elif isinstance(iface, InputComponent):
        return iface
    else:
        raise ValueError("Input interface must be of type `str` or "
                            "`InputComponent` but is {}".format(iface))
