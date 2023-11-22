from __future__ import annotations

import base64
import hashlib
import json
import logging
import os
import shutil
import subprocess
import tempfile
import warnings
from io import BytesIO
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import numpy as np
import requests
from gradio_client import utils as client_utils
from PIL import Image, ImageOps, PngImagePlugin

from gradio import wasm_utils
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.utils import abspath

with warnings.catch_warnings():
    warnings.simplefilter("ignore")  # Ignore pydub warning if ffmpeg is not installed
    from pydub import AudioSegment

log = logging.getLogger(__name__)

if TYPE_CHECKING:
    from gradio.components.base import Component

#########################
# GENERAL
#########################


def to_binary(x: str | dict) -> bytes:
    """Converts a base64 string or dictionary to a binary string that can be sent in a POST."""
    if isinstance(x, dict):
        if x.get("data"):
            base64str = x["data"]
        else:
            base64str = client_utils.encode_url_or_file_to_base64(x["path"])
    else:
        base64str = x
    return base64.b64decode(extract_base64_data(base64str))


def extract_base64_data(x: str) -> str:
    """Just extracts the base64 data from a general base64 string."""
    return x.rsplit(",", 1)[-1]


#########################
# IMAGE PRE-PROCESSING
#########################


def decode_base64_to_image(encoding: str) -> Image.Image:
    image_encoded = extract_base64_data(encoding)
    img = Image.open(BytesIO(base64.b64decode(image_encoded)))
    try:
        if hasattr(ImageOps, "exif_transpose"):
            img = ImageOps.exif_transpose(img)
    except Exception:
        log.warning(
            "Failed to transpose image %s based on EXIF data.",
            img,
            exc_info=True,
        )
    return img


def encode_plot_to_base64(plt):
    with BytesIO() as output_bytes:
        plt.savefig(output_bytes, format="png")
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return "data:image/png;base64," + base64_str


def get_pil_metadata(pil_image):
    # Copy any text-only metadata
    metadata = PngImagePlugin.PngInfo()
    for key, value in pil_image.info.items():
        if isinstance(key, str) and isinstance(value, str):
            metadata.add_text(key, value)

    return metadata


def encode_pil_to_bytes(pil_image, format="png"):
    with BytesIO() as output_bytes:
        pil_image.save(output_bytes, format, pnginfo=get_pil_metadata(pil_image))
        return output_bytes.getvalue()


def encode_pil_to_base64(pil_image):
    bytes_data = encode_pil_to_bytes(pil_image)
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return "data:image/png;base64," + base64_str


def encode_array_to_base64(image_array):
    with BytesIO() as output_bytes:
        pil_image = Image.fromarray(_convert(image_array, np.uint8, force_copy=False))
        pil_image.save(output_bytes, "PNG")
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return "data:image/png;base64," + base64_str


def hash_file(file_path: str | Path, chunk_num_blocks: int = 128) -> str:
    sha1 = hashlib.sha1()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_num_blocks * sha1.block_size), b""):
            sha1.update(chunk)
    return sha1.hexdigest()


def hash_url(url: str) -> str:
    sha1 = hashlib.sha1()
    sha1.update(url.encode("utf-8"))
    return sha1.hexdigest()


def hash_bytes(bytes: bytes):
    sha1 = hashlib.sha1()
    sha1.update(bytes)
    return sha1.hexdigest()


def hash_base64(base64_encoding: str, chunk_num_blocks: int = 128) -> str:
    sha1 = hashlib.sha1()
    for i in range(0, len(base64_encoding), chunk_num_blocks * sha1.block_size):
        data = base64_encoding[i : i + chunk_num_blocks * sha1.block_size]
        sha1.update(data.encode("utf-8"))
    return sha1.hexdigest()


def save_pil_to_cache(
    img: Image.Image,
    cache_dir: str,
    name: str = "image",
    format: Literal["png", "jpeg"] = "png",
) -> str:
    bytes_data = encode_pil_to_bytes(img, format)
    temp_dir = Path(cache_dir) / hash_bytes(bytes_data)
    temp_dir.mkdir(exist_ok=True, parents=True)
    filename = str((temp_dir / f"{name}.{format}").resolve())
    img.save(filename, pnginfo=get_pil_metadata(img))
    return filename


def save_img_array_to_cache(
    arr: np.ndarray, cache_dir: str, format: Literal["png", "jpeg"] = "png"
) -> str:
    pil_image = Image.fromarray(_convert(arr, np.uint8, force_copy=False))
    return save_pil_to_cache(pil_image, cache_dir, format=format)


def save_audio_to_cache(
    data: np.ndarray, sample_rate: int, format: str, cache_dir: str
) -> str:
    temp_dir = Path(cache_dir) / hash_bytes(data.tobytes())
    temp_dir.mkdir(exist_ok=True, parents=True)
    filename = str((temp_dir / f"audio.{format}").resolve())
    audio_to_file(sample_rate, data, filename, format=format)
    return filename


def save_bytes_to_cache(data: bytes, file_name: str, cache_dir: str) -> str:
    path = Path(cache_dir) / hash_bytes(data)
    path.mkdir(exist_ok=True, parents=True)
    path = path / Path(file_name).name
    path.write_bytes(data)
    return str(path.resolve())


def save_file_to_cache(file_path: str | Path, cache_dir: str) -> str:
    """Returns a temporary file path for a copy of the given file path if it does
    not already exist. Otherwise returns the path to the existing temp file."""
    temp_dir = hash_file(file_path)
    temp_dir = Path(cache_dir) / temp_dir
    temp_dir.mkdir(exist_ok=True, parents=True)

    name = client_utils.strip_invalid_filename_characters(Path(file_path).name)
    full_temp_file_path = str(abspath(temp_dir / name))

    if not Path(full_temp_file_path).exists():
        shutil.copy2(file_path, full_temp_file_path)

    return full_temp_file_path


def save_url_to_cache(url: str, cache_dir: str) -> str:
    """Downloads a file and makes a temporary file path for a copy if does not already
    exist. Otherwise returns the path to the existing temp file."""
    temp_dir = hash_url(url)
    temp_dir = Path(cache_dir) / temp_dir
    temp_dir.mkdir(exist_ok=True, parents=True)
    name = client_utils.strip_invalid_filename_characters(Path(url).name)
    full_temp_file_path = str(abspath(temp_dir / name))

    if not Path(full_temp_file_path).exists():
        with requests.get(url, stream=True) as r, open(full_temp_file_path, "wb") as f:
            shutil.copyfileobj(r.raw, f)

    return full_temp_file_path


def save_base64_to_cache(
    base64_encoding: str, cache_dir: str, file_name: str | None = None
) -> str:
    """Converts a base64 encoding to a file and returns the path to the file if
    the file doesn't already exist. Otherwise returns the path to the existing file.
    """
    temp_dir = hash_base64(base64_encoding)
    temp_dir = Path(cache_dir) / temp_dir
    temp_dir.mkdir(exist_ok=True, parents=True)

    guess_extension = client_utils.get_extension(base64_encoding)
    if file_name:
        file_name = client_utils.strip_invalid_filename_characters(file_name)
    elif guess_extension:
        file_name = f"file.{guess_extension}"
    else:
        file_name = "file"

    full_temp_file_path = str(abspath(temp_dir / file_name))  # type: ignore

    if not Path(full_temp_file_path).exists():
        data, _ = client_utils.decode_base64_to_binary(base64_encoding)
        with open(full_temp_file_path, "wb") as fb:
            fb.write(data)

    return full_temp_file_path


def move_resource_to_block_cache(
    url_or_file_path: str | Path | None, block: Component
) -> str | None:
    """This method has been replaced by Block.move_resource_to_block_cache(), but is
    left here for backwards compatibility for any custom components created in Gradio 4.2.0 or earlier.
    """
    return block.move_resource_to_block_cache(url_or_file_path)


def move_files_to_cache(data: Any, block: Component, postprocess: bool = False):
    """Move files to cache and replace the file path with the cache path.

    Runs after postprocess and before preprocess.

    Args:
        data: The input or output data for a component. Can be a dictionary or a dataclass
        block: The component
        postprocess: Whether its running from postprocessing
    """

    def _move_to_cache(d: dict):
        payload = FileData(**d)
        # If the gradio app developer is returning a URL from
        # postprocess, it means the component can display a URL
        # without it being served from the gradio server
        # This makes it so that the URL is not downloaded and speeds up event processing
        if payload.url and postprocess:
            temp_file_path = payload.url
        else:
            temp_file_path = move_resource_to_block_cache(payload.path, block)
        assert temp_file_path is not None
        payload.path = temp_file_path
        return payload.model_dump()

    if isinstance(data, (GradioRootModel, GradioModel)):
        data = data.model_dump()

    return client_utils.traverse(data, _move_to_cache, client_utils.is_file_obj)


def resize_and_crop(img, size, crop_type="center"):
    """
    Resize and crop an image to fit the specified size.
    args:
        size: `(width, height)` tuple. Pass `None` for either width or height
        to only crop and resize the other.
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

    resize = list(size)
    if size[0] is None:
        resize[0] = img.size[0]
    if size[1] is None:
        resize[1] = img.size[1]
    return ImageOps.fit(img, resize, centering=center)  # type: ignore


##################
# Audio
##################


def audio_from_file(filename, crop_min=0, crop_max=100):
    try:
        audio = AudioSegment.from_file(filename)
    except FileNotFoundError as e:
        isfile = Path(filename).is_file()
        msg = (
            f"Cannot load audio from file: `{'ffprobe' if isfile else filename}` not found."
            + " Please install `ffmpeg` in your system to use non-WAV audio file formats"
            " and make sure `ffprobe` is in your PATH."
            if isfile
            else ""
        )
        raise RuntimeError(msg) from e
    if crop_min != 0 or crop_max != 100:
        audio_start = len(audio) * crop_min / 100
        audio_end = len(audio) * crop_max / 100
        audio = audio[audio_start:audio_end]
    data = np.array(audio.get_array_of_samples())
    if audio.channels > 1:
        data = data.reshape(-1, audio.channels)
    return audio.frame_rate, data


def audio_to_file(sample_rate, data, filename, format="wav"):
    if format == "wav":
        data = convert_to_16_bit_wav(data)
    audio = AudioSegment(
        data.tobytes(),
        frame_rate=sample_rate,
        sample_width=data.dtype.itemsize,
        channels=(1 if len(data.shape) == 1 else data.shape[1]),
    )
    file = audio.export(filename, format=format)
    file.close()  # type: ignore


def convert_to_16_bit_wav(data):
    # Based on: https://docs.scipy.org/doc/scipy/reference/generated/scipy.io.wavfile.write.html
    warning = "Trying to convert audio automatically from {} to 16-bit int format."
    if data.dtype in [np.float64, np.float32, np.float16]:
        warnings.warn(warning.format(data.dtype))
        data = data / np.abs(data).max()
        data = data * 32767
        data = data.astype(np.int16)
    elif data.dtype == np.int32:
        warnings.warn(warning.format(data.dtype))
        data = data / 65538
        data = data.astype(np.int16)
    elif data.dtype == np.int16:
        pass
    elif data.dtype == np.uint16:
        warnings.warn(warning.format(data.dtype))
        data = data - 32768
        data = data.astype(np.int16)
    elif data.dtype == np.uint8:
        warnings.warn(warning.format(data.dtype))
        data = data * 257 - 32768
        data = data.astype(np.int16)
    else:
        raise ValueError(
            "Audio data cannot be converted automatically from "
            f"{data.dtype} to 16-bit int format."
        )
    return data


##################
# OUTPUT
##################


def _convert(image, dtype, force_copy=False, uniform=False):
    """
    Adapted from: https://github.com/scikit-image/scikit-image/blob/main/skimage/util/dtype.py#L510-L531

    Convert an image to the requested data-type.
    Warnings are issued in case of precision loss, or when negative values
    are clipped during conversion to unsigned integer types (sign loss).
    Floating point values are expected to be normalized and will be clipped
    to the range [0.0, 1.0] or [-1.0, 1.0] when converting to unsigned or
    signed integers respectively.
    Numbers are not shifted to the negative side when converting from
    unsigned to signed integer types. Negative values will be clipped when
    converting to unsigned integers.
    Parameters
    ----------
    image : ndarray
        Input image.
    dtype : dtype
        Target data-type.
    force_copy : bool, optional
        Force a copy of the data, irrespective of its current dtype.
    uniform : bool, optional
        Uniformly quantize the floating point range to the integer range.
        By default (uniform=False) floating point values are scaled and
        rounded to the nearest integers, which minimizes back and forth
        conversion errors.
    .. versionchanged :: 0.15
        ``_convert`` no longer warns about possible precision or sign
        information loss. See discussions on these warnings at:
        https://github.com/scikit-image/scikit-image/issues/2602
        https://github.com/scikit-image/scikit-image/issues/543#issuecomment-208202228
        https://github.com/scikit-image/scikit-image/pull/3575
    References
    ----------
    .. [1] DirectX data conversion rules.
           https://msdn.microsoft.com/en-us/library/windows/desktop/dd607323%28v=vs.85%29.aspx
    .. [2] Data Conversions. In "OpenGL ES 2.0 Specification v2.0.25",
           pp 7-8. Khronos Group, 2010.
    .. [3] Proper treatment of pixels as integers. A.W. Paeth.
           In "Graphics Gems I", pp 249-256. Morgan Kaufmann, 1990.
    .. [4] Dirty Pixels. J. Blinn. In "Jim Blinn's corner: Dirty Pixels",
           pp 47-57. Morgan Kaufmann, 1998.
    """
    dtype_range = {
        bool: (False, True),
        np.bool_: (False, True),
        np.bool8: (False, True),  # type: ignore
        float: (-1, 1),
        np.float_: (-1, 1),
        np.float16: (-1, 1),
        np.float32: (-1, 1),
        np.float64: (-1, 1),
    }

    def _dtype_itemsize(itemsize, *dtypes):
        """Return first of `dtypes` with itemsize greater than `itemsize`
        Parameters
        ----------
        itemsize: int
            The data type object element size.
        Other Parameters
        ----------------
        *dtypes:
            Any Object accepted by `np.dtype` to be converted to a data
            type object
        Returns
        -------
        dtype: data type object
            First of `dtypes` with itemsize greater than `itemsize`.
        """
        return next(dt for dt in dtypes if np.dtype(dt).itemsize >= itemsize)

    def _dtype_bits(kind, bits, itemsize=1):
        """Return dtype of `kind` that can store a `bits` wide unsigned int
        Parameters:
        kind: str
            Data type kind.
        bits: int
            Desired number of bits.
        itemsize: int
            The data type object element size.
        Returns
        -------
        dtype: data type object
            Data type of `kind` that can store a `bits` wide unsigned int
        """

        s = next(
            i
            for i in (itemsize,) + (2, 4, 8)
            if bits < (i * 8) or (bits == (i * 8) and kind == "u")
        )

        return np.dtype(kind + str(s))

    def _scale(a, n, m, copy=True):
        """Scale an array of unsigned/positive integers from `n` to `m` bits.
        Numbers can be represented exactly only if `m` is a multiple of `n`.
        Parameters
        ----------
        a : ndarray
            Input image array.
        n : int
            Number of bits currently used to encode the values in `a`.
        m : int
            Desired number of bits to encode the values in `out`.
        copy : bool, optional
            If True, allocates and returns new array. Otherwise, modifies
            `a` in place.
        Returns
        -------
        out : array
            Output image array. Has the same kind as `a`.
        """
        kind = a.dtype.kind
        if n > m and a.max() < 2**m:
            return a.astype(_dtype_bits(kind, m))
        elif n == m:
            return a.copy() if copy else a
        elif n > m:
            # downscale with precision loss
            if copy:
                b = np.empty(a.shape, _dtype_bits(kind, m))
                np.floor_divide(a, 2 ** (n - m), out=b, dtype=a.dtype, casting="unsafe")
                return b
            else:
                a //= 2 ** (n - m)
                return a
        elif m % n == 0:
            # exact upscale to a multiple of `n` bits
            if copy:
                b = np.empty(a.shape, _dtype_bits(kind, m))
                np.multiply(a, (2**m - 1) // (2**n - 1), out=b, dtype=b.dtype)
                return b
            else:
                a = a.astype(_dtype_bits(kind, m, a.dtype.itemsize), copy=False)
                a *= (2**m - 1) // (2**n - 1)
                return a
        else:
            # upscale to a multiple of `n` bits,
            # then downscale with precision loss
            o = (m // n + 1) * n
            if copy:
                b = np.empty(a.shape, _dtype_bits(kind, o))
                np.multiply(a, (2**o - 1) // (2**n - 1), out=b, dtype=b.dtype)
                b //= 2 ** (o - m)
                return b
            else:
                a = a.astype(_dtype_bits(kind, o, a.dtype.itemsize), copy=False)
                a *= (2**o - 1) // (2**n - 1)
                a //= 2 ** (o - m)
                return a

    image = np.asarray(image)
    dtypeobj_in = image.dtype
    dtypeobj_out = np.dtype("float64") if dtype is np.floating else np.dtype(dtype)
    dtype_in = dtypeobj_in.type
    dtype_out = dtypeobj_out.type
    kind_in = dtypeobj_in.kind
    kind_out = dtypeobj_out.kind
    itemsize_in = dtypeobj_in.itemsize
    itemsize_out = dtypeobj_out.itemsize

    # Below, we do an `issubdtype` check.  Its purpose is to find out
    # whether we can get away without doing any image conversion.  This happens
    # when:
    #
    # - the output and input dtypes are the same or
    # - when the output is specified as a type, and the input dtype
    #   is a subclass of that type (e.g. `np.floating` will allow
    #   `float32` and `float64` arrays through)

    if np.issubdtype(dtype_in, np.obj2sctype(dtype)):
        if force_copy:
            image = image.copy()
        return image

    if kind_in in "ui":
        imin_in = np.iinfo(dtype_in).min
        imax_in = np.iinfo(dtype_in).max
    if kind_out in "ui":
        imin_out = np.iinfo(dtype_out).min  # type: ignore
        imax_out = np.iinfo(dtype_out).max  # type: ignore

    # any -> binary
    if kind_out == "b":
        return image > dtype_in(dtype_range[dtype_in][1] / 2)

    # binary -> any
    if kind_in == "b":
        result = image.astype(dtype_out)
        if kind_out != "f":
            result *= dtype_out(dtype_range[dtype_out][1])
        return result

    # float -> any
    if kind_in == "f":
        if kind_out == "f":
            # float -> float
            return image.astype(dtype_out)

        if np.min(image) < -1.0 or np.max(image) > 1.0:
            raise ValueError("Images of type float must be between -1 and 1.")
        # floating point -> integer
        # use float type that can represent output integer type
        computation_type = _dtype_itemsize(
            itemsize_out, dtype_in, np.float32, np.float64
        )

        if not uniform:
            if kind_out == "u":
                image_out = np.multiply(image, imax_out, dtype=computation_type)  # type: ignore
            else:
                image_out = np.multiply(
                    image, (imax_out - imin_out) / 2, dtype=computation_type  # type: ignore
                )
                image_out -= 1.0 / 2.0
            np.rint(image_out, out=image_out)
            np.clip(image_out, imin_out, imax_out, out=image_out)  # type: ignore
        elif kind_out == "u":
            image_out = np.multiply(image, imax_out + 1, dtype=computation_type)  # type: ignore
            np.clip(image_out, 0, imax_out, out=image_out)  # type: ignore
        else:
            image_out = np.multiply(
                image, (imax_out - imin_out + 1.0) / 2.0, dtype=computation_type  # type: ignore
            )
            np.floor(image_out, out=image_out)
            np.clip(image_out, imin_out, imax_out, out=image_out)  # type: ignore
        return image_out.astype(dtype_out)

    # signed/unsigned int -> float
    if kind_out == "f":
        # use float type that can exactly represent input integers
        computation_type = _dtype_itemsize(
            itemsize_in, dtype_out, np.float32, np.float64
        )

        if kind_in == "u":
            # using np.divide or np.multiply doesn't copy the data
            # until the computation time
            image = np.multiply(image, 1.0 / imax_in, dtype=computation_type)  # type: ignore
            # DirectX uses this conversion also for signed ints
            # if imin_in:
            #     np.maximum(image, -1.0, out=image)
        else:
            image = np.add(image, 0.5, dtype=computation_type)
            image *= 2 / (imax_in - imin_in)  # type: ignore

        return np.asarray(image, dtype_out)

    # unsigned int -> signed/unsigned int
    if kind_in == "u":
        if kind_out == "i":
            # unsigned int -> signed int
            image = _scale(image, 8 * itemsize_in, 8 * itemsize_out - 1)
            return image.view(dtype_out)
        else:
            # unsigned int -> unsigned int
            return _scale(image, 8 * itemsize_in, 8 * itemsize_out)

    # signed int -> unsigned int
    if kind_out == "u":
        image = _scale(image, 8 * itemsize_in - 1, 8 * itemsize_out)
        result = np.empty(image.shape, dtype_out)
        np.maximum(image, 0, out=result, dtype=image.dtype, casting="unsafe")
        return result

    # signed int -> signed int
    if itemsize_in > itemsize_out:
        return _scale(image, 8 * itemsize_in - 1, 8 * itemsize_out - 1)

    image = image.astype(_dtype_bits("i", itemsize_out * 8))
    image -= imin_in  # type: ignore
    image = _scale(image, 8 * itemsize_in, 8 * itemsize_out, copy=False)
    image += imin_out  # type: ignore
    return image.astype(dtype_out)


def ffmpeg_installed() -> bool:
    if wasm_utils.IS_WASM:
        # TODO: Support ffmpeg in WASM
        return False

    return shutil.which("ffmpeg") is not None


def video_is_playable(video_filepath: str) -> bool:
    """Determines if a video is playable in the browser.

    A video is playable if it has a playable container and codec.
        .mp4 -> h264
        .webm -> vp9
        .ogg -> theora
    """
    from ffmpy import FFprobe, FFRuntimeError

    try:
        container = Path(video_filepath).suffix.lower()
        probe = FFprobe(
            global_options="-show_format -show_streams -select_streams v -print_format json",
            inputs={video_filepath: None},
        )
        output = probe.run(stderr=subprocess.PIPE, stdout=subprocess.PIPE)
        output = json.loads(output[0])
        video_codec = output["streams"][0]["codec_name"]
        return (container, video_codec) in [
            (".mp4", "h264"),
            (".ogg", "theora"),
            (".webm", "vp9"),
        ]
    # If anything goes wrong, assume the video can be played to not convert downstream
    except (FFRuntimeError, IndexError, KeyError):
        return True


def convert_video_to_playable_mp4(video_path: str) -> str:
    """Convert the video to mp4. If something goes wrong return the original video."""
    from ffmpy import FFmpeg, FFRuntimeError

    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            output_path = Path(video_path).with_suffix(".mp4")
            shutil.copy2(video_path, tmp_file.name)
            # ffmpeg will automatically use h264 codec (playable in browser) when converting to mp4
            ff = FFmpeg(
                inputs={str(tmp_file.name): None},
                outputs={str(output_path): None},
                global_options="-y -loglevel quiet",
            )
            ff.run()
    except FFRuntimeError as e:
        print(f"Error converting video to browser-playable format {str(e)}")
        output_path = video_path
    finally:
        # Remove temp file
        os.remove(tmp_file.name)  # type: ignore
    return str(output_path)


def get_video_length(video_path: str | Path):
    duration = subprocess.check_output(
        [
            "ffprobe",
            "-i",
            str(video_path),
            "-show_entries",
            "format=duration",
            "-v",
            "quiet",
            "-of",
            "csv={}".format("p=0"),
        ]
    )
    duration_str = duration.decode("utf-8").strip()
    duration_float = float(duration_str)

    return duration_float
