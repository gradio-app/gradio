---
"gradio": patch
---

fix:Fix open-redirect bypass in `gradio.oauth._redirect_to_target` where 4+ leading slashes (or backslashes) in `_target_url` produced a scheme-relative redirect to an external host, restoring CVE-2026-28415
