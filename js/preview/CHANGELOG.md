# @gradio/preview

## 0.5.0

### Features

- [#6537](https://github.com/gradio-app/gradio/pull/6537) [`6d3fecfa4`](https://github.com/gradio-app/gradio/commit/6d3fecfa42dde1c70a60c397434c88db77289be6) - chore(deps): update all non-major dependencies.  Thanks [@renovate](https://github.com/apps/renovate)!

## 0.4.0

### Features

- [#6532](https://github.com/gradio-app/gradio/pull/6532) [`96290d304`](https://github.com/gradio-app/gradio/commit/96290d304a61064b52c10a54b2feeb09ca007542) - tweak deps.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6296](https://github.com/gradio-app/gradio/pull/6296) [`46f13f496`](https://github.com/gradio-app/gradio/commit/46f13f4968c8177e318c9d75f2eed1ed55c2c042) - chore(deps): update all non-major dependencies.  Thanks [@renovate](https://github.com/apps/renovate)!

## 0.3.0

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

## 0.2.2

### Features

- [#6467](https://github.com/gradio-app/gradio/pull/6467) [`739e3a5a0`](https://github.com/gradio-app/gradio/commit/739e3a5a09771a4a386cab0c6605156cf9fda7f6) - Fix dev mode.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.1

### Fixes

- [#6457](https://github.com/gradio-app/gradio/pull/6457) [`d00fcf89d`](https://github.com/gradio-app/gradio/commit/d00fcf89d1c3ecbc910e81bb1311479ec2b73e4e) - Gradio custom component dev mode now detects changes to Example.svelte file.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.0

### Features

- [#6261](https://github.com/gradio-app/gradio/pull/6261) [`8bbeca0e7`](https://github.com/gradio-app/gradio/commit/8bbeca0e772a5a2853d02a058b35abb2c15ffaf1) - Improve Embed and CDN handling and fix a couple of related bugs.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.1

### Fixes

- [#6191](https://github.com/gradio-app/gradio/pull/6191) [`b555bc09f`](https://github.com/gradio-app/gradio/commit/b555bc09ffe8e58b10da6227e2f11a0c084aa71d) - fix cdn build.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Adds the ability to build the frontend and backend of custom components in preparation for publishing to pypi using `gradio_component build`.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - fix cc build.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6171](https://github.com/gradio-app/gradio/pull/6171) [`28322422c`](https://github.com/gradio-app/gradio/commit/28322422cb9d8d3e471e439ad602959662e79312) - strip dangling svelte imports.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Strip vite import warning.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.8

### Features

- [#6094](https://github.com/gradio-app/gradio/pull/6094) [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.7

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6079](https://github.com/gradio-app/gradio/pull/6079) [`3b2d9eaa3`](https://github.com/gradio-app/gradio/commit/3b2d9eaa3e84de3e4a0799e4585a94510d665f26) - fix cc build.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6112](https://github.com/gradio-app/gradio/pull/6112) [`e402bf07a`](https://github.com/gradio-app/gradio/commit/e402bf07af637b0763291f6936583afc305f1e31) - fix build.  Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.6

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Add host to dev mode for vite.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Use tags to identify custom component dirs and ignore uninstalled components.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Adds the ability to build the frontend and backend of custom components in preparation for publishing to pypi using `gradio_component build`.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - In dev/build use full path to python/gradio executables.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5962](https://github.com/gradio-app/gradio/pull/5962) [`d298e7695`](https://github.com/gradio-app/gradio/commit/d298e76952289f87213e243e813dbce3cf09a5b3) - Strip vite import warning.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Better logs in dev mode.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.5

### Features

- [#5745](https://github.com/gradio-app/gradio/pull/5745) [`f2154eb7d`](https://github.com/gradio-app/gradio/commit/f2154eb7d871162bdf01e5f6bd903bed3a969f05) - Fix windows paths.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.0-beta.4

### Features

- [#5649](https://github.com/gradio-app/gradio/pull/5649) [`d56b355c1`](https://github.com/gradio-app/gradio/commit/d56b355c12ccdeeb8406a3520fecc15ae69d9141) - Fix front-end imports + other misc fixes.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.0-beta.3

### Features

- [#5648](https://github.com/gradio-app/gradio/pull/5648) [`c573e2339`](https://github.com/gradio-app/gradio/commit/c573e2339b86c85b378dc349de5e9223a3c3b04a) - Publish all components to npm.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.0-beta.2

### Features

- [#5630](https://github.com/gradio-app/gradio/pull/5630) [`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161) - Fix esbuild.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.1

### Features

- [#5624](https://github.com/gradio-app/gradio/pull/5624) [`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571) - Fix esbuild.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components.  Thanks [@pngwn](https://github.com/pngwn)!