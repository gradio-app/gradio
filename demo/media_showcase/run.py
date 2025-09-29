import gradio as gr
from gradio.media import (
    get_image, get_video, get_audio, get_model3d, list_images, list_videos, list_audio, list_models3d,
    get_media_info
)
import random

def image_identity(image):
    """Simple identity function for image processing demo."""
    return image

def get_random_media_info():
    """Return information about randomly selected media."""
    media_info = get_media_info()

    # Get random items from each category
    random_image = random.choice(media_info["images"])
    random_video = random.choice(media_info["videos"])
    random_audio = random.choice(media_info["audio"])

    info = f"""
    ## Random Media Selected:
    - **Image**: {random_image}
    - **Video**: {random_video}  
    - **Audio**: {random_audio}
    
    ### Available Media Counts:
    - Images: {len(media_info["images"])}
    - Videos: {len(media_info["videos"])}
    - Audio: {len(media_info["audio"])}
    - 3D Models: {len(media_info["models3d"])}
    - Data Files: {len(media_info["data"])}
    """

    return info, get_image(random_image), get_video(random_video), get_audio(random_audio)

# Create the demo interface
with gr.Blocks(title="Gradio Media System Showcase") as demo:
    gr.Markdown("""
    # 🎨 Gradio Media System Showcase
    
    This demo showcases the new centralized media system in Gradio. Instead of duplicating media files 
    across different demos, we now have a central registry that provides easy access to common media files.
    
    ## Features:
    - 🖼️ **Centralized Images**: Access standard images like cheetahs, lions, logos
    - 🎥 **Common Videos**: Shared video files for consistent demos  
    - 🎵 **Audio Samples**: Standard audio files for testing
    - 🎭 **3D Models**: Various 3D models in different formats
    - 📊 **Data Files**: Common datasets like Titanic, ImageNet labels
    
    Click "Get Random Media" to see the system in action!
    """)

    with gr.Row():
        with gr.Column():
            gr.Markdown("### 📋 Media Information")
            media_info_btn = gr.Button("Get Random Media", variant="primary")
            media_info_text = gr.Markdown()

        with gr.Column():
            gr.Markdown("### 🎯 Example Usage")
            gr.Code("""
# Using the new media system
from gradio.media import get_image, get_video, get_audio

# Get specific media
cheetah = get_image("cheetah1")
world = get_video("world") 
cantina = get_audio("cantina")

# Get random media
random_img = get_image()  # Random image
random_vid = get_video()  # Random video
            """, language="python")

    gr.Markdown("### 🖼️ Image Gallery Examples")
    with gr.Row():
        # Show specific images
        cheetah_img = gr.Image(value=get_image("cheetah1"), label="Cheetah 1")
        lion_img = gr.Image(value=get_image("lion"), label="Lion")
        logo_img = gr.Image(value=get_image("logo"), label="Logo")

    gr.Markdown("### 🎥 Video Examples")
    with gr.Row():
        world_video = gr.Video(value=get_video("world"), label="World Video")
        sample_video = gr.Video(value=get_video("video_a"), label="Sample Video A")

    gr.Markdown("### 🎵 Audio Examples")
    with gr.Row():
        cantina_audio = gr.Audio(value=get_audio("cantina"), label="Cantina Music")
        recording_audio = gr.Audio(value=get_audio("recording1"), label="Recording Sample")

    gr.Markdown("### 🎭 3D Model Examples")
    with gr.Row():
        duck_model = gr.Model3D(value=get_model3d("duck"), label="Duck Model (GLB)")
        bunny_model = gr.Model3D(value=get_model3d("bunny"), label="Bunny Model (OBJ)")

    gr.Markdown("### 🔄 Interactive Demo")
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(label="Input Image")
            process_btn = gr.Button("Process Image")

        with gr.Column():
            output_image = gr.Image(label="Output Image")

    # Examples for the interactive demo
    gr.Examples(
        examples=[
            [get_image("cheetah1")],
            [get_image("lion")],
            [get_image("tower")],
            [get_image()]  # Random image
        ],
        inputs=input_image,
        label="Try these example images"
    )

    gr.Markdown("### 📊 Available Media Lists")
    with gr.Row():
        with gr.Column():
            gr.Markdown("**Available Images:**")
            gr.Textbox(value=", ".join(list_images()), label="Image Names", interactive=False)

        with gr.Column():
            gr.Markdown("**Available Videos:**")
            gr.Textbox(value=", ".join(list_videos()), label="Video Names", interactive=False)

    with gr.Row():
        with gr.Column():
            gr.Markdown("**Available Audio:**")
            gr.Textbox(value=", ".join(list_audio()), label="Audio Names", interactive=False)

        with gr.Column():
            gr.Markdown("**Available 3D Models:**")
            gr.Textbox(value=", ".join(list_models3d()), label="3D Model Names", interactive=False)

    # Event handlers
    media_info_btn.click(
        fn=get_random_media_info,
        outputs=[media_info_text, cheetah_img, world_video, cantina_audio]
    )

    process_btn.click(
        fn=image_identity,
        inputs=input_image,
        outputs=output_image
    )

    gr.Markdown("""
    ---
    
    ### 💡 Benefits of the New System:
    
    1. **Reduced Repository Size**: Eliminates ~15MB of duplicate media files
    2. **Consistency**: Same media files across all demos
    3. **Easy Access**: Simple functions to get any media type
    4. **Random Selection**: Get random media for testing without specifying names
    5. **Organized**: Media files organized by type (images, videos, audio, etc.)
    6. **Backward Compatible**: Existing demos continue to work
    
    ### 📚 Learn More:
    Check out the `gradio/media_migration_guide.md` for detailed migration instructions!
    """)

if __name__ == "__main__":
    demo.launch()
