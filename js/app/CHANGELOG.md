# @gradio/app

## 1.25.1

### Patch Changes

- Updated dependencies [[`f52cab6`](https://github.com/gradio-app/gradio/commit/f52cab634b94638d7f4625d40bf3d9afbe68040b), [`6b8a7e5`](https://github.com/gradio-app/gradio/commit/6b8a7e5d36887cdfcfbfec1536a915128df0d6b2), [`f191786`](https://github.com/gradio-app/gradio/commit/f1917867916647d383b8d7ce15e0c17f2abbdec1), [`3e4e680`](https://github.com/gradio-app/gradio/commit/3e4e680a52ba5a73c108ef1b328dacd7b6e4b566)]:
  - @gradio/fileexplorer@0.3.22
  - @gradio/dropdown@0.6.1
  - @gradio/audio@0.9.2
  - @gradio/icons@0.3.3
  - @gradio/chatbot@0.7.2
  - @gradio/annotatedimage@0.5.2
  - @gradio/atoms@0.5.3
  - @gradio/code@0.5.2
  - @gradio/file@0.5.2
  - @gradio/form@0.1.10
  - @gradio/gallery@0.7.2
  - @gradio/highlightedtext@0.4.10
  - @gradio/image@0.9.2
  - @gradio/imageeditor@0.4.2
  - @gradio/json@0.1.10
  - @gradio/label@0.2.10
  - @gradio/model3d@0.8.1
  - @gradio/plot@0.3.2
  - @gradio/simpledropdown@0.1.10
  - @gradio/simpleimage@0.3.2
  - @gradio/simpletextbox@0.1.10
  - @gradio/statustracker@0.4.7
  - @gradio/textbox@0.4.11
  - @gradio/upload@0.7.4
  - @gradio/video@0.6.2
  - @gradio/accordion@0.3.3
  - @gradio/box@0.1.10
  - @gradio/checkbox@0.2.10
  - @gradio/checkboxgroup@0.4.4
  - @gradio/colorpicker@0.2.10
  - @gradio/dataframe@0.6.3
  - @gradio/dataset@0.1.22
  - @gradio/fallback@0.2.10
  - @gradio/html@0.1.10
  - @gradio/markdown@0.6.4
  - @gradio/number@0.3.10
  - @gradio/paramviewer@0.4.3
  - @gradio/radio@0.4.4
  - @gradio/slider@0.2.10
  - @gradio/button@0.2.22
  - @gradio/uploadbutton@0.4.7

## 1.25.0

### Fixes

- [#7410](https://github.com/gradio-app/gradio/pull/7410) [`c2dfc59`](https://github.com/gradio-app/gradio/commit/c2dfc592a4988efd5a96a062eec3fb4906f71748) - remove static while pending behaviour. Thanks [@pngwn](https://github.com/pngwn)!
- [#7404](https://github.com/gradio-app/gradio/pull/7404) [`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7) - Add `.key_up` event listener to `gr.Dropdown()`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7395](https://github.com/gradio-app/gradio/pull/7395) [`46b4568`](https://github.com/gradio-app/gradio/commit/46b45683e1ea9eb40013121a8de5bee7aa98bf0b) - Allow applying `@media`, `@keyframes` and `@import` in custom CSS. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.24.0

### Features

- [#7183](https://github.com/gradio-app/gradio/pull/7183) [`49d9c48`](https://github.com/gradio-app/gradio/commit/49d9c48537aa706bf72628e3640389470138bdc6) - [WIP] Refactor file normalization to be in the backend and remove it from the frontend of each component. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6890](https://github.com/gradio-app/gradio/pull/6890) [`cccab27`](https://github.com/gradio-app/gradio/commit/cccab27fe8b6ae6860b3fff68694fa33060e18a7) - E2E tests for Lite. Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#7354](https://github.com/gradio-app/gradio/pull/7354) [`a7fa47a`](https://github.com/gradio-app/gradio/commit/a7fa47a175fbcf0fd6573ca19334a3a55b55bb24) - ensure Dataframes in background tabs are visible when the tab is selected. Thanks [@pngwn](https://github.com/pngwn)!
- [#7355](https://github.com/gradio-app/gradio/pull/7355) [`2244059`](https://github.com/gradio-app/gradio/commit/2244059cdbacb713530a3b760205c5464c05491c) - Ensure CSS `.dark` rule selectors are applied. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.23.0

### Features

- [#7129](https://github.com/gradio-app/gradio/pull/7129) [`ccdaec4`](https://github.com/gradio-app/gradio/commit/ccdaec45002d0a9d6016e8e2078b843a1ff9172b) - Add a `simpleimage` template for custom components. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7313](https://github.com/gradio-app/gradio/pull/7313) [`edfd05d`](https://github.com/gradio-app/gradio/commit/edfd05d18d20542d350d883d5e7f84d2774ad99e) - Expand chatinterface to full window height. Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7292](https://github.com/gradio-app/gradio/pull/7292) [`aa97a5e`](https://github.com/gradio-app/gradio/commit/aa97a5e33a04ef8a0309b6ec3b2df4caaa26173e) - Improvements to API Docs. Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#7117](https://github.com/gradio-app/gradio/pull/7117) [`24157a3`](https://github.com/gradio-app/gradio/commit/24157a36028b3f606194bd9977634318650b2d46) - add background color based on the OS mode. Thanks [@aileenvl](https://github.com/aileenvl)!

## 1.22.0

### Features

- [#7084](https://github.com/gradio-app/gradio/pull/7084) [`94aa271`](https://github.com/gradio-app/gradio/commit/94aa271ab11fc3426a7e143ebaa757eb30c9911d) - Improve rapid generation performance via UI throttling. Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7148](https://github.com/gradio-app/gradio/pull/7148) [`c60ad4d`](https://github.com/gradio-app/gradio/commit/c60ad4d34ab5b56a89bf6796822977e51e7a4a32) - Use Gallery as input component. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#7125](https://github.com/gradio-app/gradio/pull/7125) [`45f725f`](https://github.com/gradio-app/gradio/commit/45f725f8d0dc7813b3d2e768ca9582d6ad878d6f) - un-disable output components after exception is raised. Thanks [@abidlabs](https://github.com/abidlabs)!

## 1.21.0

### Highlights

#### Custom component documentation generator ([#7030](https://github.com/gradio-app/gradio/pull/7030) [`3a944ed`](https://github.com/gradio-app/gradio/commit/3a944ed9f162a224d26959a9c556346a9d205311))

If your custom component has type hints and docstrings for both parameters and return values, you can now automatically generate a documentation page and README.md with no additional effort. Simply run the following command:

```sh
gradio cc docs
```

This will generate a Gradio app that you can upload to spaces providing rich documentation for potential users. The documentation page includes:

- Installation instructions.
- A live embedded demo and working code snippet, pulled from your demo app.
- An API reference for initialising the component, with types, default values and descriptions.
- An explanation of how the component affects the user's predict function inputs and outputs.
- Any additional interfaces or classes that are necessary to understand the API reference.
- Optional links to GitHub, PyPi, and Hugging Face Spaces.

A README will also be generated detailing the same information but in a format that is optimised for viewing on GitHub or PyPi!

Thanks [@pngwn](https://github.com/pngwn)!

## 1.20.0

### Features

- [#6965](https://github.com/gradio-app/gradio/pull/6965) [`5d00dd3`](https://github.com/gradio-app/gradio/commit/5d00dd37ca14bbfef2ceac550b29dbe05ba8cab0) - Make <UploadProgress /> Wasm-compatible. Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6967](https://github.com/gradio-app/gradio/pull/6967) [`5e00162`](https://github.com/gradio-app/gradio/commit/5e0016267f1d683e2daab82ee4a33d2f09513a34) - Make <Gallery /> Wasm-compatible. Thanks [@whitphx](https://github.com/whitphx)!
- [#6983](https://github.com/gradio-app/gradio/pull/6983) [`6e285be`](https://github.com/gradio-app/gradio/commit/6e285be8edeacf8730bac10b7ecd3fd5e309a950) - Fix the reloader. Thanks [@aliabid94](https://github.com/aliabid94)!

## 1.19.0

### Features

- [#6778](https://github.com/gradio-app/gradio/pull/6778) [`8a093e2`](https://github.com/gradio-app/gradio/commit/8a093e23d7993a044e5e0ff73f93a74cb75dad56) - Add a dev instruction for lite in SharedWorker mode. Thanks [@whitphx](https://github.com/whitphx)!

## 1.18.0

### Features

- [#6839](https://github.com/gradio-app/gradio/pull/6839) [`e974cf0`](https://github.com/gradio-app/gradio/commit/e974cf045c82ce8d79efdda36b9dbf6ea557baa4) - Custom JS Guide. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Fixes

- [#6863](https://github.com/gradio-app/gradio/pull/6863) [`d406855`](https://github.com/gradio-app/gradio/commit/d4068557953746662235d595ec435c42ceb24414) - Fix JS Client when app is running behind a proxy. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6846](https://github.com/gradio-app/gradio/pull/6846) [`48d6534`](https://github.com/gradio-app/gradio/commit/48d6534b40f80e7e70a4061f97d9f2e23ba77fe1) - Add `show_api` parameter to events, and fix `gr.load()`. Also makes some minor improvements to the "view API" page when running on Spaces. Thanks [@abidlabs](https://github.com/abidlabs)!

## 1.17.0

### Features

- [#6831](https://github.com/gradio-app/gradio/pull/6831) [`f3abde8`](https://github.com/gradio-app/gradio/commit/f3abde80884d96ad69b825020c46486d9dd5cac5) - Add an option to enable header links for markdown. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#6766](https://github.com/gradio-app/gradio/pull/6766) [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144) - Improve source selection UX. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.16.2

### Patch Changes

- Updated dependencies [[`245d58e`](https://github.com/gradio-app/gradio/commit/245d58eff788e8d44a59d37a2d9b26d0f08a62b4), [`c352811`](https://github.com/gradio-app/gradio/commit/c352811f76d4126613ece0a584f8c552fdd8d1f6)]:
  - @gradio/client@0.9.2
  - @gradio/audio@0.6.2
  - @gradio/imageeditor@0.1.5
  - @gradio/annotatedimage@0.3.12
  - @gradio/button@0.2.12
  - @gradio/chatbot@0.5.4
  - @gradio/dataset@0.1.12
  - @gradio/file@0.4.2
  - @gradio/fileexplorer@0.3.12
  - @gradio/gallery@0.4.13
  - @gradio/image@0.5.2
  - @gradio/model3d@0.4.10
  - @gradio/upload@0.5.5
  - @gradio/uploadbutton@0.3.3
  - @gradio/video@0.2.2
  - @gradio/dataframe@0.4.2
  - @gradio/code@0.3.2

## 1.16.1

### Patch Changes

- Updated dependencies [[`5d51fbc`](https://github.com/gradio-app/gradio/commit/5d51fbce7826da840a2fd4940feb5d9ad6f1bc5a), [`34f9431`](https://github.com/gradio-app/gradio/commit/34f943101bf7dd6b8a8974a6131c1ed7c4a0dac0)]:
  - @gradio/model3d@0.4.9
  - @gradio/upload@0.5.4
  - @gradio/client@0.9.1
  - @gradio/annotatedimage@0.3.11
  - @gradio/audio@0.6.1
  - @gradio/button@0.2.11
  - @gradio/chatbot@0.5.3
  - @gradio/code@0.3.1
  - @gradio/dataframe@0.4.1
  - @gradio/dataset@0.1.11
  - @gradio/file@0.4.1
  - @gradio/fileexplorer@0.3.11
  - @gradio/gallery@0.4.12
  - @gradio/image@0.5.1
  - @gradio/imageeditor@0.1.4
  - @gradio/uploadbutton@0.3.2
  - @gradio/video@0.2.1

## 1.16.0

### Features

- [#6398](https://github.com/gradio-app/gradio/pull/6398) [`67ddd40`](https://github.com/gradio-app/gradio/commit/67ddd40b4b70d3a37cb1637c33620f8d197dbee0) - Lite v4. Thanks [@whitphx](https://github.com/whitphx)!
- [#6738](https://github.com/gradio-app/gradio/pull/6738) [`f3c4d78`](https://github.com/gradio-app/gradio/commit/f3c4d78b710854b94d9a15db78178e504a02c680) - reload on css changes + fix css specificity. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#6639](https://github.com/gradio-app/gradio/pull/6639) [`9a6ff70`](https://github.com/gradio-app/gradio/commit/9a6ff704cd8429289c5376d3af5e4b8492df4773) - Fix issue with `head` param when adding more than one script tag. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 1.15.0

### Features

- [#6512](https://github.com/gradio-app/gradio/pull/6512) [`4f040c7`](https://github.com/gradio-app/gradio/commit/4f040c752bb3b0586a4e16eca25a1e5f596eee48) - Update zh-CN.json. Thanks [@cibimo](https://github.com/cibimo)!

## 1.14.0

### Features

- [#6537](https://github.com/gradio-app/gradio/pull/6537) [`6d3fecfa4`](https://github.com/gradio-app/gradio/commit/6d3fecfa42dde1c70a60c397434c88db77289be6) - chore(deps): update all non-major dependencies. Thanks [@renovate](https://github.com/apps/renovate)!

### Fixes

- [#6530](https://github.com/gradio-app/gradio/pull/6530) [`13ef0f0ca`](https://github.com/gradio-app/gradio/commit/13ef0f0caa13e5a1cea70d572684122419419599) - Quick fix: Make component interactive when it is in focus. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 1.13.1

### Fixes

- [#6536](https://github.com/gradio-app/gradio/pull/6536) [`1bbd6cab3`](https://github.com/gradio-app/gradio/commit/1bbd6cab3f0abe183b514b82061f0937c8480966) - Fix undefined `data` TypeError in Blocks. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.13.0

### Highlights

#### New `ImageEditor` component ([#6169](https://github.com/gradio-app/gradio/pull/6169) [`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8))

A brand new component, completely separate from `Image` that provides simple editing capabilities.

- Set background images from file uploads, webcam, or just paste!
- Crop images with an improved cropping UI. App authors can event set specific crop size, or crop ratios (`1:1`, etc)
- Paint on top of any image (or no image) and erase any mistakes!
- The ImageEditor supports layers, confining draw and erase actions to that layer.
- More flexible access to data. The image component returns a composite image representing the final state of the canvas as well as providing the background and all layers as individual images.
- Fully customisable. All features can be enabled and disabled. Even the brush color swatches can be customised.

<video src="https://user-images.githubusercontent.com/12937446/284027169-31188926-fd16-4a1c-8718-998e7aae4695.mp4" autoplay muted></video>

```py

def fn(im):
    im["composite"] # the full canvas
    im["background"] # the background image
    im["layers"] # a list of individual layers


im = gr.ImageEditor(
    # decide which sources you'd like to accept
    sources=["upload", "webcam", "clipboard"],
    # set a cropsize constraint, can either be a ratio or a concrete [width, height]
    crop_size="1:1",
    # enable crop (or disable it)
    transforms=["crop"],
    # customise the brush
    brush=Brush(
      default_size="25", # or leave it as 'auto'
      color_mode="fixed", # 'fixed' hides the user swatches and colorpicker, 'defaults' shows it
      default_color="hotpink", # html names are supported
      colors=[
        "rgba(0, 150, 150, 1)", # rgb(a)
        "#fff", # hex rgb
        "hsl(360, 120, 120)" # in fact any valid colorstring
      ]
    ),
    brush=Eraser(default_size="25")
)

```

Thanks [@pngwn](https://github.com/pngwn)!

## 1.12.0

### Features

- [#6427](https://github.com/gradio-app/gradio/pull/6427) [`e0fc14659`](https://github.com/gradio-app/gradio/commit/e0fc146598ba9b081bc5fa9616d0a41c2aba2427) - Allow google analytics to work on Spaces (and other iframe situations). Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#6254](https://github.com/gradio-app/gradio/pull/6254) [`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a) - Add volume control to Audio. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6457](https://github.com/gradio-app/gradio/pull/6457) [`d00fcf89d`](https://github.com/gradio-app/gradio/commit/d00fcf89d1c3ecbc910e81bb1311479ec2b73e4e) - Gradio custom component dev mode now detects changes to Example.svelte file. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 1.11.0

### Features

- [#6099](https://github.com/gradio-app/gradio/pull/6099) [`d84209703`](https://github.com/gradio-app/gradio/commit/d84209703b7a0728cdb49221e543500ddb6a8d33) - Lite: SharedWorker mode. Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6383](https://github.com/gradio-app/gradio/pull/6383) [`324867f63`](https://github.com/gradio-app/gradio/commit/324867f63c920113d89a565892aa596cf8b1e486) - Fix event target. Thanks [@aliabid94](https://github.com/aliabid94)!

## 1.10.3

### Patch Changes

- Updated dependencies [[`6204ccac5`](https://github.com/gradio-app/gradio/commit/6204ccac5967763e0ebde550d04d12584243a120), [`4d3aad33a`](https://github.com/gradio-app/gradio/commit/4d3aad33a0b66639dbbb2928f305a79fb7789b2d), [`854b482f5`](https://github.com/gradio-app/gradio/commit/854b482f598e0dc47673846631643c079576da9c), [`55fda81fa`](https://github.com/gradio-app/gradio/commit/55fda81fa5918b48952729232d6e2fc55af9351d), [`37dd335e5`](https://github.com/gradio-app/gradio/commit/37dd335e5f04a8e689dd7f23ae24ad1934ea08d8), [`f1409f95e`](https://github.com/gradio-app/gradio/commit/f1409f95ed39c5565bed6a601e41f94e30196a57)]:
  - @gradio/image@0.3.4
  - @gradio/upload@0.4.0
  - @gradio/code@0.2.4
  - @gradio/textbox@0.4.2
  - @gradio/audio@0.5.0
  - @gradio/client@0.8.0
  - @gradio/gallery@0.4.5
  - @gradio/row@0.1.0
  - @gradio/video@0.1.4
  - @gradio/annotatedimage@0.3.4
  - @gradio/button@0.2.4
  - @gradio/chatbot@0.4.4
  - @gradio/dataframe@0.3.5
  - @gradio/dataset@0.1.4
  - @gradio/file@0.2.4
  - @gradio/fileexplorer@0.3.4
  - @gradio/model3d@0.4.2
  - @gradio/uploadbutton@0.1.4

## 1.10.2

### Patch Changes

- Updated dependencies [[`4b1011bab`](https://github.com/gradio-app/gradio/commit/4b1011bab03c0b6a09329e0beb9c1b17b2189878), [`bca6c2c80`](https://github.com/gradio-app/gradio/commit/bca6c2c80f7e5062427019de45c282238388af95), [`19af2806a`](https://github.com/gradio-app/gradio/commit/19af2806a58419cc551d2d1d6d8987df0db91ccb), [`d3b53a457`](https://github.com/gradio-app/gradio/commit/d3b53a4577ea05cd27e37ce7fec952028c18ed45), [`3cdeabc68`](https://github.com/gradio-app/gradio/commit/3cdeabc6843000310e1a9e1d17190ecbf3bbc780), [`fad92c29d`](https://github.com/gradio-app/gradio/commit/fad92c29dc1f5cd84341aae417c495b33e01245f)]:
  - @gradio/chatbot@0.4.3
  - @gradio/client@0.7.2
  - @gradio/audio@0.4.3
  - @gradio/dataframe@0.3.4
  - @gradio/atoms@0.2.1
  - @gradio/upload@0.3.3
  - @gradio/video@0.1.3
  - @gradio/annotatedimage@0.3.3
  - @gradio/button@0.2.3
  - @gradio/dataset@0.1.3
  - @gradio/file@0.2.3
  - @gradio/fileexplorer@0.3.3
  - @gradio/gallery@0.4.4
  - @gradio/image@0.3.3
  - @gradio/model3d@0.4.1
  - @gradio/uploadbutton@0.1.3
  - @gradio/accordion@0.2.1
  - @gradio/box@0.1.1
  - @gradio/checkbox@0.2.1
  - @gradio/checkboxgroup@0.3.2
  - @gradio/code@0.2.3
  - @gradio/colorpicker@0.2.1
  - @gradio/dropdown@0.3.1
  - @gradio/fallback@0.2.1
  - @gradio/form@0.1.1
  - @gradio/highlightedtext@0.4.1
  - @gradio/html@0.1.1
  - @gradio/json@0.1.1
  - @gradio/label@0.2.1
  - @gradio/markdown@0.3.1
  - @gradio/number@0.3.1
  - @gradio/plot@0.2.1
  - @gradio/radio@0.3.2
  - @gradio/simpledropdown@0.1.1
  - @gradio/simpletextbox@0.1.1
  - @gradio/slider@0.2.1
  - @gradio/statustracker@0.3.1
  - @gradio/textbox@0.4.1
  - @gradio/row@0.1.0

## 1.10.1

### Patch Changes

- Updated dependencies [[`92278729e`](https://github.com/gradio-app/gradio/commit/92278729ee008126af15ffe6be399236211b2f34), [`e8216be94`](https://github.com/gradio-app/gradio/commit/e8216be948f76ce064595183d11e9148badf9421)]:
  - @gradio/gallery@0.4.3
  - @gradio/dataframe@0.3.3

## 1.10.0

### Features

- [#6261](https://github.com/gradio-app/gradio/pull/6261) [`8bbeca0e7`](https://github.com/gradio-app/gradio/commit/8bbeca0e772a5a2853d02a058b35abb2c15ffaf1) - Improve Embed and CDN handling and fix a couple of related bugs. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#6266](https://github.com/gradio-app/gradio/pull/6266) [`e32bac894`](https://github.com/gradio-app/gradio/commit/e32bac8944c85e0ec4831963299889d6bbfa0351) - Fix updating interactive prop. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6213](https://github.com/gradio-app/gradio/pull/6213) [`27194a987`](https://github.com/gradio-app/gradio/commit/27194a987fa7ba1234b5fc0ce8bf7fabef7033a9) - Ensure the statustracker for `gr.Image` displays in static mode. Thanks [@pngwn](https://github.com/pngwn)!
- [#6234](https://github.com/gradio-app/gradio/pull/6234) [`aaa55ce85`](https://github.com/gradio-app/gradio/commit/aaa55ce85e12f95aba9299445e9c5e59824da18e) - Video/Audio fixes. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6236](https://github.com/gradio-app/gradio/pull/6236) [`6bce259c5`](https://github.com/gradio-app/gradio/commit/6bce259c5db7b21b327c2067e74ea20417bc89ec) - Ensure `gr.CheckboxGroup` updates as expected. Thanks [@pngwn](https://github.com/pngwn)!

## 1.9.2

### Fixes

- [#6191](https://github.com/gradio-app/gradio/pull/6191) [`b555bc09f`](https://github.com/gradio-app/gradio/commit/b555bc09ffe8e58b10da6227e2f11a0c084aa71d) - fix cdn build. Thanks [@pngwn](https://github.com/pngwn)!

## 1.9.1

### Features

- [#6137](https://github.com/gradio-app/gradio/pull/6137) [`2ba14b284`](https://github.com/gradio-app/gradio/commit/2ba14b284f908aa13859f4337167a157075a68eb) - JS Param. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 1.9.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Improve Audio Component. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Adds the ability to build the frontend and backend of custom components in preparation for publishing to pypi using `gradio_component build`. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Improve Video Component. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Swap websockets for SSE. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Pending events behavior. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Reinstate types that were removed in error in #5832. Thanks [@pngwn](https://github.com/pngwn)!

## 1.9.0-beta.3

### Features

- [#6124](https://github.com/gradio-app/gradio/pull/6124) [`a7435ba9e`](https://github.com/gradio-app/gradio/commit/a7435ba9e6f8b88a838e80893eb8fedf60ccda67) - Fix static issues with Lite on v4. Thanks [@aliabd](https://github.com/aliabd)!
- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6149](https://github.com/gradio-app/gradio/pull/6149) [`90318b1dd`](https://github.com/gradio-app/gradio/commit/90318b1dd118ae08a695a50e7c556226234ab6dc) - swap `mode` on the frontned to `interactive` to match the backend. Thanks [@pngwn](https://github.com/pngwn)!
- [#6118](https://github.com/gradio-app/gradio/pull/6118) [`88bccfdba`](https://github.com/gradio-app/gradio/commit/88bccfdba3df2df4b2747ea5d649ed528047cf50) - Improve Video Component. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6126](https://github.com/gradio-app/gradio/pull/6126) [`865a22d5c`](https://github.com/gradio-app/gradio/commit/865a22d5c60fd97aeca968e55580b403743a23ec) - Refactor `Blocks.load()` so that it is in the same style as the other listeners. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6157](https://github.com/gradio-app/gradio/pull/6157) [`db143bdd1`](https://github.com/gradio-app/gradio/commit/db143bdd13b830f3bfd513bbfbc0cd1403522b84) - Make output components not editable if they are being updated. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6069](https://github.com/gradio-app/gradio/pull/6069) [`bf127e124`](https://github.com/gradio-app/gradio/commit/bf127e1241a41401e144874ea468dff8474eb505) - Swap websockets for SSE. Thanks [@aliabid94](https://github.com/aliabid94)!

## 1.9.0-beta.2

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5966](https://github.com/gradio-app/gradio/pull/5966) [`9cad2127b`](https://github.com/gradio-app/gradio/commit/9cad2127b965023687470b3abfe620e188a9da6e) - Improve Audio Component. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5955](https://github.com/gradio-app/gradio/pull/5955) [`825c9cddc`](https://github.com/gradio-app/gradio/commit/825c9cddc83a09457d8c85ebeecb4bc705572d82) - Fix dev mode model3D. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6107](https://github.com/gradio-app/gradio/pull/6107) [`9a40de7bf`](https://github.com/gradio-app/gradio/commit/9a40de7bff5844c8a135e73c7d175eb02b63a966) - Fix: Move to cache in init postprocess + Fallback Fixes. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6089](https://github.com/gradio-app/gradio/pull/6089) [`cd8146ba0`](https://github.com/gradio-app/gradio/commit/cd8146ba053fbcb56cf5052e658e4570d457fb8a) - Update logos for v4. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5996](https://github.com/gradio-app/gradio/pull/5996) [`9cf40f76f`](https://github.com/gradio-app/gradio/commit/9cf40f76fed1c0f84b5a5336a9b0100f8a9b4ee3) - V4: Simple dropdown. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5990](https://github.com/gradio-app/gradio/pull/5990) [`85056de5c`](https://github.com/gradio-app/gradio/commit/85056de5cd4e90a10cbfcefab74037dbc622b26b) - V4: Simple textbox. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6065](https://github.com/gradio-app/gradio/pull/6065) [`7d07001e8`](https://github.com/gradio-app/gradio/commit/7d07001e8e7ca9cbd2251632667b3a043de49f49) - fix storybook. Thanks [@pngwn](https://github.com/pngwn)!
- [#5826](https://github.com/gradio-app/gradio/pull/5826) [`ce036c5d4`](https://github.com/gradio-app/gradio/commit/ce036c5d47e741e29812654bcc641ea6be876504) - Pending events behavior. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!
- [#6076](https://github.com/gradio-app/gradio/pull/6076) [`f3f98f923`](https://github.com/gradio-app/gradio/commit/f3f98f923c9db506284b8440e18a3ac7ddd8398b) - Lite error handler. Thanks [@whitphx](https://github.com/whitphx)!

## 1.9.0-beta.1

### Patch Changes

- Updated dependencies [[`174b73619`](https://github.com/gradio-app/gradio/commit/174b736194756e23f51bbaf6f850bac5f1ca95b5), [`5fbda0bd2`](https://github.com/gradio-app/gradio/commit/5fbda0bd2b2bbb2282249b8875d54acf87cd7e84)]:
  - @gradio/wasm@0.2.0-beta.1
  - @gradio/audio@0.4.0-beta.7
  - @gradio/image@0.3.0-beta.7
  - @gradio/video@0.1.0-beta.7
  - @gradio/gallery@0.4.0-beta.7
  - @gradio/row@0.1.0-beta.1

## 1.9.0-beta.0

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!
- [#5956](https://github.com/gradio-app/gradio/pull/5956) [`f769876e0`](https://github.com/gradio-app/gradio/commit/f769876e0fa62336425c4e8ada5e09f38353ff01) - Apply formatter (and small refactoring) to the Lite-related frontend code. Thanks [@whitphx](https://github.com/whitphx)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Adds the ability to build the frontend and backend of custom components in preparation for publishing to pypi using `gradio_component build`. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Reinstate types that were removed in error in #5832. Thanks [@pngwn](https://github.com/pngwn)!

## 1.8.0

### Features

- [#5627](https://github.com/gradio-app/gradio/pull/5627) [`b67115e8e`](https://github.com/gradio-app/gradio/commit/b67115e8e6e489fffd5271ea830211863241ddc5) - Lite: Make the Examples component display media files using pseudo HTTP requests to the Wasm server. Thanks [@whitphx](https://github.com/whitphx)!
- [#5886](https://github.com/gradio-app/gradio/pull/5886) [`121f25b2d`](https://github.com/gradio-app/gradio/commit/121f25b2d50a33e1e06721b79e20b4f5651987ba) - Lite: Fix is_self_host() to detect `127.0.0.1` as localhost as well. Thanks [@whitphx](https://github.com/whitphx)!

## 1.7.1

### Patch Changes

- Updated dependencies [[`796145e2c`](https://github.com/gradio-app/gradio/commit/796145e2c48c4087bec17f8ec0be4ceee47170cb)]:
  - @gradio/client@0.5.1
  - @gradio/file@0.2.1
  - @gradio/fileexplorer@0.2.1
  - @gradio/uploadbutton@0.0.11

## 1.7.0

### Highlights

#### new `FileExplorer` component ([#5672](https://github.com/gradio-app/gradio/pull/5672) [`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e))

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function.

Users can then navigate the virtual filesystem and select files which will be accessible in your predict function. This component will allow developers to build more complex spaces, with more flexible input options.

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).

Thanks [@aliabid94](https://github.com/aliabid94)!

### Fixes

- [#5794](https://github.com/gradio-app/gradio/pull/5794) [`f096c3ae1`](https://github.com/gradio-app/gradio/commit/f096c3ae168c0df00f90fe131c1e48c572e0574b) - Throw helpful error when media devices are not found. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.6.4

### Features

- [#5124](https://github.com/gradio-app/gradio/pull/5124) [`6e56a0d9b`](https://github.com/gradio-app/gradio/commit/6e56a0d9b0c863e76c69e1183d9d40196922b4cd) - Lite: Websocket queueing. Thanks [@whitphx](https://github.com/whitphx)!

## 1.6.3

### Patch Changes

- Updated dependencies [[`abb5e9df4`](https://github.com/gradio-app/gradio/commit/abb5e9df47989b2c56c2c312d74944678f9f2d4e), [`e842a561a`](https://github.com/gradio-app/gradio/commit/e842a561af4394f8109291ee5725bcf74743e816), [`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2), [`502054848`](https://github.com/gradio-app/gradio/commit/502054848fdbe39fc03ec42445242b4e49b7affc), [`2a5b9e03b`](https://github.com/gradio-app/gradio/commit/2a5b9e03b15ea324d641fe6982f26d81b1ca7210)]:
  - @gradio/gallery@0.4.1
  - @gradio/chatbot@0.5.0
  - @gradio/dataframe@0.3.0
  - @gradio/markdown@0.3.0
  - @gradio/icons@0.2.0
  - @gradio/annotatedimage@0.2.1
  - @gradio/atoms@0.1.3
  - @gradio/audio@0.3.6
  - @gradio/code@0.2.1
  - @gradio/dropdown@0.3.1
  - @gradio/file@0.1.5
  - @gradio/form@0.0.6
  - @gradio/highlightedtext@0.3.2
  - @gradio/image@0.3.1
  - @gradio/json@0.1.1
  - @gradio/label@0.2.1
  - @gradio/model3d@0.2.3
  - @gradio/plot@0.2.1
  - @gradio/statustracker@0.2.1
  - @gradio/textbox@0.4.1
  - @gradio/timeseries@0.0.7
  - @gradio/upload@0.3.1
  - @gradio/video@0.0.10
  - @gradio/accordion@0.1.1
  - @gradio/box@0.0.5
  - @gradio/checkbox@0.2.1
  - @gradio/checkboxgroup@0.3.1
  - @gradio/colorpicker@0.1.3
  - @gradio/html@0.0.5
  - @gradio/number@0.3.1
  - @gradio/radio@0.3.1
  - @gradio/slider@0.2.1
  - @gradio/row@0.0.1
  - @gradio/button@0.2.1
  - @gradio/uploadbutton@0.0.8

## 1.6.2

### Features

- [#5721](https://github.com/gradio-app/gradio/pull/5721) [`84e03fe50`](https://github.com/gradio-app/gradio/commit/84e03fe506e08f1f81bac6d504c9fba7924f2d93) - Adds copy buttons to website, and better descriptions to API Docs. Thanks [@aliabd](https://github.com/aliabd)!

### Fixes

- [#5705](https://github.com/gradio-app/gradio/pull/5705) [`78e7cf516`](https://github.com/gradio-app/gradio/commit/78e7cf5163e8d205e8999428fce4c02dbdece25f) - ensure internal data has updated before dispatching `success` or `then` events. Thanks [@pngwn](https://github.com/pngwn)!
- [#5726](https://github.com/gradio-app/gradio/pull/5726) [`96c4b97c7`](https://github.com/gradio-app/gradio/commit/96c4b97c742311e90a87d8e8ee562c6ad765e9f0) - Adjust translation. Thanks [@ylhsieh](https://github.com/ylhsieh)!

## 1.6.1

### Patch Changes

- Updated dependencies [[`ee8eec1e5`](https://github.com/gradio-app/gradio/commit/ee8eec1e5e544a0127e0aa68c2522a7085b8ada5)]:
  - @gradio/markdown@0.2.2
  - @gradio/chatbot@0.4.1
  - @gradio/dataframe@0.2.4

## 1.6.0

### Features

- [#5639](https://github.com/gradio-app/gradio/pull/5639) [`e1874aff8`](https://github.com/gradio-app/gradio/commit/e1874aff814d13b23f3e59ef239cc13e18ad3fa7) - Add `gr.on` listener method. Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.5.4

### Features

- [#5514](https://github.com/gradio-app/gradio/pull/5514) [`52f783175`](https://github.com/gradio-app/gradio/commit/52f7831751b432411e109bd41add4ab286023a8e) - refactor: Use package.json for version management. Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!

## 1.5.3

### Fixes

- [#5562](https://github.com/gradio-app/gradio/pull/5562) [`50d9747d0`](https://github.com/gradio-app/gradio/commit/50d9747d061962cff7f60a8da648bb3781794102) - chore(deps): update dependency iframe-resizer to v4.3.7. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5550](https://github.com/gradio-app/gradio/pull/5550) [`4ed5902e7`](https://github.com/gradio-app/gradio/commit/4ed5902e7dda2d95cd43e4ccaaef520ddd8eba57) - Adding basque language. Thanks [@EkhiAzur](https://github.com/EkhiAzur)!

## 1.5.2

### Patch Changes

- Updated dependencies [[`a0cc9ac9`](https://github.com/gradio-app/gradio/commit/a0cc9ac931554e06dcb091158c9b9ac0cc580b6c)]:
  - @gradio/dropdown@0.2.2

## 1.5.1

### Patch Changes

- Updated dependencies [[`dc86e4a7`](https://github.com/gradio-app/gradio/commit/dc86e4a7e1c40b910c74558e6f88fddf9b3292bc), [`21f1db40`](https://github.com/gradio-app/gradio/commit/21f1db40de6d1717eba97a550e11422a457ba7e9)]:
  - @gradio/gallery@0.3.3
  - @gradio/image@0.2.3
  - @gradio/dropdown@0.2.1
  - @gradio/row@0.0.1
  - @gradio/video@0.0.7

## 1.5.0

### Features

- [#5505](https://github.com/gradio-app/gradio/pull/5505) [`9ee20f49`](https://github.com/gradio-app/gradio/commit/9ee20f499f62c1fe5af6b8f84918b3a334eb1c8d) - Validate i18n file names with ISO-639x. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5475](https://github.com/gradio-app/gradio/pull/5475) [`c60b89b0`](https://github.com/gradio-app/gradio/commit/c60b89b0a54758a27277f0a6aa20d0653647c7c8) - Adding Central Kurdish. Thanks [@Hrazhan](https://github.com/Hrazhan)!
- [#5400](https://github.com/gradio-app/gradio/pull/5400) [`d112e261`](https://github.com/gradio-app/gradio/commit/d112e2611b0fc79ecedfaed367571f3157211387) - Allow interactive input in `gr.HighlightedText`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.4.3

### Patch Changes

- Updated dependencies [[`6e381c4f`](https://github.com/gradio-app/gradio/commit/6e381c4f146cc8177a4e2b8e39f914f09cd7ff0c)]:
  - @gradio/dataframe@0.2.2

## 1.4.2

### Fixes

- [#5447](https://github.com/gradio-app/gradio/pull/5447) [`7a4a89e5`](https://github.com/gradio-app/gradio/commit/7a4a89e5ca1dedb39e5366867501584b0c636bbb) - ensure iframe is correct size on spaces. Thanks [@pngwn](https://github.com/pngwn)!

## 1.4.1

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912), [`d14d63e3`](https://github.com/gradio-app/gradio/commit/d14d63e30c4af3f9c2a664fd11b0a01943a8300c), [`26fef8c7`](https://github.com/gradio-app/gradio/commit/26fef8c7f85a006c7e25cdbed1792df19c512d02)]:
  - @gradio/dataframe@0.2.0
  - @gradio/markdown@0.2.0
  - @gradio/statustracker@0.2.0
  - @gradio/theme@0.1.0
  - @gradio/textbox@0.2.0
  - @gradio/client@0.3.1
  - @gradio/chatbot@0.3.1
  - @gradio/accordion@0.0.4
  - @gradio/annotatedimage@0.1.2
  - @gradio/audio@0.3.2
  - @gradio/checkbox@0.1.3
  - @gradio/checkboxgroup@0.1.2
  - @gradio/code@0.1.2
  - @gradio/colorpicker@0.1.2
  - @gradio/dropdown@0.1.3
  - @gradio/file@0.1.2
  - @gradio/gallery@0.3.2
  - @gradio/highlightedtext@0.2.3
  - @gradio/html@0.0.4
  - @gradio/image@0.2.2
  - @gradio/json@0.0.5
  - @gradio/label@0.1.2
  - @gradio/model3d@0.2.1
  - @gradio/number@0.2.2
  - @gradio/plot@0.1.2
  - @gradio/radio@0.1.2
  - @gradio/slider@0.1.2
  - @gradio/timeseries@0.0.5
  - @gradio/video@0.0.6
  - @gradio/utils@0.1.1
  - @gradio/uploadbutton@0.0.5
  - @gradio/row@0.0.1
  - @gradio/atoms@0.1.2
  - @gradio/button@0.1.3
  - @gradio/form@0.0.5
  - @gradio/tabitem@0.0.4
  - @gradio/tabs@0.0.5
  - @gradio/box@0.0.4
  - @gradio/upload@0.2.1

## 1.4.0

### Features

- [#5267](https://github.com/gradio-app/gradio/pull/5267) [`119c8343`](https://github.com/gradio-app/gradio/commit/119c834331bfae60d4742c8f20e9cdecdd67e8c2) - Faster reload mode. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5373](https://github.com/gradio-app/gradio/pull/5373) [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96) - Adds `height` and `zoom_speed` parameters to `Model3D` component, as well as a button to reset the camera position. Thanks [@abidlabs](https://github.com/abidlabs)!

## 1.3.2

### Patch Changes

- Updated dependencies [[`5f25eb68`](https://github.com/gradio-app/gradio/commit/5f25eb6836f6a78ce6208b53495a01e1fc1a1d2f), [`3341148c`](https://github.com/gradio-app/gradio/commit/3341148c109b5458cc88435d27eb154210efc472), [`df090e89`](https://github.com/gradio-app/gradio/commit/df090e89f74a16e4cb2b700a1e3263cabd2bdd91)]:
  - @gradio/highlightedtext@0.2.1
  - @gradio/chatbot@0.2.2
  - @gradio/checkbox@0.1.1

## 1.3.1

### Fixes

- [#5324](https://github.com/gradio-app/gradio/pull/5324) [`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19) - ensure login form has correct styles. Thanks [@pngwn](https://github.com/pngwn)!

## 1.3.0

### Highlights

#### Improve startup performance and markdown support ([#5279](https://github.com/gradio-app/gradio/pull/5279) [`fe057300`](https://github.com/gradio-app/gradio/commit/fe057300f0672c62dab9d9b4501054ac5d45a4ec))

##### Improved markdown support

We now have better support for markdown in `gr.Markdown` and `gr.Dataframe`. Including syntax highlighting and Github Flavoured Markdown. We also have more consistent markdown behaviour and styling.

##### Various performance improvements

These improvements will be particularly beneficial to large applications.

- Rather than attaching events manually, they are now delegated, leading to a significant performance improvement and addressing a performance regression introduced in a recent version of Gradio. App startup for large applications is now around twice as fast.
- Optimised the mounting of individual components, leading to a modest performance improvement during startup (~30%).
- Corrected an issue that was causing markdown to re-render infinitely.
- Ensured that the `gr.3DModel` does re-render prematurely.

Thanks [@pngwn](https://github.com/pngwn)!

#### Add `render` function to `<gradio-app>` ([#5158](https://github.com/gradio-app/gradio/pull/5158) [`804fcc05`](https://github.com/gradio-app/gradio/commit/804fcc058e147f283ece67f1f353874e26235535))

We now have an event `render` on the <gradio-app> web component, which is triggered once the embedded space has finished rendering.

```html
<script>
  function handleLoadComplete() {
    console.log("Embedded space has finished rendering");
  }
  const gradioApp = document.querySelector("gradio-app");
  gradioApp.addEventListener("render", handleLoadComplete);
</script>
```

Thanks [@hannahblair](https://github.com/hannahblair)!

### Features

- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications. Thanks [@pngwn](https://github.com/pngwn)!
- [#5216](https://github.com/gradio-app/gradio/pull/5216) [`4b58ea6d`](https://github.com/gradio-app/gradio/commit/4b58ea6d98e7a43b3f30d8a4cb6f379bc2eca6a8) - Update i18n tokens and locale files. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5219](https://github.com/gradio-app/gradio/pull/5219) [`e8fd4e4e`](https://github.com/gradio-app/gradio/commit/e8fd4e4ec68a6c974bc8c84b61f4a0ec50a85bc6) - Add `api_name` parameter to `gr.Interface`. Additionally, completely hide api page if show_api=False. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5264](https://github.com/gradio-app/gradio/pull/5264) [`46a2b600`](https://github.com/gradio-app/gradio/commit/46a2b600a7ff030a9ea1560b882b3bf3ad266bbc) - ensure translations for audio work correctly. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5285](https://github.com/gradio-app/gradio/pull/5285) [`cdfd4217`](https://github.com/gradio-app/gradio/commit/cdfd42174a9c777eaee9c1209bf8e90d8c7791f2) - Tweaks to `icon` parameter in `gr.Button()`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5312](https://github.com/gradio-app/gradio/pull/5312) [`f769cb67`](https://github.com/gradio-app/gradio/commit/f769cb67149d8e209091508f06d87014acaed965) - only start listening for events after the components are mounted. Thanks [@pngwn](https://github.com/pngwn)!
- [#5276](https://github.com/gradio-app/gradio/pull/5276) [`502f1015`](https://github.com/gradio-app/gradio/commit/502f1015bf23b365bc32446dd2e549b0c5d0dc72) - Ensure `Blocks` translation copy renders correctly. Thanks [@hannahblair](https://github.com/hannahblair)!

## 1.2.0

### Highlights

#### Client.predict will now return the final output for streaming endpoints ([#5057](https://github.com/gradio-app/gradio/pull/5057) [`35856f8b`](https://github.com/gradio-app/gradio/commit/35856f8b54548cae7bd3b8d6a4de69e1748283b2))

### This is a breaking change (for gradio_client only)!

Previously, `Client.predict` would only return the first output of an endpoint that streamed results. This was causing confusion for developers that wanted to call these streaming demos via the client.

We realize that developers using the client don't know the internals of whether a demo streams or not, so we're changing the behavior of predict to match developer expectations.

Using `Client.predict` will now return the final output of a streaming endpoint. This will make it even easier to use gradio apps via the client.

Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Features

- [#5025](https://github.com/gradio-app/gradio/pull/5025) [`6693660a`](https://github.com/gradio-app/gradio/commit/6693660a790996f8f481feaf22a8c49130d52d89) - Add download button to selected images in `Gallery`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5046](https://github.com/gradio-app/gradio/pull/5046) [`5244c587`](https://github.com/gradio-app/gradio/commit/5244c5873c355cf3e2f0acb7d67fda3177ef8b0b) - Allow new lines in `HighlightedText` with `/n` and preserve whitespace. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5047](https://github.com/gradio-app/gradio/pull/5047) [`883ac364`](https://github.com/gradio-app/gradio/commit/883ac364f69d92128774ac446ce49bdf8415fd7b) - Add `step` param to `Number`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5005](https://github.com/gradio-app/gradio/pull/5005) [`f5539c76`](https://github.com/gradio-app/gradio/commit/f5539c7618e31451420bd3228754774da14dc65f) - Enhancement: Add focus event to textbox and number component. Thanks [@JodyZ0203](https://github.com/JodyZ0203)!
- [#5136](https://github.com/gradio-app/gradio/pull/5136) [`eaa1ce14`](https://github.com/gradio-app/gradio/commit/eaa1ce14ac41de1c23321e93f11f1b03a2f3c7f4) - Enhancing Tamil Translation: Language Refinement 🌟. Thanks [@sanjaiyan-dev](https://github.com/sanjaiyan-dev)!

## 1.1.0

### Features

- [#4995](https://github.com/gradio-app/gradio/pull/4995) [`3f8c210b`](https://github.com/gradio-app/gradio/commit/3f8c210b01ef1ceaaf8ee73be4bf246b5b745bbf) - Implement left and right click in `Gallery` component and show implicit images in `Gallery` grid. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#4993](https://github.com/gradio-app/gradio/pull/4993) [`dc07a9f9`](https://github.com/gradio-app/gradio/commit/dc07a9f947de44b419d8384987a02dcf94977851) - Bringing back the "Add download button for audio" PR by [@leuryr](https://github.com/leuryr). Thanks [@abidlabs](https://github.com/abidlabs)!
- [#4979](https://github.com/gradio-app/gradio/pull/4979) [`44ac8ad0`](https://github.com/gradio-app/gradio/commit/44ac8ad08d82ea12c503dde5c78f999eb0452de2) - Allow setting sketch color default. Thanks [@aliabid94](https://github.com/aliabid94)!
