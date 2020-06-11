#!/usr/bin/env python
# coding: utf-8

# In[9]:


import tensorflow as tf
import sys
import gradio
from tensorflow.keras.layers import *
from tensorflow.keras.datasets import imdb
import json
from tensorflow.keras import backend as K
import numpy as np


# In[2]:


top_words = 5000  # Only keep the 5,000 most frequent words
max_word_length = 500  # The maximum length of the review should be 500 words (trim/pad otherwise)

# (X_train, y_train), (X_test, y_test) = imdb.load_data(num_words=top_words);
# # save np.load
np_load_old = np.load
np.load = lambda *a,**k: np_load_old(*a, allow_pickle=True, **k)

# # # call load_data with allow_pickle implicitly set to true
(X_train, y_train), (X_test, y_test) = imdb.load_data(num_words=top_words);

# # restore np.load for future normal usage
np.load = np_load_old

X_train = tf.keras.preprocessing.sequence.pad_sequences(X_train, maxlen=max_word_length)
X_test = tf.keras.preprocessing.sequence.pad_sequences(X_test, maxlen=max_word_length)


def get_trained_model(n):
    model = tf.keras.models.Sequential()
    model.add(Embedding(top_words, 32, input_length=max_word_length))
    model.add(Dropout(0.2))
    model.add(Conv1D(250, 3, padding='valid', activation='relu', strides=1))
    model.add(GlobalMaxPooling1D())
    model.add(Dense(250))
    model.add(Dropout(0.2))
    model.add(Activation('relu'))
    model.add(Dense(1))
    model.add(Activation('sigmoid'))
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    model.fit(X_train[:n], y_train[:n], epochs=1, batch_size=128)
    print(model.evaluate(X_test[:n], y_test[:n]))
    return model


# In[3]:


model = get_trained_model(n=1000) #25000


# In[4]:


graph = tf.get_default_graph()
sess = tf.keras.backend.get_session()


# In[5]:


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
            
def predict(inp):
    inp = preprocessing(inp)
    with graph.as_default():
        with sess.as_default():
            prediction = model.predict(inp)
    prediction = postprocessing(prediction)
    return prediction


def saliency(input, output):
    with graph.as_default():
        with sess.as_default():
            processed_input = preprocessing(input)
            processed_output = output

            output = 0 if float(output["Positive review"]) > 0.5 else 1
            input_tensors = [model.layers[0].input, K.learning_phase()]
            saliency_input = model.layers[1].input
            saliency_output = model.layers[-1].output[:, output]
            gradients = model.optimizer.get_gradients(saliency_output, saliency_input)
            compute_gradients = K.function(inputs=input_tensors, outputs=gradients)
            saliency_graph = compute_gradients(processed_input.reshape(1, 500))[0]

            saliency_graph = saliency_graph.reshape(500, 32)

            saliency_graph = np.abs(saliency_graph).sum(axis=1)
            normalized_saliency = (saliency_graph - saliency_graph.min()) /                                   (saliency_graph.max() - saliency_graph.min())

            start_idx = np.where(processed_input[0] == START_TOKEN)[0][0]
            heat_map = []
            counter = 0
            words = input.split(" ")
            for i in range(start_idx + 1, 500):
                heat_map.extend([normalized_saliency[i]] * len(words[counter]))
                heat_map.append(0)  # zero saliency value assigned to the spaces between words
                counter += 1
            return np.array(heat_map)


# In[6]:


textbox = gradio.inputs.Textbox()
label = gradio.outputs.Label()
interface = gradio.Interface(inputs=textbox, outputs=label, fn=predict, saliency=saliency)


# In[8]:


interface.launch(inbrowser=True, share=False)


# In[ ]:





# In[ ]:




