# Gradio Media Assets

This directory contains centralized media files for Gradio demos, eliminating duplicates and reducing repository size.

## Structure

```
gradio/media_assets/
├── images/          # Image files (JPG, PNG, GIF)
├── videos/          # Video files (MP4, AVI, etc.)
├── audio/           # Audio files (WAV, MP3, etc.)
├── models3d/        # 3D model files (OBJ, GLB, GLTF, STL)
├── data/            # Data files (CSV, JSON, TXT)
└── subtitles/       # Subtitle files (SRT, VTT)
```

## Usage

Instead of copying media files to each demo directory, import them from the central registry:

```python
from gradio.media import get_image, get_video, get_audio

# Get specific media files
cheetah_img = get_image("cheetah1")
world_video = get_video("world")
cantina_audio = get_audio("cantina")

# Get random media (for testing)
random_img = get_image()
random_video = get_video()
```

## Available Media

### Images
- `cheetah1`, `cheetah` - Cheetah photos
- `lion` - Lion photo
- `tower` - Building/tower image
- `logo` - Gradio logo
- `avatar` - User avatar placeholder
- `groot` - Character image

### Videos
- `world` - Earth/world video
- `video_a`, `video_b` - Sample videos

### Audio
- `cantina` - Background music
- `recording1` - Voice recording sample
- `cate_blanch`, `heath_ledger` - Celebrity voice samples

### 3D Models
- `bunny` - Stanford bunny (OBJ)
- `duck` - Duck model (GLB)
- `fox` - Fox model (GLTF)
- `face` - Face model (OBJ)
- `sofia` - Sofia model (STL)

### Data Files
- `titanic` - Titanic dataset (CSV)
- `time_series` - Time series data (CSV)
- `imagenet_labels` - ImageNet labels (JSON)
- `sample_text` - Sample text file

## Benefits

- **Reduced repo size**: Saves ~15MB by eliminating duplicates
- **Consistency**: Same media across all demos
- **Easy access**: Simple import functions
- **Organization**: Files organized by type
- **Random selection**: Get random media for testing

## Migration

Use the migration script to update existing demos:

```bash
python scripts/migrate_demo_media.py demo/ --dry-run
```

See `gradio/media_migration_guide.md` for detailed migration instructions.

## Adding New Media

1. Add file to appropriate subdirectory
2. Update `MEDIA_REGISTRY` in `gradio/media.py`
3. Update documentation
4. Test with `python -c "from gradio.media import get_image; print(get_image('new_name'))"`

## File Size Guidelines

- **Images**: < 100KB preferred (use JPG for photos, PNG for graphics)
- **Videos**: < 5MB preferred (use MP4)
- **Audio**: < 1MB preferred (use WAV for quality, MP3 for size)
- **3D Models**: < 500KB preferred
- **Data Files**: Be mindful of repository size
