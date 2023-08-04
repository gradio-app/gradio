# Upcoming Release

## New Features:
- Chatbot messages now show hyperlinks to download files uploaded to `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4848](https://github.com/gradio-app/gradio/pull/4848)

## Bug Fixes:

* The `.change()` event is fixed in `Video` and `Image` so that it only fires once by [@abidlabs](https://github.com/abidlabs) in [PR 4793](https://github.com/gradio-app/gradio/pull/4793)
* The `.change()` event is fixed in `Audio` so that fires when the component value is programmatically updated by [@abidlabs](https://github.com/abidlabs) in [PR 4793](https://github.com/gradio-app/gradio/pull/4793)

## Other Changes:

- Warning on mobile that if a user leaves the tab, websocket connection may break. On broken connection, tries to rejoin queue and displays error conveying connection broke. By [@aliabid94](https://github.com/aliabid94) in [PR 4742](https://github.com/gradio-app/gradio/pull/4742)

## Breaking Changes:

No changes to highlight.

# Version 3.36.1

## New Features:

- Hotfix to support pydantic v1 and v2 by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4835](https://github.com/gradio-app/gradio/pull/4835)

## Bug Fixes:

- Fix bug where `gr.File` change event was not triggered when the value was changed by another event by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4811](https://github.com/gradio-app/gradio/pull/4811)

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.36.0

## New Features:

- The `gr.Video`, `gr.Audio`, `gr.Image`, `gr.Chatbot`, and `gr.Gallery` components now include a share icon when deployed on Spaces. This behavior can be modified by setting the `show_share_button` parameter in the component classes. by [@aliabid94](https://github.com/aliabid94) in [PR 4651](https://github.com/gradio-app/gradio/pull/4651)
- Allow the web component `space`, `src`, and `host` attributes to be updated dynamically by [@pngwn](https://github.com/pngwn) in [PR 4461](https://github.com/gradio-app/gradio/pull/4461)
- Suggestion for Spaces Duplication built into Gradio, by [@aliabid94](https://github.com/aliabid94) in [PR 4458](https://github.com/gradio-app/gradio/pull/4458)
- The `api_name` parameter now accepts `False` as a value, which means it does not show up in named or unnamed endpoints. By [@abidlabs](https://github.com/aliabid94) in [PR 4683](https://github.com/gradio-app/gradio/pull/4683)
- Added support for `pathlib.Path` in `gr.Video`, `gr.Gallery`, and `gr.Chatbot` by [sunilkumardash9](https://github.com/sunilkumardash9) in [PR 4581](https://github.com/gradio-app/gradio/pull/4581).

## Bug Fixes:

- Updated components with `info` attribute to update when `update()` is called on them.  by [@jebarpg](https://github.com/jebarpg) in [PR 4715](https://github.com/gradio-app/gradio/pull/4715).
- Ensure the `Image` components undo button works mode is `mask` or `color-sketch` by [@amyorz](https://github.com/AmyOrz) in [PR 4692](https://github.com/gradio-app/gradio/pull/4692)
- Load the iframe resizer external asset asynchronously, by [@akx](https://github.com/akx) in [PR 4336](https://github.com/gradio-app/gradio/pull/4336)
- Restored missing imports in `gr.components` by [@abidlabs](https://github.com/abidlabs) in [PR 4566](https://github.com/gradio-app/gradio/pull/4566)
- Fix bug where `select` event was not triggered in `gr.Gallery` if `height` was set to be large with `allow_preview=False` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4551](https://github.com/gradio-app/gradio/pull/4551)
- Fix bug where setting `visible=False` in `gr.Group` event did not work by [@abidlabs](https://github.com/abidlabs) in [PR 4567](https://github.com/gradio-app/gradio/pull/4567)
- Fix `make_waveform` to work with paths that contain spaces [@akx](https://github.com/akx) in [PR 4570](https://github.com/gradio-app/gradio/pull/4570) & [PR 4578](https://github.com/gradio-app/gradio/pull/4578)
- Send captured data in `stop_recording` event for `gr.Audio` and `gr.Video` components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4554](https://github.com/gradio-app/gradio/pull/4554)
- Fix bug in `gr.Gallery` where `height` and `object_fit` parameters where being ignored by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4576](https://github.com/gradio-app/gradio/pull/4576)
- Fixes an HTML sanitization issue in DOMPurify where links in markdown were not opening in a new window by [@hannahblair] in [PR 4577](https://github.com/gradio-app/gradio/pull/4577)
- Fixed Dropdown height rendering in Columns by [@aliabid94](https://github.com/aliabid94) in [PR 4584](https://github.com/gradio-app/gradio/pull/4584) 
- Fixed bug where `AnnotatedImage` css styling was causing the annotation masks to not be displayed correctly by  [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4628](https://github.com/gradio-app/gradio/pull/4628)
- Ensure that Gradio does not silently fail when running on a port that is occupied by [@abidlabs](https://github.com/abidlabs) in [PR 4624](https://github.com/gradio-app/gradio/pull/4624).
- Fix double upload bug that caused lag in file uploads by [@aliabid94](https://github.com/aliabid94) in [PR 4661](https://github.com/gradio-app/gradio/pull/4661)
- `Progress` component now appears even when no `iterable` is specified in `tqdm` constructor by [@itrushkin](https://github.com/itrushkin) in [PR 4475](https://github.com/gradio-app/gradio/pull/4475)
- Deprecation warnings now point at the user code using those deprecated features, instead of Gradio internals, by (https://github.com/akx) in [PR 4694](https://github.com/gradio-app/gradio/pull/4694)
- Adapt column widths in gr.Examples based on content  by [@pngwn](https://github.com/pngwn) & [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4700](https://github.com/gradio-app/gradio/pull/4700)
- The `plot` parameter deprecation warnings should now only be emitted for `Image` components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4709](https://github.com/gradio-app/gradio/pull/4709)
- Removed uncessessary `type` deprecation warning by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4709](https://github.com/gradio-app/gradio/pull/4709)
- Ensure Audio autoplays works when `autoplay=True` and the video source is dynamically updated [@pngwn](https://github.com/pngwn) in [PR 4705](https://github.com/gradio-app/gradio/pull/4705)
- When an error modal is shown in spaces, ensure we scroll to the top so it can be seen by [@pngwn](https://github.com/pngwn) in [PR 4712](https://github.com/gradio-app/gradio/pull/4712)
- Update depedencies by [@pngwn](https://github.com/pngwn) in [PR 4675](https://github.com/gradio-app/gradio/pull/4675)
- Fixes `gr.Dropdown` being cutoff at the bottom by [@abidlabs](https://github.com/abidlabs) in [PR 4691](https://github.com/gradio-app/gradio/pull/4691).
- Scroll top when clicking "View API" in spaces by [@pngwn](https://github.com/pngwn) in [PR 4714](https://github.com/gradio-app/gradio/pull/4714)
- Fix bug where `show_label` was hiding the entire component for `gr.Label` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4713](https://github.com/gradio-app/gradio/pull/4713)
- Don't crash when uploaded image has broken EXIF data, by [@akx](https://github.com/akx) in [PR 4764](https://github.com/gradio-app/gradio/pull/4764)
- Place toast messages at the top of the screen by [@pngwn](https://github.com/pngwn) in [PR 4796](https://github.com/gradio-app/gradio/pull/4796)
- Fix regressed styling of Login page when auth is enabled by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4797](https://github.com/gradio-app/gradio/pull/4797)
- Prevent broken scrolling to output on Spaces by [@aliabid94](https://github.com/aliabid94) in [PR 4822](https://github.com/gradio-app/gradio/pull/4822)

## Other Changes:

- Add `.git-blame-ignore-revs` by [@akx](https://github.com/akx) in [PR 4586](https://github.com/gradio-app/gradio/pull/4586)
- Update frontend dependencies in [PR 4601](https://github.com/gradio-app/gradio/pull/4601)
- Use `typing.Literal` where possible in gradio library and client by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4608](https://github.com/gradio-app/gradio/pull/4608)
- Remove unnecessary mock json files for frontend E2E tests by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4625](https://github.com/gradio-app/gradio/pull/4625)
- Update dependencies by [@pngwn](https://github.com/pngwn) in [PR 4643](https://github.com/gradio-app/gradio/pull/4643)
- The theme builder now launches successfully, and the API docs are cleaned up. By [@abidlabs](https://github.com/aliabid94) in [PR 4683](https://github.com/gradio-app/gradio/pull/4683)
- Remove `cleared_value` from some components as its no longer used internally by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4685](https://github.com/gradio-app/gradio/pull/4685)
- Better errors when you define two Blocks and reference components in one Blocks from the events in the other Blocks [@abidlabs](https://github.com/abidlabs) in [PR 4738](https://github.com/gradio-app/gradio/pull/4738).
- Better message when share link is not created by [@abidlabs](https://github.com/abidlabs) in [PR 4773](https://github.com/gradio-app/gradio/pull/4773).
- Improve accessibility around selected images in gr.Gallery component by [@hannahblair](https://github.com/hannahblair) in [PR 4790](https://github.com/gradio-app/gradio/pull/4790)

## Breaking Changes:

[PR 4683](https://github.com/gradio-app/gradio/pull/4683) removes the explict named endpoint "load_examples" from gr.Interface that was introduced in [PR 4456](https://github.com/gradio-app/gradio/pull/4456).

# Version 3.35.2

## New Features:

No changes to highlight.

## Bug Fixes:

- Fix chatbot streaming by [@aliabid94](https://github.com/aliabid94) in [PR 4537](https://github.com/gradio-app/gradio/pull/4537)
- Fix chatbot height and scrolling by [@aliabid94](https://github.com/aliabid94) in [PR 4540](https://github.com/gradio-app/gradio/pull/4540)

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.35.1

## New Features:

No changes to highlight.

## Bug Fixes:

- Fix chatbot streaming by [@aliabid94](https://github.com/aliabid94) in [PR 4537](https://github.com/gradio-app/gradio/pull/4537)
- Fix error modal position and text size by [@pngwn](https://github.com/pngwn) in [PR 4538](https://github.com/gradio-app/gradio/pull/4538).

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.35.0

## New Features:

- A `gr.ClearButton` which allows users to easily clear the values of components by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456)

Example usage:

```py
import gradio as gr

with gr.Blocks() as demo:
    chatbot = gr.Chatbot([("Hello", "How are you?")])
    with gr.Row():
        textbox = gr.Textbox(scale=3, interactive=True)
        gr.ClearButton([textbox, chatbot], scale=1)

demo.launch()
```

- Min and max value for gr.Number by [@artegoser](https://github.com/artegoser) and [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3991](https://github.com/gradio-app/gradio/pull/3991)
- Add `start_recording` and `stop_recording` events to `Video` and `Audio` components by [@pngwn](https://github.com/pngwn) in [PR 4422](https://github.com/gradio-app/gradio/pull/4422)
- Allow any function to generate an error message and allow multiple messages to appear at a time. Other error modal improvements such as auto dismiss after a time limit and a new layout on mobile [@pngwn](https://github.com/pngwn) in [PR 4459](https://github.com/gradio-app/gradio/pull/4459).
- Add `autoplay` kwarg to `Video` and `Audio` components by [@pngwn](https://github.com/pngwn) in [PR 4453](https://github.com/gradio-app/gradio/pull/4453)
- Add `allow_preview` parameter to `Gallery` to control whether a detailed preview is displayed on click by
[@freddyaboulton](https://github.com/freddyaboulton) in [PR 4470](https://github.com/gradio-app/gradio/pull/4470)
- Add `latex_delimiters` parameter to `Chatbot` to control the delimiters used for LaTeX and to disable LaTeX in the `Chatbot` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4516](https://github.com/gradio-app/gradio/pull/4516)
- Can now issue `gr.Warning` and `gr.Info` modals. Simply put the code `gr.Warning("Your warning message")` or `gr.Info("Your info message")` as a standalone line in your function. By [@aliabid94](https://github.com/aliabid94) in [PR 4518](https://github.com/gradio-app/gradio/pull/4518). 

Example:
```python
def start_process(name):
    gr.Info("Starting process")
    if name is None:
        gr.Warning("Name is empty")
    ...
    if success == False:
        raise gr.Error("Process failed")
```


## Bug Fixes:

- Add support for PAUSED state in the JS client by [@abidlabs](https://github.com/abidlabs) in [PR 4438](https://github.com/gradio-app/gradio/pull/4438)
- Ensure Tabs only occupy the space required by [@pngwn](https://github.com/pngwn) in [PR 4419](https://github.com/gradio-app/gradio/pull/4419)
- Ensure components have the correct empty sizes to prevent empty containers from collapsing by [@pngwn](https://github.com/pngwn) in [PR 4447](https://github.com/gradio-app/gradio/pull/4447).
- Frontend code no longer crashes when there is a relative URL in an `<a>` element, by [@akx](https://github.com/akx) in [PR 4449](https://github.com/gradio-app/gradio/pull/4449).
- Fix bug where setting `format='mp4'` on a video component would cause the function to error out if the uploaded video was not playable by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4467](https://github.com/gradio-app/gradio/pull/4467)
- Fix `_js` parameter to work even without backend function, by [@aliabid94](https://github.com/aliabid94) in [PR 4486](https://github.com/gradio-app/gradio/pull/4486).
- Fix new line issue with `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4491](https://github.com/gradio-app/gradio/pull/4491)
- Fixes issue with Clear button not working for `Label` component by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456)
- Restores the ability to pass in a tuple (sample rate, audio array) to gr.Audio() by [@abidlabs](https://github.com/abidlabs) in [PR 4525](https://github.com/gradio-app/gradio/pull/4525)
- Ensure code is correctly formatted and copy button is always present in Chatbot by [@pngwn](https://github.com/pngwn) in [PR 4527](https://github.com/gradio-app/gradio/pull/4527)
- `show_label` will not automatically be set to `True` in `gr.BarPlot.update` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4531](https://github.com/gradio-app/gradio/pull/4531)
- `gr.BarPlot` group text now respects darkmode by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4531](https://github.com/gradio-app/gradio/pull/4531)
- Fix dispatched errors from within components [@aliabid94](https://github.com/aliabid94) in [PR 4786](https://github.com/gradio-app/gradio/pull/4786)

## Other Changes:

- Change styling of status and toast error components by [@hannahblair](https://github.com/hannahblair) in [PR 4454](https://github.com/gradio-app/gradio/pull/4454).
- Clean up unnecessary `new Promise()`s by [@akx](https://github.com/akx) in [PR 4442](https://github.com/gradio-app/gradio/pull/4442).
- Minor UI cleanup for Examples and Dataframe components [@aliabid94](https://github.com/aliabid94) in [PR 4455](https://github.com/gradio-app/gradio/pull/4455). 
- Minor UI cleanup for Examples and Dataframe components [@aliabid94](https://github.com/aliabid94) in [PR 4455](https://github.com/gradio-app/gradio/pull/4455).
- Add Catalan translation [@jordimas](https://github.com/jordimas) in [PR 4483](https://github.com/gradio-app/gradio/pull/4483).
- The API endpoint that loads examples upon click has been given an explicit name ("/load_examples") by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456).
- Allows configuration of FastAPI app when calling `mount_gradio_app`, by [@charlesfrye](https://github.com/charlesfrye) in [PR4519](https://github.com/gradio-app/gradio/pull/4519).

## Breaking Changes:

- The behavior of the `Clear` button has been changed for `Slider`, `CheckboxGroup`, `Radio`, `Dropdown` components by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456). The Clear button now sets the value of these components to be empty as opposed to the original default set by the developer. This is to make them in line with the rest of the Gradio components.
- Python 3.7 end of life is June 27 2023. Gradio will no longer support python 3.7 by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4484](https://github.com/gradio-app/gradio/pull/4484)
- Removed `$` as a default LaTeX delimiter for the `Chatbot` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4516](https://github.com/gradio-app/gradio/pull/4516). The specific LaTeX delimeters can be set using the new `latex_delimiters` parameter in `Chatbot`.

# Version 3.34.0

## New Features:

- The `gr.UploadButton` component now supports the `variant` and `interactive` parameters by [@abidlabs](https://github.com/abidlabs) in [PR 4436](https://github.com/gradio-app/gradio/pull/4436).

## Bug Fixes:

- Remove target="\_blank" override on anchor tags with internal targets by [@hannahblair](https://github.com/hannahblair) in [PR 4405](https://github.com/gradio-app/gradio/pull/4405)
- Fixed bug where `gr.File(file_count='multiple')` could not be cached as output by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4421](https://github.com/gradio-app/gradio/pull/4421)
- Restricts the domains that can be proxied via `/proxy` route by [@abidlabs](https://github.com/abidlabs) in [PR 4406](https://github.com/gradio-app/gradio/pull/4406).
- Fixes issue where `gr.UploadButton` could not be used to upload the same file twice by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4437](https://github.com/gradio-app/gradio/pull/4437)
- Fixes bug where `/proxy` route was being incorrectly constructed by the frontend by [@abidlabs](https://github.com/abidlabs) in [PR 4430](https://github.com/gradio-app/gradio/pull/4430).
- Fix z-index of status component by [@hannahblair](https://github.com/hannahblair) in [PR 4429](https://github.com/gradio-app/gradio/pull/4429)
- Fix video rendering in Safari by [@aliabid94](https://github.com/aliabid94) in [PR 4433](https://github.com/gradio-app/gradio/pull/4433).
- The output directory for files downloaded when calling Blocks as a function is now set to a temporary directory by default (instead of the working directory in some cases) by [@abidlabs](https://github.com/abidlabs) in [PR 4501](https://github.com/gradio-app/gradio/pull/4501)

## Other Changes:

- When running on Spaces, handler functions will be transformed by the [PySpaces](https://pypi.org/project/spaces/) library in order to make them work with specific hardware. It will have no effect on standalone Gradio apps or regular Gradio Spaces and can be globally deactivated as follows : `import spaces; spaces.disable_gradio_auto_wrap()` by [@cbensimon](https://github.com/cbensimon) in [PR 4389](https://github.com/gradio-app/gradio/pull/4389).
- Deprecated `.style` parameter and moved arguments to constructor. Added support for `.update()` to all arguments initially in style. Added `scale` and `min_width` support to every Component. By [@aliabid94](https://github.com/aliabid94) in [PR 4374](https://github.com/gradio-app/gradio/pull/4374)

## Breaking Changes:

No changes to highlight.

# Version 3.33.1

## New Features:

No changes to highlight.

## Bug Fixes:

- Allow `every` to work with generators by [@dkjshk](https://github.com/dkjshk) in [PR 4434](https://github.com/gradio-app/gradio/pull/4434)
- Fix z-index of status component by [@hannahblair](https://github.com/hannahblair) in [PR 4429](https://github.com/gradio-app/gradio/pull/4429)
- Allow gradio to work offline, by [@aliabid94](https://github.com/aliabid94) in [PR 4398](https://github.com/gradio-app/gradio/pull/4398).
- Fixed `validate_url` to check for 403 errors and use a GET request in place of a HEAD by [@alvindaiyan](https://github.com/alvindaiyan) in [PR 4388](https://github.com/gradio-app/gradio/pull/4388).

## Other Changes:

- More explicit error message when share link binary is blocked by antivirus by [@abidlabs](https://github.com/abidlabs) in [PR 4380](https://github.com/gradio-app/gradio/pull/4380).

## Breaking Changes:

No changes to highlight.

# Version 3.33.0

## New Features:

- Introduced `gradio deploy` to launch a Gradio app to Spaces directly from your terminal. By [@aliabid94](https://github.com/aliabid94) in [PR 4033](https://github.com/gradio-app/gradio/pull/4033).
- Introduce `show_progress='corner'` argument to event listeners, which will not cover the output components with the progress animation, but instead show it in the corner of the components. By [@aliabid94](https://github.com/aliabid94) in [PR 4396](https://github.com/gradio-app/gradio/pull/4396).

## Bug Fixes:

- Fix bug where Label change event was triggering itself by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4371](https://github.com/gradio-app/gradio/pull/4371)
- Make `Blocks.load` behave like other event listeners (allows chaining `then` off of it) [@anentropic](https://github.com/anentropic/) in [PR 4304](https://github.com/gradio-app/gradio/pull/4304)
- Respect `interactive=True` in output components of a `gr.Interface` by [@abidlabs](https://github.com/abidlabs) in [PR 4356](https://github.com/gradio-app/gradio/pull/4356).
- Remove unused frontend code by [@akx](https://github.com/akx) in [PR 4275](https://github.com/gradio-app/gradio/pull/4275)
- Fixes favicon path on Windows by [@abidlabs](https://github.com/abidlabs) in [PR 4369](https://github.com/gradio-app/gradio/pull/4369).
- Prevent path traversal in `/file` routes by [@abidlabs](https://github.com/abidlabs) in [PR 4370](https://github.com/gradio-app/gradio/pull/4370).
- Do not send HF token to other domains via `/proxy` route by [@abidlabs](https://github.com/abidlabs) in [PR 4368](https://github.com/gradio-app/gradio/pull/4368).
- Replace default `markedjs` sanitize function with DOMPurify sanitizer for `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4360](https://github.com/gradio-app/gradio/pull/4360)
- Prevent the creation of duplicate copy buttons in the chatbot and ensure copy buttons work in non-secure contexts by [@binary-husky](https://github.com/binary-husky) in [PR 4350](https://github.com/gradio-app/gradio/pull/4350).

## Other Changes:

- Remove flicker of loading bar by adding opacity transition, by [@aliabid94](https://github.com/aliabid94) in [PR 4349](https://github.com/gradio-app/gradio/pull/4349).
- Performance optimization in the frontend's Blocks code by [@akx](https://github.com/akx) in [PR 4334](https://github.com/gradio-app/gradio/pull/4334)
- Upgrade the pnpm lock file format version from v6.0 to v6.1 by [@whitphx](https://github.com/whitphx) in [PR 4393](https://github.com/gradio-app/gradio/pull/4393)

## Breaking Changes:

- The `/file=` route no longer allows accessing dotfiles or files in "dot directories" by [@akx](https://github.com/akx) in [PR 4303](https://github.com/gradio-app/gradio/pull/4303)

# Version 3.32.0

## New Features:

- `Interface.launch()` and `Blocks.launch()` now accept an `app_kwargs` argument to allow customizing the configuration of the underlying FastAPI app, by [@akx](https://github.com/akx) in [PR 4282](https://github.com/gradio-app/gradio/pull/4282)

## Bug Fixes:

- Fixed Gallery/AnnotatedImage components not respecting GRADIO_DEFAULT_DIR variable by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed Gallery/AnnotatedImage components resaving identical images by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed Audio/Video/File components creating empty tempfiles on each run by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed the behavior of the `run_on_click` parameter in `gr.Examples` by [@abidlabs](https://github.com/abidlabs) in [PR 4258](https://github.com/gradio-app/gradio/pull/4258).
- Ensure error modal displays when the queue is enabled by [@pngwn](https://github.com/pngwn) in [PR 4273](https://github.com/gradio-app/gradio/pull/4273)
- Ensure js client respcts the full root when making requests to the server by [@pngwn](https://github.com/pngwn) in [PR 4271](https://github.com/gradio-app/gradio/pull/4271)

## Other Changes:

- Refactor web component `initial_height` attribute by [@whitphx](https://github.com/whitphx) in [PR 4223](https://github.com/gradio-app/gradio/pull/4223)
- Relocate `mount_css` fn to remove circular dependency [@whitphx](https://github.com/whitphx) in [PR 4222](https://github.com/gradio-app/gradio/pull/4222)
- Upgrade Black to 23.3 by [@akx](https://github.com/akx) in [PR 4259](https://github.com/gradio-app/gradio/pull/4259)
- Add frontend LaTeX support in `gr.Chatbot()` using `KaTeX` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4285](https://github.com/gradio-app/gradio/pull/4285).

## Breaking Changes:

No changes to highlight.

# Version 3.31.0

## New Features:

- The reloader command (`gradio app.py`) can now accept command line arguments by [@micky2be](https://github.com/micky2be) in [PR 4119](https://github.com/gradio-app/gradio/pull/4119)
- Added `format` argument to `Audio` component by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4178](https://github.com/gradio-app/gradio/pull/4178)
- Add JS client code snippets to use via api page by [@aliabd](https://github.com/aliabd) in [PR 3927](https://github.com/gradio-app/gradio/pull/3927).
- Update to the JS client by [@pngwn](https://github.com/pngwn) in [PR 4202](https://github.com/gradio-app/gradio/pull/4202)

## Bug Fixes:

- Fix "TypeError: issubclass() arg 1 must be a class" When use Optional[Types] by [@lingfengchencn](https://github.com/lingfengchencn) in [PR 4200](https://github.com/gradio-app/gradio/pull/4200).
- Gradio will no longer send any analytics or call home if analytics are disabled with the GRADIO_ANALYTICS_ENABLED environment variable. By [@akx](https://github.com/akx) in [PR 4194](https://github.com/gradio-app/gradio/pull/4194) and [PR 4236](https://github.com/gradio-app/gradio/pull/4236)
- The deprecation warnings for kwargs now show the actual stack level for the invocation, by [@akx](https://github.com/akx) in [PR 4203](https://github.com/gradio-app/gradio/pull/4203).
- Fix "TypeError: issubclass() arg 1 must be a class" When use Optional[Types] by [@lingfengchencn](https://github.com/lingfengchencn) in [PR 4200](https://github.com/gradio-app/gradio/pull/4200).
- Ensure cancelling functions work correctly by [@pngwn](https://github.com/pngwn) in [PR 4225](https://github.com/gradio-app/gradio/pull/4225)
- Fixes a bug with typing.get_type_hints() on Python 3.9 by [@abidlabs](https://github.com/abidlabs) in [PR 4228](https://github.com/gradio-app/gradio/pull/4228).
- Fixes JSONDecodeError by [@davidai](https://github.com/davidai) in [PR 4241](https://github.com/gradio-app/gradio/pull/4241)
- Fix `chatbot_dialogpt` demo by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4238](https://github.com/gradio-app/gradio/pull/4238).

## Other Changes:

- Change `gr.Chatbot()` markdown parsing to frontend using `marked` library and `prism` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4150](https://github.com/gradio-app/gradio/pull/4150)
- Update the js client by [@pngwn](https://github.com/pngwn) in [PR 3899](https://github.com/gradio-app/gradio/pull/3899)
- Fix documentation for the shape of the numpy array produced by the `Image` component by [@der3318](https://github.com/der3318) in [PR 4204](https://github.com/gradio-app/gradio/pull/4204).
- Updates the timeout for websocket messaging from 1 second to 5 seconds by [@abidlabs](https://github.com/abidlabs) in [PR 4235](https://github.com/gradio-app/gradio/pull/4235)

## Breaking Changes:

No changes to highlight.

# Version 3.30.0

## New Features:

- Adds a `root_path` parameter to `launch()` that allows running Gradio applications on subpaths (e.g. www.example.com/app) behind a proxy, by [@abidlabs](https://github.com/abidlabs) in [PR 4133](https://github.com/gradio-app/gradio/pull/4133)
- Fix dropdown change listener to trigger on change when updated as an output by [@aliabid94](https://github.com/aliabid94) in [PR 4128](https://github.com/gradio-app/gradio/pull/4128).
- Add `.input` event listener, which is only triggered when a user changes the component value (as compared to `.change`, which is also triggered when a component updates as the result of a function trigger), by [@aliabid94](https://github.com/aliabid94) in [PR 4157](https://github.com/gradio-app/gradio/pull/4157).

## Bug Fixes:

- Records username when flagging by [@abidlabs](https://github.com/abidlabs) in [PR 4135](https://github.com/gradio-app/gradio/pull/4135)
- Fix website build issue by [@aliabd](https://github.com/aliabd) in [PR 4142](https://github.com/gradio-app/gradio/pull/4142)
- Fix lang agnostic type info for `gr.File(file_count='multiple')` output components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4153](https://github.com/gradio-app/gradio/pull/4153)

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.29.0

## New Features:

- Returning language agnostic types in the `/info` route by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4039](https://github.com/gradio-app/gradio/pull/4039)

## Bug Fixes:

- Allow users to upload audio files in Audio component on iOS by by [@aliabid94](https://github.com/aliabid94) in [PR 4071](https://github.com/gradio-app/gradio/pull/4071).
- Fixes the gradio theme builder error that appeared on launch by [@aliabid94](https://github.com/aliabid94) and [@abidlabs](https://github.com/abidlabs) in [PR 4080](https://github.com/gradio-app/gradio/pull/4080)
- Keep Accordion content in DOM by [@aliabid94](https://github.com/aliabid94) in [PR 4070](https://github.com/gradio-app/gradio/pull/4073)
- Fixed bug where type hints in functions caused the event handler to crash by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4068](https://github.com/gradio-app/gradio/pull/4068)
- Fix dropdown default value not appearing by [@aliabid94](https://github.com/aliabid94) in [PR 4072](https://github.com/gradio-app/gradio/pull/4072).
- Soft theme label color fix by [@aliabid94](https://github.com/aliabid94) in [PR 4070](https://github.com/gradio-app/gradio/pull/4070)
- Fix `gr.Slider` `release` event not triggering on mobile by [@space-nuko](https://github.com/space-nuko) in [PR 4098](https://github.com/gradio-app/gradio/pull/4098)
- Removes extraneous `State` component info from the `/info` route by [@abidlabs](https://github.com/freddyaboulton) in [PR 4107](https://github.com/gradio-app/gradio/pull/4107)
- Make .then() work even if first event fails by [@aliabid94](https://github.com/aliabid94) in [PR 4115](https://github.com/gradio-app/gradio/pull/4115).

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

- Allow users to submit with enter in Interfaces with textbox / number inputs [@aliabid94](https://github.com/aliabid94) in [PR 4090](https://github.com/gradio-app/gradio/pull/4090).
- Updates gradio's requirements.txt to requires uvicorn>=0.14.0 by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)
- Updates some error messaging by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)
- Renames simplified Chinese translation file from `zh-cn.json` to `zh-CN.json` by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.3

## New Features:

No changes to highlight.

## Bug Fixes:

- Fixes issue with indentation in `gr.Code()` component with streaming by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4043](https://github.com/gradio-app/gradio/pull/4043)

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.2

## Bug Fixes

- Code component visual updates by [@pngwn](https://github.com/pngwn) in [PR 4051](https://github.com/gradio-app/gradio/pull/4051)

## New Features:

- Add support for `visual-question-answering`, `document-question-answering`, and `image-to-text` using `gr.Interface.load("models/...")` and `gr.Interface.from_pipeline` by [@osanseviero](https://github.com/osanseviero) in [PR 3887](https://github.com/gradio-app/gradio/pull/3887)
- Add code block support in `gr.Chatbot()`, by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4048](https://github.com/gradio-app/gradio/pull/4048)
- Adds the ability to blocklist filepaths (and also improves the allowlist mechanism) by [@abidlabs](https://github.com/abidlabs) in [PR 4047](https://github.com/gradio-app/gradio/pull/4047).
- Adds the ability to specify the upload directory via an environment variable by [@abidlabs](https://github.com/abidlabs) in [PR 4047](https://github.com/gradio-app/gradio/pull/4047).

## Bug Fixes:

- Fixes issue with `matplotlib` not rendering correctly if the backend was not set to `Agg` by [@abidlabs](https://github.com/abidlabs) in [PR 4029](https://github.com/gradio-app/gradio/pull/4029)
- Fixes bug where rendering the same `gr.State` across different Interfaces/Blocks within larger Blocks would not work by [@abidlabs](https://github.com/abidlabs) in [PR 4030](https://github.com/gradio-app/gradio/pull/4030)
- Code component visual updates by [@pngwn](https://github.com/pngwn) in [PR 4051](https://github.com/gradio-app/gradio/pull/4051)

## Documentation Changes:

- Adds a Guide on how to use the Python Client within a FastAPI app, by [@abidlabs](https://github.com/abidlabs) in [PR 3892](https://github.com/gradio-app/gradio/pull/3892)

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

- `gr.HuggingFaceDatasetSaver` behavior changed internally. The `flagging/` folder is not a `.git/` folder anymore when using it. `organization` parameter is now ignored in favor of passing a full dataset id as `dataset_name` (e.g. `"username/my-dataset"`).
- New lines (`\n`) are not automatically converted to `<br>` in `gr.Markdown()` or `gr.Chatbot()`. For multiple new lines, a developer must add multiple `<br>` tags.

## Full Changelog:

- Safer version of `gr.HuggingFaceDatasetSaver` using HTTP methods instead of git pull/push by [@Wauplin](https://github.com/Wauplin) in [PR 3973](https://github.com/gradio-app/gradio/pull/3973)

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.1

## New Features:

- Add a "clear mask" button to `gr.Image` sketch modes, by [@space-nuko](https://github.com/space-nuko) in [PR 3615](https://github.com/gradio-app/gradio/pull/3615)

## Bug Fixes:

- Fix dropdown default value not appearing by [@aliabid94](https://github.com/aliabid94) in [PR 3996](https://github.com/gradio-app/gradio/pull/3996).
- Fix faded coloring of output textboxes in iOS / Safari by [@aliabid94](https://github.com/aliabid94) in [PR 3993](https://github.com/gradio-app/gradio/pull/3993)

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

- CI: Simplified Python CI workflow by [@akx](https://github.com/akx) in [PR 3982](https://github.com/gradio-app/gradio/pull/3982)
- Upgrade pyright to 1.1.305 by [@akx](https://github.com/akx) in [PR 4042](https://github.com/gradio-app/gradio/pull/4042)
- More Ruff rules are enabled and lint errors fixed by [@akx](https://github.com/akx) in [PR 4038](https://github.com/gradio-app/gradio/pull/4038)

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.0

## Bug Fixes:

- Fix duplicate play commands in full-screen mode of 'video'. by [@tomchang25](https://github.com/tomchang25) in [PR 3968](https://github.com/gradio-app/gradio/pull/3968).
- Fix the issue of the UI stuck caused by the 'selected' of DataFrame not being reset. by [@tomchang25](https://github.com/tomchang25) in [PR 3916](https://github.com/gradio-app/gradio/pull/3916).
- Fix issue where `gr.Video()` would not work inside a `gr.Tab()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3891](https://github.com/gradio-app/gradio/pull/3891)
- Fixed issue with old_value check in File. by [@tomchang25](https://github.com/tomchang25) in [PR 3859](https://github.com/gradio-app/gradio/pull/3859).
- Fixed bug where all bokeh plots appeared in the same div by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3896](https://github.com/gradio-app/gradio/pull/3896)
- Fixed image outputs to automatically take full output image height, unless explicitly set, by [@aliabid94](https://github.com/aliabid94) in [PR 3905](https://github.com/gradio-app/gradio/pull/3905)
- Fix issue in `gr.Gallery()` where setting height causes aspect ratio of images to collapse by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3830](https://github.com/gradio-app/gradio/pull/3830)
- Fix issue where requesting for a non-existing file would trigger a 500 error by [@micky2be](https://github.com/micky2be) in `[PR 3895](https://github.com/gradio-app/gradio/pull/3895)`.
- Fix bugs with abspath about symlinks, and unresolvable path on Windows by [@micky2be](https://github.com/micky2be) in `[PR 3895](https://github.com/gradio-app/gradio/pull/3895)`.
- Fixes type in client `Status` enum by [@10zinten](https://github.com/10zinten) in [PR 3931](https://github.com/gradio-app/gradio/pull/3931)
- Fix `gr.ChatBot` to handle image url [tye-singwa](https://github.com/tye-signwa) in [PR 3953](https://github.com/gradio-app/gradio/pull/3953)
- Move Google Tag Manager related initialization code to analytics-enabled block by [@akx](https://github.com/akx) in [PR 3956](https://github.com/gradio-app/gradio/pull/3956)
- Fix bug where port was not reused if the demo was closed and then re-launched by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3896](https://github.com/gradio-app/gradio/pull/3959)
- Fixes issue where dropdown does not position itself at selected element when opened [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3639](https://github.com/gradio-app/gradio/pull/3639)

## Documentation Changes:

- Make use of `gr` consistent across the docs by [@duerrsimon](https://github.com/duerrsimon) in [PR 3901](https://github.com/gradio-app/gradio/pull/3901)
- Fixed typo in theming-guide.md by [@eltociear](https://github.com/eltociear) in [PR 3952](https://github.com/gradio-app/gradio/pull/3952)

## Testing and Infrastructure Changes:

- CI: Python backend lint is only run once, by [@akx](https://github.com/akx) in [PR 3960](https://github.com/gradio-app/gradio/pull/3960)
- Format invocations and concatenations were replaced by f-strings where possible by [@akx](https://github.com/akx) in [PR 3984](https://github.com/gradio-app/gradio/pull/3984)
- Linting rules were made more strict and issues fixed by [@akx](https://github.com/akx) in [PR 3979](https://github.com/gradio-app/gradio/pull/3979).

## Breaking Changes:

- Some re-exports in `gradio.themes` utilities (introduced in 3.24.0) have been eradicated.
  By [@akx](https://github.com/akx) in [PR 3958](https://github.com/gradio-app/gradio/pull/3958)

## Full Changelog:

- Add DESCRIPTION.md to image_segmentation demo by [@aliabd](https://github.com/aliabd) in [PR 3866](https://github.com/gradio-app/gradio/pull/3866)
- Fix error in running `gr.themes.builder()` by [@deepkyu](https://github.com/deepkyu) in [PR 3869](https://github.com/gradio-app/gradio/pull/3869)
- Fixed a JavaScript TypeError when loading custom JS with `_js` and setting `outputs` to `None` in `gradio.Blocks()` by [@DavG25](https://github.com/DavG25) in [PR 3883](https://github.com/gradio-app/gradio/pull/3883)
- Fixed bg_background_fill theme property to expand to whole background, block_radius to affect form elements as well, and added block_label_shadow theme property by [@aliabid94](https://github.com/aliabid94) in [PR 3590](https://github.com/gradio-app/gradio/pull/3590)

## Contributors Shoutout:

No changes to highlight.

# Version 3.27.0

## New Features:

### AnnotatedImage Component

New AnnotatedImage component allows users to highlight regions of an image, either by providing bounding boxes, or 0-1 pixel masks. This component is useful for tasks such as image segmentation, object detection, and image captioning.

![AnnotatedImage screenshot](https://user-images.githubusercontent.com/7870876/232142720-86e0020f-beaf-47b9-a843-689c9621f09c.gif)

Example usage:

```python
with gr.Blocks() as demo:
    img = gr.Image()
    img_section = gr.AnnotatedImage()
    def mask(img):
        top_left_corner = [0, 0, 20, 20]
        random_mask = np.random.randint(0, 2, img.shape[:2])
        return (img, [(top_left_corner, "left corner"), (random_mask, "random")])
    img.change(mask, img, img_section)
```

See the [image_segmentation demo](https://github.com/gradio-app/gradio/tree/main/demo/image_segmentation) for a full example. By [@aliabid94](https://github.com/aliabid94) in [PR 3836](https://github.com/gradio-app/gradio/pull/3836)

## Bug Fixes:

No changes to highlight.

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.26.0

## New Features:

### `Video` component supports subtitles

- Allow the video component to accept subtitles as input, by [@tomchang25](https://github.com/tomchang25) in [PR 3673](https://github.com/gradio-app/gradio/pull/3673). To provide subtitles, simply return a tuple consisting of `(path_to_video, path_to_subtitles)` from your function. Both `.srt` and `.vtt` formats are supported:

```py
with gr.Blocks() as demo:
    gr.Video(("video.mp4", "captions.srt"))
```

## Bug Fixes:

- Fix code markdown support in `gr.Chatbot()` component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3816](https://github.com/gradio-app/gradio/pull/3816)

## Documentation Changes:

- Updates the "view API" page in Gradio apps to use the `gradio_client` library by [@aliabd](https://github.com/aliabd) in [PR 3765](https://github.com/gradio-app/gradio/pull/3765)

- Read more about how to use the `gradio_client` library here: https://gradio.app/getting-started-with-the-python-client/

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.25.0

## New Features:

- Improve error messages when number of inputs/outputs to event handlers mismatch, by [@space-nuko](https://github.com/space-nuko) in [PR 3519](https://github.com/gradio-app/gradio/pull/3519)

- Add `select` listener to Images, allowing users to click on any part of an image and get the coordinates of the click by [@aliabid94](https://github.com/aliabid94) in [PR 3786](https://github.com/gradio-app/gradio/pull/3786).

```python
with gr.Blocks() as demo:
    img = gr.Image()
    textbox = gr.Textbox()

    def select_handler(img, evt: gr.SelectData):
        selected_pixel = img[evt.index[1], evt.index[0]]
        return f"Selected pixel: {selected_pixel}"

    img.select(select_handler, img, textbox)
```

![Recording 2023-04-08 at 17 44 39](https://user-images.githubusercontent.com/7870876/230748572-90a2a8d5-116d-4769-bb53-5516555fbd0f.gif)

## Bug Fixes:

- Increase timeout for sending analytics data by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3647](https://github.com/gradio-app/gradio/pull/3647)
- Fix bug where http token was not accessed over websocket connections by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3735](https://github.com/gradio-app/gradio/pull/3735)
- Add ability to specify `rows`, `columns` and `object-fit` in `style()` for `gr.Gallery()` component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3586](https://github.com/gradio-app/gradio/pull/3586)
- Fix bug where recording an audio file through the microphone resulted in a corrupted file name by [@abidlabs](https://github.com/abidlabs) in [PR 3770](https://github.com/gradio-app/gradio/pull/3770)
- Added "ssl_verify" to blocks.launch method to allow for use of self-signed certs by [@garrettsutula](https://github.com/garrettsutula) in [PR 3873](https://github.com/gradio-app/gradio/pull/3873)
- Fix bug where iterators where not being reset for processes that terminated early by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3777](https://github.com/gradio-app/gradio/pull/3777)
- Fix bug where the upload button was not properly handling the `file_count='multiple'` case by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3782](https://github.com/gradio-app/gradio/pull/3782)
- Fix bug where use Via API button was giving error by [@Devang-C](https://github.com/Devang-C) in [PR 3783](https://github.com/gradio-app/gradio/pull/3783)

## Documentation Changes:

- Fix invalid argument docstrings, by [@akx](https://github.com/akx) in [PR 3740](https://github.com/gradio-app/gradio/pull/3740)

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

- Fixed IPv6 listening to work with bracket [::1] notation, by [@dsully](https://github.com/dsully) in [PR 3695](https://github.com/gradio-app/gradio/pull/3695)

## Contributors Shoutout:

No changes to highlight.

# Version 3.24.1

## New Features:

- No changes to highlight.

## Bug Fixes:

- Fixes Chatbot issue where new lines were being created every time a message was sent back and forth by [@aliabid94](https://github.com/aliabid94) in [PR 3717](https://github.com/gradio-app/gradio/pull/3717).
- Fixes data updating in DataFrame invoking a `select` event once the dataframe has been selected. By [@yiyuezhuo](https://github.com/yiyuezhuo) in [PR 3861](https://github.com/gradio-app/gradio/pull/3861)
- Fixes false positive warning which is due to too strict type checking by [@yiyuezhuo](https://github.com/yiyuezhuo) in [PR 3837](https://github.com/gradio-app/gradio/pull/3837).

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.24.0

## New Features:

- Trigger the release event when Slider number input is released or unfocused by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3589](https://github.com/gradio-app/gradio/pull/3589)
- Created Theme Builder, which allows users to create themes without writing any code, by [@aliabid94](https://github.com/aliabid94) in [PR 3664](https://github.com/gradio-app/gradio/pull/3664). Launch by:

  ```python
  import gradio as gr
  gr.themes.builder()
  ```

  ![Theme Builder](https://user-images.githubusercontent.com/7870876/228204929-d71cbba5-69c2-45b3-bd20-e3a201d98b12.png)

- The `Dropdown` component now has a `allow_custom_value` parameter that lets users type in custom values not in the original list of choices.
- The `Colorpicker` component now has a `.blur()` event

### Added a download button for videos! 📥

![download_video](https://user-images.githubusercontent.com/41651716/227009612-9bc5fb72-2a44-4c55-9b7b-a0fa098e7f25.gif)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3581](https://github.com/gradio-app/gradio/pull/3581).

- Trigger the release event when Slider number input is released or unfocused by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3589](https://github.com/gradio-app/gradio/pull/3589)

## Bug Fixes:

- Fixed bug where text for altair plots was not legible in dark mode by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3555](https://github.com/gradio-app/gradio/pull/3555)
- Fixes `Chatbot` and `Image` components so that files passed during processing are added to a directory where they can be served from, by [@abidlabs](https://github.com/abidlabs) in [PR 3523](https://github.com/gradio-app/gradio/pull/3523)
- Use Gradio API server to send telemetry using `huggingface_hub` [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3488](https://github.com/gradio-app/gradio/pull/3488)
- Fixes an an issue where if the Blocks scope was not exited, then State could be shared across sessions, by [@abidlabs](https://github.com/abidlabs) in [PR 3600](https://github.com/gradio-app/gradio/pull/3600)
- Ensures that `gr.load()` loads and applies the upstream theme, by [@abidlabs](https://github.com/abidlabs) in [PR 3641](https://github.com/gradio-app/gradio/pull/3641)
- Fixed bug where "or" was not being localized in file upload text by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3599](https://github.com/gradio-app/gradio/pull/3599)
- Fixed bug where chatbot does not autoscroll inside of a tab, row or column by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3637](https://github.com/gradio-app/gradio/pull/3637)
- Fixed bug where textbox shrinks when `lines` set to larger than 20 by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3637](https://github.com/gradio-app/gradio/pull/3637)
- Ensure CSS has fully loaded before rendering the application, by [@pngwn](https://github.com/pngwn) in [PR 3573](https://github.com/gradio-app/gradio/pull/3573)
- Support using an empty list as `gr.Dataframe` value, by [@space-nuko](https://github.com/space-nuko) in [PR 3646](https://github.com/gradio-app/gradio/pull/3646)
- Fixed `gr.Image` not filling the entire element size, by [@space-nuko](https://github.com/space-nuko) in [PR 3649](https://github.com/gradio-app/gradio/pull/3649)
- Make `gr.Code` support the `lines` property, by [@space-nuko](https://github.com/space-nuko) in [PR 3651](https://github.com/gradio-app/gradio/pull/3651)
- Fixes certain `_js` return values being double wrapped in an array, by [@space-nuko](https://github.com/space-nuko) in [PR 3594](https://github.com/gradio-app/gradio/pull/3594)
- Correct the documentation of `gr.File` component to state that its preprocessing method converts the uploaded file to a temporary file, by @RussellLuo in [PR 3660](https://github.com/gradio-app/gradio/pull/3660)
- Fixed bug in Serializer ValueError text by [@osanseviero](https://github.com/osanseviero) in [PR 3669](https://github.com/gradio-app/gradio/pull/3669)
- Fix default parameter argument and `gr.Progress` used in same function, by [@space-nuko](https://github.com/space-nuko) in [PR 3671](https://github.com/gradio-app/gradio/pull/3671)
- Hide `Remove All` button in `gr.Dropdown` single-select mode by [@space-nuko](https://github.com/space-nuko) in [PR 3678](https://github.com/gradio-app/gradio/pull/3678)
- Fix broken spaces in docs by [@aliabd](https://github.com/aliabd) in [PR 3698](https://github.com/gradio-app/gradio/pull/3698)
- Fix items in `gr.Dropdown` besides the selected item receiving a checkmark, by [@space-nuko](https://github.com/space-nuko) in [PR 3644](https://github.com/gradio-app/gradio/pull/3644)
- Fix several `gr.Dropdown` issues and improve usability, by [@space-nuko](https://github.com/space-nuko) in [PR 3705](https://github.com/gradio-app/gradio/pull/3705)

## Documentation Changes:

- Makes some fixes to the Theme Guide related to naming of variables, by [@abidlabs](https://github.com/abidlabs) in [PR 3561](https://github.com/gradio-app/gradio/pull/3561)
- Documented `HuggingFaceDatasetJSONSaver` by [@osanseviero](https://github.com/osanseviero) in [PR 3604](https://github.com/gradio-app/gradio/pull/3604)
- Makes some additions to documentation of `Audio` and `State` components, and fixes the `pictionary` demo by [@abidlabs](https://github.com/abidlabs) in [PR 3611](https://github.com/gradio-app/gradio/pull/3611)
- Fix outdated sharing your app guide by [@aliabd](https://github.com/aliabd) in [PR 3699](https://github.com/gradio-app/gradio/pull/3699)

## Testing and Infrastructure Changes:

- Removed heavily-mocked tests related to comet_ml, wandb, and mlflow as they added a significant amount of test dependencies that prevented installation of test dependencies on Windows environments. By [@abidlabs](https://github.com/abidlabs) in [PR 3608](https://github.com/gradio-app/gradio/pull/3608)
- Added Windows continuous integration, by [@space-nuko](https://github.com/space-nuko) in [PR 3628](https://github.com/gradio-app/gradio/pull/3628)
- Switched linting from flake8 + isort to `ruff`, by [@akx](https://github.com/akx) in [PR 3710](https://github.com/gradio-app/gradio/pull/3710)

## Breaking Changes:

No changes to highlight.

## Full Changelog:

- Mobile responsive iframes in themes guide by [@aliabd](https://github.com/aliabd) in [PR 3562](https://github.com/gradio-app/gradio/pull/3562)
- Remove extra $demo from theme guide by [@aliabd](https://github.com/aliabd) in [PR 3563](https://github.com/gradio-app/gradio/pull/3563)
- Set the theme name to be the upstream repo name when loading from the hub by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3595](https://github.com/gradio-app/gradio/pull/3595)
- Copy everything in website Dockerfile, fix build issues by [@aliabd](https://github.com/aliabd) in [PR 3659](https://github.com/gradio-app/gradio/pull/3659)
- Raise error when an event is queued but the queue is not configured by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3640](https://github.com/gradio-app/gradio/pull/3640)
- Allows users to apss in a string name for a built-in theme, by [@abidlabs](https://github.com/abidlabs) in [PR 3641](https://github.com/gradio-app/gradio/pull/3641)
- Added `orig_name` to Video output in the backend so that the front end can set the right name for downloaded video files by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3700](https://github.com/gradio-app/gradio/pull/3700)

## Contributors Shoutout:
# Upcoming Release

## New Features:
- Chatbot messages now show hyperlinks to download files uploaded to `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4848](https://github.com/gradio-app/gradio/pull/4848)

## Bug Fixes:

* The `.change()` event is fixed in `Video` and `Image` so that it only fires once by [@abidlabs](https://github.com/abidlabs) in [PR 4793](https://github.com/gradio-app/gradio/pull/4793)
* The `.change()` event is fixed in `Audio` so that fires when the component value is programmatically updated by [@abidlabs](https://github.com/abidlabs) in [PR 4793](https://github.com/gradio-app/gradio/pull/4793)

## Other Changes:

- Warning on mobile that if a user leaves the tab, websocket connection may break. On broken connection, tries to rejoin queue and displays error conveying connection broke. By [@aliabid94](https://github.com/aliabid94) in [PR 4742](https://github.com/gradio-app/gradio/pull/4742)

## Breaking Changes:

No changes to highlight.

# Version 3.36.1

## New Features:

- Hotfix to support pydantic v1 and v2 by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4835](https://github.com/gradio-app/gradio/pull/4835)

## Bug Fixes:

- Fix bug where `gr.File` change event was not triggered when the value was changed by another event by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4811](https://github.com/gradio-app/gradio/pull/4811)

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.36.0

## New Features:

- The `gr.Video`, `gr.Audio`, `gr.Image`, `gr.Chatbot`, and `gr.Gallery` components now include a share icon when deployed on Spaces. This behavior can be modified by setting the `show_share_button` parameter in the component classes. by [@aliabid94](https://github.com/aliabid94) in [PR 4651](https://github.com/gradio-app/gradio/pull/4651)
- Allow the web component `space`, `src`, and `host` attributes to be updated dynamically by [@pngwn](https://github.com/pngwn) in [PR 4461](https://github.com/gradio-app/gradio/pull/4461)
- Suggestion for Spaces Duplication built into Gradio, by [@aliabid94](https://github.com/aliabid94) in [PR 4458](https://github.com/gradio-app/gradio/pull/4458)
- The `api_name` parameter now accepts `False` as a value, which means it does not show up in named or unnamed endpoints. By [@abidlabs](https://github.com/aliabid94) in [PR 4683](https://github.com/gradio-app/gradio/pull/4683)
- Added support for `pathlib.Path` in `gr.Video`, `gr.Gallery`, and `gr.Chatbot` by [sunilkumardash9](https://github.com/sunilkumardash9) in [PR 4581](https://github.com/gradio-app/gradio/pull/4581).

## Bug Fixes:

- Updated components with `info` attribute to update when `update()` is called on them.  by [@jebarpg](https://github.com/jebarpg) in [PR 4715](https://github.com/gradio-app/gradio/pull/4715).
- Ensure the `Image` components undo button works mode is `mask` or `color-sketch` by [@amyorz](https://github.com/AmyOrz) in [PR 4692](https://github.com/gradio-app/gradio/pull/4692)
- Load the iframe resizer external asset asynchronously, by [@akx](https://github.com/akx) in [PR 4336](https://github.com/gradio-app/gradio/pull/4336)
- Restored missing imports in `gr.components` by [@abidlabs](https://github.com/abidlabs) in [PR 4566](https://github.com/gradio-app/gradio/pull/4566)
- Fix bug where `select` event was not triggered in `gr.Gallery` if `height` was set to be large with `allow_preview=False` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4551](https://github.com/gradio-app/gradio/pull/4551)
- Fix bug where setting `visible=False` in `gr.Group` event did not work by [@abidlabs](https://github.com/abidlabs) in [PR 4567](https://github.com/gradio-app/gradio/pull/4567)
- Fix `make_waveform` to work with paths that contain spaces [@akx](https://github.com/akx) in [PR 4570](https://github.com/gradio-app/gradio/pull/4570) & [PR 4578](https://github.com/gradio-app/gradio/pull/4578)
- Send captured data in `stop_recording` event for `gr.Audio` and `gr.Video` components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4554](https://github.com/gradio-app/gradio/pull/4554)
- Fix bug in `gr.Gallery` where `height` and `object_fit` parameters where being ignored by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4576](https://github.com/gradio-app/gradio/pull/4576)
- Fixes an HTML sanitization issue in DOMPurify where links in markdown were not opening in a new window by [@hannahblair] in [PR 4577](https://github.com/gradio-app/gradio/pull/4577)
- Fixed Dropdown height rendering in Columns by [@aliabid94](https://github.com/aliabid94) in [PR 4584](https://github.com/gradio-app/gradio/pull/4584) 
- Fixed bug where `AnnotatedImage` css styling was causing the annotation masks to not be displayed correctly by  [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4628](https://github.com/gradio-app/gradio/pull/4628)
- Ensure that Gradio does not silently fail when running on a port that is occupied by [@abidlabs](https://github.com/abidlabs) in [PR 4624](https://github.com/gradio-app/gradio/pull/4624).
- Fix double upload bug that caused lag in file uploads by [@aliabid94](https://github.com/aliabid94) in [PR 4661](https://github.com/gradio-app/gradio/pull/4661)
- `Progress` component now appears even when no `iterable` is specified in `tqdm` constructor by [@itrushkin](https://github.com/itrushkin) in [PR 4475](https://github.com/gradio-app/gradio/pull/4475)
- Deprecation warnings now point at the user code using those deprecated features, instead of Gradio internals, by (https://github.com/akx) in [PR 4694](https://github.com/gradio-app/gradio/pull/4694)
- Adapt column widths in gr.Examples based on content  by [@pngwn](https://github.com/pngwn) & [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4700](https://github.com/gradio-app/gradio/pull/4700)
- The `plot` parameter deprecation warnings should now only be emitted for `Image` components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4709](https://github.com/gradio-app/gradio/pull/4709)
- Removed uncessessary `type` deprecation warning by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4709](https://github.com/gradio-app/gradio/pull/4709)
- Ensure Audio autoplays works when `autoplay=True` and the video source is dynamically updated [@pngwn](https://github.com/pngwn) in [PR 4705](https://github.com/gradio-app/gradio/pull/4705)
- When an error modal is shown in spaces, ensure we scroll to the top so it can be seen by [@pngwn](https://github.com/pngwn) in [PR 4712](https://github.com/gradio-app/gradio/pull/4712)
- Update depedencies by [@pngwn](https://github.com/pngwn) in [PR 4675](https://github.com/gradio-app/gradio/pull/4675)
- Fixes `gr.Dropdown` being cutoff at the bottom by [@abidlabs](https://github.com/abidlabs) in [PR 4691](https://github.com/gradio-app/gradio/pull/4691).
- Scroll top when clicking "View API" in spaces by [@pngwn](https://github.com/pngwn) in [PR 4714](https://github.com/gradio-app/gradio/pull/4714)
- Fix bug where `show_label` was hiding the entire component for `gr.Label` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4713](https://github.com/gradio-app/gradio/pull/4713)
- Don't crash when uploaded image has broken EXIF data, by [@akx](https://github.com/akx) in [PR 4764](https://github.com/gradio-app/gradio/pull/4764)
- Place toast messages at the top of the screen by [@pngwn](https://github.com/pngwn) in [PR 4796](https://github.com/gradio-app/gradio/pull/4796)
- Fix regressed styling of Login page when auth is enabled by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4797](https://github.com/gradio-app/gradio/pull/4797)
- Prevent broken scrolling to output on Spaces by [@aliabid94](https://github.com/aliabid94) in [PR 4822](https://github.com/gradio-app/gradio/pull/4822)

## Other Changes:

- Add `.git-blame-ignore-revs` by [@akx](https://github.com/akx) in [PR 4586](https://github.com/gradio-app/gradio/pull/4586)
- Update frontend dependencies in [PR 4601](https://github.com/gradio-app/gradio/pull/4601)
- Use `typing.Literal` where possible in gradio library and client by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4608](https://github.com/gradio-app/gradio/pull/4608)
- Remove unnecessary mock json files for frontend E2E tests by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4625](https://github.com/gradio-app/gradio/pull/4625)
- Update dependencies by [@pngwn](https://github.com/pngwn) in [PR 4643](https://github.com/gradio-app/gradio/pull/4643)
- The theme builder now launches successfully, and the API docs are cleaned up. By [@abidlabs](https://github.com/aliabid94) in [PR 4683](https://github.com/gradio-app/gradio/pull/4683)
- Remove `cleared_value` from some components as its no longer used internally by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4685](https://github.com/gradio-app/gradio/pull/4685)
- Better errors when you define two Blocks and reference components in one Blocks from the events in the other Blocks [@abidlabs](https://github.com/abidlabs) in [PR 4738](https://github.com/gradio-app/gradio/pull/4738).
- Better message when share link is not created by [@abidlabs](https://github.com/abidlabs) in [PR 4773](https://github.com/gradio-app/gradio/pull/4773).
- Improve accessibility around selected images in gr.Gallery component by [@hannahblair](https://github.com/hannahblair) in [PR 4790](https://github.com/gradio-app/gradio/pull/4790)

## Breaking Changes:

[PR 4683](https://github.com/gradio-app/gradio/pull/4683) removes the explict named endpoint "load_examples" from gr.Interface that was introduced in [PR 4456](https://github.com/gradio-app/gradio/pull/4456).

# Version 3.35.2

## New Features:

No changes to highlight.

## Bug Fixes:

- Fix chatbot streaming by [@aliabid94](https://github.com/aliabid94) in [PR 4537](https://github.com/gradio-app/gradio/pull/4537)
- Fix chatbot height and scrolling by [@aliabid94](https://github.com/aliabid94) in [PR 4540](https://github.com/gradio-app/gradio/pull/4540)

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.35.1

## New Features:

No changes to highlight.

## Bug Fixes:

- Fix chatbot streaming by [@aliabid94](https://github.com/aliabid94) in [PR 4537](https://github.com/gradio-app/gradio/pull/4537)
- Fix error modal position and text size by [@pngwn](https://github.com/pngwn) in [PR 4538](https://github.com/gradio-app/gradio/pull/4538).

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.35.0

## New Features:

- A `gr.ClearButton` which allows users to easily clear the values of components by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456)

Example usage:

```py
import gradio as gr

with gr.Blocks() as demo:
    chatbot = gr.Chatbot([("Hello", "How are you?")])
    with gr.Row():
        textbox = gr.Textbox(scale=3, interactive=True)
        gr.ClearButton([textbox, chatbot], scale=1)

demo.launch()
```

- Min and max value for gr.Number by [@artegoser](https://github.com/artegoser) and [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3991](https://github.com/gradio-app/gradio/pull/3991)
- Add `start_recording` and `stop_recording` events to `Video` and `Audio` components by [@pngwn](https://github.com/pngwn) in [PR 4422](https://github.com/gradio-app/gradio/pull/4422)
- Allow any function to generate an error message and allow multiple messages to appear at a time. Other error modal improvements such as auto dismiss after a time limit and a new layout on mobile [@pngwn](https://github.com/pngwn) in [PR 4459](https://github.com/gradio-app/gradio/pull/4459).
- Add `autoplay` kwarg to `Video` and `Audio` components by [@pngwn](https://github.com/pngwn) in [PR 4453](https://github.com/gradio-app/gradio/pull/4453)
- Add `allow_preview` parameter to `Gallery` to control whether a detailed preview is displayed on click by
[@freddyaboulton](https://github.com/freddyaboulton) in [PR 4470](https://github.com/gradio-app/gradio/pull/4470)
- Add `latex_delimiters` parameter to `Chatbot` to control the delimiters used for LaTeX and to disable LaTeX in the `Chatbot` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4516](https://github.com/gradio-app/gradio/pull/4516)
- Can now issue `gr.Warning` and `gr.Info` modals. Simply put the code `gr.Warning("Your warning message")` or `gr.Info("Your info message")` as a standalone line in your function. By [@aliabid94](https://github.com/aliabid94) in [PR 4518](https://github.com/gradio-app/gradio/pull/4518). 

Example:
```python
def start_process(name):
    gr.Info("Starting process")
    if name is None:
        gr.Warning("Name is empty")
    ...
    if success == False:
        raise gr.Error("Process failed")
```


## Bug Fixes:

- Add support for PAUSED state in the JS client by [@abidlabs](https://github.com/abidlabs) in [PR 4438](https://github.com/gradio-app/gradio/pull/4438)
- Ensure Tabs only occupy the space required by [@pngwn](https://github.com/pngwn) in [PR 4419](https://github.com/gradio-app/gradio/pull/4419)
- Ensure components have the correct empty sizes to prevent empty containers from collapsing by [@pngwn](https://github.com/pngwn) in [PR 4447](https://github.com/gradio-app/gradio/pull/4447).
- Frontend code no longer crashes when there is a relative URL in an `<a>` element, by [@akx](https://github.com/akx) in [PR 4449](https://github.com/gradio-app/gradio/pull/4449).
- Fix bug where setting `format='mp4'` on a video component would cause the function to error out if the uploaded video was not playable by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4467](https://github.com/gradio-app/gradio/pull/4467)
- Fix `_js` parameter to work even without backend function, by [@aliabid94](https://github.com/aliabid94) in [PR 4486](https://github.com/gradio-app/gradio/pull/4486).
- Fix new line issue with `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4491](https://github.com/gradio-app/gradio/pull/4491)
- Fixes issue with Clear button not working for `Label` component by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456)
- Restores the ability to pass in a tuple (sample rate, audio array) to gr.Audio() by [@abidlabs](https://github.com/abidlabs) in [PR 4525](https://github.com/gradio-app/gradio/pull/4525)
- Ensure code is correctly formatted and copy button is always present in Chatbot by [@pngwn](https://github.com/pngwn) in [PR 4527](https://github.com/gradio-app/gradio/pull/4527)
- `show_label` will not automatically be set to `True` in `gr.BarPlot.update` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4531](https://github.com/gradio-app/gradio/pull/4531)
- `gr.BarPlot` group text now respects darkmode by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4531](https://github.com/gradio-app/gradio/pull/4531)
- Fix dispatched errors from within components [@aliabid94](https://github.com/aliabid94) in [PR 4786](https://github.com/gradio-app/gradio/pull/4786)

## Other Changes:

- Change styling of status and toast error components by [@hannahblair](https://github.com/hannahblair) in [PR 4454](https://github.com/gradio-app/gradio/pull/4454).
- Clean up unnecessary `new Promise()`s by [@akx](https://github.com/akx) in [PR 4442](https://github.com/gradio-app/gradio/pull/4442).
- Minor UI cleanup for Examples and Dataframe components [@aliabid94](https://github.com/aliabid94) in [PR 4455](https://github.com/gradio-app/gradio/pull/4455). 
- Minor UI cleanup for Examples and Dataframe components [@aliabid94](https://github.com/aliabid94) in [PR 4455](https://github.com/gradio-app/gradio/pull/4455).
- Add Catalan translation [@jordimas](https://github.com/jordimas) in [PR 4483](https://github.com/gradio-app/gradio/pull/4483).
- The API endpoint that loads examples upon click has been given an explicit name ("/load_examples") by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456).
- Allows configuration of FastAPI app when calling `mount_gradio_app`, by [@charlesfrye](https://github.com/charlesfrye) in [PR4519](https://github.com/gradio-app/gradio/pull/4519).

## Breaking Changes:

- The behavior of the `Clear` button has been changed for `Slider`, `CheckboxGroup`, `Radio`, `Dropdown` components by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456). The Clear button now sets the value of these components to be empty as opposed to the original default set by the developer. This is to make them in line with the rest of the Gradio components.
- Python 3.7 end of life is June 27 2023. Gradio will no longer support python 3.7 by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4484](https://github.com/gradio-app/gradio/pull/4484)
- Removed `$` as a default LaTeX delimiter for the `Chatbot` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4516](https://github.com/gradio-app/gradio/pull/4516). The specific LaTeX delimeters can be set using the new `latex_delimiters` parameter in `Chatbot`.

# Version 3.34.0

## New Features:

- The `gr.UploadButton` component now supports the `variant` and `interactive` parameters by [@abidlabs](https://github.com/abidlabs) in [PR 4436](https://github.com/gradio-app/gradio/pull/4436).

## Bug Fixes:

- Remove target="\_blank" override on anchor tags with internal targets by [@hannahblair](https://github.com/hannahblair) in [PR 4405](https://github.com/gradio-app/gradio/pull/4405)
- Fixed bug where `gr.File(file_count='multiple')` could not be cached as output by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4421](https://github.com/gradio-app/gradio/pull/4421)
- Restricts the domains that can be proxied via `/proxy` route by [@abidlabs](https://github.com/abidlabs) in [PR 4406](https://github.com/gradio-app/gradio/pull/4406).
- Fixes issue where `gr.UploadButton` could not be used to upload the same file twice by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4437](https://github.com/gradio-app/gradio/pull/4437)
- Fixes bug where `/proxy` route was being incorrectly constructed by the frontend by [@abidlabs](https://github.com/abidlabs) in [PR 4430](https://github.com/gradio-app/gradio/pull/4430).
- Fix z-index of status component by [@hannahblair](https://github.com/hannahblair) in [PR 4429](https://github.com/gradio-app/gradio/pull/4429)
- Fix video rendering in Safari by [@aliabid94](https://github.com/aliabid94) in [PR 4433](https://github.com/gradio-app/gradio/pull/4433).
- The output directory for files downloaded when calling Blocks as a function is now set to a temporary directory by default (instead of the working directory in some cases) by [@abidlabs](https://github.com/abidlabs) in [PR 4501](https://github.com/gradio-app/gradio/pull/4501)

## Other Changes:

- When running on Spaces, handler functions will be transformed by the [PySpaces](https://pypi.org/project/spaces/) library in order to make them work with specific hardware. It will have no effect on standalone Gradio apps or regular Gradio Spaces and can be globally deactivated as follows : `import spaces; spaces.disable_gradio_auto_wrap()` by [@cbensimon](https://github.com/cbensimon) in [PR 4389](https://github.com/gradio-app/gradio/pull/4389).
- Deprecated `.style` parameter and moved arguments to constructor. Added support for `.update()` to all arguments initially in style. Added `scale` and `min_width` support to every Component. By [@aliabid94](https://github.com/aliabid94) in [PR 4374](https://github.com/gradio-app/gradio/pull/4374)

## Breaking Changes:

No changes to highlight.

# Version 3.33.1

## New Features:

No changes to highlight.

## Bug Fixes:

- Allow `every` to work with generators by [@dkjshk](https://github.com/dkjshk) in [PR 4434](https://github.com/gradio-app/gradio/pull/4434)
- Fix z-index of status component by [@hannahblair](https://github.com/hannahblair) in [PR 4429](https://github.com/gradio-app/gradio/pull/4429)
- Allow gradio to work offline, by [@aliabid94](https://github.com/aliabid94) in [PR 4398](https://github.com/gradio-app/gradio/pull/4398).
- Fixed `validate_url` to check for 403 errors and use a GET request in place of a HEAD by [@alvindaiyan](https://github.com/alvindaiyan) in [PR 4388](https://github.com/gradio-app/gradio/pull/4388).

## Other Changes:

- More explicit error message when share link binary is blocked by antivirus by [@abidlabs](https://github.com/abidlabs) in [PR 4380](https://github.com/gradio-app/gradio/pull/4380).

## Breaking Changes:

No changes to highlight.

# Version 3.33.0

## New Features:

- Introduced `gradio deploy` to launch a Gradio app to Spaces directly from your terminal. By [@aliabid94](https://github.com/aliabid94) in [PR 4033](https://github.com/gradio-app/gradio/pull/4033).
- Introduce `show_progress='corner'` argument to event listeners, which will not cover the output components with the progress animation, but instead show it in the corner of the components. By [@aliabid94](https://github.com/aliabid94) in [PR 4396](https://github.com/gradio-app/gradio/pull/4396).

## Bug Fixes:

- Fix bug where Label change event was triggering itself by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4371](https://github.com/gradio-app/gradio/pull/4371)
- Make `Blocks.load` behave like other event listeners (allows chaining `then` off of it) [@anentropic](https://github.com/anentropic/) in [PR 4304](https://github.com/gradio-app/gradio/pull/4304)
- Respect `interactive=True` in output components of a `gr.Interface` by [@abidlabs](https://github.com/abidlabs) in [PR 4356](https://github.com/gradio-app/gradio/pull/4356).
- Remove unused frontend code by [@akx](https://github.com/akx) in [PR 4275](https://github.com/gradio-app/gradio/pull/4275)
- Fixes favicon path on Windows by [@abidlabs](https://github.com/abidlabs) in [PR 4369](https://github.com/gradio-app/gradio/pull/4369).
- Prevent path traversal in `/file` routes by [@abidlabs](https://github.com/abidlabs) in [PR 4370](https://github.com/gradio-app/gradio/pull/4370).
- Do not send HF token to other domains via `/proxy` route by [@abidlabs](https://github.com/abidlabs) in [PR 4368](https://github.com/gradio-app/gradio/pull/4368).
- Replace default `markedjs` sanitize function with DOMPurify sanitizer for `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4360](https://github.com/gradio-app/gradio/pull/4360)
- Prevent the creation of duplicate copy buttons in the chatbot and ensure copy buttons work in non-secure contexts by [@binary-husky](https://github.com/binary-husky) in [PR 4350](https://github.com/gradio-app/gradio/pull/4350).

## Other Changes:

- Remove flicker of loading bar by adding opacity transition, by [@aliabid94](https://github.com/aliabid94) in [PR 4349](https://github.com/gradio-app/gradio/pull/4349).
- Performance optimization in the frontend's Blocks code by [@akx](https://github.com/akx) in [PR 4334](https://github.com/gradio-app/gradio/pull/4334)
- Upgrade the pnpm lock file format version from v6.0 to v6.1 by [@whitphx](https://github.com/whitphx) in [PR 4393](https://github.com/gradio-app/gradio/pull/4393)

## Breaking Changes:

- The `/file=` route no longer allows accessing dotfiles or files in "dot directories" by [@akx](https://github.com/akx) in [PR 4303](https://github.com/gradio-app/gradio/pull/4303)

# Version 3.32.0

## New Features:

- `Interface.launch()` and `Blocks.launch()` now accept an `app_kwargs` argument to allow customizing the configuration of the underlying FastAPI app, by [@akx](https://github.com/akx) in [PR 4282](https://github.com/gradio-app/gradio/pull/4282)

## Bug Fixes:

- Fixed Gallery/AnnotatedImage components not respecting GRADIO_DEFAULT_DIR variable by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed Gallery/AnnotatedImage components resaving identical images by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed Audio/Video/File components creating empty tempfiles on each run by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed the behavior of the `run_on_click` parameter in `gr.Examples` by [@abidlabs](https://github.com/abidlabs) in [PR 4258](https://github.com/gradio-app/gradio/pull/4258).
- Ensure error modal displays when the queue is enabled by [@pngwn](https://github.com/pngwn) in [PR 4273](https://github.com/gradio-app/gradio/pull/4273)
- Ensure js client respcts the full root when making requests to the server by [@pngwn](https://github.com/pngwn) in [PR 4271](https://github.com/gradio-app/gradio/pull/4271)

## Other Changes:

- Refactor web component `initial_height` attribute by [@whitphx](https://github.com/whitphx) in [PR 4223](https://github.com/gradio-app/gradio/pull/4223)
- Relocate `mount_css` fn to remove circular dependency [@whitphx](https://github.com/whitphx) in [PR 4222](https://github.com/gradio-app/gradio/pull/4222)
- Upgrade Black to 23.3 by [@akx](https://github.com/akx) in [PR 4259](https://github.com/gradio-app/gradio/pull/4259)
- Add frontend LaTeX support in `gr.Chatbot()` using `KaTeX` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4285](https://github.com/gradio-app/gradio/pull/4285).

## Breaking Changes:

No changes to highlight.

# Version 3.31.0

## New Features:

- The reloader command (`gradio app.py`) can now accept command line arguments by [@micky2be](https://github.com/micky2be) in [PR 4119](https://github.com/gradio-app/gradio/pull/4119)
- Added `format` argument to `Audio` component by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4178](https://github.com/gradio-app/gradio/pull/4178)
- Add JS client code snippets to use via api page by [@aliabd](https://github.com/aliabd) in [PR 3927](https://github.com/gradio-app/gradio/pull/3927).
- Update to the JS client by [@pngwn](https://github.com/pngwn) in [PR 4202](https://github.com/gradio-app/gradio/pull/4202)

## Bug Fixes:

- Fix "TypeError: issubclass() arg 1 must be a class" When use Optional[Types] by [@lingfengchencn](https://github.com/lingfengchencn) in [PR 4200](https://github.com/gradio-app/gradio/pull/4200).
- Gradio will no longer send any analytics or call home if analytics are disabled with the GRADIO_ANALYTICS_ENABLED environment variable. By [@akx](https://github.com/akx) in [PR 4194](https://github.com/gradio-app/gradio/pull/4194) and [PR 4236](https://github.com/gradio-app/gradio/pull/4236)
- The deprecation warnings for kwargs now show the actual stack level for the invocation, by [@akx](https://github.com/akx) in [PR 4203](https://github.com/gradio-app/gradio/pull/4203).
- Fix "TypeError: issubclass() arg 1 must be a class" When use Optional[Types] by [@lingfengchencn](https://github.com/lingfengchencn) in [PR 4200](https://github.com/gradio-app/gradio/pull/4200).
- Ensure cancelling functions work correctly by [@pngwn](https://github.com/pngwn) in [PR 4225](https://github.com/gradio-app/gradio/pull/4225)
- Fixes a bug with typing.get_type_hints() on Python 3.9 by [@abidlabs](https://github.com/abidlabs) in [PR 4228](https://github.com/gradio-app/gradio/pull/4228).
- Fixes JSONDecodeError by [@davidai](https://github.com/davidai) in [PR 4241](https://github.com/gradio-app/gradio/pull/4241)
- Fix `chatbot_dialogpt` demo by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4238](https://github.com/gradio-app/gradio/pull/4238).

## Other Changes:

- Change `gr.Chatbot()` markdown parsing to frontend using `marked` library and `prism` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4150](https://github.com/gradio-app/gradio/pull/4150)
- Update the js client by [@pngwn](https://github.com/pngwn) in [PR 3899](https://github.com/gradio-app/gradio/pull/3899)
- Fix documentation for the shape of the numpy array produced by the `Image` component by [@der3318](https://github.com/der3318) in [PR 4204](https://github.com/gradio-app/gradio/pull/4204).
- Updates the timeout for websocket messaging from 1 second to 5 seconds by [@abidlabs](https://github.com/abidlabs) in [PR 4235](https://github.com/gradio-app/gradio/pull/4235)

## Breaking Changes:

No changes to highlight.

# Version 3.30.0

## New Features:

- Adds a `root_path` parameter to `launch()` that allows running Gradio applications on subpaths (e.g. www.example.com/app) behind a proxy, by [@abidlabs](https://github.com/abidlabs) in [PR 4133](https://github.com/gradio-app/gradio/pull/4133)
- Fix dropdown change listener to trigger on change when updated as an output by [@aliabid94](https://github.com/aliabid94) in [PR 4128](https://github.com/gradio-app/gradio/pull/4128).
- Add `.input` event listener, which is only triggered when a user changes the component value (as compared to `.change`, which is also triggered when a component updates as the result of a function trigger), by [@aliabid94](https://github.com/aliabid94) in [PR 4157](https://github.com/gradio-app/gradio/pull/4157).

## Bug Fixes:

- Records username when flagging by [@abidlabs](https://github.com/abidlabs) in [PR 4135](https://github.com/gradio-app/gradio/pull/4135)
- Fix website build issue by [@aliabd](https://github.com/aliabd) in [PR 4142](https://github.com/gradio-app/gradio/pull/4142)
- Fix lang agnostic type info for `gr.File(file_count='multiple')` output components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4153](https://github.com/gradio-app/gradio/pull/4153)

## Other Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

# Version 3.29.0

## New Features:

- Returning language agnostic types in the `/info` route by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4039](https://github.com/gradio-app/gradio/pull/4039)

## Bug Fixes:

- Allow users to upload audio files in Audio component on iOS by by [@aliabid94](https://github.com/aliabid94) in [PR 4071](https://github.com/gradio-app/gradio/pull/4071).
- Fixes the gradio theme builder error that appeared on launch by [@aliabid94](https://github.com/aliabid94) and [@abidlabs](https://github.com/abidlabs) in [PR 4080](https://github.com/gradio-app/gradio/pull/4080)
- Keep Accordion content in DOM by [@aliabid94](https://github.com/aliabid94) in [PR 4070](https://github.com/gradio-app/gradio/pull/4073)
- Fixed bug where type hints in functions caused the event handler to crash by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4068](https://github.com/gradio-app/gradio/pull/4068)
- Fix dropdown default value not appearing by [@aliabid94](https://github.com/aliabid94) in [PR 4072](https://github.com/gradio-app/gradio/pull/4072).
- Soft theme label color fix by [@aliabid94](https://github.com/aliabid94) in [PR 4070](https://github.com/gradio-app/gradio/pull/4070)
- Fix `gr.Slider` `release` event not triggering on mobile by [@space-nuko](https://github.com/space-nuko) in [PR 4098](https://github.com/gradio-app/gradio/pull/4098)
- Removes extraneous `State` component info from the `/info` route by [@abidlabs](https://github.com/freddyaboulton) in [PR 4107](https://github.com/gradio-app/gradio/pull/4107)
- Make .then() work even if first event fails by [@aliabid94](https://github.com/aliabid94) in [PR 4115](https://github.com/gradio-app/gradio/pull/4115).

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

- Allow users to submit with enter in Interfaces with textbox / number inputs [@aliabid94](https://github.com/aliabid94) in [PR 4090](https://github.com/gradio-app/gradio/pull/4090).
- Updates gradio's requirements.txt to requires uvicorn>=0.14.0 by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)
- Updates some error messaging by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)
- Renames simplified Chinese translation file from `zh-cn.json` to `zh-CN.json` by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.3

## New Features:

No changes to highlight.

## Bug Fixes:

- Fixes issue with indentation in `gr.Code()` component with streaming by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4043](https://github.com/gradio-app/gradio/pull/4043)

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.2

## Bug Fixes

- Code component visual updates by [@pngwn](https://github.com/pngwn) in [PR 4051](https://github.com/gradio-app/gradio/pull/4051)

## New Features:

- Add support for `visual-question-answering`, `document-question-answering`, and `image-to-text` using `gr.Interface.load("models/...")` and `gr.Interface.from_pipeline` by [@osanseviero](https://github.com/osanseviero) in [PR 3887](https://github.com/gradio-app/gradio/pull/3887)
- Add code block support in `gr.Chatbot()`, by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4048](https://github.com/gradio-app/gradio/pull/4048)
- Adds the ability to blocklist filepaths (and also improves the allowlist mechanism) by [@abidlabs](https://github.com/abidlabs) in [PR 4047](https://github.com/gradio-app/gradio/pull/4047).
- Adds the ability to specify the upload directory via an environment variable by [@abidlabs](https://github.com/abidlabs) in [PR 4047](https://github.com/gradio-app/gradio/pull/4047).

## Bug Fixes:

- Fixes issue with `matplotlib` not rendering correctly if the backend was not set to `Agg` by [@abidlabs](https://github.com/abidlabs) in [PR 4029](https://github.com/gradio-app/gradio/pull/4029)
- Fixes bug where rendering the same `gr.State` across different Interfaces/Blocks within larger Blocks would not work by [@abidlabs](https://github.com/abidlabs) in [PR 4030](https://github.com/gradio-app/gradio/pull/4030)
- Code component visual updates by [@pngwn](https://github.com/pngwn) in [PR 4051](https://github.com/gradio-app/gradio/pull/4051)

## Documentation Changes:

- Adds a Guide on how to use the Python Client within a FastAPI app, by [@abidlabs](https://github.com/abidlabs) in [PR 3892](https://github.com/gradio-app/gradio/pull/3892)

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

- `gr.HuggingFaceDatasetSaver` behavior changed internally. The `flagging/` folder is not a `.git/` folder anymore when using it. `organization` parameter is now ignored in favor of passing a full dataset id as `dataset_name` (e.g. `"username/my-dataset"`).
- New lines (`\n`) are not automatically converted to `<br>` in `gr.Markdown()` or `gr.Chatbot()`. For multiple new lines, a developer must add multiple `<br>` tags.

## Full Changelog:

- Safer version of `gr.HuggingFaceDatasetSaver` using HTTP methods instead of git pull/push by [@Wauplin](https://github.com/Wauplin) in [PR 3973](https://github.com/gradio-app/gradio/pull/3973)

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.1

## New Features:

- Add a "clear mask" button to `gr.Image` sketch modes, by [@space-nuko](https://github.com/space-nuko) in [PR 3615](https://github.com/gradio-app/gradio/pull/3615)

## Bug Fixes:

- Fix dropdown default value not appearing by [@aliabid94](https://github.com/aliabid94) in [PR 3996](https://github.com/gradio-app/gradio/pull/3996).
- Fix faded coloring of output textboxes in iOS / Safari by [@aliabid94](https://github.com/aliabid94) in [PR 3993](https://github.com/gradio-app/gradio/pull/3993)

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

- CI: Simplified Python CI workflow by [@akx](https://github.com/akx) in [PR 3982](https://github.com/gradio-app/gradio/pull/3982)
- Upgrade pyright to 1.1.305 by [@akx](https://github.com/akx) in [PR 4042](https://github.com/gradio-app/gradio/pull/4042)
- More Ruff rules are enabled and lint errors fixed by [@akx](https://github.com/akx) in [PR 4038](https://github.com/gradio-app/gradio/pull/4038)

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.28.0

## Bug Fixes:

- Fix duplicate play commands in full-screen mode of 'video'. by [@tomchang25](https://github.com/tomchang25) in [PR 3968](https://github.com/gradio-app/gradio/pull/3968).
- Fix the issue of the UI stuck caused by the 'selected' of DataFrame not being reset. by [@tomchang25](https://github.com/tomchang25) in [PR 3916](https://github.com/gradio-app/gradio/pull/3916).
- Fix issue where `gr.Video()` would not work inside a `gr.Tab()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3891](https://github.com/gradio-app/gradio/pull/3891)
- Fixed issue with old_value check in File. by [@tomchang25](https://github.com/tomchang25) in [PR 3859](https://github.com/gradio-app/gradio/pull/3859).
- Fixed bug where all bokeh plots appeared in the same div by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3896](https://github.com/gradio-app/gradio/pull/3896)
- Fixed image outputs to automatically take full output image height, unless explicitly set, by [@aliabid94](https://github.com/aliabid94) in [PR 3905](https://github.com/gradio-app/gradio/pull/3905)
- Fix issue in `gr.Gallery()` where setting height causes aspect ratio of images to collapse by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3830](https://github.com/gradio-app/gradio/pull/3830)
- Fix issue where requesting for a non-existing file would trigger a 500 error by [@micky2be](https://github.com/micky2be) in `[PR 3895](https://github.com/gradio-app/gradio/pull/3895)`.
- Fix bugs with abspath about symlinks, and unresolvable path on Windows by [@micky2be](https://github.com/micky2be) in `[PR 3895](https://github.com/gradio-app/gradio/pull/3895)`.
- Fixes type in client `Status` enum by [@10zinten](https://github.com/10zinten) in [PR 3931](https://github.com/gradio-app/gradio/pull/3931)
- Fix `gr.ChatBot` to handle image url [tye-singwa](https://github.com/tye-signwa) in [PR 3953](https://github.com/gradio-app/gradio/pull/3953)
- Move Google Tag Manager related initialization code to analytics-enabled block by [@akx](https://github.com/akx) in [PR 3956](https://github.com/gradio-app/gradio/pull/3956)
- Fix bug where port was not reused if the demo was closed and then re-launched by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3896](https://github.com/gradio-app/gradio/pull/3959)
- Fixes issue where dropdown does not position itself at selected element when opened [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3639](https://github.com/gradio-app/gradio/pull/3639)

## Documentation Changes:

- Make use of `gr` consistent across the docs by [@duerrsimon](https://github.com/duerrsimon) in [PR 3901](https://github.com/gradio-app/gradio/pull/3901)
- Fixed typo in theming-guide.md by [@eltociear](https://github.com/eltociear) in [PR 3952](https://github.com/gradio-app/gradio/pull/3952)

## Testing and Infrastructure Changes:

- CI: Python backend lint is only run once, by [@akx](https://github.com/akx) in [PR 3960](https://github.com/gradio-app/gradio/pull/3960)
- Format invocations and concatenations were replaced by f-strings where possible by [@akx](https://github.com/akx) in [PR 3984](https://github.com/gradio-app/gradio/pull/3984)
- Linting rules were made more strict and issues fixed by [@akx](https://github.com/akx) in [PR 3979](https://github.com/gradio-app/gradio/pull/3979).

## Breaking Changes:

- Some re-exports in `gradio.themes` utilities (introduced in 3.24.0) have been eradicated.
  By [@akx](https://github.com/akx) in [PR 3958](https://github.com/gradio-app/gradio/pull/3958)

## Full Changelog:

- Add DESCRIPTION.md to image_segmentation demo by [@aliabd](https://github.com/aliabd) in [PR 3866](https://github.com/gradio-app/gradio/pull/3866)
- Fix error in running `gr.themes.builder()` by [@deepkyu](https://github.com/deepkyu) in [PR 3869](https://github.com/gradio-app/gradio/pull/3869)
- Fixed a JavaScript TypeError when loading custom JS with `_js` and setting `outputs` to `None` in `gradio.Blocks()` by [@DavG25](https://github.com/DavG25) in [PR 3883](https://github.com/gradio-app/gradio/pull/3883)
- Fixed bg_background_fill theme property to expand to whole background, block_radius to affect form elements as well, and added block_label_shadow theme property by [@aliabid94](https://github.com/aliabid94) in [PR 3590](https://github.com/gradio-app/gradio/pull/3590)

## Contributors Shoutout:

No changes to highlight.

# Version 3.27.0

## New Features:

### AnnotatedImage Component

New AnnotatedImage component allows users to highlight regions of an image, either by providing bounding boxes, or 0-1 pixel masks. This component is useful for tasks such as image segmentation, object detection, and image captioning.

![AnnotatedImage screenshot](https://user-images.githubusercontent.com/7870876/232142720-86e0020f-beaf-47b9-a843-689c9621f09c.gif)

Example usage:

```python
with gr.Blocks() as demo:
    img = gr.Image()
    img_section = gr.AnnotatedImage()
    def mask(img):
        top_left_corner = [0, 0, 20, 20]
        random_mask = np.random.randint(0, 2, img.shape[:2])
        return (img, [(top_left_corner, "left corner"), (random_mask, "random")])
    img.change(mask, img, img_section)
```

See the [image_segmentation demo](https://github.com/gradio-app/gradio/tree/main/demo/image_segmentation) for a full example. By [@aliabid94](https://github.com/aliabid94) in [PR 3836](https://github.com/gradio-app/gradio/pull/3836)

## Bug Fixes:

No changes to highlight.

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.26.0

## New Features:

### `Video` component supports subtitles

- Allow the video component to accept subtitles as input, by [@tomchang25](https://github.com/tomchang25) in [PR 3673](https://github.com/gradio-app/gradio/pull/3673). To provide subtitles, simply return a tuple consisting of `(path_to_video, path_to_subtitles)` from your function. Both `.srt` and `.vtt` formats are supported:

```py
with gr.Blocks() as demo:
    gr.Video(("video.mp4", "captions.srt"))
```

## Bug Fixes:

- Fix code markdown support in `gr.Chatbot()` component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3816](https://github.com/gradio-app/gradio/pull/3816)

## Documentation Changes:

- Updates the "view API" page in Gradio apps to use the `gradio_client` library by [@aliabd](https://github.com/aliabd) in [PR 3765](https://github.com/gradio-app/gradio/pull/3765)

- Read more about how to use the `gradio_client` library here: https://gradio.app/getting-started-with-the-python-client/

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.25.0

## New Features:

- Improve error messages when number of inputs/outputs to event handlers mismatch, by [@space-nuko](https://github.com/space-nuko) in [PR 3519](https://github.com/gradio-app/gradio/pull/3519)

- Add `select` listener to Images, allowing users to click on any part of an image and get the coordinates of the click by [@aliabid94](https://github.com/aliabid94) in [PR 3786](https://github.com/gradio-app/gradio/pull/3786).

```python
with gr.Blocks() as demo:
    img = gr.Image()
    textbox = gr.Textbox()

    def select_handler(img, evt: gr.SelectData):
        selected_pixel = img[evt.index[1], evt.index[0]]
        return f"Selected pixel: {selected_pixel}"

    img.select(select_handler, img, textbox)
```

![Recording 2023-04-08 at 17 44 39](https://user-images.githubusercontent.com/7870876/230748572-90a2a8d5-116d-4769-bb53-5516555fbd0f.gif)

## Bug Fixes:

- Increase timeout for sending analytics data by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3647](https://github.com/gradio-app/gradio/pull/3647)
- Fix bug where http token was not accessed over websocket connections by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3735](https://github.com/gradio-app/gradio/pull/3735)
- Add ability to specify `rows`, `columns` and `object-fit` in `style()` for `gr.Gallery()` component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3586](https://github.com/gradio-app/gradio/pull/3586)
- Fix bug where recording an audio file through the microphone resulted in a corrupted file name by [@abidlabs](https://github.com/abidlabs) in [PR 3770](https://github.com/gradio-app/gradio/pull/3770)
- Added "ssl_verify" to blocks.launch method to allow for use of self-signed certs by [@garrettsutula](https://github.com/garrettsutula) in [PR 3873](https://github.com/gradio-app/gradio/pull/3873)
- Fix bug where iterators where not being reset for processes that terminated early by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3777](https://github.com/gradio-app/gradio/pull/3777)
- Fix bug where the upload button was not properly handling the `file_count='multiple'` case by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3782](https://github.com/gradio-app/gradio/pull/3782)
- Fix bug where use Via API button was giving error by [@Devang-C](https://github.com/Devang-C) in [PR 3783](https://github.com/gradio-app/gradio/pull/3783)

## Documentation Changes:

- Fix invalid argument docstrings, by [@akx](https://github.com/akx) in [PR 3740](https://github.com/gradio-app/gradio/pull/3740)

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

- Fixed IPv6 listening to work with bracket [::1] notation, by [@dsully](https://github.com/dsully) in [PR 3695](https://github.com/gradio-app/gradio/pull/3695)

## Contributors Shoutout:

No changes to highlight.

# Version 3.24.1

## New Features:

- No changes to highlight.

## Bug Fixes:

- Fixes Chatbot issue where new lines were being created every time a message was sent back and forth by [@aliabid94](https://github.com/aliabid94) in [PR 3717](https://github.com/gradio-app/gradio/pull/3717).
- Fixes data updating in DataFrame invoking a `select` event once the dataframe has been selected. By [@yiyuezhuo](https://github.com/yiyuezhuo) in [PR 3861](https://github.com/gradio-app/gradio/pull/3861)
- Fixes false positive warning which is due to too strict type checking by [@yiyuezhuo](https://github.com/yiyuezhuo) in [PR 3837](https://github.com/gradio-app/gradio/pull/3837).

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# Version 3.24.0

## New Features:

- Trigger the release event when Slider number input is released or unfocused by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3589](https://github.com/gradio-app/gradio/pull/3589)
- Created Theme Builder, which allows users to create themes without writing any code, by [@aliabid94](https://github.com/aliabid94) in [PR 3664](https://github.com/gradio-app/gradio/pull/3664). Launch by:

  ```python
  import gradio as gr
  gr.themes.builder()
  ```

  ![Theme Builder](https://user-images.githubusercontent.com/7870876/228204929-d71cbba5-69c2-45b3-bd20-e3a201d98b12.png)

- The `Dropdown` component now has a `allow_custom_value` parameter that lets users type in custom values not in the original list of choices.
- The `Colorpicker` component now has a `.blur()` event

### Added a download button for videos! 📥

![download_video](https://user-images.githubusercontent.com/41651716/227009612-9bc5fb72-2a44-4c55-9b7b-a0fa098e7f25.gif)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3581](https://github.com/gradio-app/gradio/pull/3581).

- Trigger the release event when Slider number input is released or unfocused by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3589](https://github.com/gradio-app/gradio/pull/3589)

## Bug Fixes:

- Fixed bug where text for altair plots was not legible in dark mode by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3555](https://github.com/gradio-app/gradio/pull/3555)
- Fixes `Chatbot` and `Image` components so that files passed during processing are added to a directory where they can be served from, by [@abidlabs](https://github.com/abidlabs) in [PR 3523](https://github.com/gradio-app/gradio/pull/3523)
- Use Gradio API server to send telemetry using `huggingface_hub` [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3488](https://github.com/gradio-app/gradio/pull/3488)
- Fixes an an issue where if the Blocks scope was not exited, then State could be shared across sessions, by [@abidlabs](https://github.com/abidlabs) in [PR 3600](https://github.com/gradio-app/gradio/pull/3600)
- Ensures that `gr.load()` loads and applies the upstream theme, by [@abidlabs](https://github.com/abidlabs) in [PR 3641](https://github.com/gradio-app/gradio/pull/3641)
- Fixed bug where "or" was not being localized in file upload text by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3599](https://github.com/gradio-app/gradio/pull/3599)
- Fixed bug where chatbot does not autoscroll inside of a tab, row or column by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3637](https://github.com/gradio-app/gradio/pull/3637)
- Fixed bug where textbox shrinks when `lines` set to larger than 20 by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3637](https://github.com/gradio-app/gradio/pull/3637)
- Ensure CSS has fully loaded before rendering the application, by [@pngwn](https://github.com/pngwn) in [PR 3573](https://github.com/gradio-app/gradio/pull/3573)
- Support using an empty list as `gr.Dataframe` value, by [@space-nuko](https://github.com/space-nuko) in [PR 3646](https://github.com/gradio-app/gradio/pull/3646)
- Fixed `gr.Image` not filling the entire element size, by [@space-nuko](https://github.com/space-nuko) in [PR 3649](https://github.com/gradio-app/gradio/pull/3649)
- Make `gr.Code` support the `lines` property, by [@space-nuko](https://github.com/space-nuko) in [PR 3651](https://github.com/gradio-app/gradio/pull/3651)
- Fixes certain `_js` return values being double wrapped in an array, by [@space-nuko](https://github.com/space-nuko) in [PR 3594](https://github.com/gradio-app/gradio/pull/3594)
- Correct the documentation of `gr.File` component to state that its preprocessing method converts the uploaded file to a temporary file, by @RussellLuo in [PR 3660](https://github.com/gradio-app/gradio/pull/3660)
- Fixed bug in Serializer ValueError text by [@osanseviero](https://github.com/osanseviero) in [PR 3669](https://github.com/gradio-app/gradio/pull/3669)
- Fix default parameter argument and `gr.Progress` used in same function, by [@space-nuko](https://github.com/space-nuko) in [PR 3671](https://github.com/gradio-app/gradio/pull/3671)
- Hide `Remove All` button in `gr.Dropdown` single-select mode by [@space-nuko](https://github.com/space-nuko) in [PR 3678](https://github.com/gradio-app/gradio/pull/3678)
- Fix broken spaces in docs by [@aliabd](https://github.com/aliabd) in [PR 3698](https://github.com/gradio-app/gradio/pull/3698)
- Fix items in `gr.Dropdown` besides the selected item receiving a checkmark, by [@space-nuko](https://github.com/space-nuko) in [PR 3644](https://github.com/gradio-app/gradio/pull/3644)
- Fix several `gr.Dropdown` issues and improve usability, by [@space-nuko](https://github.com/space-nuko) in [PR 3705](https://github.com/gradio-app/gradio/pull/3705)

## Documentation Changes:

- Makes some fixes to the Theme Guide related to naming of variables, by [@abidlabs](https://github.com/abidlabs) in [PR 3561](https://github.com/gradio-app/gradio/pull/3561)
- Documented `HuggingFaceDatasetJSONSaver` by [@osanseviero](https://github.com/osanseviero) in [PR 3604](https://github.com/gradio-app/gradio/pull/3604)
- Makes some additions to documentation of `Audio` and `State` components, and fixes the `pictionary` demo by [@abidlabs](https://github.com/abidlabs) in [PR 3611](https://github.com/gradio-app/gradio/pull/3611)
- Fix outdated sharing your app guide by [@aliabd](https://github.com/aliabd) in [PR 3699](https://github.com/gradio-app/gradio/pull/3699)

## Testing and Infrastructure Changes:

- Removed heavily-mocked tests related to comet_ml, wandb, and mlflow as they added a significant amount of test dependencies that prevented installation of test dependencies on Windows environments. By [@abidlabs](https://github.com/abidlabs) in [PR 3608](https://github.com/gradio-app/gradio/pull/3608)
- Added Windows continuous integration, by [@space-nuko](https://github.com/space-nuko) in [PR 3628](https://github.com/gradio-app/gradio/pull/3628)
- Switched linting from flake8 + isort to `ruff`, by [@akx](https://github.com/akx) in [PR 3710](https://github.com/gradio-app/gradio/pull/3710)

## Breaking Changes:

No changes to highlight.

## Full Changelog:

- Mobile responsive iframes in themes guide by [@aliabd](https://github.com/aliabd) in [PR 3562](https://github.com/gradio-app/gradio/pull/3562)
- Remove extra $demo from theme guide by [@aliabd](https://github.com/aliabd) in [PR 3563](https://github.com/gradio-app/gradio/pull/3563)
- Set the theme name to be the upstream repo name when loading from the hub by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3595](https://github.com/gradio-app/gradio/pull/3595)
- Copy everything in website Dockerfile, fix build issues by [@aliabd](https://github.com/aliabd) in [PR 3659](https://github.com/gradio-app/gradio/pull/3659)
- Raise error when an event is queued but the queue is not configured by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3640](https://github.com/gradio-app/gradio/pull/3640)
- Allows users to apss in a string name for a built-in theme, by [@abidlabs](https://github.com/abidlabs) in [PR 3641](https://github.com/gradio-app/gradio/pull/3641)
- Added `orig_name` to Video output in the backend so that the front end can set the right name for downloaded video files by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3700](https://github.com/gradio-app/gradio/pull/3700)

## Contributors Shoutout:
