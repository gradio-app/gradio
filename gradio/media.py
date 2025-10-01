"""
Media Registry for Gradio Demos

This module provides a centralized way to access media files.

Usage:
    from gradio.media import get_image, get_video, get_audio, get_model3d, get_file

    # Get specific media files
    cheetah_img = get_image("cheetah1.jpg")
    world_video = get_video("world.mp4")
    cantina_audio = get_audio("cantina.wav")

    # Get random media of a type
    random_img = get_image()
    random_audio = get_audio()

"""

import random
from pathlib import Path
from typing import Optional

MEDIA_ROOT = Path(__file__).parent / "media_assets"


def _get_media_path(media_type: str, filename: Optional[str] = None) -> str:
    """
    Internal function to get the path to a media file.

    Args:
        media_type: Type of media (images, videos, audio, models3d, data, subtitles)
        filename: Optional filename of the media file. If None, returns a random file.

    Returns:
        Absolute path to the media file

    Raises:
        ValueError: If media_type is invalid
        FileNotFoundError: If the media file doesn't exist
    """
    media_dir = MEDIA_ROOT / media_type

    if not media_dir.exists():
        raise ValueError(f"Media directory not found: {media_dir}")

    if filename is None:
        # Get a random file from the directory
        media_files = list(media_dir.glob("*"))
        if not media_files:
            raise ValueError(f"No media files found in {media_dir}")
        file_path = random.choice(media_files)
    else:
        if filename.startswith(("http://", "https://")):
            return filename

        file_path = media_dir / filename

    if not file_path.exists():
        raise FileNotFoundError(f"Media file not found: {file_path}")

    return str(file_path.absolute())


def get_image(filename: Optional[str] = None) -> str:
    """
    Get path to an image file.

    Args:
        filename: Filename of the image (e.g., "tower.jpg"). If None, returns a random image.

    Returns:
        Absolute path to the image file

    Examples:
        >>> get_image("tower.jpg")  # Get specific image
        >>> get_image()  # Get random image
    """
    return _get_media_path("images", filename)


def get_video(filename: Optional[str] = None) -> str:
    """
    Get path to a video file.

    Args:
        filename: Filename of the video (e.g., "world.mp4"). If None, returns a random video.

    Returns:
        Absolute path to the video file

    Examples:
        >>> get_video("world.mp4")  # Get specific video
        >>> get_video()  # Get random video
    """
    return _get_media_path("videos", filename)


def get_audio(filename: Optional[str] = None) -> str:
    """
    Get path to an audio file.

    Args:
        filename: Filename of the audio (e.g., "cantina.wav"). If None, returns a random audio file.

    Returns:
        Absolute path to the audio file

    Examples:
        >>> get_audio("cantina.wav")  # Get specific audio
        >>> get_audio()  # Get random audio
    """
    return _get_media_path("audio", filename)


def get_model3d(filename: Optional[str] = None) -> str:
    """
    Get path to a 3D model file.

    Args:
        filename: Filename of the 3D model (e.g., "Duck.glb"). If None, returns a random model.

    Returns:
        Absolute path to the 3D model file

    Examples:
        >>> get_model3d("Duck.glb")  # Get specific model
        >>> get_model3d()  # Get random 3D model
    """
    return _get_media_path("models3d", filename)


def get_file(filename: Optional[str] = None) -> str:
    """
    Get path to a data file (CSV, JSON, text, etc.).

    Args:
        filename: Filename of the data file (e.g., "titanic.csv"). If None, returns a random file.

    Returns:
        Absolute path to the data file

    Examples:
        >>> get_file("titanic.csv")  # Get specific file
        >>> get_file()  # Get random data file
    """
    return _get_media_path("data", filename)


def get_subtitle(filename: Optional[str] = None) -> str:
    """
    Get path to a subtitle file.

    Args:
        filename: Filename of the subtitle file (e.g., "s1.srt"). If None, returns a random subtitle.

    Returns:
        Absolute path to the subtitle file

    Examples:
        >>> get_subtitle("s1.srt")  # Get specific subtitle
        >>> get_subtitle()  # Get random subtitle
    """
    return _get_media_path("subtitles", filename)


def get_media_info() -> dict[str, list[str]]:
    """
    Get information about all available media files.

    Returns:
        Dictionary mapping media types to lists of available filenames
    """
    media_types = ["images", "videos", "audio", "models3d", "data", "subtitles"]
    result = {}

    for media_type in media_types:
        media_dir = MEDIA_ROOT / media_type
        if media_dir.exists():
            result[media_type] = [f.name for f in media_dir.glob("*") if f.is_file()]
        else:
            result[media_type] = []

    return result


class MediaPaths:
    """
    Provides directory paths for backwards compatibility with existing demos.

    Usage:
        from gradio.media import MediaPaths
        paths = MediaPaths()
        img_dir = paths.images_dir
        file_dir = paths.data_dir
    """

    @property
    def images_dir(self) -> str:
        """Directory containing image files."""
        return str(MEDIA_ROOT / "images")

    @property
    def videos_dir(self) -> str:
        """Directory containing video files."""
        return str(MEDIA_ROOT / "videos")

    @property
    def audio_dir(self) -> str:
        """Directory containing audio files."""
        return str(MEDIA_ROOT / "audio")

    @property
    def models3d_dir(self) -> str:
        """Directory containing 3D model files."""
        return str(MEDIA_ROOT / "models3d")

    @property
    def data_dir(self) -> str:
        """Directory containing data files."""
        return str(MEDIA_ROOT / "data")

    @property
    def subtitles_dir(self) -> str:
        """Directory containing subtitle files."""
        return str(MEDIA_ROOT / "subtitles")
