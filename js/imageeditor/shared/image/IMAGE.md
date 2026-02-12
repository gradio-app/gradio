# Image Tool Documentation

## Overview

The Image Tool is a component of the image editor that handles adding and managing background images on the canvas. It allows users to upload, paste, or capture images from a webcam and set them as the background of the editing canvas. The tool manages image sizing, positioning, and integration with the layer system.

## File Structure

- `js/imageeditor/shared/image/image.ts` - Main implementation of the image tool
- `js/imageeditor/shared/image/Sources.svelte` - UI component for image source options
- `js/imageeditor/shared/core/editor.ts` - Defines the `Tool` interface and `ImageEditorContext`
- `js/imageeditor/shared/Toolbar.svelte` - Defines the tool types and subtool types

## Implementation Details

### Class: `ImageTool`

The `ImageTool` class implements the `Tool` interface defined in `editor.ts`. It provides the following functionality:

- Adding images to the canvas
- Managing image dimensions and positioning
- Integrating with the layer system

### Key Components

#### `ImageTool` Class

The main class that implements the `Tool` interface with methods:
- `setup(context, tool, subtool)` - Initializes the tool with the editor context
- `cleanup()` - Cleans up resources
- `add_image(image, fixed_canvas)` - Adds an image to the canvas
- `set_tool(tool, subtool)` - Updates the current tool and subtool

#### `AddImageCommand` Class

Implements the command pattern for adding images, allowing for undo/redo functionality:
- `start()` - Initializes the image sprite and calculates dimensions
- `execute()` - Adds the image to the canvas and updates the editor state
- `undo()` - Removes the image from the canvas

#### Helper Functions

- `fit_image_to_canvas(image_width, image_height, canvas_width, canvas_height)` - Calculates dimensions to fit an image within the canvas while maintaining aspect ratio
- `add_bg_color(container, renderer, color, width, height, resize)` - Adds a solid color background to the canvas

### Image Processing Flow

1. **Image Acquisition**: The image is acquired as a Blob or File from one of the sources (upload, clipboard, webcam)
2. **Image Processing**: 
   - The image is converted to a bitmap and then to a PIXI.js Texture
   - The dimensions are calculated based on whether fixed_canvas is true or false
   - If fixed_canvas is true, the image is scaled to fit the canvas while maintaining aspect ratio
   - If fixed_canvas is false, the canvas is resized to match the image dimensions

3. **Canvas Integration**:
   - The editor's image properties are updated with the new dimensions
   - Existing layers are preserved and scaled to match the new dimensions
   - A new background layer is created with the image sprite
   - The image is centered in the viewport

4. **Layer Management**:
   - The image is added as a sprite to a background layer
   - Existing layers are preserved and scaled to match the new dimensions
   - If no layers exist, an initial drawing layer is created

## Command Pattern Implementation

The image tool uses the command pattern to implement undo/redo functionality:

1. **Command Creation**: When adding an image, an `AddImageCommand` is created
2. **Command Execution**: The command's `execute()` method is called to add the image
3. **Command Registration**: The command is registered with the editor's command manager
4. **Undo Support**: The command's `undo()` method can be called to remove the image

## Integration with Editor

The image tool integrates with the editor through the `ImageEditorContext` interface, which provides:

- `app` - The PIXI.js Application instance
- `layer_manager` - Manages the layers in the editor
- `set_image_properties` - Updates the image dimensions and position
- `set_background_image` - Sets the background image sprite
- `execute_command` - Registers a command with the command manager

## Usage Flow

1. The user selects an image source (upload, clipboard, webcam)
2. The image is acquired as a Blob or File
3. The `add_image` method is called with the image and a flag indicating whether to maintain the canvas size
4. An `AddImageCommand` is created and executed
5. The image is added to the canvas as a background layer
6. The editor's state is updated with the new dimensions and position

## Implementation Notes

### Image Scaling

The tool provides two modes for handling image dimensions:

1. **Fixed Canvas Mode** (fixed_canvas = true):
   - The image is scaled to fit within the canvas dimensions
   - The aspect ratio is maintained
   - The canvas size remains unchanged

2. **Flexible Canvas Mode** (fixed_canvas = false):
   - The canvas is resized to match the image dimensions
   - No scaling is applied to the image
   - Existing layers are scaled to match the new dimensions

### Layer Preservation

When adding a new background image:

1. Existing layers are preserved
2. Layer textures are captured before modification
3. New layers are created with the new dimensions
4. Content from old layers is scaled and centered on the new layers
5. If no layers exist, an initial drawing layer is created

## Maintenance Notes

When modifying the image tool, consider:

1. **Command Pattern**: Ensure that all modifications to the canvas state are implemented as commands for proper undo/redo support
2. **Layer Management**: Be careful with layer creation and destruction to avoid memory leaks
3. **Image Scaling**: Ensure that aspect ratios are maintained when scaling images
4. **Performance**: Large images may need to be downsampled for performance
5. **Memory Management**: Properly destroy textures and sprites when they are no longer needed

## Related Components

- **Toolbar**: Controls tool selection
- **ImageEditor**: Provides the context and manages the overall editor state
- **LayerManager**: Manages image layers
- **Sources.svelte**: Provides UI for selecting image sources 