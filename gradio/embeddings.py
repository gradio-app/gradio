import numpy as np
from sklearn.decomposition import PCA

SMALL_CONST = 1e-10

def calculate_similarity(embedding1, embedding2):
    """
    Scores the similarity between two embeddings by taking the cosine similarity
    """
    e1, e2 = np.array(embedding1), np.array(embedding2)
    cosine_similarity = np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2) + SMALL_CONST)
    return cosine_similarity

def fit_pca_to_embeddings(embeddings):
    """
    Computes 2D tsne embeddings from a list of higher-dimensional embeddings
    """
    pca_model = PCA(n_components=2, random_state=0)
    embeddings = np.array(embeddings)
    embeddings_2D = pca_model.fit_transform(embeddings)
    return pca_model, [{'x': e[0], 'y': e[1]} for e in embeddings_2D.tolist()]

def transform_with_pca(pca_model, embeddings):
    """
    Computes 2D tsne embeddings from a list of higher-dimensional embeddings
    """
    embeddings_2D = pca_model.transform(embeddings)
    return [{'x': e[0], 'y': e[1]} for e in embeddings_2D.tolist()]
