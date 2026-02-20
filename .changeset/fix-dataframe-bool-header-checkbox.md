---
"@gradio/dataframe": patch
---

fix: header checkbox on bool column no longer toggles values in other selected columns

- Fixed `EditableCell` blur shim to only fire when transitioning out of edit mode, not on external value changes
- Fixed `handle_select_all` to clear cell selection before toggling bool column values
