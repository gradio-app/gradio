---
"@gradio/model3d": minor
"gradio": minor
---

feat:Expose current Model3D camera position to event handlers

Also fixes, in the same area:

- `camera_position` is now applied on load for `display_mode="point_cloud"` and `display_mode="wireframe"`, not only for `"solid"`.
- `camera_position` is now applied to interactive (uploadable) `gr.Model3D` components, which previously ignored it.
- `pan_speed` is now passed through to the viewer; it was silently stuck at its default.
- A camera observer was added on every camera update without ever being removed; exactly one is now registered, and it is cleaned up with the component.
