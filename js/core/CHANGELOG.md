# @gradio/core

## 0.1.1

### Dependency updates

- @gradio/code@0.10.2
- @gradio/file@0.10.2
- @gradio/upload@0.13.1
- @gradio/image@0.16.2
- @gradio/video@0.11.2
- @gradio/button@0.3.1
- @gradio/wasm@0.14.1
- @gradio/gallery@0.13.2

## 0.1.1

### Features

- [#9617](https://github.com/gradio-app/gradio/pull/9617) [`c163182`](https://github.com/gradio-app/gradio/commit/c163182d1b752ef91629f9caa13bf3cce0fb0869) - Fix dark mode detection and container height.  Thanks @pngwn!

### Dependency updates

- @gradio/code@0.10.1
- @gradio/paramviewer@0.5.1
- @gradio/video@0.11.1
- @gradio/statustracker@0.8.1
- @gradio/gallery@0.13.1
- @gradio/markdown@0.10.1
- @gradio/plot@0.7.1
- @gradio/textbox@0.7.1
- @gradio/column@0.2.0
- @gradio/checkbox@0.4.1
- @gradio/file@0.10.1
- @gradio/image@0.16.1

## 0.1.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - SSR e2e + fixes
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix reload mode and streaming in 5.0 dev
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Disable liking user message in chatbot by default but make it configurable
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Adds ability to block event trigger when file is uploading
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Open audio/image input stream only when queue is ready
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Streaming Guides
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Send Streaming data over Websocket if possible. Also support base64 output format for images.
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Allow `info=` to render markdown
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Remove lite/theme.css from the Git-managed file tree
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Update gr.Dataframe UI with action popover
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Video gallery
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix reload mode
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Streaming inputs for 5.0
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - fix SSR apps on spaces
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix plots
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ssr part 2
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - prefix api routes

### Fixes


- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Trigger state change event on iterators

## 0.1.0-beta.6

### Features

- [#9590](https://github.com/gradio-app/gradio/pull/9590) [`e853c41`](https://github.com/gradio-app/gradio/commit/e853c413583d91186aef3aceb0849d0ec0494834) - SSR e2e + fixes.  Thanks @pngwn!
- [#9575](https://github.com/gradio-app/gradio/pull/9575) [`4ec2feb`](https://github.com/gradio-app/gradio/commit/4ec2feb04e452d2c77482c09543c59948567be67) - Update gr.Dataframe UI with action popover.  Thanks @hannahblair!
- [#9576](https://github.com/gradio-app/gradio/pull/9576) [`430a26a`](https://github.com/gradio-app/gradio/commit/430a26a4fbcbabb5e9ddb6173bf658a00960e88e) - Fix reload mode.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/upload@0.13.0-beta.7
- @gradio/statustracker@0.8.0-beta.5
- @gradio/code@0.10.0-beta.8
- @gradio/paramviewer@0.4.22-beta.5
- @gradio/tabitem@0.3.0-beta.4
- @gradio/tabs@0.3.0-beta.3
- @gradio/icons@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.5
- @gradio/image@0.16.0-beta.7
- @gradio/video@0.11.0-beta.7
- @gradio/button@0.3.0-beta.7
- @gradio/markdown@0.10.0-beta.5
- @gradio/gallery@0.13.0-beta.7
- @gradio/plot@0.7.0-beta.6
- @gradio/column@0.2.0-beta.2
- @gradio/textbox@0.7.0-beta.5
- @gradio/checkbox@0.4.0-beta.5
- @gradio/file@0.10.0-beta.7

## 0.1.0-beta.5

### Features

- [#9483](https://github.com/gradio-app/gradio/pull/9483) [`8dc7c12`](https://github.com/gradio-app/gradio/commit/8dc7c12389311b60efcde1b9d3e3668a34d2dc00) - Send Streaming data over Websocket if possible. Also support base64 output format for images.  Thanks @freddyaboulton!
- [#9521](https://github.com/gradio-app/gradio/pull/9521) [`06ef22e`](https://github.com/gradio-app/gradio/commit/06ef22e83cdd27e7afb381396d153d9db3dea16e) - Allow `info=` to render markdown.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/tabitem@0.3.0-beta.4
- @gradio/code@0.10.0-beta.7
- @gradio/paramviewer@0.4.22-beta.4
- @gradio/video@0.11.0-beta.6
- @gradio/statustracker@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.4
- @gradio/client@1.6.0-beta.4
- @gradio/upload@0.13.0-beta.6
- @gradio/image@0.16.0-beta.6
- @gradio/gallery@0.13.0-beta.6
- @gradio/markdown@0.10.0-beta.4
- @gradio/plot@0.7.0-beta.5
- @gradio/column@0.2.0-beta.2
- @gradio/button@0.3.0-beta.6
- @gradio/textbox@0.7.0-beta.4
- @gradio/checkbox@0.4.0-beta.4
- @gradio/file@0.10.0-beta.6

## 0.1.0-beta.4

### Dependency updates

- @gradio/code@0.10.0-beta.6

## 0.1.0-beta.4

### Dependency updates

- @gradio/upload@0.13.0-beta.5
- @gradio/statustracker@0.8.0-beta.3
- @gradio/video@0.11.0-beta.5
- @gradio/tabs@0.3.0-beta.3
- @gradio/column@0.2.0-beta.1
- @gradio/tabitem@0.3.0-beta.3
- @gradio/code@0.10.0-beta.5
- @gradio/paramviewer@0.4.22-beta.3
- @gradio/icons@0.8.0-beta.3
- @gradio/atoms@0.9.0-beta.3
- @gradio/button@0.3.0-beta.5
- @gradio/markdown@0.10.0-beta.3
- @gradio/gallery@0.13.0-beta.5
- @gradio/plot@0.7.0-beta.4
- @gradio/file@0.10.0-beta.5
- @gradio/checkbox@0.4.0-beta.3
- @gradio/image@0.16.0-beta.5
- @gradio/textbox@0.7.0-beta.3

## 0.1.0-beta.4

### Features

- [#9464](https://github.com/gradio-app/gradio/pull/9464) [`3ac5d9c`](https://github.com/gradio-app/gradio/commit/3ac5d9c972576d82bc365a6532e6e12f55441a30) - Fix plots.  Thanks @pngwn!

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2
- @gradio/upload@0.13.0-beta.4
- @gradio/button@0.3.0-beta.4
- @gradio/markdown@0.10.0-beta.2
- @gradio/textbox@0.7.0-beta.2
- @gradio/checkbox@0.4.0-beta.2
- @gradio/file@0.10.0-beta.4
- @gradio/image@0.16.0-beta.4
- @gradio/video@0.11.0-beta.4
- @gradio/code@0.10.0-beta.4
- @gradio/paramviewer@0.4.22-beta.2
- @gradio/wasm@0.14.0-beta.3
- @gradio/plot@0.7.0-beta.3
- @gradio/gallery@0.13.0-beta.4

## 0.1.0-beta.3

### Features

- [#9412](https://github.com/gradio-app/gradio/pull/9412) [`c2c2fd9`](https://github.com/gradio-app/gradio/commit/c2c2fd989348f826566773c07c0e0bda200199ff) - fix SSR apps on spaces.  Thanks @pngwn!

### Dependency updates

- @gradio/upload@0.13.0-beta.3
- @gradio/video@0.11.0-beta.3
- @gradio/code@0.10.0-beta.3
- @gradio/client@1.6.0-beta.3
- @gradio/button@0.3.0-beta.3
- @gradio/gallery@0.13.0-beta.3
- @gradio/file@0.10.0-beta.3
- @gradio/image@0.16.0-beta.3

## 0.1.0-beta.2

### Features

- [#9323](https://github.com/gradio-app/gradio/pull/9323) [`06babda`](https://github.com/gradio-app/gradio/commit/06babda0395fd3fbd323c1c3cb33704ecfd6deb0) - Disable liking user message in chatbot by default but make it configurable.  Thanks @freddyaboulton!
- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!
- [#9269](https://github.com/gradio-app/gradio/pull/9269) [`e05f568`](https://github.com/gradio-app/gradio/commit/e05f568f47e9fa33ef91dbbe5cc477d32762bc36) - Fix reload mode and streaming in 5.0 dev.  Thanks @freddyaboulton!
- [#9253](https://github.com/gradio-app/gradio/pull/9253) [`99648ec`](https://github.com/gradio-app/gradio/commit/99648ec7c4443e74799941e47b0015ac9ca581e1) - Adds ability to block event trigger when file is uploading.  Thanks @dawoodkhan82!
- [#9335](https://github.com/gradio-app/gradio/pull/9335) [`b543465`](https://github.com/gradio-app/gradio/commit/b543465d06d7d1b399c4d0755da05e022611a97f) - Remove lite/theme.css from the Git-managed file tree.  Thanks @whitphx!

### Fixes

- [#9299](https://github.com/gradio-app/gradio/pull/9299) [`aa35b07`](https://github.com/gradio-app/gradio/commit/aa35b0788e613fdd45446d267513e6f94fa208ea) - Trigger state change event on iterators.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/atoms@0.9.0-beta.2
- @gradio/gallery@0.13.0-beta.2
- @gradio/upload@0.13.0-beta.2
- @gradio/wasm@0.14.0-beta.2
- @gradio/markdown@0.10.0-beta.2
- @gradio/client@1.6.0-beta.2
- @gradio/icons@0.8.0-beta.2
- @gradio/statustracker@0.8.0-beta.2
- @gradio/utils@0.7.0-beta.2
- @gradio/plot@0.6.5-beta.2
- @gradio/button@0.3.0-beta.2
- @gradio/file@0.10.0-beta.2
- @gradio/image@0.16.0-beta.2
- @gradio/video@0.11.0-beta.2
- @gradio/code@0.10.0-beta.2
- @gradio/paramviewer@0.4.22-beta.2
- @gradio/checkbox@0.4.0-beta.2
- @gradio/column@0.2.0-beta.0
- @gradio/textbox@0.7.0-beta.2
- @gradio/tabs@0.3.0-beta.2

## 0.1.0-beta.1

### Features

- [#9200](https://github.com/gradio-app/gradio/pull/9200) [`2e179d3`](https://github.com/gradio-app/gradio/commit/2e179d35be6ed60a5a6bfc7303178d63e41781ad) - prefix api routes.  Thanks @pngwn!

### Dependency updates

- @gradio/video@0.11.0-beta.1
- @gradio/atoms@0.8.1-beta.1
- @gradio/icons@0.8.0-beta.1
- @gradio/statustracker@0.8.0-beta.1
- @gradio/utils@0.7.0-beta.1
- @gradio/client@1.6.0-beta.1
- @gradio/image@0.16.0-beta.1
- @gradio/upload@0.12.4-beta.1
- @gradio/markdown@0.9.4-beta.1
- @gradio/wasm@0.13.1-beta.1
- @gradio/theme@0.3.0-beta.1
- @gradio/gallery@0.13.0-beta.1
- @gradio/plot@0.6.5-beta.1
- @gradio/tabs@0.3.0-beta.1
- @gradio/column@0.2.0-beta.0
- @gradio/button@0.3.0-beta.1
- @gradio/textbox@0.7.0-beta.1
- @gradio/code@0.9.1-beta.1
- @gradio/paramviewer@0.4.22-beta.1
- @gradio/file@0.9.4-beta.1
- @gradio/checkbox@0.4.0-beta.1

## 0.1.0-beta.0

### Features

- [#9149](https://github.com/gradio-app/gradio/pull/9149) [`3d7a9b8`](https://github.com/gradio-app/gradio/commit/3d7a9b81f6fef06187eca832471dc1692eb493a0) - Open audio/image input stream only when queue is ready.  Thanks @freddyaboulton!
- [#9173](https://github.com/gradio-app/gradio/pull/9173) [`66349fe`](https://github.com/gradio-app/gradio/commit/66349fe26827e3a3c15b738a1177e95fec7f5554) - Streaming Guides.  Thanks @freddyaboulton!
- [#9052](https://github.com/gradio-app/gradio/pull/9052) [`f3652eb`](https://github.com/gradio-app/gradio/commit/f3652ebe08211e12739df73c15fd97e5ff81276a) - Video gallery.  Thanks @dawoodkhan82!
- [#8941](https://github.com/gradio-app/gradio/pull/8941) [`97a7bf6`](https://github.com/gradio-app/gradio/commit/97a7bf66a79179d1b91a3199d68e5c11216ca500) - Streaming inputs for 5.0.  Thanks @freddyaboulton!

## 0.0.4

### Dependency updates

- @gradio/code@0.9.1
- @gradio/paramviewer@0.4.22

## 0.0.4

### Fixes

- [#9188](https://github.com/gradio-app/gradio/pull/9188) [`8f8e1c6`](https://github.com/gradio-app/gradio/commit/8f8e1c6a0b09b0d1985b8377d94d693cb00f8a18) - Fix multiple trigger bug when function has js.  Thanks @freddyaboulton!

## 0.0.3

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/code@0.9.1
- @gradio/paramviewer@0.4.22
- @gradio/utils@0.6.1
- @gradio/statustracker@0.7.6
- @gradio/atoms@0.8.1
- @gradio/icons@0.7.2
- @gradio/wasm@0.13.1
- @gradio/client@1.5.2
- @gradio/upload@0.12.4
- @gradio/button@0.2.51
- @gradio/markdown@0.9.4
- @gradio/gallery@0.12.2
- @gradio/theme@0.2.5
- @gradio/plot@0.6.5
- @gradio/textbox@0.7.0
- @gradio/image@0.15.1
- @gradio/video@0.10.4
- @gradio/file@0.9.4
- @gradio/checkbox@0.3.13
- @gradio/column@0.1.4
- @gradio/tabs@0.2.14

## 0.0.2

### Features

- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!
- [#9102](https://github.com/gradio-app/gradio/pull/9102) [`efdc323`](https://github.com/gradio-app/gradio/commit/efdc3231a7bde38cfe45d10086d0d36a24c1b9b4) - Initial SSR refactor.  Thanks @pngwn!

### Dependency updates

- @gradio/code@0.9.0
- @gradio/paramviewer@0.4.21
- @gradio/utils@0.6.0
- @gradio/upload@0.12.3
- @gradio/atoms@0.8.0
- @gradio/button@0.2.50
- @gradio/client@1.5.1
- @gradio/markdown@0.9.3
- @gradio/statustracker@0.7.5
- @gradio/theme@0.2.4
- @gradio/wasm@0.13.0
- @gradio/gallery@0.12.1
- @gradio/icons@0.7.1
- @gradio/plot@0.6.4
- @gradio/image@0.15.0
- @gradio/video@0.10.3
- @gradio/textbox@0.6.11
- @gradio/column@0.1.3
- @gradio/checkbox@0.3.12
- @gradio/file@0.9.3
- @gradio/tabs@0.2.13