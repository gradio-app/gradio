---
"gradio": minor
---

feat:Cleanup of .update and .get_config per component

get_config is removed, the config used is simply any attribute that is in the Block that shares a name with one of the constructor paramaters.

update is not removed for backwards compatibility, but deprecated. Instead return the component itself. Created a updateable decorator that simply checks to see if we're in an update, and if so, skips the constructor and wraps the args and kwargs in an update dictionary. easy peasy.
