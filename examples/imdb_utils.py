import tensorflow as tf
from tensorflow.keras.layers import *
from tensorflow.keras.datasets import imdb
import json
import numpy as np

top_words = 5000  # Only keep the 5,000 most frequent words
max_word_length = 500  # The maximum length of the review should be 500 words (trim/pad otherwise)


NUM_SPECIAL_TOKENS = 3
PAD_TOKEN = 0
START_TOKEN = 1
UNK_TOKEN = 2

word_to_id = tf.keras.datasets.imdb.get_word_index()
word_to_id = {k: (v + NUM_SPECIAL_TOKENS) for k, v in word_to_id.items()}

id_to_word = {value: key for key, value in word_to_id.items()}
id_to_word[PAD_TOKEN] = ""  # Padding tokens are converted to empty strings.
id_to_word[START_TOKEN] = ""  # Start tokens are converted to empty strings.
id_to_word[UNK_TOKEN] = "UNK"  # <UNK> tokens are converted to "UNK".


def decode_vector_to_text(vector):
    text = " ".join(id_to_word[id] for id in vector if id >= 2)
    return text


def encode_text_to_vector(text, max_word_length=500, top_words=5000):
    text_vector = text.split(" ")
    encoded_vector = [
        word_to_id.get(element, UNK_TOKEN) if word_to_id.get(element, UNK_TOKEN) < top_words else UNK_TOKEN for element
        in text_vector]
    encoded_vector = [START_TOKEN] + encoded_vector
    if len(encoded_vector) < max_word_length:
        encoded_vector = (max_word_length - len(encoded_vector)) * [PAD_TOKEN] + encoded_vector
    else:
        encoded_vector = encoded_vector[:max_word_length]
    return encoded_vector


def preprocessing(text):
    new = encode_text_to_vector(text)
    return tf.keras.preprocessing.sequence.pad_sequences([new], maxlen=max_word_length)


def postprocessing(pred):
    return {
        "Positive review": f"{pred[0][0]}",
        "Negative review": f"{1-pred[0][0]}"
    }
