# Brush Tool Documentation

## Overview

The Brush Tool is a core component of the image editor that allows users to draw and erase on the canvas. It provides a flexible drawing experience with customizable brush size, color, and opacity. This document explains how the brush tool works and the relationships between its components.

## Key Files

- `js/imageeditor/shared/brush/brush.ts`: Main implementation of the brush tool
- `js/imageeditor/shared/brush/BrushOptions.svelte`: UI controls for brush settings
- `js/imageeditor/shared/brush/ColorPicker.svelte`: Color selection component
- `js/imageeditor/shared/brush/ColorSwatch.svelte`: Color swatch component
- `js/imageeditor/shared/brush/ColorField.svelte`: Color input field component
- `js/imageeditor/shared/brush/BrushSize.svelte`: Brush size slider component
- `js/imageeditor/shared/Toolbar.svelte`: Defines tool types and handles tool selection
- `js/imageeditor/shared/core/editor.ts`: Provides the editor context and tool interface

## Architecture

The brush tool follows the Tool interface defined in `editor.ts`. It integrates with the image editor through the `ImageEditorContext` which provides access to the PIXI.js application, containers, and other utilities.

### Class Structure

The `BrushTool` class implements the `Tool` interface and provides the following functionality:

1. **Drawing and Erasing**: Handles pointer events to draw or erase on the canvas
2. **Brush Customization**: Allows changing brush size, color, and opacity
3. **Preview**: Shows a preview of the brush before drawing
4. **Cursor**: Displays a custom cursor that reflects the current brush settings

### State Management

The brush tool maintains several state variables:

- `state`: Contains the current brush settings (opacity, size, color, mode)
- `brushSize` and `eraserSize`: Separate size settings for drawing and erasing
- `isDrawing`: Tracks whether the user is currently drawing
- `isCursorOverImage`: Tracks whether the cursor is over the image container

### Rendering Pipeline

The brush tool uses multiple PIXI.js textures and containers to manage the drawing process:

1. `left_texture`: Stores the final result that is displayed to the user
2. `right_texture`: Stores the current state before applying new strokes
3. `stroke_texture`: Temporarily stores the current stroke being drawn
4. `displayContainer`: Contains all visual elements of the brush tool
5. `stroke_container`: Contains the graphics for the current stroke
6. `erase_graphics`: Used for masking when in erase mode

### Drawing Process

1. **Pointer Down**: Initializes a new stroke, captures the starting position
2. **Pointer Move**: Draws line segments between points with interpolation for smooth strokes
3. **Pointer Up**: Commits the current stroke to the canvas
4. **Commit Stroke**: Merges the temporary stroke with the existing content

### Erasing Process

1. **Pointer Down**: Creates an erase mask at the starting position
2. **Pointer Move**: Extends the erase mask along the pointer path
3. **Pointer Up**: Applies the erase mask to the canvas
4. **Commit Stroke**: Merges the erased content with the existing content

## UI Components

### BrushOptions.svelte

Provides UI controls for:
- Color selection (via color picker or swatches)
- Brush size adjustment
- Recent colors management
- Brush preview

### Brush Preview

The brush tool can show a preview of the current brush in the center of the screen, which helps users understand the brush size and color before drawing.

## Event Handling

The brush tool sets up the following event listeners:

- `pointerdown`: Starts a new stroke
- `pointermove`: Continues the current stroke and updates the cursor position
- `pointerup`/`pointerupoutside`: Ends the current stroke
- Custom events for checking if the cursor is over the image container

## Integration with Editor

The brush tool integrates with the editor through:

1. **Tool Interface**: Implements the required methods (setup, cleanup, set_tool)
2. **Context Access**: Uses the ImageEditorContext to access the PIXI.js application and containers
3. **Tool Switching**: Handles transitions between drawing and erasing modes

## Performance Considerations

The brush tool uses several techniques to maintain performance:

1. **Point Interpolation**: Ensures smooth lines even with fast mouse movements
2. **Texture Management**: Efficiently manages textures to minimize memory usage
3. **Cursor Position Checking**: Uses debouncing to avoid excessive updates

## Customization API

The brush tool exposes several methods for customization:

- `setBrushSize(size)`: Sets the brush size
- `setBrushColor(color)`: Sets the brush color
- `setBrushOpacity(opacity)`: Sets the brush opacity
- `set_brush_size(size)`: Sets the brush size (only affects drawing mode)
- `set_eraser_size(size)`: Sets the eraser size (only affects eraser mode)
- `set_brush_color(color)`: Sets the brush color (only affects drawing mode)
- `preview_brush(show)`: Shows or hides the brush preview

## Maintenance Notes

When modifying the brush tool, consider the following:

1. **Texture Cleanup**: Always clean up textures to prevent memory leaks
2. **Event Listener Management**: Properly add and remove event listeners
3. **Mode Transitions**: Handle transitions between drawing and erasing modes carefully
4. **Scale Handling**: Account for the editor scale when drawing and displaying the cursor
5. **Cursor Visibility**: Manage cursor visibility based on the current tool and cursor position

## Future Improvements

Potential areas for enhancement:

1. **Brush Types**: Add support for different brush types (e.g., airbrush, pencil)
2. **Pressure Sensitivity**: Integrate with pressure-sensitive devices
3. **Performance Optimization**: Further optimize for large canvases
4. **Layer Support**: Improve integration with the layer system
5. **Undo/Redo**: Enhance undo/redo support for brush strokes 