import numpy as np

def calculate_similarity(embedding1, embedding2):
    """
    Scores the similarity between two embeddings by taking the L2 distance
    """
    return np.linalg.norm(np.array(embedding1) - np.array(embedding2))
    