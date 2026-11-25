# Footer design options (Gradio 7)

Mockups for the footer redesign (#13915) and the "trying the UI → calling it
from an agent" flow (#13916). Each option is shown idle, right after a run,
and with its code/agent panel open.

|     | Option      | Idea                                                                                                     |
| --- | ----------- | -------------------------------------------------------------------------------------------------------- |
| A   | Quiet line  | Today's footer, refreshed; the API link lights up after a run and opens the existing drawer on that run  |
| B   | Pill dock   | A compact pill that grows a "Run `/endpoint` from code" segment after a run and opens a popover in place |
| C   | Split bar   | Brand left, tools right; after a run, one-click "copy as Python / JS / cURL / MCP" chips                 |
| D   | Agent-first | A "Use with your agent" button that fills after a run and opens MCP setup first                          |
| E   | Launcher    | The Gradio logo in a corner circle, with a badge for running events, that expands upwards into a panel   |

- `footer-options.html`: the mockups (static HTML, Gradio's default theme tokens and fonts)
- `render.mjs`: regenerates the PNGs (`node design/footer/render.mjs`, needs Playwright)
- `footer-launcher.html`, `render-launcher.mjs`, `launcher-*.png`: the same for option E, which also shows
  the session's running events (#13585)
- `option-*.png`, `server.png`: the rendered boards

These files are for review only, and would be removed once a direction is
chosen and implemented.

## Launcher shapes (option E)

The circle reads as a chat widget, so `footer-launcher.html?shape=squircle|tab|diamond`
redraws every launcher board as a rounded square, a tab docked in the corner,
or a diamond (the rhombus of the Gradio mark). `launcher-shapes.png` compares
every state; `shapes/<shape>/` holds each board in that shape.
`node design/footer/render-shapes.mjs` regenerates them.
