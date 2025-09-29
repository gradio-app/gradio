"""
Media Registry for Gradio Demos

This module provides a centralized way to access media files for demos,
reducing repository size by eliminating duplicate files and providing
a clean abstraction for importing media content.

Usage:
    from gradio.media import get_image, get_video, get_audio, get_model3d, get_file
    
    # Get specific media files
    cheetah_img = get_image("cheetah1")
    world_video = get_video("world")
    cantina_audio = get_audio("cantina")
    
    # Get random media of a type
    random_img = get_image()
    random_audio = get_audio()
    
    # List available media
    available_images = list_images()
    available_videos = list_videos()
"""

import random
import warnings
from pathlib import Path
from typing import Dict, List, Optional

# Media registry root directory
MEDIA_ROOT = Path(__file__).parent / "media_assets"

# Media type mappings
MEDIA_REGISTRY: Dict[str, Dict[str, str]] = {
    "images": {
        "cheetah1": "cheetah1.jpg",
        "cheetah": "cheetah.jpg",
        "lion": "lion.jpg",
        "tower": "tower.jpg",
        "logo": "logo.png",
        "avatar": "avatar.png",
        "elephant": "elephant.jpg",
        "tiger": "tiger.jpg",
        "zebra": "zebra.jpg",
        "groot": "groot.jpeg",
        "hf_logo": "hf-logo_transpng.png",
        "watermark_w1": "w1.jpg",
        "watermark_w2": "w2.png",
        "layer1": "layer1.png",
        "rabbit": "rabbit.png",
        "frog": "frog.jpg",
    },
    "videos": {
        "world": "world.mp4",
        "video_a": "a.mp4",
        "video_b": "b.mp4",
        "sample_video": "video_sample.mp4",
        "compliment_bot": "compliment_bot_screen_recording_3x.mp4",
        "hd_sample": "3285790-hd_1920_1080_30fps.mp4",
    },
    "audio": {
        "cantina": "cantina.wav",
        "recording1": "recording1.wav",
        "audio_sample": "audio.wav",
        "beep": "beep.mp3",
        "audio_a": "a.mp3",
        "audio_b": "b.mp3",
        "flute": "flute.wav",
        "sax": "sax.wav",
        "sax2": "sax2.wav",
        "trombone": "trombone.wav",
        "cate_blanch": "cate_blanch.mp3",
        "cate_blanch_2": "cate_blanch_2.mp3",
        "heath_ledger": "heath_ledger.mp3",
        "kirsten_dunst": "kirsten_dunst.wav",
    },
    "models3d": {
        "bunny": "Bunny.obj",
        "duck": "Duck.glb",
        "fox": "Fox.gltf",
        "face": "face.obj",
        "sofia": "sofia.stl",
    },
    "data": {
        "titanic": "titanic.csv",
        "time_series": "time.csv",
        "imagenet_labels": "imagenet_labels.json",
        "sample_text": "sample.txt",
    },
    "subtitles": {
        "subtitle_srt": "s1.srt",
        "subtitle_vtt": "s2.vtt",
    }
}

def _get_media_path(media_type: str, name: Optional[str] = None) -> str:
    """
    Internal function to get the path to a media file.
    
    Args:
        media_type: Type of media (images, videos, audio, models3d, data, subtitles)
        name: Optional name of the specific media file. If None, returns a random file.
        
    Returns:
        Absolute path to the media file
        
    Raises:
        ValueError: If media_type is invalid or name is not found
        FileNotFoundError: If the media file doesn't exist
    """
    if media_type not in MEDIA_REGISTRY:
        raise ValueError(f"Invalid media type: {media_type}. Available types: {list(MEDIA_REGISTRY.keys())}")

    media_files = MEDIA_REGISTRY[media_type]

    if name is None:
        # Return random file of this type
        name = random.choice(list(media_files.keys()))

    if name not in media_files:
        available = list(media_files.keys())
        raise ValueError(f"Media '{name}' not found in {media_type}. Available: {available}")

    filename = media_files[name]
    file_path = MEDIA_ROOT / media_type / filename

    if not file_path.exists():
        raise FileNotFoundError(f"Media file not found: {file_path}")

    return str(file_path.absolute())


def get_image(name: Optional[str] = None) -> str:
    """
    Get path to an image file.
    
    Args:
        name: Name of the image. If None, returns a random image.
        
    Returns:
        Absolute path to the image file
        
    Examples:
        >>> get_image("cheetah1")  # Get specific cheetah image
        >>> get_image()  # Get random image
    """
    return _get_media_path("images", name)


def get_video(name: Optional[str] = None) -> str:
    """
    Get path to a video file.
    
    Args:
        name: Name of the video. If None, returns a random video.
        
    Returns:
        Absolute path to the video file
        
    Examples:
        >>> get_video("world")  # Get world.mp4
        >>> get_video()  # Get random video
    """
    return _get_media_path("videos", name)


def get_audio(name: Optional[str] = None) -> str:
    """
    Get path to an audio file.
    
    Args:
        name: Name of the audio. If None, returns a random audio file.
        
    Returns:
        Absolute path to the audio file
        
    Examples:
        >>> get_audio("cantina")  # Get cantina.wav
        >>> get_audio()  # Get random audio
    """
    return _get_media_path("audio", name)


def get_model3d(name: Optional[str] = None) -> str:
    """
    Get path to a 3D model file.
    
    Args:
        name: Name of the 3D model. If None, returns a random model.
        
    Returns:
        Absolute path to the 3D model file
        
    Examples:
        >>> get_model3d("duck")  # Get Duck.glb
        >>> get_model3d()  # Get random 3D model
    """
    return _get_media_path("models3d", name)


def get_file(name: Optional[str] = None) -> str:
    """
    Get path to a data file (CSV, JSON, text, etc.).
    
    Args:
        name: Name of the data file. If None, returns a random file.
        
    Returns:
        Absolute path to the data file
        
    Examples:
        >>> get_file("titanic")  # Get titanic.csv
        >>> get_file()  # Get random data file
    """
    return _get_media_path("data", name)


def get_subtitle(name: Optional[str] = None) -> str:
    """
    Get path to a subtitle file.
    
    Args:
        name: Name of the subtitle file. If None, returns a random subtitle.
        
    Returns:
        Absolute path to the subtitle file
        
    Examples:
        >>> get_subtitle("subtitle_srt")  # Get s1.srt
        >>> get_subtitle()  # Get random subtitle
    """
    return _get_media_path("subtitles", name)


def list_images() -> List[str]:
    """List all available image names."""
    return list(MEDIA_REGISTRY["images"].keys())


def list_videos() -> List[str]:
    """List all available video names."""
    return list(MEDIA_REGISTRY["videos"].keys())


def list_audio() -> List[str]:
    """List all available audio names."""
    return list(MEDIA_REGISTRY["audio"].keys())


def list_models3d() -> List[str]:
    """List all available 3D model names."""
    return list(MEDIA_REGISTRY["models3d"].keys())


def list_files() -> List[str]:
    """List all available data file names."""
    return list(MEDIA_REGISTRY["data"].keys())


def list_subtitles() -> List[str]:
    """List all available subtitle names."""
    return list(MEDIA_REGISTRY["subtitles"].keys())


def get_media_info() -> Dict[str, List[str]]:
    """
    Get information about all available media files.
    
    Returns:
        Dictionary mapping media types to lists of available names
    """
    return {
        "images": list_images(),
        "videos": list_videos(),
        "audio": list_audio(),
        "models3d": list_models3d(),
        "data": list_files(),
        "subtitles": list_subtitles(),
    }


# Backwards compatibility - deprecated functions
def random_image() -> str:
    """Deprecated: Use get_image() instead."""
    warnings.warn("random_image() is deprecated. Use get_image() instead.", DeprecationWarning)
    return get_image()


def random_video() -> str:
    """Deprecated: Use get_video() instead."""
    warnings.warn("random_video() is deprecated. Use get_video() instead.", DeprecationWarning)
    return get_video()


def random_audio() -> str:
    """Deprecated: Use get_audio() instead."""
    warnings.warn("random_audio() is deprecated. Use get_audio() instead.", DeprecationWarning)
    return get_audio()


# For demo compatibility - provides directory paths
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


# Create default instance for easy access
media_paths = MediaPaths()
