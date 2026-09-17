---
"@gradio/imageslider": minor
"@gradio/model3d": minor
"gradio": minor
---

feat:Expose live Model3D camera and ImageSlider divider position to event handlers

- `camera_position` on `gr.Model3D` and `slider_position` on `gr.ImageSlider` now follow the user, so a function whose parameter is annotated with the component reads the view that is on screen, and both can still be set from the backend
- `camera_position` is applied on load for `display_mode="point_cloud"` and `"wireframe"`, not only for `"solid"`
- `camera_position` is applied to interactive `gr.Model3D`, and `slider_position` to interactive `gr.ImageSlider`; both previously ignored it
- `pan_speed` is passed through to the `gr.Model3D` viewer, where it was stuck at its default
- Exactly one Model3D camera observer is registered and cleaned up with the component; one was previously added on every camera update and never removed
