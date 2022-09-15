# Make function to find classes in target directory
import os
import librosa
import torch
import numpy as np
from torchaudio.transforms import Resample

SAMPLE_RATE = 44100
AUDIO_LEN = 2.90

# Parameters to control the MelSpec generation
N_MELS = 128
F_MIN = 20
F_MAX = 16000
N_FFT = 1024
HOP_LEN = 512

# Make function to find classes in target directory
def find_classes(directory: str):
    # 1. Get the class names by scanning the target directory
    classes = sorted(entry.name for entry in os.scandir(directory) if entry.is_dir())
    # 2. Raise an error if class names not found
    if not classes:
        raise FileNotFoundError(f"Couldn't find any classes in {directory}.")
    # 3. Crearte a dictionary of index labels (computers prefer numerical rather than string labels)
    class_to_idx = {cls_name: i for i, cls_name in enumerate(classes)}
    return classes, class_to_idx
    
def resample(wav, sample_rate, new_sample_rate):
    if wav.shape[0] >= 2:
        wav = torch.mean(wav, dim=0)
    else:
        wav = wav.squeeze(0)
    if sample_rate > new_sample_rate:
        resampler = Resample(sample_rate, new_sample_rate)
        wav = resampler(wav)
    return wav

def mono_to_color(X, eps=1e-6, mean=None, std=None):
    X = np.stack([X, X, X], axis=-1)
    # Standardize
    mean = mean or X.mean()
    std = std or X.std()
    X = (X - mean) / (std + eps)
    # Normalize to [0, 255]
    _min, _max = X.min(), X.max()
    if (_max - _min) > eps:
        V = np.clip(X, _min, _max)
        V = 255 * (V - _min) / (_max - _min)
        V = V.astype(np.uint8)
    else:
        V = np.zeros_like(X, dtype=np.uint8)
    return V

def normalize(image, mean=None, std=None):
    image = image / 255.0
    if mean is not None and std is not None:
        image = (image - mean) / std
    return np.moveaxis(image, 2, 0).astype(np.float32)

def compute_melspec(wav, sample_rate=SAMPLE_RATE):
    melspec = librosa.feature.melspectrogram(
        y=wav,
        sr=sample_rate, 
        n_fft=N_FFT, 
        fmin=F_MIN, 
        fmax=F_MAX,
        n_mels=N_MELS,
        hop_length=HOP_LEN
    )
    melspec = librosa.power_to_db(melspec).astype(np.float32)
    return melspec

def audio_preprocess(wav, sample_rate):
    wav = wav.numpy()
    melspec = compute_melspec(wav, sample_rate)
    image = mono_to_color(melspec)
    image = normalize(image, mean=None, std=None)
    image = torch.from_numpy(image)
    return image