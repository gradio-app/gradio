# Core Editor Documentation

## Overview

The Core Editor is the central component of the image editor that manages the canvas, tools, layers, and user interactions. It provides a flexible architecture for integrating various tools and maintaining the state of the editor. This document explains how the core editor works and the relationships between its components.

## Key Files

- `js/imageeditor/shared/core/editor.ts`: Main implementation of the editor
- `js/imageeditor/shared/Toolbar.svelte`: Defines tool types and handles tool selection
- `js/imageeditor/shared/ImageEditor.svelte`: Main Svelte component that integrates the editor

## Architecture

The image editor is built around several key classes that work together:

1. **ImageEditor**: The main class that initializes and manages the editor
2. **CommandManager**: Handles undo/redo functionality
3. **LayerManager**: Manages layers and their textures
4. **EditorState**: Maintains the editor's state and notifies subscribers of changes
5. **Tool Interface**: Defines the contract for all tools to implement

### Class Structure

#### ImageEditor

The `ImageEditor` class is the main entry point and provides the following functionality:

1. **Initialization**: Sets up the PIXI.js application, containers, and initial state
2. **Tool Management**: Registers and manages tools
3. **Layer Management**: Creates and manages layers through the LayerManager
4. **Command Execution**: Executes commands and manages undo/redo through the CommandManager
5. **State Management**: Maintains and updates the editor's state
6. **Rendering**: Handles the rendering loop and updates

#### CommandManager

The `CommandManager` class implements the Command pattern to support undo/redo functionality:

1. **Command Execution**: Executes commands and adds them to the undo stack
2. **Undo**: Reverts the most recent command and moves it to the redo stack
3. **Redo**: Re-executes a previously undone command and moves it back to the undo stack

#### LayerManager

The `LayerManager` class manages the layers in the editor:

1. **Layer Creation**: Creates new layers with associated textures
2. **Layer Deletion**: Removes layers and cleans up resources
3. **Layer Order**: Manages the z-index ordering of layers
4. **Active Layer**: Tracks and sets the currently active layer
5. **Background Layer**: Special handling for the background layer

#### EditorState

The `EditorState` class maintains the state of the editor and notifies subscribers of changes:

1. **State Properties**: Maintains scale, position, and tool information
2. **Subscription**: Allows components to subscribe to state changes
3. **Notification**: Notifies subscribers when state changes occur

### Tool Interface

The `Tool` interface defines the contract that all tools must implement:

1. **setup**: Initializes the tool with the editor context
2. **cleanup**: Cleans up resources when the tool is deactivated
3. **set_tool**: Updates the tool's state when the active tool changes

## Rendering Pipeline

The editor uses PIXI.js for rendering and manages several containers:

1. **image_container**: Contains the layers and their content
2. **ui_container**: Contains UI elements that overlay the canvas
3. **outline_container**: Contains the outline around the canvas

The rendering pipeline follows these steps:

1. **Layer Rendering**: Each layer renders its content to a texture
2. **Container Composition**: Layers are composed in the image container
3. **UI Overlay**: UI elements are rendered on top of the image
4. **Outline Drawing**: The canvas outline is drawn around the image
5. **Scale and Position**: The image container is scaled and positioned based on user interactions

## State Management

The editor uses Svelte's spring store for smooth animations of state changes:

1. **dimensions**: Tracks the width and height of the canvas
2. **scale**: Tracks the zoom level of the canvas
3. **position**: Tracks the position of the canvas in the viewport

These stores are used to animate transitions when the user interacts with the canvas.

## Command Pattern

The editor implements the Command pattern for undo/redo functionality:

1. **Command Interface**: Defines execute and undo methods
2. **Command Execution**: Commands are executed and added to the undo stack
3. **Undo/Redo**: Commands can be undone and redone

This pattern allows for complex operations to be encapsulated and reversed.

## Layer Management

The editor supports multiple layers with the following features:

1. **Layer Creation**: New layers can be created with associated textures
2. **Layer Deletion**: Layers can be deleted, cleaning up associated resources
3. **Layer Order**: Layers can be reordered to change their z-index
4. **Active Layer**: One layer is designated as the active layer for editing
5. **Background Layer**: A special layer can be designated as the background

## Tool Integration

Tools are integrated with the editor through the Tool interface:

1. **Registration**: Tools are registered with the editor during initialization
2. **Context Access**: Tools receive the editor context during setup
3. **Lifecycle Management**: Tools are set up and cleaned up as needed
4. **Event Handling**: Tools can handle events from the editor

## Event Handling

The editor handles various events:

1. **Resize**: Responds to changes in the container size
2. **Tool Selection**: Updates the active tool when the user selects a new tool
3. **Command Execution**: Executes commands when triggered by tools
4. **Animation**: Animates state changes using springs

## Integration with Svelte

The editor is designed to work with Svelte:

1. **Stores**: Uses Svelte stores for reactive state management
2. **Springs**: Uses Svelte springs for smooth animations
3. **Component Integration**: Can be integrated with Svelte components

## Performance Considerations

The editor uses several techniques to maintain performance:

1. **Texture Management**: Efficiently manages textures to minimize memory usage
2. **Layer Composition**: Composes layers efficiently to minimize rendering overhead
3. **Event Throttling**: Throttles events to avoid excessive updates
4. **Resolution Scaling**: Adjusts resolution based on device pixel ratio

## Customization API

The editor exposes several methods for customization:

- `set_image_properties`: Updates the canvas dimensions, scale, and position
- `execute_command`: Executes a command and adds it to the undo stack
- `undo`: Undoes the most recent command
- `redo`: Redoes a previously undone command
- `add_image`: Adds an image to the canvas
- `set_tool`: Sets the active tool
- `set_subtool`: Sets the active subtool
- `set_background_image`: Sets the background image

## Maintenance Notes

When modifying the editor, consider the following:

1. **Resource Cleanup**: Always clean up resources to prevent memory leaks
2. **Event Listener Management**: Properly add and remove event listeners
3. **State Updates**: Update state through the appropriate methods to ensure proper notification
4. **Command Pattern**: Use the Command pattern for operations that should be undoable
5. **Layer Management**: Properly manage layers and their resources

## Future Improvements

Potential areas for enhancement:

1. **Performance Optimization**: Further optimize rendering for large canvases
2. **Tool Extensions**: Add support for more tools and tool options
3. **Layer Effects**: Add support for layer effects and blending modes
4. **Selection Tools**: Enhance selection tools and operations
5. **Export Options**: Add more export options and formats 