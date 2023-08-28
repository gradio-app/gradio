# @gradio/client

## 0.2.1

### Features

- [#5173](https://github.com/gradio-app/gradio/pull/5173) [`730f0c1d`](https://github.com/gradio-app/gradio/commit/730f0c1d54792eb11359e40c9f2326e8a6e39203) - Ensure gradio client works as expected for functions that return nothing.  Thanks [@raymondtri](https://github.com/raymondtri)!

## 0.2.0

### Features

- [#5133](https://github.com/gradio-app/gradio/pull/5133) [`61129052`](https://github.com/gradio-app/gradio/commit/61129052ed1391a75c825c891d57fa0ad6c09fc8) - Update dependency esbuild to ^0.19.0. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5035](https://github.com/gradio-app/gradio/pull/5035) [`8b4eb8ca`](https://github.com/gradio-app/gradio/commit/8b4eb8cac9ea07bde31b44e2006ca2b7b5f4de36) - JS Client: Fixes cannot read properties of null (reading 'is_file'). Thanks [@raymondtri](https://github.com/raymondtri)!

### Fixes

- [#5075](https://github.com/gradio-app/gradio/pull/5075) [`67265a58`](https://github.com/gradio-app/gradio/commit/67265a58027ef1f9e4c0eb849a532f72eaebde48) - Allow supporting >1000 files in `gr.File()` and `gr.UploadButton()`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.4

### Patch Changes

- [#4717](https://github.com/gradio-app/gradio/pull/4717) [`ab5d1ea0`](https://github.com/gradio-app/gradio/commit/ab5d1ea0de87ed888779b66fd2a705583bd29e02) Thanks [@whitphx](https://github.com/whitphx)! - Fix the package description

## 0.1.3

### Patch Changes

- [#4357](https://github.com/gradio-app/gradio/pull/4357) [`0dbd8f7f`](https://github.com/gradio-app/gradio/commit/0dbd8f7fee4b4877f783fa7bc493f98bbfc3d01d) Thanks [@pngwn](https://github.com/pngwn)! - Various internal refactors and cleanups.

## 0.1.2

### Patch Changes

- [#4273](https://github.com/gradio-app/gradio/pull/4273) [`1d0f0a9d`](https://github.com/gradio-app/gradio/commit/1d0f0a9db096552e67eb2197c932342587e9e61e) Thanks [@pngwn](https://github.com/pngwn)! - Ensure websocket error messages are correctly handled.

- [#4315](https://github.com/gradio-app/gradio/pull/4315) [`b525b122`](https://github.com/gradio-app/gradio/commit/b525b122dd8569bbaf7e06db5b90d622d2e9073d) Thanks [@whitphx](https://github.com/whitphx)! - Refacor types.

- [#4271](https://github.com/gradio-app/gradio/pull/4271) [`1151c525`](https://github.com/gradio-app/gradio/commit/1151c5253554cb87ebd4a44a8a470ac215ff782b) Thanks [@pngwn](https://github.com/pngwn)! - Ensure the full root path is always respected when making requests to a gradio app server.

## 0.1.1

### Patch Changes

- [#4201](https://github.com/gradio-app/gradio/pull/4201) [`da5b4ee1`](https://github.com/gradio-app/gradio/commit/da5b4ee11721175858ded96e5710225369097f74) Thanks [@pngwn](https://github.com/pngwn)! - Ensure semiver is bundled so CDN links work correctly.

- [#4202](https://github.com/gradio-app/gradio/pull/4202) [`a26e9afd`](https://github.com/gradio-app/gradio/commit/a26e9afde319382993e6ddc77cc4e56337a31248) Thanks [@pngwn](https://github.com/pngwn)! - Ensure all URLs returned by the client are complete URLs with the correct host instead of an absolute path relative to a server.

## 0.1.0

### Minor Changes

- [#4185](https://github.com/gradio-app/gradio/pull/4185) [`67239ca9`](https://github.com/gradio-app/gradio/commit/67239ca9b2fe3796853fbf7bf865c9e4b383200d) Thanks [@pngwn](https://github.com/pngwn)! - Update client for initial release

### Patch Changes

- [#3692](https://github.com/gradio-app/gradio/pull/3692) [`48e8b113`](https://github.com/gradio-app/gradio/commit/48e8b113f4b55e461d9da4f153bf72aeb4adf0f1) Thanks [@pngwn](https://github.com/pngwn)! - Ensure client works in node, create ESM bundle and generate typescript declaration files.

- [#3605](https://github.com/gradio-app/gradio/pull/3605) [`ae4277a9`](https://github.com/gradio-app/gradio/commit/ae4277a9a83d49bdadfe523b0739ba988128e73b) Thanks [@pngwn](https://github.com/pngwn)! - Update readme.