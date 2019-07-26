import tensorflow as tf
import sys
sys.path.insert(1, '../gradio')
import gradio
from tensorflow.keras.layers import *
from tensorflow.keras.datasets import imdb
import json
from tensorflow.keras import backend as K
import numpy as np


top_words = 5000  # Only keep the 5,000 most frequent words
max_word_length = 500  # The maximum length of the review should be 500 words (trim/pad otherwise)

(X_train, y_train), (X_test, y_test) = imdb.load_data(num_words=top_words);
X_train = tf.keras.preprocessing.sequence.pad_sequences(X_train, maxlen=max_word_length)
X_test = tf.keras.preprocessing.sequence.pad_sequences(X_test, maxlen=max_word_length)


def get_trained_model(n):
    model = tf.keras.models.Sequential()
    model.add(Embedding(top_words, 32, input_length=max_word_length))
    model.add(Flatten())
    model.add(Dense(250, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    model.fit(X_train[:n], y_train[:n], epochs=1, batch_size=128)
    return model


model = get_trained_model(n=25000)

# Gradio code #
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
    if pred[0][0] > 0.5:
        return json.dumps({"label": "Positive review"})
    else:
        return json.dumps({"label": "Negative review"})


def saliency(interface, model, input, processed_input, output, processed_output):
    with interface.graph.as_default():
        with interface.sess.as_default():
            output = output.argmax()
            input_tensors = [model.layers[0].input, K.learning_phase()]
            saliency_input = model.layers[1].input
            saliency_output = model.layers[-1].output[:, output]
            gradients = model.optimizer.get_gradients(saliency_output, saliency_input)
            compute_gradients = K.function(inputs=input_tensors, outputs=gradients)
            saliency_graph = compute_gradients(processed_input.reshape(1, 500))[0]

            saliency_graph = saliency_graph.reshape(500, 32)

            saliency_graph = np.abs(saliency_graph).sum(axis=1)
            normalized_saliency = (saliency_graph - saliency_graph.min()) / \
                                  (saliency_graph.max() - saliency_graph.min())

            start_idx = np.where(processed_input[0] == START_TOKEN)[0][0]
            heat_map = []
            counter = 0
            words = input.split(" ")
            for i in range(start_idx + 1, 500):
                heat_map.extend([normalized_saliency[i]] * len(words[counter]))
                heat_map.append(0)  # zero saliency value assigned to the spaces between words
                counter += 1
            return np.array(heat_map)


textbox = gradio.inputs.Textbox(preprocessing_fn=preprocessing,
                                sample_inputs=[
                                    "A wonderful little production. The filming technique is very unassuming- very old-time-BBC fashion and gives a comforting, and sometimes discomforting, sense of realism to the entire piece. The actors are extremely well chosen- Michael Sheen not only has got all the polari but he has all the voices down pat too! You can truly see the seamless editing guided by the references to Williams' diary entries, not only is it well worth the watching but it is a terrificly written and performed piece. A masterful production about one of the great master's of comedy and his life. The realism really comes home with the little things: the fantasy of the guard which, rather than use the traditional 'dream' techniques remains solid then disappears.",
                                    "This was a very brief episode that appeared in one of the Night Gallery show back in 1971. The episode starred Sue Lyon (of Lolita movie fame) and Joseph Campanella who play a baby sitter and a vampire, respectively. The vampire hires a baby sitter to watch his child (which appears to be some kind of werewolf or monster) while he goes out at night for blood. I don't know what purpose it was to make such an abbreviated episode that lasted just 5 minutes. They should just have expanded the earlier episode by those same 5 minutes and skipped this one. A total wasted effort.",
                                    "No one expects the Star Trek movies to be high art, but the fans do expect a movie that is as good as some of the best episodes. Unfortunately, this movie had a muddled, implausible plot that just left me cringing - this is by far the worst of the nine (so far) movies. Even the chance to watch the well known characters interact in another movie can't save this movie - including the goofy scenes with Kirk, Spock and McCoy at Yosemite.I would say this movie is not worth a rental, and hardly worth watching, however for the True Fan who needs to see all the movies, renting this movie is about the only way you'll see it - even the cable channels avoid this movie.",
                                    "This movie started out cringe-worthy--but it was meant to, with an overbearing mother, a witch of a rival, and a hesitant beauty queen constantly coming in second. There was some goofy overacting, and a few implausible plot points (She comes in second in EVERY single competition? ALL of them?) Unfortunately, the movie suffers horribly from it's need to, well, be a TV movie. Rather than end at the ending of the movie, an amusing twist in which the killer is (semi-plausibly) revealed, the movie continues for another twenty minutes, just to make sure that justice is done. Of course, now that the killer is revealed, she suddenly undergoes a complete personality shift--her character gets completely rewritten, because the writers don't need to keep her identity secret any more. The cheese completely sinks what otherwise could have been a passably amusing movie.",
                                    "I thought this movie did a down right good job. It wasn't as creative or original as the first, but who was expecting it to be. It was a whole lotta fun. the more i think about it the more i like it, and when it comes out on DVD I'm going to pay the money for it very proudly, every last cent. Sharon Stone is great, she always is, even if her movie is horrible(Catwoman), but this movie isn't, this is one of those movies that will be underrated for its lifetime, and it will probably become a classic in like 20 yrs. Don't wait for it to be a classic, watch it now and enjoy it. Don't expect a masterpiece, or something thats gripping and soul touching, just allow yourself to get out of your life and get yourself involved in theirs.All in all, this movie is entertaining and i recommend people who haven't seen it see it.",
                                    "I rented this movie, but I wasn't too sure what to expect of it. I was very glad to find that it's about the best Brazilian movie I've ever seen. The story is rather odd and simple, and above all, extremely original. We have Antonio, who is a young man living in Nordestina, a town in the middle of nowhere in the north east of Brazil, and who is deeply in love with Karina. The main conflict between the two is that, while Antonio loves his little town and has no wish to leave it, Karina wants to see the world and resents the place. As a prove of his love for her, he decides to go out himself and bring the world to her. He'll put Nordestina in the map, as he says. And the way he does it is unbelievable. This is a good movie; might be a bit stagy for some people due to its different editing job, but I think that it's also that that improves the story. It's just fun, and it makes you feel good."])
label = gradio.outputs.Label(postprocessing_fn=postprocessing)
io = gradio.Interface(inputs=textbox, outputs=label, model_type="keras", model=model, saliency=saliency)
httpd, path_to_local_server, share_url = io.launch(share=True, inbrowser=True, inline=False)

print("URL for IMDB model interface: ", share_url)
