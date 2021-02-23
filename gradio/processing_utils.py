from PIL import Image, ImageOps
from io import BytesIO
import base64
import tempfile
import scipy.io.wavfile
from scipy.fftpack import dct
import numpy as np
import skimage


#########################
# IMAGE PRE-PROCESSING
#########################
def decode_base64_to_image(encoding):
    content = encoding.split(';')[1]
    image_encoded = content.split(',')[1]
    return Image.open(BytesIO(base64.b64decode(image_encoded)))


def encode_file_to_base64(f, type="image", ext=None, header=True):
    with open(f, "rb") as file:
        encoded_string = base64.b64encode(file.read())
        base64_str = str(encoded_string, 'utf-8')
        if not header:
            return base64_str
        if ext is None:
            ext = f.split(".")[-1]
        return "data:" + type + "/" + ext + ";base64," + base64_str


def encode_plot_to_base64(plt):
    with BytesIO() as output_bytes:
        plt.savefig(output_bytes, format="png")
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), 'utf-8')
    return "data:image/png;base64," + base64_str

def encode_array_to_base64(image_array):
    with BytesIO() as output_bytes:
        PIL_image = Image.fromarray(skimage.img_as_ubyte(image_array))
        PIL_image.save(output_bytes, 'PNG')
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), 'utf-8')
    return "data:image/png;base64," + base64_str


def resize_and_crop(img, size, crop_type='center'):
    """
    Resize and crop an image to fit the specified size.
    args:
        size: `(width, height)` tuple.
        crop_type: can be 'top', 'middle' or 'bottom', depending on this
            value, the image will cropped getting the 'top/left', 'middle' or
            'bottom/right' of the image to fit the size.
    raises:
        ValueError: if an invalid `crop_type` is provided.
    """
    if crop_type == "top":
        center = (0, 0)
    elif crop_type == "center":
        center = (0.5, 0.5)
    else:
        raise ValueError
    return ImageOps.fit(img, size, centering=center) 

##################
# OUTPUT
##################

def decode_base64_to_binary(encoding):
    extension = None
    if "," in encoding:
        header, data = encoding.split(",")
        header = header[5:]
        if ";base64" in header:
            header = header[0:header.index(";base64")]
        if "/" in header:
            extension = header[header.index("/") + 1:]
    else:
        data = encoding
    return base64.b64decode(data), extension

def decode_base64_to_file(encoding):
    data, extension = decode_base64_to_binary(encoding)
    if extension is None:
        file_obj = tempfile.NamedTemporaryFile(delete=False)
    else:
        file_obj = tempfile.NamedTemporaryFile(delete=False, suffix="."+extension)
    file_obj.write(data)
    file_obj.flush()
    return file_obj

##################
# AUDIO FILES
##################

def generate_mfcc_features_from_audio_file(wav_filename=None,
                                           pre_emphasis=0.95,
                                           frame_size= 0.025,
                                           frame_stride=0.01,
                                           NFFT=512,
                                           nfilt=40,
                                           num_ceps=12,
                                           cep_lifter=22,
                                           sample_rate=None,
                                           signal=None,
                                           downsample_to=None):
    """
    Loads and preprocesses a .wav audio file (or alternatively, a sample rate & signal) into mfcc coefficients, the typical inputs to models.
    Adapted from: https://haythamfayek.com/2016/04/21/speech-processing-for-machine-learning.html
    :param wav_filename: string name of audio file to process.
    :param pre_emphasis: a float factor, typically 0.95 or 0.97, which amplifies high frequencies.
    :param frame_size: a float that is the length, in seconds, of time frame over which to take the fft.
    :param frame_stride: a float that is the offset, in seconds, between consecutive time frames.
    :param NFFT: The number of points in the short-time fft for each time frame.
    :param nfilt: The number of filters on the Mel-scale to extract frequency bands.
    :param num_ceps: the number of cepstral coefficients to retrain.
    :param cep_lifter: the int factor, by which to de-emphasize higher-frequency.
    :param sample_rate: optional param represnting sample rate that is used if `wav_filename` is not provided
    :param signal: optional param representing sample data that is used if `wav_filename` is not provided
    :param downsample_to: optional param. If provided, audio file is downsampled to this many frames.  
    :return: a 3D numpy array of mfcc coefficients, of the shape 1 x num_frames x num_coeffs.
    """
    if (wav_filename is None) and (sample_rate is None or signal is None):
        raise ValueError("Either a wav_filename must be provdied or a sample_rate and signal") 
    elif wav_filename is None:
        pass
    else:
        sample_rate, signal = scipy.io.wavfile.read(wav_filename)

    if not(downsample_to is None):
        signal = scipy.signal.resample(signal, downsample_to)    

    emphasized_signal = np.append(signal[0], signal[1:] - pre_emphasis * signal[:-1])

    frame_length, frame_step = frame_size * sample_rate, frame_stride * sample_rate  # Convert from seconds to samples
    signal_length = len(emphasized_signal)
    frame_length = int(round(frame_length))
    frame_step = int(round(frame_step))
    num_frames = int(np.ceil(float(np.abs(signal_length - frame_length)) / frame_step))  # Make sure that we have at least 1 frame

    pad_signal_length = num_frames * frame_step + frame_length
    z = np.zeros((pad_signal_length - signal_length))
    pad_signal = np.append(emphasized_signal, z)  # Pad Signal to make sure that all frames have equal number of samples without truncating any samples from the original signal

    indices = np.tile(np.arange(0, frame_length), (num_frames, 1)) + np.tile(np.arange(0, num_frames * frame_step, frame_step), (frame_length, 1)).T
    frames = pad_signal[indices.astype(np.int32, copy=False)]

    frames *= np.hamming(frame_length)
    mag_frames = np.absolute(np.fft.rfft(frames, NFFT))  # Magnitude of the FFT
    pow_frames = ((1.0 / NFFT) * ((mag_frames) ** 2))  # Power Spectrum

    low_freq_mel = 0
    high_freq_mel = (2595 * np.log10(1 + (sample_rate / 2) / 700))  # Convert Hz to Mel
    mel_points = np.linspace(low_freq_mel, high_freq_mel, nfilt + 2)  # Equally spaced in Mel scale
    hz_points = (700 * (10**(mel_points / 2595) - 1))  # Convert Mel to Hz
    bin = np.floor((NFFT + 1) * hz_points / sample_rate)

    fbank = np.zeros((nfilt, int(np.floor(NFFT / 2 + 1))))
    for m in range(1, nfilt + 1):
        f_m_minus = int(bin[m - 1])   # left
        f_m = int(bin[m])             # center
        f_m_plus = int(bin[m + 1])    # right

        for k in range(f_m_minus, f_m):
            fbank[m - 1, k] = (k - bin[m - 1]) / (bin[m] - bin[m - 1])
        for k in range(f_m, f_m_plus):
            fbank[m - 1, k] = (bin[m + 1] - k) / (bin[m + 1] - bin[m])
    filter_banks = np.dot(pow_frames, fbank.T)
    filter_banks = np.where(filter_banks == 0, np.finfo(float).eps, filter_banks)  # Numerical Stability
    filter_banks = 20 * np.log10(filter_banks)  # dB

    mfcc = dct(filter_banks, type=2, axis=1, norm='ortho')[:, 0: (num_ceps + 1)]  # Keep filters 1-13 by default.
    (nframes, ncoeff) = mfcc.shape
    n = np.arange(ncoeff)
    lift = 1 + (cep_lifter / 2) * np.sin(np.pi * n / cep_lifter)
    mfcc *= lift

    filter_banks -= (np.mean(filter_banks, axis=0) + 1e-8)
    mfcc -= (np.mean(mfcc, axis=0) + 1e-8)
    return mfcc[np.newaxis, :, :]  # Create a batch dimension.


