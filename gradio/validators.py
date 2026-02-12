from typing import TYPE_CHECKING, Any

from gradio_client.documentation import document

if TYPE_CHECKING:
    import numpy as np


@document()
def is_audio_correct_length(
    audio: tuple[int, "np.ndarray"], min_length: float | None, max_length: float | None
) -> dict[str, Any]:
    """
    Validates that the audio length is within the specified min and max length (in seconds).

    Parameters:
        audio: A tuple of (sample rate in Hz, audio data as numpy array).
        min_length: Minimum length of audio in seconds. If None, no minimum length check is performed.
        max_length: Maximum length of audio in seconds. If None, no maximum length check is performed.
    Returns:
        A dict corresponding to `gr.validate()` indicating whether the audio length is valid and an optional message.
    """
    if min_length is not None or max_length is not None:
        sample_rate, data = audio
        duration = len(data) / sample_rate
        if min_length is not None and duration < min_length:
            return {
                "__type__": "validate",
                "is_valid": False,
                "message": f"Audio is too short. It must be at least {min_length} seconds",
            }
        if max_length is not None and duration > max_length:
            return {
                "__type__": "validate",
                "is_valid": False,
                "message": f"Audio is too long. It must be at most {max_length} seconds",
            }
    return {"__type__": "validate", "is_valid": True}


@document()
def is_video_correct_length(
    video: str, min_length: float | None, max_length: float | None
) -> dict[str, Any]:
    """
    Validates that the video file length is within the specified min and max length (in seconds).

    Parameters:
        video: The path to the video file.
        min_length: Minimum length of video in seconds. If None, no minimum length check is performed.
        max_length: Maximum length of video in seconds. If None, no maximum length check is performed.
    Returns:
        A dict corresponding to `gr.validate()` indicating whether the audio length is valid and an optional message.
    """
    from gradio.processing_utils import get_video_length

    if min_length is not None or max_length is not None:
        duration = get_video_length(video)
        if min_length is not None and duration < min_length:
            return {
                "__type__": "validate",
                "is_valid": False,
                "message": f"Video is too short. It must be at least {min_length} seconds",
            }
        if max_length is not None and duration > max_length:
            return {
                "__type__": "validate",
                "is_valid": False,
                "message": f"Video is too long. It must be at most {max_length} seconds",
            }
    return {"__type__": "validate", "is_valid": True}
