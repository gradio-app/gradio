import gradio as gr
import math
from functools import partial
import matplotlib.pyplot as plt
import numpy as np
from sklearn.cluster import (
    AgglomerativeClustering, Birch, DBSCAN, KMeans, MeanShift, OPTICS, SpectralClustering, estimate_bandwidth
)
from sklearn.datasets import make_blobs, make_circles, make_moons
from sklearn.mixture import GaussianMixture
from sklearn.neighbors import kneighbors_graph
from sklearn.preprocessing import StandardScaler

plt.style.use('seaborn')
SEED = 0
MAX_CLUSTERS = 10
N_SAMPLES = 1000
N_COLS = 3
FIGSIZE = 7, 7  # does not affect size in webpage
COLORS = [
    'blue', 'orange', 'green', 'red', 'purple', 'brown', 'pink', 'gray', 'olive', 'cyan'
]
assert len(COLORS) >= MAX_CLUSTERS, "Not enough different colors for all clusters"
np.random.seed(SEED)


def normalize(X):
    return StandardScaler().fit_transform(X)

def get_regular(n_clusters):
    # spiral pattern
    centers = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [2, -1],
    ][:n_clusters]
    assert len(centers) == n_clusters
    X, labels = make_blobs(n_samples=N_SAMPLES, centers=centers, cluster_std=0.25, random_state=SEED)
    return normalize(X), labels


def get_circles(n_clusters):
    X, labels = make_circles(n_samples=N_SAMPLES, factor=0.5, noise=0.05, random_state=SEED)
    return normalize(X), labels


def get_moons(n_clusters):
    X, labels = make_moons(n_samples=N_SAMPLES, noise=0.05, random_state=SEED)
    return normalize(X), labels


def get_noise(n_clusters):
    np.random.seed(SEED)
    X, labels = np.random.rand(N_SAMPLES, 2), np.random.randint(0, n_clusters, size=(N_SAMPLES,))
    return normalize(X), labels


def get_anisotropic(n_clusters):
    X, labels = make_blobs(n_samples=N_SAMPLES, centers=n_clusters, random_state=170)
    transformation = [[0.6, -0.6], [-0.4, 0.8]]
    X = np.dot(X, transformation)
    return X, labels


def get_varied(n_clusters):
    cluster_std = [1.0, 2.5, 0.5, 1.0, 2.5, 0.5, 1.0, 2.5, 0.5, 1.0][:n_clusters]
    assert len(cluster_std) == n_clusters
    X, labels = make_blobs(
        n_samples=N_SAMPLES, centers=n_clusters, cluster_std=cluster_std, random_state=SEED
    )
    return normalize(X), labels


def get_spiral(n_clusters):
    # from https://scikit-learn.org/stable/auto_examples/cluster/plot_agglomerative_clustering.html
    np.random.seed(SEED)
    t = 1.5 * np.pi * (1 + 3 * np.random.rand(1, N_SAMPLES))
    x = t * np.cos(t)
    y = t * np.sin(t)
    X = np.concatenate((x, y))
    X += 0.7 * np.random.randn(2, N_SAMPLES)
    X = np.ascontiguousarray(X.T)

    labels = np.zeros(N_SAMPLES, dtype=int)
    return normalize(X), labels


DATA_MAPPING = {
    'regular': get_regular,
    'circles': get_circles,
    'moons': get_moons,
    'spiral': get_spiral,
    'noise': get_noise,
    'anisotropic': get_anisotropic,
    'varied': get_varied,
}


def get_groundtruth_model(X, labels, n_clusters, **kwargs):
    # dummy model to show true label distribution
    class Dummy:
        def __init__(self, y):
            self.labels_ = labels

    return Dummy(labels)


def get_kmeans(X, labels, n_clusters, **kwargs):
    model = KMeans(init="k-means++", n_clusters=n_clusters, n_init=10, random_state=SEED)
    model.set_params(**kwargs)
    return model.fit(X)


def get_dbscan(X, labels, n_clusters, **kwargs):
    model = DBSCAN(eps=0.3)
    model.set_params(**kwargs)
    return model.fit(X)


def get_agglomerative(X, labels, n_clusters, **kwargs):
    connectivity = kneighbors_graph(
        X, n_neighbors=n_clusters, include_self=False
    )
    # make connectivity symmetric
    connectivity = 0.5 * (connectivity + connectivity.T)
    model = AgglomerativeClustering(
        n_clusters=n_clusters, linkage="ward", connectivity=connectivity
    )
    model.set_params(**kwargs)
    return model.fit(X)


def get_meanshift(X, labels, n_clusters, **kwargs):
    bandwidth = estimate_bandwidth(X, quantile=0.25)
    model = MeanShift(bandwidth=bandwidth, bin_seeding=True)
    model.set_params(**kwargs)
    return model.fit(X)


def get_spectral(X, labels, n_clusters, **kwargs):
    model = SpectralClustering(
        n_clusters=n_clusters,
        eigen_solver="arpack",
        affinity="nearest_neighbors",
    )
    model.set_params(**kwargs)
    return model.fit(X)


def get_optics(X, labels, n_clusters, **kwargs):
    model = OPTICS(
        min_samples=7,
        xi=0.05,
        min_cluster_size=0.1,
    )
    model.set_params(**kwargs)
    return model.fit(X)


def get_birch(X, labels, n_clusters, **kwargs):
    model = Birch(n_clusters=n_clusters)
    model.set_params(**kwargs)
    return model.fit(X)


def get_gaussianmixture(X, labels, n_clusters, **kwargs):
    model = GaussianMixture(
        n_components=n_clusters, covariance_type="full", random_state=SEED,
    )
    model.set_params(**kwargs)
    return model.fit(X)


MODEL_MAPPING = {
    'True labels': get_groundtruth_model,
    'KMeans': get_kmeans,
    'DBSCAN': get_dbscan,
    'MeanShift': get_meanshift,
    'SpectralClustering': get_spectral,
    'OPTICS': get_optics,
    'Birch': get_birch,
    'GaussianMixture': get_gaussianmixture,
    'AgglomerativeClustering': get_agglomerative,
}


def plot_clusters(ax, X, labels):
    set_clusters = set(labels)
    set_clusters.discard(-1)  # -1 signifiies outliers, which we plot separately
    for label, color in zip(sorted(set_clusters), COLORS):
        idx = labels == label
        if not sum(idx):
            continue
        ax.scatter(X[idx, 0], X[idx, 1], color=color)

    # show outliers (if any)
    idx = labels == -1
    if sum(idx):
        ax.scatter(X[idx, 0], X[idx, 1], c='k', marker='x')

    ax.grid(None)
    ax.set_xticks([])
    ax.set_yticks([])
    return ax


def cluster(dataset: str, n_clusters: int, clustering_algorithm: str):
    if isinstance(n_clusters, dict):
        n_clusters = n_clusters['value']
    else:
        n_clusters = int(n_clusters)

    X, labels = DATA_MAPPING[dataset](n_clusters)
    model = MODEL_MAPPING[clustering_algorithm](X, labels, n_clusters=n_clusters)
    if hasattr(model, "labels_"):
        y_pred = model.labels_.astype(int)
    else:
        y_pred = model.predict(X)

    fig, ax = plt.subplots(figsize=FIGSIZE)

    plot_clusters(ax, X, y_pred)
    ax.set_title(clustering_algorithm, fontsize=16)

    return fig


title = "Clustering with Scikit-learn"
description = (
    "This example shows how different clustering algorithms work. Simply pick "
    "the dataset and the number of clusters to see how the clustering algorithms work. "
    "Colored circles are (predicted) labels and black x are outliers."
)


def iter_grid(n_rows, n_cols):
    # create a grid using gradio Block
    for _ in range(n_rows):
        with gr.Row():
            for _ in range(n_cols):
                with gr.Column():
                    yield

with gr.Blocks(title=title) as demo:
    gr.HTML(f"<b>{title}</b>")
    gr.Markdown(description)

    input_models = list(MODEL_MAPPING)
    input_data = gr.Radio(
        list(DATA_MAPPING),
        value="regular",
        label="dataset"
    )
    input_n_clusters = gr.Slider(
        minimum=1,
        maximum=MAX_CLUSTERS,
        value=4,
        step=1,
        label='Number of clusters'
    )
    n_rows = int(math.ceil(len(input_models) / N_COLS))
    counter = 0
    for _ in iter_grid(n_rows, N_COLS):
        if counter >= len(input_models):
            break

        input_model = input_models[counter]
        plot = gr.Plot(label=input_model)
        fn = partial(cluster, clustering_algorithm=input_model)
        input_data.change(fn=fn, inputs=[input_data, input_n_clusters], outputs=plot)
        input_n_clusters.change(fn=fn, inputs=[input_data, input_n_clusters], outputs=plot)
        counter += 1

demo.launch()
