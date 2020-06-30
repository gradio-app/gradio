from PIL import Image
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


def convert_file_to_base64(img):
    with open(img, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
        base64_str = str(encoded_string, 'utf-8')
        type = img.split(".")[-1]
        return "data:image/" + type + ";base64," + base64_str

def encode_plot_to_base64(plt):
    with BytesIO() as output_bytes:
        plt.savefig(output_bytes, format="png")
        bytes_data = output_bytes.getvalue()
    plt.close()
    base64_str = str(base64.b64encode(bytes_data), 'utf-8')
    return "data:image/png;base64," + base64_str

def encode_array_to_base64(image_array):
    with BytesIO() as output_bytes:
        PIL_image = Image.fromarray(skimage.img_as_ubyte(image_array))
        PIL_image.save(output_bytes, 'PNG')
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), 'utf-8')
    return "data:image/png;base64," + base64_str


def resize_and_crop(img, size, crop_type='top'):
    """
    Resize and crop an image to fit the specified size.
    args:
        img_path: path for the image to resize.
        modified_path: path to store the modified image.
        size: `(width, height)` tuple.
        crop_type: can be 'top', 'middle' or 'bottom', depending on this
            value, the image will cropped getting the 'top/left', 'middle' or
            'bottom/right' of the image to fit the size.
    raises:
        Exception: if can not open the file in img_path of there is problems
            to save the image.
        ValueError: if an invalid `crop_type` is provided.
    """
    # Get current and desired ratio for the images
    img_ratio = img.size[0] // float(img.size[1])
    ratio = size[0] // float(size[1])
    # The image is scaled//cropped vertically or horizontally depending on the ratio
    if ratio > img_ratio:
        img = img.resize((size[0], size[0] * img.size[1] // img.size[0]),
                         Image.ANTIALIAS)
        # Crop in the top, middle or bottom
        if crop_type == 'top':
            box = (0, 0, img.size[0], size[1])
        elif crop_type == 'middle':
            box = (0, (img.size[1] - size[1]) // 2, img.size[0], (img.size[1] + size[1]) // 2)
        elif crop_type == 'bottom':
            box = (0, img.size[1] - size[1], img.size[0], img.size[1])
        else:
            raise ValueError('ERROR: invalid value for crop_type')
        img = img.crop(box)
    elif ratio < img_ratio:
        img = img.resize((size[1] * img.size[0] // img.size[1], size[1]),
                         Image.ANTIALIAS)
        # Crop in the top, middle or bottom
        if crop_type == 'top':
            box = (0, 0, size[0], img.size[1])
        elif crop_type == 'middle':
            box = ((img.size[0] - size[0]) // 2, 0, (img.size[0] + size[0]) // 2, img.size[1])
        elif crop_type == 'bottom':
            box = (img.size[0] - size[0], 0, img.size[0], img.size[1])
        else:
            raise ValueError('ERROR: invalid value for crop_type')
        img = img.crop(box)
    else:
        img = img.resize((size[0], size[1]),
                         Image.ANTIALIAS)
        # If the scale is the same, we do not need to crop
    return img


##################
# AUDIO FILES
##################

def decode_base64_to_wav_file(encoding):
    inp = encoding.split(';')[1].split(',')[1]
    wav_obj = base64.b64decode(inp)
    file_obj = tempfile.NamedTemporaryFile()
    file_obj.close()
    with open(file_obj.name, 'wb') as f:
        f.write(wav_obj)
    return file_obj


def generate_mfcc_features_from_audio_file(wav_filename,
                                           pre_emphasis=0.95,
                                           frame_size= 0.025,
                                           frame_stride=0.01,
                                           NFFT=512,
                                           nfilt=40,
                                           num_ceps=12,
                                           cep_lifter=22):
    """
    Loads and preprocesses a .wav audio file into mfcc coefficients, the typical inputs to models.
    Adapted from: https://haythamfayek.com/2016/04/21/speech-processing-for-machine-learning.html
    :param wav_filename: string name of audio file to process.
    :param pre_emphasis: a float factor, typically 0.95 or 0.97, which amplifies high frequencies.
    :param frame_size: a float that is the length, in seconds, of time frame over which to take the fft.
    :param frame_stride: a float that is the offset, in seconds, between consecutive time frames.
    :param NFFT: The number of points in the short-time fft for each time frame.
    :param nfilt: The number of filters on the Mel-scale to extract frequency bands.
    :param num_ceps: the number of cepstral coefficients to retrain.
    :param cep_lifter: the int factor, by which to de-emphasize higher-frequency.
    :return: a numpy array of mfcc coefficients.
    """
    sample_rate, signal = scipy.io.wavfile.read(wav_filename)
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


