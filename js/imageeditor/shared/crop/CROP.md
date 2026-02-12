# Crop Tool Documentation

## Overview

The crop tool is a component of the image editor that allows users to select a portion of an image to keep while discarding the rest. It provides an interactive UI with handles that can be dragged to adjust the crop area.

## File Structure

- `js/imageeditor/shared/crop/crop.ts` - Main implementation of the crop tool
- `js/imageeditor/shared/core/editor.ts` - Defines the `Tool` interface and `ImageEditorContext`
- `js/imageeditor/shared/Toolbar.svelte` - Defines the tool types and subtool types

## Implementation Details

### Class: `CropTool`

The `CropTool` class implements the `Tool` interface defined in `editor.ts`. It provides the following functionality:

- Interactive crop area with draggable corners and edges
- Visual feedback with a mask that shows only the selected area
- Ability to move the entire crop window
- Constraints to keep the crop area within the image bounds

### Key Components

#### State Management

The crop tool maintains several state variables:

- `crop_bounds` - Stores the x, y, width, and height of the crop area
- `is_dragging` - Tracks if a handle is being dragged
- `is_dragging_window` - Tracks if the entire crop window is being dragged
- `selected_handle` - Reference to the currently selected handle
- `active_corner_index` - Index of the active corner (-1 if none)
- `active_edge_index` - Index of the active edge (-1 if none)

#### Visual Elements

The crop tool creates several visual elements:

- `crop_ui_container` - Container for all UI elements
- `crop_mask` - Graphics object used to mask the image
- Corner handles - L-shaped handles at each corner
- Edge handles - Bar-shaped handles at the middle of each edge

#### Event Handling

The tool sets up event listeners for:

- `pointerdown` - Start dragging a handle or the window
- `pointermove` - Update crop bounds during dragging
- `pointerup` - End dragging operations

### Key Methods

#### Setup and Initialization

- `setup(context, tool, subtool)` - Initializes the tool with the editor context
- `init_crop_ui()` - Creates the UI elements
- `set_crop_mask()` - Sets up the mask for the image

#### UI Creation

- `make_crop_ui(width, height)` - Creates the crop UI container
- `create_handle(is_edge)` - Creates a handle (corner or edge)
- `create_corner_handles(container, width, height)` - Creates the corner handles
- `create_edge_handles(container, width, height)` - Creates the edge handles

#### Event Handlers

- `handle_pointer_down(event, handle, corner_index, edge_index)` - Handles pointer down events
- `handle_pointer_move(event)` - Handles pointer move events
- `handle_pointer_up()` - Handles pointer up events
- `handle_window_drag_start(event)` - Handles the start of window dragging

#### Update Methods

- `update_crop_bounds(delta)` - Updates crop bounds based on pointer movement
- `constrain_crop_bounds()` - Ensures crop bounds stay within image dimensions
- `update_crop_mask()` - Updates the mask graphics
- `update_crop_ui()` - Updates the crop UI position and dimensions
- `update_handle_positions(width, height)` - Updates handle positions

### Integration with Editor

The crop tool integrates with the editor through the `ImageEditorContext` interface, which provides:

- `app` - The PIXI.js Application instance
- `image_container` - The container holding the image
- `dimensions` - A readable store with the image dimensions
- `position` - A readable store with the image position
- `scale` - A readable store with the image scale

## Usage Flow

1. The user selects the "crop" subtool from the toolbar
2. The crop tool initializes with a crop area matching the full image
3. The user can:
   - Drag corners to resize from that corner
   - Drag edges to resize from that edge
   - Drag the center area to move the entire crop window
4. The image is masked to show only the selected area
5. When the user applies the crop, the image is cropped to the selected area

## Implementation Notes

### Masking Technique

The crop tool uses a PIXI.js mask with alpha=0 to make the mask invisible while still functioning as a mask. This prevents the white background from appearing in the masked area.

### Scaling Considerations

The tool handles scaling by:
- Storing crop bounds in image coordinates (unscaled)
- Applying scale when positioning UI elements
- Converting between global and local coordinates for pointer events

### Constraints

The tool enforces several constraints:
- Minimum crop size of 20x20 pixels
- Crop area cannot extend beyond image boundaries
- Handles cannot be dragged beyond valid positions

## Maintenance Notes

When modifying the crop tool, consider:

1. **Event Handling**: Ensure proper event propagation and stopping
2. **Coordinate Systems**: Be careful with conversions between global and local coordinates
3. **Scale Handling**: Account for image scaling in all calculations
4. **Performance**: Minimize unnecessary updates to the mask and UI
5. **Edge Cases**: Test with extreme crop sizes and positions

## Related Components

- **Toolbar**: Controls tool selection
- **ImageEditor**: Provides the context and manages the overall editor state
- **LayerManager**: Manages image layers that the crop tool operates on 