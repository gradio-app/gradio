# @gradio/imageeditor

## 0.1.4

### Patch Changes

- Updated dependencies [[`5d51fbc`](https://github.com/gradio-app/gradio/commit/5d51fbce7826da840a2fd4940feb5d9ad6f1bc5a), [`34f9431`](https://github.com/gradio-app/gradio/commit/34f943101bf7dd6b8a8974a6131c1ed7c4a0dac0)]:
  - @gradio/upload@0.5.4
  - @gradio/client@0.9.1
  - @gradio/image@0.5.1

## 0.1.3

### Patch Changes

- Updated dependencies [[`6a9151d`](https://github.com/gradio-app/gradio/commit/6a9151d5c9432c724098da7d88a539aaaf5ffe88), [`21cfb0a`](https://github.com/gradio-app/gradio/commit/21cfb0acc309bb1a392f4d8a8e42f6be864c5978), [`d76bcaa`](https://github.com/gradio-app/gradio/commit/d76bcaaaf0734aaf49a680f94ea9d4d22a602e70), [`67ddd40`](https://github.com/gradio-app/gradio/commit/67ddd40b4b70d3a37cb1637c33620f8d197dbee0), [`053bec9`](https://github.com/gradio-app/gradio/commit/053bec98be1127e083414024e02cf0bebb0b5142), [`bdf81fe`](https://github.com/gradio-app/gradio/commit/bdf81fead86e1d5a29e6b036f1fff677f6480e6b), [`4d1cbbc`](https://github.com/gradio-app/gradio/commit/4d1cbbcf30833ef1de2d2d2710c7492a379a9a00), [`5177132`](https://github.com/gradio-app/gradio/commit/5177132d718c77f6d47869b4334afae6380394cb)]:
  - @gradio/image@0.5.0
  - @gradio/upload@0.5.3
  - @gradio/client@0.9.0
  - @gradio/wasm@0.4.0
  - @gradio/icons@0.3.2
  - @gradio/atoms@0.4.0
  - @gradio/statustracker@0.4.2

## 0.1.2

### Patch Changes

- Updated dependencies [[`b639e04`](https://github.com/gradio-app/gradio/commit/b639e040741e6c0d9104271c81415d7befbd8cf3), [`206af31`](https://github.com/gradio-app/gradio/commit/206af31d7c1a31013364a44e9b40cf8df304ba50)]:
  - @gradio/image@0.4.2
  - @gradio/icons@0.3.1
  - @gradio/atoms@0.3.1
  - @gradio/statustracker@0.4.1
  - @gradio/upload@0.5.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`71f1a1f99`](https://github.com/gradio-app/gradio/commit/71f1a1f9931489d465c2c1302a5c8d768a3cd23a)]:
  - @gradio/client@0.8.2
  - @gradio/image@0.4.1
  - @gradio/upload@0.5.1

## 0.1.0

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

### Fixes

- [#6502](https://github.com/gradio-app/gradio/pull/6502) [`070f71c93`](https://github.com/gradio-app/gradio/commit/070f71c933d846ce8e2fe11cdd9bc0f3f897f29f) - Ensure image editor crop and draw cursor works as expected when the scroll position changes. Thanks [@pngwn](https://github.com/pngwn)!

# @gradio/image
