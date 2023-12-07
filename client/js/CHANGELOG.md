# @gradio/client

## 0.8.2

### Features

- [#6511](https://github.com/gradio-app/gradio/pull/6511) [`71f1a1f99`](https://github.com/gradio-app/gradio/commit/71f1a1f9931489d465c2c1302a5c8d768a3cd23a) - Mark `FileData.orig_name` optional on the frontend aligning the type definition on the Python side.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.8.1

### Fixes

- [#6383](https://github.com/gradio-app/gradio/pull/6383) [`324867f63`](https://github.com/gradio-app/gradio/commit/324867f63c920113d89a565892aa596cf8b1e486) - Fix event target.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.8.0

### Features

- [#6307](https://github.com/gradio-app/gradio/pull/6307) [`f1409f95e`](https://github.com/gradio-app/gradio/commit/f1409f95ed39c5565bed6a601e41f94e30196a57) - Provide status updates on file uploads.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.7.2

### Fixes

- [#6327](https://github.com/gradio-app/gradio/pull/6327) [`bca6c2c80`](https://github.com/gradio-app/gradio/commit/bca6c2c80f7e5062427019de45c282238388af95) - Restore query parameters in request.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.7.1

### Features

- [#6137](https://github.com/gradio-app/gradio/pull/6137) [`2ba14b284`](https://github.com/gradio-app/gradio/commit/2ba14b284f908aa13859f4337167a157075a68eb) - JS Param.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.7.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - fix circular dependency with client + upload.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Swap websockets for SSE.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.7.0-beta.1

### Features

- [#6143](https://github.com/gradio-app/gradio/pull/6143) [`e4f7b4b40`](https://github.com/gradio-app/gradio/commit/e4f7b4b409323b01aa01b39e15ce6139e29aa073) - fix circular dependency with client + upload.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6094](https://github.com/gradio-app/gradio/pull/6094) [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6069](https://github.com/gradio-app/gradio/pull/6069) [`bf127e124`](https://github.com/gradio-app/gradio/commit/bf127e1241a41401e144874ea468dff8474eb505) - Swap websockets for SSE.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.7.0-beta.0

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.6.0

### Features

- [#5972](https://github.com/gradio-app/gradio/pull/5972) [`11a300791`](https://github.com/gradio-app/gradio/commit/11a3007916071f0791844b0a37f0fb4cec69cea3) - Lite: Support opening the entrypoint HTML page directly in browser via the `file:` protocol.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.5.2

### Fixes

- [#5840](https://github.com/gradio-app/gradio/pull/5840) [`4e62b8493`](https://github.com/gradio-app/gradio/commit/4e62b8493dfce50bafafe49f1a5deb929d822103) - Ensure websocket polyfill doesn't load if there is already a `global.Webocket` property set.  Thanks [@Jay2theWhy](https://github.com/Jay2theWhy)!

## 0.5.1

### Fixes

- [#5816](https://github.com/gradio-app/gradio/pull/5816) [`796145e2c`](https://github.com/gradio-app/gradio/commit/796145e2c48c4087bec17f8ec0be4ceee47170cb) - Fix calls to the component server so that `gr.FileExplorer` works on Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.5.0

### Highlights

#### new `FileExplorer` component ([#5672](https://github.com/gradio-app/gradio/pull/5672) [`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e))

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function. 

Users can then navigate the virtual filesystem and select files which will be accessible in your predict function. This component will allow developers to build more complex spaces, with more flexible input options.

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).

 Thanks [@aliabid94](https://github.com/aliabid94)!

### Features

- [#5787](https://github.com/gradio-app/gradio/pull/5787) [`caeee8bf7`](https://github.com/gradio-app/gradio/commit/caeee8bf7821fd5fe2f936ed82483bed00f613ec) - ensure the client does not depend on `window` when running in a node environment.  Thanks [@gibiee](https://github.com/gibiee)!

### Fixes

- [#5776](https://github.com/gradio-app/gradio/pull/5776) [`c0fef4454`](https://github.com/gradio-app/gradio/commit/c0fef44541bfa61568bdcfcdfc7d7d79869ab1df) - Revert replica proxy logic and instead implement using the `root` variable.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.4.2

### Features

- [#5124](https://github.com/gradio-app/gradio/pull/5124) [`6e56a0d9b`](https://github.com/gradio-app/gradio/commit/6e56a0d9b0c863e76c69e1183d9d40196922b4cd) - Lite: Websocket queueing.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.4.1

### Fixes

- [#5705](https://github.com/gradio-app/gradio/pull/5705) [`78e7cf516`](https://github.com/gradio-app/gradio/commit/78e7cf5163e8d205e8999428fce4c02dbdece25f) - ensure internal data has updated before dispatching `success` or `then` events.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0

### Features

- [#5682](https://github.com/gradio-app/gradio/pull/5682) [`c57f1b75e`](https://github.com/gradio-app/gradio/commit/c57f1b75e272c76b0af4d6bd0c7f44743ff34f26) - Fix functional tests.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5681](https://github.com/gradio-app/gradio/pull/5681) [`40de3d217`](https://github.com/gradio-app/gradio/commit/40de3d2178b61ebe424b6f6228f94c0c6f679bea) - add query parameters to the `gr.Request` object through the `query_params` attribute.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!
- [#5653](https://github.com/gradio-app/gradio/pull/5653) [`ea0e00b20`](https://github.com/gradio-app/gradio/commit/ea0e00b207b4b90a10e9d054c4202d4e705a29ba) - Prevent Clients from accessing API endpoints that set `api_name=False`.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.3.1

### Fixes

- [#5412](https://github.com/gradio-app/gradio/pull/5412) [`26fef8c7`](https://github.com/gradio-app/gradio/commit/26fef8c7f85a006c7e25cdbed1792df19c512d02) - Skip view_api request in js client when auth enabled.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.3.0

### Features

- [#5267](https://github.com/gradio-app/gradio/pull/5267) [`119c8343`](https://github.com/gradio-app/gradio/commit/119c834331bfae60d4742c8f20e9cdecdd67e8c2) - Faster reload mode.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

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