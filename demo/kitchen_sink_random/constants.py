import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import random
import os


def random_plot():
    start_year = 2020
    x = np.arange(start_year, start_year + random.randint(0, 10))
    year_count = x.shape[0]
    plt_format = "-"
    fig = plt.figure()
    ax = fig.add_subplot(111)
    series = np.arange(0, year_count, dtype=float)
    series = series**2
    series += np.random.rand(year_count)
    ax.plot(x, series, plt_format)
    return fig


img_dir = os.path.join(os.path.dirname(__file__), "files")
file_dir = os.path.join(os.path.dirname(__file__), "..", "kitchen_sink", "files")
model3d_dir = os.path.join(os.path.dirname(__file__), "..", "model3D", "files")
highlighted_text_output_1 = [
    {
        "entity": "I-LOC",
        "score": 0.9988978,
        "index": 2,
        "word": "Chicago",
        "start": 5,
        "end": 12,
    },
    {
        "entity": "I-MISC",
        "score": 0.9958592,
        "index": 5,
        "word": "Pakistani",
        "start": 22,
        "end": 31,
    },
]
highlighted_text_output_2 = [
    {
        "entity": "I-LOC",
        "score": 0.9988978,
        "index": 2,
        "word": "Chicago",
        "start": 5,
        "end": 12,
    },
    {
        "entity": "I-LOC",
        "score": 0.9958592,
        "index": 5,
        "word": "Pakistan",
        "start": 22,
        "end": 30,
    },
]

highlighted_text = "Does Chicago have any Pakistani restaurants"


def random_model3d():
    model_3d = random.choice(
        [os.path.join(model3d_dir, model) for model in os.listdir(model3d_dir) if model != "source.txt"]
    )
    return model_3d
