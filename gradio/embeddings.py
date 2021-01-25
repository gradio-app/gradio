import numpy as np

SMALL_CONST = 1e-10

class PCA:
    """
    Credit: https://www.python-engineer.com/courses/mlfromscratch/11_pca/
    """
    def __init__(self, n_components, random_state):
        self.n_components = n_components
        self.components = None
        self.mean = None
        self.random_state = random_state

    def fit(self, X):
        np.random.seed(self.random_state)
        self.mean = np.mean(X, axis=0)
        X = X - self.mean
        cov = np.cov(X.T)
        eigenvalues, eigenvectors = np.linalg.eig(cov)
        eigenvectors = eigenvectors.T
        idxs = np.argsort(eigenvalues)[::-1]
        eigenvalues = eigenvalues[idxs]
        eigenvectors = eigenvectors[idxs]
        self.components = np.real(eigenvectors[0:self.n_components])

    def transform(self, X):
        X = X - self.mean
        return np.dot(X, self.components.T)

    def fit_transform(self, X):
        self.fit(X)
        return self.transform(X)


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
