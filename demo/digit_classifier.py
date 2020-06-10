import tensorflow as tf
import gradio
import os
from tensorflow.keras.layers import *
import gradio as gr

(x_train, y_train),(x_test, y_test) = tf.keras.datasets.mnist.load_data()
x_train, x_test = x_train.reshape(-1,784) / 255.0, x_test.reshape(-1,784) / 255.0

def get_trained_model(n):
    model = tf.keras.models.Sequential()
    model.add(Reshape((28, 28, 1), input_shape=(784,)))
    model.add(Conv2D(32, kernel_size=(3, 3), activation='relu'))
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(10, activation='softmax'))
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train[:n], y_train[:n], epochs=2)
    print(model.evaluate(x_test, y_test))
    return model

if not os.path.exists("models/mnist.h5"):
    model = get_trained_model(n=50000)
    model.save('models/mnist.h5')
else:
    model = tf.keras.models.load_model('models/mnist.h5') 

graph = tf.get_default_graph()
sess = tf.keras.backend.get_session()

def recognize_digit(image):
    with graph.as_default():
        with sess.as_default():
            prediction = model.predict(image).tolist()[0]
    return {str(i): prediction[i] for i in range(10)}

gr.Interface(
    recognize_digit, 
    gradio.inputs.Sketchpad(flatten=True), 
    gradio.outputs.Label(num_top_classes=3),
    live=True
).launch()