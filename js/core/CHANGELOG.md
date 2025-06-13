# @gradio/core

## 0.19.2

### Fixes

- [#11364](https://github.com/gradio-app/gradio/pull/11364) [`467de5d`](https://github.com/gradio-app/gradio/commit/467de5d865f8b841cb0d065031d5458f52ee2d29) - Call load events on @gr.render.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/gallery@0.15.23
- @gradio/code@0.14.7
- @gradio/textbox@0.10.14

## 0.19.1

### Fixes

- [#11338](https://github.com/gradio-app/gradio/pull/11338) [`b31c3ed`](https://github.com/gradio-app/gradio/commit/b31c3edef97373b96f188072d5bb16db9d690261) - Fix Reload Mode when using gr.render.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/upload@0.16.7
- @gradio/video@0.14.17
- @gradio/checkbox@0.4.23
- @gradio/client@1.15.2
- @gradio/button@0.5.3
- @gradio/tabs@0.4.5
- @gradio/tabitem@0.4.5
- @gradio/code@0.14.6
- @gradio/file@0.12.20
- @gradio/image@0.22.9
- @gradio/gallery@0.15.22

## 0.19.0

### Features

- [#11306](https://github.com/gradio-app/gradio/pull/11306) [`6cd608d`](https://github.com/gradio-app/gradio/commit/6cd608d8f9b1a142c58f0d2db861845ec267f705) - Improvements for plots and event listeners in re-renders.  Thanks @aliabid94!
- [#11328](https://github.com/gradio-app/gradio/pull/11328) [`ff39d56`](https://github.com/gradio-app/gradio/commit/ff39d568dc9a8a44807126c7366ac8f7dc63df12) - Update mcp schema to include return type information from function.  Thanks @abidlabs!

### Dependency updates

- @gradio/textbox@0.10.13

## 0.18.1

### Dependency updates

- @gradio/statustracker@0.10.12
- @gradio/gallery@0.15.21
- @gradio/plot@0.9.17
- @gradio/button@0.5.2
- @gradio/video@0.14.16
- @gradio/image@0.22.8
- @gradio/file@0.12.19

## 0.18.1

### Features

- [#11289](https://github.com/gradio-app/gradio/pull/11289) [`1b6bd1e`](https://github.com/gradio-app/gradio/commit/1b6bd1ee5a96541e88b5834784b9acd6bd344187) - Include default values in MCP docs.  Thanks @abidlabs!

### Fixes

- [#11271](https://github.com/gradio-app/gradio/pull/11271) [`ab25fb9`](https://github.com/gradio-app/gradio/commit/ab25fb9adb4e0401a060cdd07c0985483075123c) - Ensure i18n setup is complete when rendering.  Thanks @hannahblair!

### Dependency updates

- @gradio/statustracker@0.10.12
- @gradio/column@0.2.0
- @gradio/code@0.14.5
- @gradio/paramviewer@0.7.10
- @gradio/client@1.15.1
- @gradio/button@0.5.1
- @gradio/upload@0.16.6
- @gradio/image@0.22.7
- @gradio/gallery@0.15.20
- @gradio/plot@0.9.17
- @gradio/checkbox@0.4.22
- @gradio/file@0.12.19
- @gradio/video@0.14.15
- @gradio/textbox@0.10.12

## 0.18.0

### Features

- [#11224](https://github.com/gradio-app/gradio/pull/11224) [`834e92c`](https://github.com/gradio-app/gradio/commit/834e92c187f200665c78c344f0b38f5adede807b) - Fix re-rendering with key when setting a value to None.  Thanks @aliabid94!
- [#10832](https://github.com/gradio-app/gradio/pull/10832) [`d457438`](https://github.com/gradio-app/gradio/commit/d4574381bdd12709183c3affe740fada82b8baea) - Screen recording.  Thanks @dawoodkhan82!

## 0.17.0

### Features

- [#11155](https://github.com/gradio-app/gradio/pull/11155) [`30a1d9e`](https://github.com/gradio-app/gradio/commit/30a1d9e2ac3013d9c844b236410010bce97ffaf5) - Improvements to MCP page.  Thanks @abidlabs!
- [#11047](https://github.com/gradio-app/gradio/pull/11047) [`6d4b8a7`](https://github.com/gradio-app/gradio/commit/6d4b8a7f10daefc9c79aa224635da23fbaeebb76) - Implement custom i18n.  Thanks @hannahblair!

### Fixes

- [#11206](https://github.com/gradio-app/gradio/pull/11206) [`c196ac2`](https://github.com/gradio-app/gradio/commit/c196ac25b7744e9dcfa788b1ac8edf6551eec1ff) - Render key fixes.  Thanks @aliabid94!

### Dependency updates

- @gradio/code@0.14.4
- @gradio/paramviewer@0.7.9
- @gradio/statustracker@0.10.11
- @gradio/atoms@0.16.1
- @gradio/client@1.15.0
- @gradio/upload@0.16.5
- @gradio/button@0.5.0
- @gradio/image@0.22.6
- @gradio/video@0.14.14
- @gradio/file@0.12.18
- @gradio/column@0.2.0
- @gradio/gallery@0.15.19
- @gradio/plot@0.9.16
- @gradio/textbox@0.10.11
- @gradio/checkbox@0.4.21

## 0.16.1

### Dependency updates

- @gradio/tabs@0.4.4
- @gradio/tabitem@0.4.4

## 0.16.1

### Fixes

- [#11115](https://github.com/gradio-app/gradio/pull/11115) [`49e7a0d`](https://github.com/gradio-app/gradio/commit/49e7a0dd18174196b262d32e6c59d93ca40b1c73) - update STDIO instructions to specify sse-only transport.  Thanks @evalstate!

### Dependency updates

- @gradio/code@0.14.3
- @gradio/button@0.4.18
- @gradio/video@0.14.13
- @gradio/upload@0.16.4
- @gradio/image@0.22.5
- @gradio/gallery@0.15.18
- @gradio/file@0.12.17

## 0.16.0

### Features

- [#10984](https://github.com/gradio-app/gradio/pull/10984) [`8dab577`](https://github.com/gradio-app/gradio/commit/8dab5771c7d952c76f325681dbf364119c91b0b1) - Let Gradio apps also be MCP Servers.  Thanks @abidlabs!

## 0.15.1

### Fixes

- [#11088](https://github.com/gradio-app/gradio/pull/11088) [`a5105cc`](https://github.com/gradio-app/gradio/commit/a5105cccd6ca0682bd206608a080e24d69dad136) - fix: ensure all translation files work as expected.  Thanks @Col0ring!

### Dependency updates

- @gradio/gallery@0.15.17
- @gradio/button@0.4.17
- @gradio/video@0.14.12
- @gradio/image@0.22.4

## 0.15.0

### Features

- [#11027](https://github.com/gradio-app/gradio/pull/11027) [`eff532b`](https://github.com/gradio-app/gradio/commit/eff532b913a3c8f06f10a4f9471d3177e3744053) - Add new `ImageSlider` component.  Thanks @pngwn!

### Fixes

- [#11049](https://github.com/gradio-app/gradio/pull/11049) [`8d2aa3e`](https://github.com/gradio-app/gradio/commit/8d2aa3e99e165413bae1d8f5f3b4630e870308f5) - Ensure translations work as expected.  Thanks @hannahblair!

### Dependency updates

- @gradio/code@0.14.2
- @gradio/paramviewer@0.7.8
- @gradio/statustracker@0.10.10
- @gradio/image@0.22.3
- @gradio/upload@0.16.3
- @gradio/button@0.4.16
- @gradio/video@0.14.11
- @gradio/atoms@0.16.0
- @gradio/column@0.2.0
- @gradio/gallery@0.15.16
- @gradio/plot@0.9.15
- @gradio/textbox@0.10.10
- @gradio/checkbox@0.4.20
- @gradio/file@0.12.16

## 0.14.1

### Fixes

- [#11038](https://github.com/gradio-app/gradio/pull/11038) [`fd46e48`](https://github.com/gradio-app/gradio/commit/fd46e48f516a2907c469c7a6d3e67ae9f7068b29) - Be able to dispatch Info messages from a component.  Thanks @freddyaboulton!

## 0.14.0

### Dependency updates

- @gradio/code@0.14.1
- @gradio/paramviewer@0.7.7
- @gradio/statustracker@0.10.9
- @gradio/tabitem@0.4.3
- @gradio/tabs@0.4.3
- @gradio/video@0.14.10
- @gradio/atoms@0.15.2
- @gradio/client@1.14.2
- @gradio/utils@0.10.2
- @gradio/button@0.4.15
- @gradio/upload@0.16.2
- @gradio/image@0.22.2
- @gradio/gallery@0.15.15
- @gradio/plot@0.9.14
- @gradio/textbox@0.10.9
- @gradio/file@0.12.15
- @gradio/checkbox@0.4.19
- @gradio/column@0.2.0

## 0.14.0

### Features

- [#10980](https://github.com/gradio-app/gradio/pull/10980) [`370b3e2`](https://github.com/gradio-app/gradio/commit/370b3e254411bce354354f6e14753cda464cc463) - Add i18n for chatbot interactions.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/button@0.4.14
- @gradio/upload@0.16.1
- @gradio/atoms@0.15.1
- @gradio/statustracker@0.10.8
- @gradio/column@0.2.0
- @gradio/textbox@0.10.8
- @gradio/icons@0.12.0
- @gradio/gallery@0.15.14
- @gradio/plot@0.9.13
- @gradio/image@0.22.1
- @gradio/code@0.14.0
- @gradio/paramviewer@0.7.6
- @gradio/video@0.14.9
- @gradio/file@0.12.14
- @gradio/checkbox@0.4.18

## 0.13.2

### Dependency updates

- @gradio/code@0.13.2
- @gradio/paramviewer@0.7.5
- @gradio/statustracker@0.10.7
- @gradio/video@0.14.8
- @gradio/button@0.4.13
- @gradio/atoms@0.15.0
- @gradio/icons@0.11.0
- @gradio/upload@0.16.0
- @gradio/image@0.22.0
- @gradio/column@0.2.0
- @gradio/gallery@0.15.13
- @gradio/plot@0.9.12
- @gradio/textbox@0.10.7
- @gradio/checkbox@0.4.17
- @gradio/file@0.12.13

## 0.13.2

### Fixes

- [#10913](https://github.com/gradio-app/gradio/pull/10913) [`2322700`](https://github.com/gradio-app/gradio/commit/2322700812341a71a200958cdca793ca865c08c4) - Update i18n files.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/code@0.13.1
- @gradio/video@0.14.7
- @gradio/wasm@0.18.1
- @gradio/client@1.14.1
- @gradio/upload@0.15.7
- @gradio/gallery@0.15.12
- @gradio/button@0.4.12
- @gradio/image@0.21.7
- @gradio/file@0.12.12

## 0.13.1

### Fixes

- [#10841](https://github.com/gradio-app/gradio/pull/10841) [`8ff0a5e`](https://github.com/gradio-app/gradio/commit/8ff0a5e3e916ba6dfe6255ffcf4d09868ab29bde) - Fix path generation for returned files for bash API.  Thanks @cansik!

### Dependency updates

- @gradio/video@0.14.6
- @gradio/atoms@0.14.1
- @gradio/statustracker@0.10.6
- @gradio/column@0.2.0
- @gradio/client@1.14.0
- @gradio/wasm@0.18.0
- @gradio/gallery@0.15.11
- @gradio/upload@0.15.6
- @gradio/plot@0.9.11
- @gradio/button@0.4.11
- @gradio/image@0.21.6
- @gradio/textbox@0.10.6
- @gradio/file@0.12.11
- @gradio/checkbox@0.4.16
- @gradio/code@0.13.0
- @gradio/paramviewer@0.7.4

## 0.13.0

### Features

- [#10778](https://github.com/gradio-app/gradio/pull/10778) [`373007b`](https://github.com/gradio-app/gradio/commit/373007b3e9d019ee41589d1dbb09a7511a024a51) - Allow sorting by multiple columns in dataframe.  Thanks @hannahblair!

### Dependency updates

- @gradio/image@0.21.5
- @gradio/upload@0.15.5
- @gradio/statustracker@0.10.5
- @gradio/button@0.4.10
- @gradio/video@0.14.5
- @gradio/atoms@0.14.0
- @gradio/code@0.12.0
- @gradio/paramviewer@0.7.3
- @gradio/gallery@0.15.10
- @gradio/plot@0.9.10
- @gradio/textbox@0.10.5
- @gradio/column@0.2.0
- @gradio/checkbox@0.4.15
- @gradio/file@0.12.10

## 0.12.1

### Features

- [#10694](https://github.com/gradio-app/gradio/pull/10694) [`16244f3`](https://github.com/gradio-app/gradio/commit/16244f3c1cb1a65ac1f719142f8fab67512fbb25) - Event Listeners in gradio sketch.  Thanks @aliabid94!

### Fixes

- [#10719](https://github.com/gradio-app/gradio/pull/10719) [`b710d7c`](https://github.com/gradio-app/gradio/commit/b710d7cf13c1277fd18c7809cad0f707b880ef70) - Fix error display.  Thanks @aliabid94!

### Dependency updates

- @gradio/code@0.11.2
- @gradio/video@0.14.4
- @gradio/client@1.13.1
- @gradio/wasm@0.17.4
- @gradio/gallery@0.15.9
- @gradio/upload@0.15.4
- @gradio/button@0.4.9
- @gradio/image@0.21.4
- @gradio/file@0.12.9

## 0.12.0

### Features

- [#10500](https://github.com/gradio-app/gradio/pull/10500) [`16d419b`](https://github.com/gradio-app/gradio/commit/16d419b9f1f18ae4507d18a4739eb83ac4f3fae9) - Allow functions that solely update component properties to run in the frontend by setting `js=True`.  Thanks @abidlabs!

### Dependency updates

- @gradio/upload@0.15.3
- @gradio/video@0.14.3
- @gradio/code@0.11.1
- @gradio/client@1.13.0
- @gradio/button@0.4.8
- @gradio/image@0.21.3
- @gradio/gallery@0.15.8
- @gradio/file@0.12.8

## 0.11.1

### Features

- [#10679](https://github.com/gradio-app/gradio/pull/10679) [`cb3c762`](https://github.com/gradio-app/gradio/commit/cb3c76205c3fc1fae55229b5efe223c6d5c5c907) - Add Thai Translate.  Thanks @haihandsome!

## 0.11.0

### Dependency updates

- @gradio/code@0.11.0

## 0.11.0

### Features

- [#10569](https://github.com/gradio-app/gradio/pull/10569) [`bd4895a`](https://github.com/gradio-app/gradio/commit/bd4895a95a29fa1f0d12fefde26a82a1d60954e9) - Update Lite to support multi-page apps.  Thanks @whitphx!
- [#10630](https://github.com/gradio-app/gradio/pull/10630) [`77432c7`](https://github.com/gradio-app/gradio/commit/77432c7fa84c56ef76364bf23f4273e889a94a71) - gradio sketch - UI based gradio skeleton builder.  Thanks @aliabid94!

### Fixes

- [#10622](https://github.com/gradio-app/gradio/pull/10622) [`b505df0`](https://github.com/gradio-app/gradio/commit/b505df0b883d119d4660c25519497c4d86eea8d5) - Fix fill_width.  Thanks @aliabid94!

## 0.10.1

### Dependency updates

- @gradio/image@0.21.2
- @gradio/upload@0.15.2
- @gradio/code@0.10.18
- @gradio/paramviewer@0.7.2
- @gradio/statustracker@0.10.4
- @gradio/video@0.14.2
- @gradio/atoms@0.13.3
- @gradio/gallery@0.15.7
- @gradio/plot@0.9.9
- @gradio/button@0.4.7
- @gradio/column@0.2.0
- @gradio/textbox@0.10.4
- @gradio/checkbox@0.4.14
- @gradio/file@0.12.7

## 0.10.1

### Features

- [#10511](https://github.com/gradio-app/gradio/pull/10511) [`c4aa886`](https://github.com/gradio-app/gradio/commit/c4aa8864dabec4caeb59af91f6f1aaaf50e33b67) - Semantic search in the playground.  Thanks @aliabd!

## 0.10.0

### Features

- [#10492](https://github.com/gradio-app/gradio/pull/10492) [`29880d5`](https://github.com/gradio-app/gradio/commit/29880d51fbe7fbd222b0765a83c95134dc7d0e90) - Allow showing progress updates on arbitrary components.  Thanks @abidlabs!
- [#10552](https://github.com/gradio-app/gradio/pull/10552) [`ed25a10`](https://github.com/gradio-app/gradio/commit/ed25a1053a55ddd2cf7d3067c72bdf77185ada8d) - Add 1920px wide resolution for wide monitors.  Thanks @Oncorporation!

### Fixes

- [#10490](https://github.com/gradio-app/gradio/pull/10490) [`178311b`](https://github.com/gradio-app/gradio/commit/178311b72d72a3c5f4a67bee5e0098be4232e68c) - Ensure row numbers functionality in dataframe works as expected.  Thanks @hannahblair!
- [#10534](https://github.com/gradio-app/gradio/pull/10534) [`855d870`](https://github.com/gradio-app/gradio/commit/855d87001a492afce1aff9c2eb3de765d8855828) - Footer alignment fix.  Thanks @aliabid94!

### Dependency updates

- @gradio/code@0.10.17
- @gradio/paramviewer@0.7.1
- @gradio/statustracker@0.10.3
- @gradio/tabitem@0.4.2
- @gradio/tabs@0.4.2
- @gradio/video@0.14.1
- @gradio/atoms@0.13.2
- @gradio/utils@0.10.1
- @gradio/column@0.2.0
- @gradio/theme@0.4.0
- @gradio/client@1.12.0
- @gradio/upload@0.15.1
- @gradio/button@0.4.6
- @gradio/wasm@0.17.3
- @gradio/plot@0.9.8
- @gradio/gallery@0.15.6
- @gradio/image@0.21.1
- @gradio/textbox@0.10.3
- @gradio/file@0.12.6
- @gradio/checkbox@0.4.13

## 0.9.0

### Features

- [#10433](https://github.com/gradio-app/gradio/pull/10433) [`2e8dc74`](https://github.com/gradio-app/gradio/commit/2e8dc74f751be02f7217f78d241806b42fcdca04) - Allow building multipage Gradio apps.  Thanks @aliabid94!
- [#10478](https://github.com/gradio-app/gradio/pull/10478) [`afb96c6`](https://github.com/gradio-app/gradio/commit/afb96c64451e5a282bfee89445d831d1c87f9746) - Improve dataframe's upload accessibility.  Thanks @hannahblair!

### Dependency updates

- @gradio/client@1.11.0
- @gradio/upload@0.15.0
- @gradio/button@0.4.5
- @gradio/paramviewer@0.7.0
- @gradio/code@0.10.16
- @gradio/image@0.21.0
- @gradio/gallery@0.15.5
- @gradio/file@0.12.5
- @gradio/video@0.14.0

## 0.8.0

### Features

- [#10420](https://github.com/gradio-app/gradio/pull/10420) [`a69b8e8`](https://github.com/gradio-app/gradio/commit/a69b8e83ad7c89c627db2bdd5d25b0142731aaac) - Support column/row deletion in `gr.DataFrame`.  Thanks @abidlabs!
- [#10435](https://github.com/gradio-app/gradio/pull/10435) [`ef66fe5`](https://github.com/gradio-app/gradio/commit/ef66fe52b22448a5125a314581f2ec6c73c24145) - Sidebar Component.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/upload@0.14.8
- @gradio/button@0.4.4
- @gradio/code@0.10.15
- @gradio/file@0.12.4
- @gradio/image@0.20.4
- @gradio/video@0.13.4
- @gradio/wasm@0.17.2
- @gradio/gallery@0.15.4

## 0.7.0

### Dependency updates

- @gradio/upload@0.14.7
- @gradio/button@0.4.3
- @gradio/code@0.10.14
- @gradio/file@0.12.3
- @gradio/image@0.20.3
- @gradio/video@0.13.3
- @gradio/wasm@0.17.1
- @gradio/gallery@0.15.3

## 0.7.0

### Features

- [#10341](https://github.com/gradio-app/gradio/pull/10341) [`b0cf92f`](https://github.com/gradio-app/gradio/commit/b0cf92f03ba29f29fa540de8c5803a7263df0106) - PWA icon customization.  Thanks @whitphx!

### Dependency updates

- @gradio/upload@0.14.6
- @gradio/textbox@0.10.2
- @gradio/button@0.4.2
- @gradio/video@0.13.2
- @gradio/wasm@0.17.0
- @gradio/statustracker@0.10.2
- @gradio/image@0.20.2
- @gradio/gallery@0.15.2
- @gradio/plot@0.9.7
- @gradio/tabitem@0.4.1
- @gradio/tabs@0.4.1
- @gradio/code@0.10.13
- @gradio/paramviewer@0.6.4
- @gradio/column@0.2.0
- @gradio/file@0.12.2
- @gradio/checkbox@0.4.12

## 0.6.1

### Fixes

- [#10332](https://github.com/gradio-app/gradio/pull/10332) [`e742dcc`](https://github.com/gradio-app/gradio/commit/e742dcccb376692c9ddd5a6c251080e7c5936574) - Allow users to add a custom API route.  Thanks @aliabid94!

### Dependency updates

- @gradio/code@0.10.12
- @gradio/paramviewer@0.6.3
- @gradio/video@0.13.1
- @gradio/atoms@0.13.1
- @gradio/statustracker@0.10.1
- @gradio/column@0.2.0
- @gradio/client@1.10.0
- @gradio/icons@0.10.0
- @gradio/upload@0.14.5
- @gradio/gallery@0.15.1
- @gradio/plot@0.9.6
- @gradio/image@0.20.1
- @gradio/file@0.12.1
- @gradio/button@0.4.1
- @gradio/textbox@0.10.1
- @gradio/checkbox@0.4.11

## 0.6.0

### Dependency updates

- @gradio/gallery@0.15.0

## 0.6.0

### Features

- [#10192](https://github.com/gradio-app/gradio/pull/10192) [`4fc7fb7`](https://github.com/gradio-app/gradio/commit/4fc7fb777c42af537e4af612423fa44029657d41) - Ensure components can be remounted with their previous data.  Thanks @pngwn!
- [#10254](https://github.com/gradio-app/gradio/pull/10254) [`da07707`](https://github.com/gradio-app/gradio/commit/da0770748db9ea40194a43c9138ee2c6536b1247) - Add a `settings` link to the footer with i18n options & pwa instructions.  Thanks @abidlabs!

### Fixes

- [#10207](https://github.com/gradio-app/gradio/pull/10207) [`314a8b5`](https://github.com/gradio-app/gradio/commit/314a8b55f57a30806b37fe077b471df97d04245d) - fix: make sure `comp.instance` exists.  Thanks @Col0ring!

### Dependency updates

- @gradio/atoms@0.13.0
- @gradio/utils@0.10.0
- @gradio/gallery@0.14.1
- @gradio/upload@0.14.4
- @gradio/client@1.9.0
- @gradio/icons@0.9.0
- @gradio/statustracker@0.10.0
- @gradio/wasm@0.16.0
- @gradio/plot@0.9.5
- @gradio/image@0.20.0
- @gradio/video@0.13.0
- @gradio/file@0.12.0
- @gradio/button@0.4.0
- @gradio/tabs@0.4.0
- @gradio/column@0.2.0
- @gradio/tabitem@0.4.0
- @gradio/code@0.10.11
- @gradio/paramviewer@0.6.2
- @gradio/textbox@0.10.0
- @gradio/checkbox@0.4.10

## 0.5.0

### Features

- [#10166](https://github.com/gradio-app/gradio/pull/10166) [`8ac5b13`](https://github.com/gradio-app/gradio/commit/8ac5b13c96f871ac4b0f13c6ebfbb5559a18bcc2) - Add Japanese translations for login UI.  Thanks @kazuhitoyokoi!
- [#10159](https://github.com/gradio-app/gradio/pull/10159) [`7ca3685`](https://github.com/gradio-app/gradio/commit/7ca36850c9e46a1eb5b7a3866b4b166776b4146f) - Add Japanese message into message catalog.  Thanks @kazuhitoyokoi!

### Fixes

- [#10170](https://github.com/gradio-app/gradio/pull/10170) [`5e6e234`](https://github.com/gradio-app/gradio/commit/5e6e234cba820d29ebe29de2597d36ab3683093b) - Custom component in rerender.  Thanks @aliabid94!

### Dependency updates

- @gradio/code@0.10.10
- @gradio/paramviewer@0.6.1
- @gradio/video@0.12.1
- @gradio/statustracker@0.9.7
- @gradio/upload@0.14.3
- @gradio/button@0.3.9
- @gradio/atoms@0.12.0
- @gradio/image@0.19.0
- @gradio/gallery@0.14.0
- @gradio/plot@0.9.4
- @gradio/file@0.11.3
- @gradio/column@0.2.0
- @gradio/textbox@0.9.1
- @gradio/checkbox@0.4.9

## 0.4.1

### Dependency updates

- @gradio/gallery@0.13.10
- @gradio/paramviewer@0.6.0
- @gradio/image@0.18.0
- @gradio/video@0.12.0

## 0.4.1

### Fixes

- [#9822](https://github.com/gradio-app/gradio/pull/9822) [`2e2cdbf`](https://github.com/gradio-app/gradio/commit/2e2cdbfb609ca992ccc31bb38589486aaaa14012) - Fix css preload when serving from proxied subpaths.  Thanks @amol-!

### Dependency updates

- @gradio/video@0.11.9
- @gradio/atoms@0.11.2
- @gradio/code@0.10.9
- @gradio/paramviewer@0.5.8
- @gradio/tabitem@0.3.5
- @gradio/tabs@0.3.5
- @gradio/utils@0.9.0
- @gradio/button@0.3.8
- @gradio/statustracker@0.9.6
- @gradio/upload@0.14.2
- @gradio/gallery@0.13.9
- @gradio/plot@0.9.3
- @gradio/image@0.17.0
- @gradio/file@0.11.2
- @gradio/textbox@0.9.0
- @gradio/column@0.2.0
- @gradio/checkbox@0.4.8

## 0.4.0

### Features

- [#9950](https://github.com/gradio-app/gradio/pull/9950) [`fc06fe4`](https://github.com/gradio-app/gradio/commit/fc06fe41f015678a0545f4e5c99f6ae2704f0031) - Add ability to read and write from LocalStorage.  Thanks @abidlabs!

### Dependency updates

- @gradio/video@0.11.8
- @gradio/atoms@0.11.1
- @gradio/code@0.10.8
- @gradio/paramviewer@0.5.7
- @gradio/tabitem@0.3.4
- @gradio/tabs@0.3.4
- @gradio/client@1.8.0
- @gradio/utils@0.8.0
- @gradio/button@0.3.7
- @gradio/upload@0.14.1
- @gradio/statustracker@0.9.5
- @gradio/gallery@0.13.8
- @gradio/plot@0.9.2
- @gradio/image@0.16.8
- @gradio/file@0.11.1
- @gradio/checkbox@0.4.7
- @gradio/textbox@0.8.6
- @gradio/column@0.2.0

## 0.3.0

### Features

- [#9786](https://github.com/gradio-app/gradio/pull/9786) [`f109497`](https://github.com/gradio-app/gradio/commit/f109497e8281b3429b58e3f6a293dd63ebcc08af) - Fix frontend errors on ApiDocs and RecordingSnippet.  Thanks @whitphx!

### Dependency updates

- @gradio/code@0.10.7
- @gradio/paramviewer@0.5.6
- @gradio/video@0.11.7
- @gradio/statustracker@0.9.4
- @gradio/button@0.3.6
- @gradio/atoms@0.11.0
- @gradio/column@0.2.0
- @gradio/file@0.11.0
- @gradio/upload@0.14.0
- @gradio/checkbox@0.4.6
- @gradio/wasm@0.15.0
- @gradio/image@0.16.7
- @gradio/gallery@0.13.7
- @gradio/plot@0.9.1
- @gradio/textbox@0.8.5

## 0.2.1

### Dependency updates

- @gradio/video@0.11.6
- @gradio/statustracker@0.9.3
- @gradio/atoms@0.10.1
- @gradio/client@1.7.1
- @gradio/image@0.16.6
- @gradio/upload@0.13.5
- @gradio/plot@0.9.0
- @gradio/gallery@0.13.6
- @gradio/tabs@0.3.3
- @gradio/tabitem@0.3.3
- @gradio/code@0.10.6
- @gradio/paramviewer@0.5.5
- @gradio/button@0.3.5
- @gradio/textbox@0.8.4
- @gradio/column@0.2.0
- @gradio/checkbox@0.4.5
- @gradio/file@0.10.6

## 0.2.1

### Fixes

- [#9653](https://github.com/gradio-app/gradio/pull/9653) [`61cd768`](https://github.com/gradio-app/gradio/commit/61cd768490a12f5d63101d5434092bcd1cfc43a8) - Ensures tabs with visible set to false are not visible.  Thanks @hannahblair!

### Dependency updates

- @gradio/button@0.3.4
- @gradio/video@0.11.5
- @gradio/statustracker@0.9.2
- @gradio/atoms@0.10.0
- @gradio/icons@0.8.1
- @gradio/upload@0.13.4
- @gradio/plot@0.8.0
- @gradio/gallery@0.13.5
- @gradio/tabs@0.3.2
- @gradio/column@0.2.0
- @gradio/tabitem@0.3.2
- @gradio/code@0.10.5
- @gradio/paramviewer@0.5.4
- @gradio/textbox@0.8.3
- @gradio/file@0.10.5
- @gradio/checkbox@0.4.4
- @gradio/image@0.16.5

## 0.2.0

### Dependency updates

- @gradio/markdown@0.10.3
- @gradio/code@0.10.4
- @gradio/paramviewer@0.5.3
- @gradio/statustracker@0.9.1
- @gradio/upload@0.13.3
- @gradio/button@0.3.3
- @gradio/video@0.11.4
- @gradio/atoms@0.9.2
- @gradio/gallery@0.13.4
- @gradio/plot@0.7.3
- @gradio/column@0.2.0
- @gradio/textbox@0.8.2
- @gradio/checkbox@0.4.3
- @gradio/file@0.10.4
- @gradio/image@0.16.4

## 0.2.0

### Features

- [#9681](https://github.com/gradio-app/gradio/pull/9681) [`2ed2361`](https://github.com/gradio-app/gradio/commit/2ed236187a9aab18e17fc4a8079eddef7dd195a5) - Allow setting title in gr.Info/Warning/Error.  Thanks @ABucket!

### Fixes

- [#9728](https://github.com/gradio-app/gradio/pull/9728) [`d0b2ce8`](https://github.com/gradio-app/gradio/commit/d0b2ce8c0f150f0b636ad7d2226f7c8c61401996) - Ensure tabs render in SSR mode and reduce time it takes for them to render.  Thanks @pngwn!

### Dependency updates

- @gradio/video@0.11.3
- @gradio/markdown@0.10.2
- @gradio/atoms@0.9.1
- @gradio/statustracker@0.9.0
- @gradio/client@1.7.0
- @gradio/upload@0.13.2
- @gradio/button@0.3.2
- @gradio/wasm@0.14.2
- @gradio/gallery@0.13.3
- @gradio/plot@0.7.2
- @gradio/image@0.16.3
- @gradio/column@0.2.0
- @gradio/textbox@0.8.1
- @gradio/file@0.10.3
- @gradio/checkbox@0.4.2
- @gradio/tabs@0.3.1
- @gradio/code@0.10.3
- @gradio/paramviewer@0.5.2
- @gradio/tabitem@0.3.1

## 0.1.1

### Dependency updates

- @gradio/textbox@0.8.0

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