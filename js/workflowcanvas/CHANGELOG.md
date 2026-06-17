# @gradio/workflowcanvas

## 0.4.0

### Features

- [#13526](https://github.com/gradio-app/gradio/pull/13526) [`53cb4ca`](https://github.com/gradio-app/gradio/commit/53cb4cae1ec3521e9170d12867253516413ba37a) - Run `pnpm lint` and `pnpm ts:check` on CI.  Thanks @abidlabs!
- [#13524](https://github.com/gradio-app/gradio/pull/13524) [`d4d340d`](https://github.com/gradio-app/gradio/commit/d4d340d1bbc1dfdec72fa46431b43f6a808f084f) - Run `gr.Workflow` subgraphs via the Gradio API — each subgraph is exposed as a named endpoint (returning all of its outputs) reusing `/info`, `/call`, and `/api`, with a "View API" panel in the canvas.  Thanks @abidlabs!

### Fixes

- [#13511](https://github.com/gradio-app/gradio/pull/13511) [`8eafb31`](https://github.com/gradio-app/gradio/commit/8eafb31ee17c134e65d1a006753b9a6ee4631f07) - refactor space and model discovery modal.  Thanks @hannahblair!

### Dependency updates

- @gradio/atoms@0.25.0
- @gradio/statustracker@0.15.0
- @gradio/utils@0.13.0
- @gradio/client@2.3.0

## 0.3.0

### Features

- [#13501](https://github.com/gradio-app/gradio/pull/13501) [`e547392`](https://github.com/gradio-app/gradio/commit/e547392d794bc8ac0bcf60f6846229e95350f2c4) - workflow: update pipeline UX around pro accounts.  Thanks @hannahblair!
- [#13517](https://github.com/gradio-app/gradio/pull/13517) [`100eaf2`](https://github.com/gradio-app/gradio/commit/100eaf2705861ccb71ea53748e2c6965a9c68bd0) - workflow: implement drag selection.  Thanks @hannahblair!
- [#13502](https://github.com/gradio-app/gradio/pull/13502) [`429faeb`](https://github.com/gradio-app/gradio/commit/429faeb643fb1afc1722c0f63fafa11603f2c87f) - Ensure every component dispatches a `change` event when its value changes.  Thanks @abidlabs!
- [#13520](https://github.com/gradio-app/gradio/pull/13520) [`9362fd9`](https://github.com/gradio-app/gradio/commit/9362fd9fdb1f5699c8902e74d33afb6c25343209) - Use local HF token in Workflow, gated behind a write-token auth model.  Thanks @abidlabs!

### Fixes

- [#13484](https://github.com/gradio-app/gradio/pull/13484) [`87f42b9`](https://github.com/gradio-app/gradio/commit/87f42b9135004f416bfc71798c55eebf8120ef9c) - workflow: preserve dropdown, radio and checkbox inputs.  Thanks @hannahblair!
- [#13489](https://github.com/gradio-app/gradio/pull/13489) [`965a36c`](https://github.com/gradio-app/gradio/commit/965a36cfa9fd4f29dcf0225b2c3da891b7e0027b) - workflow: dont render nodes for optional params on spawn.  Thanks @hannahblair!

### Dependency updates

- @gradio/client@2.2.2

## 0.2.2

### Features

- [#13497](https://github.com/gradio-app/gradio/pull/13497) [`c26e797`](https://github.com/gradio-app/gradio/commit/c26e7975ede55b4c27d22379255de0b4e69ba3c6) - fix workflow canvas repo.url.  Thanks @pngwn!

## 0.2.1

### Fixes

- [#13487](https://github.com/gradio-app/gradio/pull/13487) [`61b9715`](https://github.com/gradio-app/gradio/commit/61b9715739936a73c03408eb8b435bf7833f524f) - workflow: tweak zerogpu toggle UX.  Thanks @hannahblair!

## 0.2.0

### Features

- [#13417](https://github.com/gradio-app/gradio/pull/13417) [`127400b`](https://github.com/gradio-app/gradio/commit/127400b01538faa0cf9d8a1ea7984c5ee05e66a0) - Add `gr.Workflow` and `gr.WorkflowCanvas` for building AI pipelines visually. `gr.Workflow` accepts `graph`, `bind`, and `edges` parameters to wire Python functions into a canvas, with automatic persistence to the graph JSON file.  Thanks @hannahblair!

## 0.1.0

### Features

- Initial release: Workflow Canvas component integrated into core Gradio