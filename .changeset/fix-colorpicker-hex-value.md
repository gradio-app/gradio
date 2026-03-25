---
"@gradio/colorpicker": patch
---

fix: normalize ColorPicker value to hex string format

ColorPicker now always returns hex color strings (e.g. `#ff0000`) instead of inconsistent formats like `rgba(...)`, `rgb(...)`, or `hsl(...)` depending on how the user interacts with the picker. This matches the documented behavior that the component passes "selected color value as a hex str."
