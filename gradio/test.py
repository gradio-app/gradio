import tensorflow as tf
import gradio


(x_train, y_train),(x_test, y_test) = tf.keras.datasets.mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(),
  tf.keras.layers.Dense(512, activation=tf.nn.relu),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10, activation=tf.nn.softmax)
])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
model.fit(x_train, y_train, epochs=1)
inp = gradio.inputs.Sketchpad(sample_inputs=x_train[:10])
iface = gradio.Interface(inputs=inp, outputs="label", model=model, model_type='keras')
iface.launch(inline=False, share=False, inbrowser=True);