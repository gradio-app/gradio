---
"@gradio/app": minor
"@gradio/atoms": minor
"@gradio/icons": minor
"@gradio/image": minor
"@gradio/imageeditor": minor
"@gradio/preview": minor
"@gradio/statustracker": minor
"@gradio/upload": minor
"gradio": minor
---

feat:

#### New `ImageEditor` component

https://user-images.githubusercontent.com/12937446/284027169-31188926-fd16-4a1c-8718-998e7aae4695.mp4

A brand new component, completely separate from `Image` that provides simple editing capabilities.

- Set background images from file uploads, webcam, or just paste!
- Crop images with an improved cropping UI. App authors can event set specific crop size, or crop ratios (`1:1`, etc)
- Paint on top of any image (or no image) and erase any mistakes!
- The ImageEditor supports layers, confining draw and erase actions to that layer.
- More flexible access to data. The image component returns a composite image representing the final state of the canvas as well as providing the background and all layers as individual images.
- Fully customisable. All features can be enabled and disabled. Even the brush color swatches can be customised.