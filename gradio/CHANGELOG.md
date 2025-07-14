# gradio

## 5.37.0

### Features

- [#11572](https://github.com/gradio-app/gradio/pull/11572) [`552a5eb`](https://github.com/gradio-app/gradio/commit/552a5ebf9beb5d543f82a24a546daaf9ad3d88b1) - handle i18n error when browsers aren't set to en.  Thanks @hannahblair!
- [#11527](https://github.com/gradio-app/gradio/pull/11527) [`13597b8`](https://github.com/gradio-app/gradio/commit/13597b8a7f0bd1c73a2e269a95a831f5b0e1a1d7) - Add method to the gr.Dataframe to automatic generation of the datatype-Parameter.  Thanks @janosch6!

### Fixes

- [#11504](https://github.com/gradio-app/gradio/pull/11504) [`1bb635d`](https://github.com/gradio-app/gradio/commit/1bb635d7721232dd715478a1c52620771dca1a20) - Fix fonts in SSR mode.  Thanks @dawoodkhan82!
- [#11496](https://github.com/gradio-app/gradio/pull/11496) [`ee0da48`](https://github.com/gradio-app/gradio/commit/ee0da481446da5ffd79151a457cd3847db645bfb) - Prevent deletion of values in static columns.  Thanks @hannahblair!

## 5.36.2

### Features

- [#11542](https://github.com/gradio-app/gradio/pull/11542) [`bfe0104`](https://github.com/gradio-app/gradio/commit/bfe0104a278e0fe719cd1bcc8535ab5f4b6da0d4) - set python version.  Thanks @abidlabs!
- [#11548](https://github.com/gradio-app/gradio/pull/11548) [`b961410`](https://github.com/gradio-app/gradio/commit/b9614106136b8a3a82bb425820ce348a6f586859) - test.  Thanks @abidlabs!
- [#11544](https://github.com/gradio-app/gradio/pull/11544) [`abc42a3`](https://github.com/gradio-app/gradio/commit/abc42a36a7ca91b1266b4814a03ac8d7586d0935) - testing.  Thanks @abidlabs!
- [#11549](https://github.com/gradio-app/gradio/pull/11549) [`5d0522c`](https://github.com/gradio-app/gradio/commit/5d0522c566d35d5eeee209108684af734cd097df) - Cc2.  Thanks @abidlabs!

## 5.36.1

### Features

- [#11539](https://github.com/gradio-app/gradio/pull/11539) [`6b6d95b`](https://github.com/gradio-app/gradio/commit/6b6d95b6409f9136233ba1d4f55a1cab9e040070) - Update @huggingface/space-header to 1.0.4.  Thanks @aayush4vedi!

## 5.36.0

### Features

- [#11427](https://github.com/gradio-app/gradio/pull/11427) [`6b2bcd0`](https://github.com/gradio-app/gradio/commit/6b2bcd097ae5ef999a7fb273ecf7c7e4c0eab305) - Improve load times of the Gradio front-end.  Thanks @pngwn!
- [#11157](https://github.com/gradio-app/gradio/pull/11157) [`c207de9`](https://github.com/gradio-app/gradio/commit/c207de96f8ae2ce6c74026ff696c7fa4cf3a87c7) - Build the Gradio wheel for Lite before packaging.  Thanks @whitphx!
- [#11511](https://github.com/gradio-app/gradio/pull/11511) [`1a99336`](https://github.com/gradio-app/gradio/commit/1a99336043076e7b0a4c4b07f97082f0361882f4) - Fix SSR.  Thanks @pngwn!

### Fixes

- [#11430](https://github.com/gradio-app/gradio/pull/11430) [`4d4cd4b`](https://github.com/gradio-app/gradio/commit/4d4cd4b08d6daafc66e0189a2b274916da00d480) - fix exports + add browser build.  Thanks @pngwn!
- [#11435](https://github.com/gradio-app/gradio/pull/11435) [`50d43a8`](https://github.com/gradio-app/gradio/commit/50d43a8e8bc2a4862668a5d46a5e6482b4f75fe3) - SSR Auth Fix.  Thanks @dawoodkhan82!
- [#11528](https://github.com/gradio-app/gradio/pull/11528) [`2948687`](https://github.com/gradio-app/gradio/commit/294868733862c392c46c1d17e71f47fa30bb3461) - only compress text resources with brotli.  Thanks @pngwn!
- [#11537](https://github.com/gradio-app/gradio/pull/11537) [`8eb253b`](https://github.com/gradio-app/gradio/commit/8eb253be32a01c0c67911d7a7a3762c52a76a87b) - fix html attribute spreading bug and pin `httpx`.  Thanks @abidlabs!
- [#11436](https://github.com/gradio-app/gradio/pull/11436) [`f49b8da`](https://github.com/gradio-app/gradio/commit/f49b8da1c062dbd81acb8e7fdcdc9a09a272d02f) - Multi-Line DataFrame Editing.  Thanks @deckar01!
- [#11466](https://github.com/gradio-app/gradio/pull/11466) [`2c969c9`](https://github.com/gradio-app/gradio/commit/2c969c9bf78aad9ab5124e0387ab74d6028b48b2) - Fix schema modification bug in MCP.  Thanks @freddyaboulton!
- [#11506](https://github.com/gradio-app/gradio/pull/11506) [`c439380`](https://github.com/gradio-app/gradio/commit/c439380d9f6ea7a9e15a486d8c1acc80708583a1) - Fix Delete Diff Keys.  Thanks @deckar01!
- [#11477](https://github.com/gradio-app/gradio/pull/11477) [`b97c817`](https://github.com/gradio-app/gradio/commit/b97c817f87c2ef6de3541df5a8e7e098a5e7b719) - Improve logic for sanitizing MCP tool names.  Thanks @abidlabs!

## 5.35.0

### Features

- [#11429](https://github.com/gradio-app/gradio/pull/11429) [`1a718e7`](https://github.com/gradio-app/gradio/commit/1a718e72f0aef043f4ee4a6cfd2af4f68902ce63) - Add placeholder support to number component.  Thanks @seb-goodman!
- [#11447](https://github.com/gradio-app/gradio/pull/11447) [`58631ef`](https://github.com/gradio-app/gradio/commit/58631efdf3e2ff805ce625b7ef63e651f01af03e) - Revert .only marker in e2e tests.  Thanks @freddyaboulton!
- [#11392](https://github.com/gradio-app/gradio/pull/11392) [`dc760a6`](https://github.com/gradio-app/gradio/commit/dc760a6dd7d3375f99913059803a826cdf0f7102) - Add column-specific filtering to `gr.Dataframe`.  Thanks @tiago-gsantos!
- [#11442](https://github.com/gradio-app/gradio/pull/11442) [`f114f7f`](https://github.com/gradio-app/gradio/commit/f114f7f56b50b0176526a13ad3fcf2a81c077491) - Downsample heavy line plots.  Thanks @aliabid94!

### Fixes

- [#11426](https://github.com/gradio-app/gradio/pull/11426) [`fa4018a`](https://github.com/gradio-app/gradio/commit/fa4018a99ee815e33bc228bfb0183dd820246eb1) - Remove gap parametger from gr.Column.  Thanks @deckar01!
- [#11041](https://github.com/gradio-app/gradio/pull/11041) [`474aa30`](https://github.com/gradio-app/gradio/commit/474aa30979c14793e00852ad2f4ef6c12a41b900) - Attach cookies to client after first request (to support multiple-replica setups with cookie-based affinity).  Thanks @abidlabs!
- [#11433](https://github.com/gradio-app/gradio/pull/11433) [`a37f9b8`](https://github.com/gradio-app/gradio/commit/a37f9b895a21771f6491f56ab07f9c01b9885fe3) - Fix potential DoS vulnerability.  Thanks @rllj!
- [#11432](https://github.com/gradio-app/gradio/pull/11432) [`dd1eee5`](https://github.com/gradio-app/gradio/commit/dd1eee5f9cd3d70773912fd6444d093bdcea321a) - Fix bug where cancelling an event would close the event stream.  Thanks @freddyaboulton!
- [#11456](https://github.com/gradio-app/gradio/pull/11456) [`4de7169`](https://github.com/gradio-app/gradio/commit/4de716919873336939a212be96c2f359cd565a68) - Fix Lite + Playground.  Thanks @freddyaboulton!
- [#11407](https://github.com/gradio-app/gradio/pull/11407) [`f3f9590`](https://github.com/gradio-app/gradio/commit/f3f9590d539b9e6fe3937a1bdc48006ee174fb8f) - Fix Styled DataFrame Sorting.  Thanks @deckar01!
- [#11421](https://github.com/gradio-app/gradio/pull/11421) [`c2acf6e`](https://github.com/gradio-app/gradio/commit/c2acf6e33025fe7bbfe0660c182006651cc95090) - Preserve value in reload mode.  Thanks @aliabid94!
- [#11439](https://github.com/gradio-app/gradio/pull/11439) [`4a208fd`](https://github.com/gradio-app/gradio/commit/4a208fd38d0fef87b81a4f5f28615dd9db3af056) - Fix hot reload bug where indirectly referenced modules are not loaded.  Thanks @freddyaboulton!
- [#11396](https://github.com/gradio-app/gradio/pull/11396) [`eaf3b93`](https://github.com/gradio-app/gradio/commit/eaf3b936c29305067b9effedceb6e14b1b15f7cd) - Ensure Sync generators get closed if they are cancelled.  Thanks @freddyaboulton!

## 5.34.2

### Features

- [#11418](https://github.com/gradio-app/gradio/pull/11418) [`e398c51`](https://github.com/gradio-app/gradio/commit/e398c51e610713d7dc1ed0a1ee43d7d313b8ca6a) - Full screen plots take full height.  Thanks @aliabid94!

## 5.34.1

### Fixes

- [#11408](https://github.com/gradio-app/gradio/pull/11408) [`9082647`](https://github.com/gradio-app/gradio/commit/9082647e48e94d104d3fe1b9325f993d3b0cc0bb) - Make the method for getting the `asyncio` event loop more robust.  Thanks @abidlabs!
- [#11400](https://github.com/gradio-app/gradio/pull/11400) [`8bb7776`](https://github.com/gradio-app/gradio/commit/8bb7776c88b1f2b08940247ae0adee24cc73f460) - Resolve issues around example caching with `gr.Progress`.  Thanks @abidlabs!
- [#11399](https://github.com/gradio-app/gradio/pull/11399) [`4757302`](https://github.com/gradio-app/gradio/commit/4757302c9d4164f483a881ad993941b844cc1f25) - Miscellaneous fixes around docstrings & documentation.  Thanks @abidlabs!
- [#11387](https://github.com/gradio-app/gradio/pull/11387) [`8245afc`](https://github.com/gradio-app/gradio/commit/8245afc669501e1e5f0d619f452455f68a3b7667) - Define root URL in frontend.  Thanks @aliabid94!
- [#11397](https://github.com/gradio-app/gradio/pull/11397) [`5a7790d`](https://github.com/gradio-app/gradio/commit/5a7790d473c762e873d986d4953c6fc2f2b749f9) - Add detect audio format from bytes.  Thanks @yahiro-code!

## 5.34.0

### Features

- [#11393](https://github.com/gradio-app/gradio/pull/11393) [`43ece52`](https://github.com/gradio-app/gradio/commit/43ece52e847bb7cb9333e7262372ba342e41971f) - Be able to specify repo-id in gradio cc publish.  Thanks @freddyaboulton!

### Fixes

- [#11386](https://github.com/gradio-app/gradio/pull/11386) [`92aa905`](https://github.com/gradio-app/gradio/commit/92aa9058e101a6f4ddf72495a87ae392802d9f2d) - Hide pending message indicator ("...") from `gr.Chatbot` if `show_progress="hidden"`.  Thanks @abidlabs!
- [#11378](https://github.com/gradio-app/gradio/pull/11378) [`3ec4a7c`](https://github.com/gradio-app/gradio/commit/3ec4a7c376b5eee9e2d5a0b858c374b417f8c61a) - Add Model3D support in Chatbot.  Thanks @dawoodkhan82!
- [#11349](https://github.com/gradio-app/gradio/pull/11349) [`bed858b`](https://github.com/gradio-app/gradio/commit/bed858b62b9887e606618bea5fe8a2f212b4a645) - Fix DataFrame Scroll Divergence.  Thanks @deckar01!
- [#11381](https://github.com/gradio-app/gradio/pull/11381) [`0e6fae0`](https://github.com/gradio-app/gradio/commit/0e6fae015069b6b4c44523642abfbbfced394ab2) - Fix transparent bg issue in gr.ImageSlider.  Thanks @hannahblair!
- [#11346](https://github.com/gradio-app/gradio/pull/11346) [`3a9a002`](https://github.com/gradio-app/gradio/commit/3a9a0025efd49942303517c5dbd426d41241b7f6) - Hide native Dataframe to screen readers.  Thanks @hannahblair!
- [#11382](https://github.com/gradio-app/gradio/pull/11382) [`5ff539e`](https://github.com/gradio-app/gradio/commit/5ff539e4764fba0e0a100accfcc3d4fa43e470a0) - Fix cached examples in `@gr.render`.  Thanks @abidlabs!

## 5.33.2

### Features

- [#11372](https://github.com/gradio-app/gradio/pull/11372) [`7282c9e`](https://github.com/gradio-app/gradio/commit/7282c9eb1ed0ce8608f9a1157f3243e8c1b0f597) - Plot re-render fixes.  Thanks @aliabid94!
- [#11380](https://github.com/gradio-app/gradio/pull/11380) [`0b2b6cb`](https://github.com/gradio-app/gradio/commit/0b2b6cbd44562a2f5843af872fe6761c5f255185) - Truncate textbox examples to 70 chars.  Thanks @hannahblair!
- [#11369](https://github.com/gradio-app/gradio/pull/11369) [`6aed692`](https://github.com/gradio-app/gradio/commit/6aed692d94541c0233648833cc87b2f217421d43) - Tiny typo when running gradio in colab.  Thanks @abidlabs!

### Fixes

- [#11363](https://github.com/gradio-app/gradio/pull/11363) [`5e3ec9c`](https://github.com/gradio-app/gradio/commit/5e3ec9cf2c221fcd0d84f07d5757b63940cc1238) - Redesign the `gr.Datetime` component and ensure it works within an iframe (e.g. on Spaces).  Thanks @abidlabs!
- [#11368](https://github.com/gradio-app/gradio/pull/11368) [`3f53679`](https://github.com/gradio-app/gradio/commit/3f5367986e90c57465bdbb809b318da6aed5400d) - Fixes chatbot unsupported components.  Thanks @dawoodkhan82!
- [#11364](https://github.com/gradio-app/gradio/pull/11364) [`467de5d`](https://github.com/gradio-app/gradio/commit/467de5d865f8b841cb0d065031d5458f52ee2d29) - Call load events on @gr.render.  Thanks @freddyaboulton!
- [#11362](https://github.com/gradio-app/gradio/pull/11362) [`1b88339`](https://github.com/gradio-app/gradio/commit/1b883395eb3feceed60ec79fcf19285269e2b171) - Fix Gallery thumbnail overflow.  Thanks @freddyaboulton!
- [#11379](https://github.com/gradio-app/gradio/pull/11379) [`546008c`](https://github.com/gradio-app/gradio/commit/546008c9c3e460e736da3feae0027b2b7b583e1e) - Fixes hardcoded HTTP protocol in dev reload.  Thanks @mtojek!

## 5.33.1

### Features

- [#11360](https://github.com/gradio-app/gradio/pull/11360) [`1eb4e2e`](https://github.com/gradio-app/gradio/commit/1eb4e2ec9decfb448379b6224e790b8d36690699) - Inject the `Request` information in MCP tool calls.  Thanks @abidlabs!
- [#11237](https://github.com/gradio-app/gradio/pull/11237) [`a6f6b40`](https://github.com/gradio-app/gradio/commit/a6f6b40dda5194fa5bc9926ef67f2a75f503e9a4) - Enhance boolean cell types in `gr.Dataframe`.  Thanks @hannahblair!

### Fixes

- [#11350](https://github.com/gradio-app/gradio/pull/11350) [`9af8fc1`](https://github.com/gradio-app/gradio/commit/9af8fc1583c69f5f10ecfcd1c95f365525a99c83) - Be Able to launch MCP server when mounting in FastAPI app.  Thanks @freddyaboulton!
- [#11344](https://github.com/gradio-app/gradio/pull/11344) [`b961441`](https://github.com/gradio-app/gradio/commit/b961441780d70c82504141bd4deae7b3290c2227) - Fixes default tab label.  Thanks @dawoodkhan82!
- [#11348](https://github.com/gradio-app/gradio/pull/11348) [`250ae7a`](https://github.com/gradio-app/gradio/commit/250ae7a0088b2a42c89f40cc8f51cca2d72a63dd) - fix(mcp): package SVG outputs as proper ImageContent for MCP clients.  Thanks @DavidLMS!
- [#11325](https://github.com/gradio-app/gradio/pull/11325) [`2b571e1`](https://github.com/gradio-app/gradio/commit/2b571e13afdc8031ce9c1291abf0fc7062340064) - Fix image streaming - wait for ws to open.  Thanks @freddyaboulton!
- [#11347](https://github.com/gradio-app/gradio/pull/11347) [`fdce3a0`](https://github.com/gradio-app/gradio/commit/fdce3a094fe1278ae83fe2f8b134b4c268506cfe) - Fix `gr.api()` to support more types, including optional params.  Thanks @abidlabs!
- [#11338](https://github.com/gradio-app/gradio/pull/11338) [`b31c3ed`](https://github.com/gradio-app/gradio/commit/b31c3edef97373b96f188072d5bb16db9d690261) - Fix Reload Mode when using gr.render.  Thanks @freddyaboulton!

## 5.33.0

### Features

- [#11306](https://github.com/gradio-app/gradio/pull/11306) [`6cd608d`](https://github.com/gradio-app/gradio/commit/6cd608d8f9b1a142c58f0d2db861845ec267f705) - Improvements for plots and event listeners in re-renders.  Thanks @aliabid94!
- [#11287](https://github.com/gradio-app/gradio/pull/11287) [`7b06b61`](https://github.com/gradio-app/gradio/commit/7b06b61efe84c9a6647378e71f421b20923a02b4) - Preload the first example for `gr.Interface` when examples are cached.  Thanks @abidlabs!
- [#11328](https://github.com/gradio-app/gradio/pull/11328) [`ff39d56`](https://github.com/gradio-app/gradio/commit/ff39d568dc9a8a44807126c7366ac8f7dc63df12) - Update mcp schema to include return type information from function.  Thanks @abidlabs!
- [#11320](https://github.com/gradio-app/gradio/pull/11320) [`d6649e5`](https://github.com/gradio-app/gradio/commit/d6649e541d96ce94cd20bc8d7655c4c380c9cdb2) - Fix doc title for JS Chatbot.  Thanks @aymeric-roucher!

### Fixes

- [#11327](https://github.com/gradio-app/gradio/pull/11327) [`5770fd0`](https://github.com/gradio-app/gradio/commit/5770fd0ad42a1ba8bb87a5c0f92bbf4dcf3e5a38) - Suppress error in create_or_modify_pyi.  Thanks @freddyaboulton!
- [#11318](https://github.com/gradio-app/gradio/pull/11318) [`3e40af3`](https://github.com/gradio-app/gradio/commit/3e40af3df4669ce400db4c9308d0e20f0d7ddf96) - Fix textbox autoscroll in tabs.  Thanks @dawoodkhan82!
- [#11326](https://github.com/gradio-app/gradio/pull/11326) [`477730e`](https://github.com/gradio-app/gradio/commit/477730ef51697a355a09020b235f6cc4a6fbb9dc) - Fix streaming chatbot diff logic.  Thanks @freddyaboulton!

## 5.32.1

### Fixes

- [#11304](https://github.com/gradio-app/gradio/pull/11304) [`bdbc210`](https://github.com/gradio-app/gradio/commit/bdbc210dbf09555b3bd8f647c6f19621771b5771) - Fix custom components build and dev mode with certain base components (Image and Audio at least).  Thanks @pngwn!
- [#11307](https://github.com/gradio-app/gradio/pull/11307) [`bc299f1`](https://github.com/gradio-app/gradio/commit/bc299f12e54f765c2194da2c46a8d4520c44fbb3) - Show scroll to bottom button whenever user scrolls up in chatbot.  Thanks @dawoodkhan82!
- [#11282](https://github.com/gradio-app/gradio/pull/11282) [`9a6a6f5`](https://github.com/gradio-app/gradio/commit/9a6a6f524e8e9784144d45ea7b6327a1a7b3593c) - Fix DataFrame Group Flicker.  Thanks @deckar01!

## 5.32.0

### Features

- [#11283](https://github.com/gradio-app/gradio/pull/11283) [`6ec91bf`](https://github.com/gradio-app/gradio/commit/6ec91bf3a224758d79dc3413e51ecb90d4302a50) - Add `_` between space name and tool name for mcp.  Thanks @abidlabs!
- [#11289](https://github.com/gradio-app/gradio/pull/11289) [`1b6bd1e`](https://github.com/gradio-app/gradio/commit/1b6bd1ee5a96541e88b5834784b9acd6bd344187) - Include default values in MCP docs.  Thanks @abidlabs!
- [#11300](https://github.com/gradio-app/gradio/pull/11300) [`6780f69`](https://github.com/gradio-app/gradio/commit/6780f69ded0067ac96f9cc73fddce9323b649bee) - Streamable HTTP Transport for MCP server.  Thanks @freddyaboulton!
- [#11247](https://github.com/gradio-app/gradio/pull/11247) [`0a26311`](https://github.com/gradio-app/gradio/commit/0a2631127d970a19e7969401345bba124e68dcb4) - Use the function name as the tool name in the Gradio MCP server.  Thanks @abidlabs!

### Fixes

- [#11286](https://github.com/gradio-app/gradio/pull/11286) [`5bfc57e`](https://github.com/gradio-app/gradio/commit/5bfc57e3748e3d39050dd13e063705f8c8000c49) - Fix parameter names in ChatInterface view api page.  Thanks @freddyaboulton!
- [#11270](https://github.com/gradio-app/gradio/pull/11270) [`636be09`](https://github.com/gradio-app/gradio/commit/636be09928448dd6d4ef29013dbf698f22787d3d) - A few frontend / UI fixes to `gr.Sidebar`.  Thanks @abidlabs!
- [#11279](https://github.com/gradio-app/gradio/pull/11279) [`8ae434c`](https://github.com/gradio-app/gradio/commit/8ae434c58906fda5fe20a6b08a12b6007a47af09) - Ensure error text overflows as expected.  Thanks @hannahblair!
- [#11272](https://github.com/gradio-app/gradio/pull/11272) [`8177b01`](https://github.com/gradio-app/gradio/commit/8177b014e5539aa1011a74856d065dbb17fa0326) - Fix bug where streaming one chunk of audio or video would not play.  Thanks @freddyaboulton!
- [#11215](https://github.com/gradio-app/gradio/pull/11215) [`2186ae3`](https://github.com/gradio-app/gradio/commit/2186ae3f4d6f8ac83883c359aed88a5b72746b5d) - Allow httpx_kwargs to contain cookies.  Thanks @santibreo!
- [#11271](https://github.com/gradio-app/gradio/pull/11271) [`ab25fb9`](https://github.com/gradio-app/gradio/commit/ab25fb9adb4e0401a060cdd07c0985483075123c) - Ensure i18n setup is complete when rendering.  Thanks @hannahblair!
- [#11262](https://github.com/gradio-app/gradio/pull/11262) [`56d82d7`](https://github.com/gradio-app/gradio/commit/56d82d72ea71c218002f70063288aeb56a885727) - Add missing `blur` event to `gr.Number`.  Thanks @ExcellentAmericanEagle!
- [#11243](https://github.com/gradio-app/gradio/pull/11243) [`35afa21`](https://github.com/gradio-app/gradio/commit/35afa21f0d6647e4fbda711f3f22a2fd54eedaf9) - Only show parameters warning when valid `endpoint_info` exists.  Thanks @hannahblair!
- [#11285](https://github.com/gradio-app/gradio/pull/11285) [`c16dff0`](https://github.com/gradio-app/gradio/commit/c16dff0489983648c6aafe82b971b4a9b903961f) - Allow `gr.Progress` to take fractional steps and fractional total # of steps.  Thanks @abidlabs!
- [#11278](https://github.com/gradio-app/gradio/pull/11278) [`ac2bcea`](https://github.com/gradio-app/gradio/commit/ac2bcea619806ff99a44d98c15ca5c5969cdd54d) - Add gap around slider input in mobile.  Thanks @hannahblair!
- [#11273](https://github.com/gradio-app/gradio/pull/11273) [`f54f81b`](https://github.com/gradio-app/gradio/commit/f54f81bda84c1337fdd453e3fe837d0159e384ea) - Fix bug where only the first chunk of a video stream played audio.  Thanks @freddyaboulton!

## 5.31.0

### Features

- [#11229](https://github.com/gradio-app/gradio/pull/11229) [`231ccfe`](https://github.com/gradio-app/gradio/commit/231ccfeed0a9f3971489e571cceaf8bea28fdd54) - Chatbot autoscroll fix.  Thanks @dawoodkhan82!
- [#11224](https://github.com/gradio-app/gradio/pull/11224) [`834e92c`](https://github.com/gradio-app/gradio/commit/834e92c187f200665c78c344f0b38f5adede807b) - Fix re-rendering with key when setting a value to None.  Thanks @aliabid94!
- [#10832](https://github.com/gradio-app/gradio/pull/10832) [`d457438`](https://github.com/gradio-app/gradio/commit/d4574381bdd12709183c3affe740fada82b8baea) - Screen recording.  Thanks @dawoodkhan82!

### Fixes

- [#11236](https://github.com/gradio-app/gradio/pull/11236) [`3a7750c`](https://github.com/gradio-app/gradio/commit/3a7750cb8e0f5f860c72db9ab02f7ce4d324d6c5) - Add padding param to gr.Markdown.  Thanks @hannahblair!
- [#11238](https://github.com/gradio-app/gradio/pull/11238) [`13c8510`](https://github.com/gradio-app/gradio/commit/13c85108ec44408c614a353656d12221f0317150) - Fix DeepLink Query Parameters.  Thanks @freddyaboulton!
- [#11228](https://github.com/gradio-app/gradio/pull/11228) [`0b7f753`](https://github.com/gradio-app/gradio/commit/0b7f753a8e400795b5e03fd3faf2a6d1f4426f05) - Improve slider alignment.  Thanks @hannahblair!
- [#11227](https://github.com/gradio-app/gradio/pull/11227) [`4099700`](https://github.com/gradio-app/gradio/commit/40997002090b0ad7cd1037872523dcdd9bf45bc3) - Check file validity even if preprocess=False.  Thanks @freddyaboulton!
- [#11230](https://github.com/gradio-app/gradio/pull/11230) [`62a8d97`](https://github.com/gradio-app/gradio/commit/62a8d97fe8a92886f22af11b5fdef14bace69ea8) - Fix Model3D `camera_position` param.  Thanks @dawoodkhan82!
- [#11231](https://github.com/gradio-app/gradio/pull/11231) [`78a3854`](https://github.com/gradio-app/gradio/commit/78a38543d843a7afac360f9022318c4defa1682f) - Fix MCP server mounted path.  Thanks @abidlabs!
- [#11244](https://github.com/gradio-app/gradio/pull/11244) [`ed97e39`](https://github.com/gradio-app/gradio/commit/ed97e390f1790b77192368a77cd2d10c90a232c5) - Ensure `show_indices` works as expected in gr.JSON.  Thanks @hannahblair!
- [#11232](https://github.com/gradio-app/gradio/pull/11232) [`8ea7ce7`](https://github.com/gradio-app/gradio/commit/8ea7ce7312a743590c053bcece950ab001bbd8e5) - Provide a workaround for the MCP integration for endpoints that have `gr.State` components.  Thanks @abidlabs!
- [#11246](https://github.com/gradio-app/gradio/pull/11246) [`bfb9bcf`](https://github.com/gradio-app/gradio/commit/bfb9bcf956c61c69e5809eb96d2bab2b3e9d9dcb) - Remove Deep Link events from API page.  Thanks @freddyaboulton!

## 5.30.0

### Features

- [#11177](https://github.com/gradio-app/gradio/pull/11177) [`3068196`](https://github.com/gradio-app/gradio/commit/3068196d47234fd1c1634f33b9ddfc089f5cbbe0) - Improved, smoother fullscreen mode for components.  Thanks @aliabid94!
- [#11155](https://github.com/gradio-app/gradio/pull/11155) [`30a1d9e`](https://github.com/gradio-app/gradio/commit/30a1d9e2ac3013d9c844b236410010bce97ffaf5) - Improvements to MCP page.  Thanks @abidlabs!
- [#11192](https://github.com/gradio-app/gradio/pull/11192) [`a03736f`](https://github.com/gradio-app/gradio/commit/a03736f97c642b338aa701166d3a0b299a46d27a) - Add undo and redo to the `ImageEditor` component.  Thanks @pngwn!
- [#11047](https://github.com/gradio-app/gradio/pull/11047) [`6d4b8a7`](https://github.com/gradio-app/gradio/commit/6d4b8a7f10daefc9c79aa224635da23fbaeebb76) - Implement custom i18n.  Thanks @hannahblair!

### Fixes

- [#11221](https://github.com/gradio-app/gradio/pull/11221) [`5f3e84d`](https://github.com/gradio-app/gradio/commit/5f3e84d870572b2851a5243be341d7aab4e166c1) - Ensure Clear sort works as expected.  Thanks @hannahblair!
- [#11117](https://github.com/gradio-app/gradio/pull/11117) [`9b976b7`](https://github.com/gradio-app/gradio/commit/9b976b750a61368f369bcefaacda6d4fb0975c5f) - Raise UI error if video not playable in the browser.  Thanks @freddyaboulton!
- [#11222](https://github.com/gradio-app/gradio/pull/11222) [`b2a93e1`](https://github.com/gradio-app/gradio/commit/b2a93e111d825bbf08883d12442ad66e2df19e84) - Add xethub bridge to host whitelist.  Thanks @abidlabs!
- [#11202](https://github.com/gradio-app/gradio/pull/11202) [`53688a2`](https://github.com/gradio-app/gradio/commit/53688a257cad85cf9df2c7a371bf80df20d51b17) - Fix Deep Link Issue.  Thanks @freddyaboulton!
- [#11206](https://github.com/gradio-app/gradio/pull/11206) [`c196ac2`](https://github.com/gradio-app/gradio/commit/c196ac25b7744e9dcfa788b1ac8edf6551eec1ff) - Render key fixes.  Thanks @aliabid94!
- [#11218](https://github.com/gradio-app/gradio/pull/11218) [`2f1c9d5`](https://github.com/gradio-app/gradio/commit/2f1c9d5e1bee3daf496eb57cc84f6f13309e0b86) - for Interface, have DeepLink disabled by default and then enable it after first submission.  Thanks @freddyaboulton!

## 5.29.1

### Features

- [#11185](https://github.com/gradio-app/gradio/pull/11185) [`e64b83b`](https://github.com/gradio-app/gradio/commit/e64b83bf42a813d9269e519189523f8390a72ec4) - Evaluate index variable in argument description.  Thanks @emmanuel-ferdman!
- [#11173](https://github.com/gradio-app/gradio/pull/11173) [`d023b2e`](https://github.com/gradio-app/gradio/commit/d023b2e2ffdf872f531e22b0310bc7855a756c7d) - Adds docs for `gr.api()` which were previously missing from the website.  Thanks @abidlabs!
- [#11159](https://github.com/gradio-app/gradio/pull/11159) [`cb9f21b`](https://github.com/gradio-app/gradio/commit/cb9f21be28d2077e61af7d58d9f66b90f2e5c07a) - chore: Support Path type for the favicon.  Thanks @wdroz!
- [#11183](https://github.com/gradio-app/gradio/pull/11183) [`ab0fbb3`](https://github.com/gradio-app/gradio/commit/ab0fbb32cdee752673313b5536c04eecadc1071e) - Plot brushing prevents chart refresh.  Thanks @aliabid94!
- [#11156](https://github.com/gradio-app/gradio/pull/11156) [`a1d436f`](https://github.com/gradio-app/gradio/commit/a1d436f7e62ea7d973ef176b4801ca6eb1be65a4) - Lazy import pandas in native_plot.py.  Thanks @whitphx!
- [#11129](https://github.com/gradio-app/gradio/pull/11129) [`d5ddd85`](https://github.com/gradio-app/gradio/commit/d5ddd85d4d5088cce154b1cd50a4a2db179ac227) - Ocean theme quickfix.  Thanks @aliabid94!

### Fixes

- [#11174](https://github.com/gradio-app/gradio/pull/11174) [`f11a26a`](https://github.com/gradio-app/gradio/commit/f11a26a31e8586eecb026e0b32a30f061462aa67) - Remove warning from gr.File about specifying file_types when file_count is directory.  Thanks @freddyaboulton!
- [#11189](https://github.com/gradio-app/gradio/pull/11189) [`88f06c7`](https://github.com/gradio-app/gradio/commit/88f06c7b8126a67edefd3116c764148d0f39c6c7) - Ensure that tabs with `visible=False` don't show up in the overflow menu.  Thanks @abidlabs!
- [#11181](https://github.com/gradio-app/gradio/pull/11181) [`ee7f17e`](https://github.com/gradio-app/gradio/commit/ee7f17e25642bc4b86f2272b3b5cfcf77c08adf1) - Fix the `.select()` event in `gr.Dataset` in table layout.  Thanks @abidlabs!
- [#11180](https://github.com/gradio-app/gradio/pull/11180) [`0595238`](https://github.com/gradio-app/gradio/commit/05952383bdc079814c560ebe7af3cd04e1474bed) - Refactor `gr.State`, `gr.BrowserState`, and `gr.Timer` to inherit from `FormComponent`.  Thanks @abidlabs!
- [#11195](https://github.com/gradio-app/gradio/pull/11195) [`0571f83`](https://github.com/gradio-app/gradio/commit/0571f83f47ad3ab657ed99324d015174eea27d92) - Fix bug where returning components in a dictionary would not work in reload mode.  Thanks @freddyaboulton!
- [#11179](https://github.com/gradio-app/gradio/pull/11179) [`caf46c7`](https://github.com/gradio-app/gradio/commit/caf46c7db930c07a776882615632fafe81db8cd1) - Fix `.unrender()`.  Thanks @abidlabs!
- [#11147](https://github.com/gradio-app/gradio/pull/11147) [`bc0d0e0`](https://github.com/gradio-app/gradio/commit/bc0d0e0ec53abb52ad81036646fa573080f9d763) - Fix "delete" diff instruction in JS client.  Thanks @freddyaboulton!
- [#11186](https://github.com/gradio-app/gradio/pull/11186) [`470a41f`](https://github.com/gradio-app/gradio/commit/470a41ffaaad1ca5d213c4e4098a742d333d5740) - #11056 Avoid unchecked pop from `blob_storage` cache in `ImageEditor::preprocess`.  Thanks @doraeneko!
- [#11171](https://github.com/gradio-app/gradio/pull/11171) [`85cfa82`](https://github.com/gradio-app/gradio/commit/85cfa826c4b65b3aa62397464e0a30aae2cdbeb1) - Fixes `save_history` not working when passing gradio component.  Thanks @dawoodkhan82!
- [#11184](https://github.com/gradio-app/gradio/pull/11184) [`f1a1c50`](https://github.com/gradio-app/gradio/commit/f1a1c5049ec1a5fcd3353b090a138fa63137790f) - Add Example component for JSON.  Thanks @freddyaboulton!
- [#11196](https://github.com/gradio-app/gradio/pull/11196) [`1bc680d`](https://github.com/gradio-app/gradio/commit/1bc680d2fffaf70687b0e7eb723d0454e9da826b) - Fix 500 error in /file= route.  Thanks @freddyaboulton!
- [#11151](https://github.com/gradio-app/gradio/pull/11151) [`0497068`](https://github.com/gradio-app/gradio/commit/049706886917af3d5dca288695dc418fc24640a3) - Fix builtin functions for gr.State value.  Thanks @freddyaboulton!
- [#11158](https://github.com/gradio-app/gradio/pull/11158) [`56ab579`](https://github.com/gradio-app/gradio/commit/56ab5799fab715e36fb540c580fd03ed0113a26c) - gr.Chatbot: Style fixes to remove multiple scrollbars.  Thanks @aymeric-roucher!
- [#11172](https://github.com/gradio-app/gradio/pull/11172) [`b618571`](https://github.com/gradio-app/gradio/commit/b618571ed17a8cece4bf9f1f55ed2e8bf7b59c46) - Fix python client SSE decoding issue.  Thanks @freddyaboulton!

## 5.29.0

### Features

- [#11103](https://github.com/gradio-app/gradio/pull/11103) [`098fb29`](https://github.com/gradio-app/gradio/commit/098fb29d384ddf2c8a09efd9746bc788d74e2a17) - Add `openapi.json` route for Gradio apps as well as docs on the "view API" page.  Thanks @abidlabs!

### Fixes

- [#11102](https://github.com/gradio-app/gradio/pull/11102) [`8cd4e53`](https://github.com/gradio-app/gradio/commit/8cd4e53a839d86ac69ea2d2eabfcb73e9ff4926c) - Fix file upload progress.  Thanks @freddyaboulton!
- [#11098](https://github.com/gradio-app/gradio/pull/11098) [`49ad594`](https://github.com/gradio-app/gradio/commit/49ad5943eeab96b153f0b56fe8d42d755fe1e0f8) - Fix #10281: Dragging image replaces existing instead of opening new tab.  Thanks @Martim-Rito!
- [#11113](https://github.com/gradio-app/gradio/pull/11113) [`c32f8de`](https://github.com/gradio-app/gradio/commit/c32f8de99a6ab3a82da2f8d5f9f3176a04129f77) - Fix markdown change event.  Thanks @freddyaboulton!
- [#11115](https://github.com/gradio-app/gradio/pull/11115) [`49e7a0d`](https://github.com/gradio-app/gradio/commit/49e7a0dd18174196b262d32e6c59d93ca40b1c73) - update STDIO instructions to specify sse-only transport.  Thanks @evalstate!
- [#11111](https://github.com/gradio-app/gradio/pull/11111) [`15d6297`](https://github.com/gradio-app/gradio/commit/15d6297261bfca97a2df30b9df358c7751386958) - Fix gradio cc environment.  Thanks @freddyaboulton!
- [#11112](https://github.com/gradio-app/gradio/pull/11112) [`0e5a75e`](https://github.com/gradio-app/gradio/commit/0e5a75e263dfd0557431e33771dd8cd49196b28e) - Fix passing datetime.datetime instance to gr.Datetime.  Thanks @freddyaboulton!
- [#11119](https://github.com/gradio-app/gradio/pull/11119) [`bb2c744`](https://github.com/gradio-app/gradio/commit/bb2c7443c25b12241ab218195251520e953f7e32) - Replace invalid characters in MCP tool name.  Thanks @abidlabs!

## 5.28.0

### Features

- [#10984](https://github.com/gradio-app/gradio/pull/10984) [`8dab577`](https://github.com/gradio-app/gradio/commit/8dab5771c7d952c76f325681dbf364119c91b0b1) - Let Gradio apps also be MCP Servers.  Thanks @abidlabs!

### Fixes

- [#11097](https://github.com/gradio-app/gradio/pull/11097) [`bb5a3c5`](https://github.com/gradio-app/gradio/commit/bb5a3c5b6b4459fb4d491bcc5a625e7fee7e502c) - Fix #10320: Chatbot - Ensure all messages in a group are editable.  Thanks @eduardopalricas33!

## 5.27.1

### Fixes

- [#11093](https://github.com/gradio-app/gradio/pull/11093) [`cb322df`](https://github.com/gradio-app/gradio/commit/cb322df1f4df858590e760a82f6410f3b6db899b) - Update client.py to always send file data, even for files without extensions.  Thanks @edmcman!
- [#11091](https://github.com/gradio-app/gradio/pull/11091) [`e3d80e3`](https://github.com/gradio-app/gradio/commit/e3d80e3c5c305ce84771ec78e5e25c705d4eff44) - Fix scaling issue when setting height in Image component.  Thanks @freddyaboulton!
- [#11088](https://github.com/gradio-app/gradio/pull/11088) [`a5105cc`](https://github.com/gradio-app/gradio/commit/a5105cccd6ca0682bd206608a080e24d69dad136) - fix: ensure all translation files work as expected.  Thanks @Col0ring!

## 5.27.0

### Features

- [#11027](https://github.com/gradio-app/gradio/pull/11027) [`eff532b`](https://github.com/gradio-app/gradio/commit/eff532b913a3c8f06f10a4f9471d3177e3744053) - Add new `ImageSlider` component.  Thanks @pngwn!

### Fixes

- [#11049](https://github.com/gradio-app/gradio/pull/11049) [`8d2aa3e`](https://github.com/gradio-app/gradio/commit/8d2aa3e99e165413bae1d8f5f3b4630e870308f5) - Ensure translations work as expected.  Thanks @hannahblair!

## 5.26.0

### Features

- [#11043](https://github.com/gradio-app/gradio/pull/11043) [`62a0080`](https://github.com/gradio-app/gradio/commit/62a00806e198c4c76bc132255d4b78c7aa329157) - Pass any visible error modals from a Gradio app downstream to the app that has `gr.load`-ed it.  Thanks @abidlabs!

### Fixes

- [#11038](https://github.com/gradio-app/gradio/pull/11038) [`fd46e48`](https://github.com/gradio-app/gradio/commit/fd46e48f516a2907c469c7a6d3e67ae9f7068b29) - Be able to dispatch Info messages from a component.  Thanks @freddyaboulton!
- [#11070](https://github.com/gradio-app/gradio/pull/11070) [`0355ef6`](https://github.com/gradio-app/gradio/commit/0355ef644577791749499c64840bad5947764dc8) - Ensure it is possible to draw after uploading an image to the ImageEditor.  Thanks @pngwn!
- [#11039](https://github.com/gradio-app/gradio/pull/11039) [`aaba2c6`](https://github.com/gradio-app/gradio/commit/aaba2c6358692c9e25a193f92f02069179052837) - Fix chatinterface icons bug.  Thanks @freddyaboulton!
- [#11057](https://github.com/gradio-app/gradio/pull/11057) [`bb1b74c`](https://github.com/gradio-app/gradio/commit/bb1b74cb62208f1cc05b91902cd541f36a1f9b01) - Image Editor Clear Event.  Thanks @freddyaboulton!
- [#11033](https://github.com/gradio-app/gradio/pull/11033) [`0dbc14f`](https://github.com/gradio-app/gradio/commit/0dbc14fa867ef57a2f810e0b869b7d13d98f2544) - Allow setting an empty value in `display_value` of `gr.Dataframe`.  Thanks @abidlabs!
- [#11040](https://github.com/gradio-app/gradio/pull/11040) [`3d3c701`](https://github.com/gradio-app/gradio/commit/3d3c701c46628898dee939629f57fcd3bc6c04c8) - Show stop button in `gr.ChatInterface` even for non-streaming chat functions.  Thanks @abidlabs!
- [#11052](https://github.com/gradio-app/gradio/pull/11052) [`2750d48`](https://github.com/gradio-app/gradio/commit/2750d485450f7de9b8d01144b939893e39c8397e) - Fix duplicate id issue in spaces when creating an interface inside blocks.  Thanks @freddyaboulton!

## 5.25.2

### Fixes

- [#11021](https://github.com/gradio-app/gradio/pull/11021) [`c57a7ff`](https://github.com/gradio-app/gradio/commit/c57a7ff659ecea1bc540b359446aefd19f06085a) - Ensure that logins and logouts are redirected to the correct page in a multipage Gradio app.  Thanks @abidlabs!
- [#11025](https://github.com/gradio-app/gradio/pull/11025) [`d24f8fd`](https://github.com/gradio-app/gradio/commit/d24f8fdc9da889e94f094f8bedbc7b8475e3acb7) - Fix `ssr_mode` parameter name in notice message.  Thanks @oxkitsune!
- [#11020](https://github.com/gradio-app/gradio/pull/11020) [`a4a3a03`](https://github.com/gradio-app/gradio/commit/a4a3a03d513c3df8a85c2742be34b80bcf406496) - Fix streaming / stopping button when examples are clicked in `gr.ChatInterface`.  Thanks @abidlabs!

## 5.25.1

### Features

- [#11014](https://github.com/gradio-app/gradio/pull/11014) [`7f92d5f`](https://github.com/gradio-app/gradio/commit/7f92d5ff7b39ea973bc17027ec8c158d3e376b87) - Update docs to reflect 1 week timeout.  Thanks @abidlabs!

### Fixes

- [#11017](https://github.com/gradio-app/gradio/pull/11017) [`734b309`](https://github.com/gradio-app/gradio/commit/734b3099d79647695e635d87726666d4b28d1bcf) - Include HF token in stream requests.  Thanks @nostalgebraist!
- [#11018](https://github.com/gradio-app/gradio/pull/11018) [`3615a45`](https://github.com/gradio-app/gradio/commit/3615a454eb8cf5f758743494a15ce8af2fe16278) - Create share link automatically in Sagemaker notebooks.  Thanks @abidlabs!
- [#11010](https://github.com/gradio-app/gradio/pull/11010) [`9219e62`](https://github.com/gradio-app/gradio/commit/9219e62cd21243fd9f5abecbe991e3b29039c76e) - fix: add svg tags for markdown when `allow_tags=True`.  Thanks @Col0ring!
- [#11005](https://github.com/gradio-app/gradio/pull/11005) [`3def0ed`](https://github.com/gradio-app/gradio/commit/3def0ed9edc5a9194d69456948324ec4e2740b7d) - Ensure that the `.select()` event in `gr.DataFrame` carries the `.row_value` and `.col_value`.  Thanks @abidlabs!

## 5.25.0

### Features

- [#10980](https://github.com/gradio-app/gradio/pull/10980) [`370b3e2`](https://github.com/gradio-app/gradio/commit/370b3e254411bce354354f6e14753cda464cc463) - Add i18n for chatbot interactions.  Thanks @freddyaboulton!
- [#10970](https://github.com/gradio-app/gradio/pull/10970) [`bb45441`](https://github.com/gradio-app/gradio/commit/bb454415a608acd862486da46f5bf60a7d3db2a9) - fix: accept signed URLs in gr.Audio.  Thanks @jerpint!
- [#10982](https://github.com/gradio-app/gradio/pull/10982) [`a80b312`](https://github.com/gradio-app/gradio/commit/a80b312c081a03b5bd73477305e2f094da512b37) - Add latex to code component languages.  Thanks @ginazhouhuiwu!
- [#10981](https://github.com/gradio-app/gradio/pull/10981) [`0db230f`](https://github.com/gradio-app/gradio/commit/0db230f5c2f19d9b3b455adb1b30ed9374ae1791) - allow users to change the visibility of layers in the image editor.  Thanks @pngwn!

### Fixes

- [#10993](https://github.com/gradio-app/gradio/pull/10993) [`1918baa`](https://github.com/gradio-app/gradio/commit/1918baa178066dc94a8e1a559d4d62a52a3d8db4) - Update babylon.js and ensure the Model3D component autoplays on load.  Thanks @CedricGuillemet!
- [#10968](https://github.com/gradio-app/gradio/pull/10968) [`238702a`](https://github.com/gradio-app/gradio/commit/238702a709c23f9c1b6302eb143c7cb71a3a066b) - Fix Default meta social tags + Add ability to override existing meta tags.  Thanks @dawoodkhan82!
- [#10999](https://github.com/gradio-app/gradio/pull/10999) [`8c70819`](https://github.com/gradio-app/gradio/commit/8c70819f87027b75e44f49a13050ae2c3e8b3580) - implement download button for the ImageEditor.  Thanks @pngwn!
- [#10997](https://github.com/gradio-app/gradio/pull/10997) [`45d5840`](https://github.com/gradio-app/gradio/commit/45d5840fb265328f3aa0c050ce9c6b87ae7dbbc5) - When custom layers are provided to the ImageEditor, always default to the first layer.  Thanks @pngwn!
- [#10979](https://github.com/gradio-app/gradio/pull/10979) [`975feee`](https://github.com/gradio-app/gradio/commit/975feee3925e5b65e52ae00da5c5066d8889ae6a) - improve webcam options for the ImageEditor.  Thanks @pngwn!
- [#10995](https://github.com/gradio-app/gradio/pull/10995) [`fc59815`](https://github.com/gradio-app/gradio/commit/fc598151aa9c77a84f6e7eaf9bcc0cae6ba49369) - ensure the image editor background respects the theme mode.  Thanks @pngwn!
- [#10994](https://github.com/gradio-app/gradio/pull/10994) [`714015a`](https://github.com/gradio-app/gradio/commit/714015a1868168721ae79d6b5bc10fbc5bbb4290) - ensure images uploaded to the ImageEditor correctly initialise the canvas dimensions.  Thanks @pngwn!

## 5.24.0

### Features

- [#10933](https://github.com/gradio-app/gradio/pull/10933) [`b768651`](https://github.com/gradio-app/gradio/commit/b7686515d99276123731698bfde09bb328b7d286) - Add `rtl` to Block Label.  Thanks @hannahblair!
- [#10924](https://github.com/gradio-app/gradio/pull/10924) [`be46b94`](https://github.com/gradio-app/gradio/commit/be46b94f51c29d66fef9320d59a7f7e5a0df81b4) - Add `rtl` to gr.HighlightedText.  Thanks @hannahblair!
- [#10635](https://github.com/gradio-app/gradio/pull/10635) [`2f68c9d`](https://github.com/gradio-app/gradio/commit/2f68c9d988dcbc53a0b8e53bdb1de49c9c8c65d8) - Refactor and redesign `ImageEditor` component.  Thanks @pngwn!
- [#10923](https://github.com/gradio-app/gradio/pull/10923) [`8a62c7e`](https://github.com/gradio-app/gradio/commit/8a62c7e90b5e0945709d97e34f405a7f92675ab0) - Add `rtl` to `gr.Radio`.  Thanks @hannahblair!
- [#10927](https://github.com/gradio-app/gradio/pull/10927) [`5b3414a`](https://github.com/gradio-app/gradio/commit/5b3414a3e4214ae0a6f97d1236127607bb070cd6) - Change the location where the FRPC binary is downloaded.  Thanks @abidlabs!
- [#10935](https://github.com/gradio-app/gradio/pull/10935) [`6754d82`](https://github.com/gradio-app/gradio/commit/6754d82a257c98f06ed38c5d1f952aec38d738ca) - Relax aiofiles verison.  Thanks @freddyaboulton!

### Fixes

- [#10955](https://github.com/gradio-app/gradio/pull/10955) [`d654e60`](https://github.com/gradio-app/gradio/commit/d654e60ff61f76ebcf37f294f1d85305d344a70b) - Map search-filtered row indices to original data indices in gr.Dataframe.  Thanks @hannahblair!
- [#10918](https://github.com/gradio-app/gradio/pull/10918) [`36da6d0`](https://github.com/gradio-app/gradio/commit/36da6d0d5466dd251f46359019959702523f1afc) - Fix value synchronisation issue in gr.Dataframe.  Thanks @hannahblair!
- [#10953](https://github.com/gradio-app/gradio/pull/10953) [`ede7428`](https://github.com/gradio-app/gradio/commit/ede74283d738f55e032a98fb1875605cb0b65d8a) - Fix gr.NativePlot sorting of labels as default behaviour.  Thanks @Rafalex04!
- [#10925](https://github.com/gradio-app/gradio/pull/10925) [`c37de0f`](https://github.com/gradio-app/gradio/commit/c37de0f9081f30ac963b0c837e8f1985461afbb1) - Tweak `rtl` UI in `gr.MultimodalTextbox`.  Thanks @hannahblair!
- [#10962](https://github.com/gradio-app/gradio/pull/10962) [`c851862`](https://github.com/gradio-app/gradio/commit/c85186254cdf065acb9e75f7e65f967533fddd03) - Unrender user-provided textbox in `gr.ChatInterface` so that it is rendered in the right place as part of a `gr.Blocks` app.  Thanks @abidlabs!
- [#10928](https://github.com/gradio-app/gradio/pull/10928) [`f09f543`](https://github.com/gradio-app/gradio/commit/f09f543af46bf286218904179c3a9bc3e2a1e257) - Reverse order of conversations in chat history and render correctly with custom chatbot.  Thanks @abidlabs!

## 5.23.3

### Features

- [#10845](https://github.com/gradio-app/gradio/pull/10845) [`2521e8a`](https://github.com/gradio-app/gradio/commit/2521e8a1c76fe77253156bf8465500b9cb1db5c4) - Check if SharedWorker is available in the current runtime and fallback to DedicatedWorker if not available.  Thanks @whitphx!
- [#10926](https://github.com/gradio-app/gradio/pull/10926) [`d81385b`](https://github.com/gradio-app/gradio/commit/d81385bdb939a81718339b806f0c3f71d64f6dc5) - Add status docs to MetadataDict.  Thanks @aliabd!
- [#10847](https://github.com/gradio-app/gradio/pull/10847) [`d5fde7c`](https://github.com/gradio-app/gradio/commit/d5fde7c390004ce5394072100b059f545d2d4eae) - Babylon update for model3D.  Thanks @CedricGuillemet!
- [#10890](https://github.com/gradio-app/gradio/pull/10890) [`01b88c7`](https://github.com/gradio-app/gradio/commit/01b88c7fdedb413ba92ef6191967a8aed25e185f) - Improve API error handling in JS Client.  Thanks @l2dy!

### Fixes

- [#10913](https://github.com/gradio-app/gradio/pull/10913) [`2322700`](https://github.com/gradio-app/gradio/commit/2322700812341a71a200958cdca793ca865c08c4) - Update i18n files.  Thanks @freddyaboulton!
- [#10922](https://github.com/gradio-app/gradio/pull/10922) [`afe0b13`](https://github.com/gradio-app/gradio/commit/afe0b139fa8715eabc28362aaffe6e0b50b239a5) - Fix regression around chatbot thoughts not being collapsible.  Thanks @abidlabs!
- [#10901](https://github.com/gradio-app/gradio/pull/10901) [`64a6ead`](https://github.com/gradio-app/gradio/commit/64a6ead05c99cfd5787e7f112838f2be83082a69) - Fix EventData scaling when `gr.Image` is in fullscreen mode.  Thanks @tiago-gsantos!
- [#10921](https://github.com/gradio-app/gradio/pull/10921) [`c8d6ddd`](https://github.com/gradio-app/gradio/commit/c8d6ddd344495dfa4d97afba708b342ee5e84a63) - Refactor `get_request_url`.  Thanks @abidlabs!

## 5.23.2

### Features

- [#10908](https://github.com/gradio-app/gradio/pull/10908) [`09a8d0c`](https://github.com/gradio-app/gradio/commit/09a8d0c87b5b37d6c5ea1d40d103fd17fc4f24f1) - Pin `pydantic` version.  Thanks @abidlabs!
- [#10897](https://github.com/gradio-app/gradio/pull/10897) [`1e8cdee`](https://github.com/gradio-app/gradio/commit/1e8cdee48a2c897e2cd3751bf51dda85b48529d9) - Fix route_utils.get_api_call_path().  Thanks @whitphx!
- [#10891](https://github.com/gradio-app/gradio/pull/10891) [`17fed95`](https://github.com/gradio-app/gradio/commit/17fed951a9bd6ef02fc4430b2dc61e7cd358cd9e) - Fix empty array check in arrow key handling in `gr.Dropdown`.  Thanks @l2dy!

### Fixes

- [#10900](https://github.com/gradio-app/gradio/pull/10900) [`a018a46`](https://github.com/gradio-app/gradio/commit/a018a46a7fae0f7db25baca7e1c08e6fd5912ed2) - Fix wrap behaviour in dataframe.  Thanks @hannahblair!
- [#10892](https://github.com/gradio-app/gradio/pull/10892) [`bfb7aae`](https://github.com/gradio-app/gradio/commit/bfb7aae299093c9295fca601bded9198fca30744) - Fix minor heartbeat memory leak.  Thanks @brentyi!
- [#10902](https://github.com/gradio-app/gradio/pull/10902) [`b9b8d08`](https://github.com/gradio-app/gradio/commit/b9b8d08bd2cfb4c89444f5ca3066b1d733c8a807) - Fix disabling buttons in `MultimodalTextbox` when `interactive=False`.  Thanks @lara-gfaria!
- [#10882](https://github.com/gradio-app/gradio/pull/10882) [`cd7f486`](https://github.com/gradio-app/gradio/commit/cd7f486c61b86a8fcf0157ee884f8f96534ffcc5) - Fix root on gradio mounted apps.  Thanks @aliabid94!

## 5.23.1

### Features

- [#10877](https://github.com/gradio-app/gradio/pull/10877) [`b19e8ad`](https://github.com/gradio-app/gradio/commit/b19e8ad26789146a8b4dcab65715b2bc05937d7c) - Switch from `root_url` to `request.url` in `get_api_call_path()`.  Thanks @abidlabs!
- [#10879](https://github.com/gradio-app/gradio/pull/10879) [`3ba9e4f`](https://github.com/gradio-app/gradio/commit/3ba9e4febb9d32a7d523af46e0484face4cc8e64) - Fix request url.  Thanks @abidlabs!

### Fixes

- [#10872](https://github.com/gradio-app/gradio/pull/10872) [`84fafc4`](https://github.com/gradio-app/gradio/commit/84fafc45bf9f8fbc5fe39ff20dbb7108d0a66e94) - Fix `/monitoring` endpoint.  Thanks @aliabid94!
- [#10873](https://github.com/gradio-app/gradio/pull/10873) [`3a3d0d9`](https://github.com/gradio-app/gradio/commit/3a3d0d93884ccf498713bad748bacdd5294b535e) - Improve UI for lazy caching.  Thanks @abidlabs!

## 5.23.0

### Features

- [#10858](https://github.com/gradio-app/gradio/pull/10858) [`e30348b`](https://github.com/gradio-app/gradio/commit/e30348b085b045e5aac5bd8a41e1cf5485c8c56d) - Gradio sketch: Remove HF Inference health check.  Thanks @aliabid94!
- [#10834](https://github.com/gradio-app/gradio/pull/10834) [`c05610c`](https://github.com/gradio-app/gradio/commit/c05610c87dd7f9e9fe5d0aed2fe93e40fdd32648) - Add Deep Links.  Thanks @freddyaboulton!
- [#10838](https://github.com/gradio-app/gradio/pull/10838) [`a06c7e4`](https://github.com/gradio-app/gradio/commit/a06c7e40e2ddb5c526c195d31832f6e97b669291) - Allow for iterative coding in gradio sketch.  Thanks @aliabid94!
- [#10862](https://github.com/gradio-app/gradio/pull/10862) [`243942e`](https://github.com/gradio-app/gradio/commit/243942e5e47d22a4f512f31313bc3098a0a5b77d) - fix typing of gr.on event listener.  Thanks @JackismyShephard!
- [#10859](https://github.com/gradio-app/gradio/pull/10859) [`a1862f5`](https://github.com/gradio-app/gradio/commit/a1862f54a741002bc78bc36fc3c3cb78856fad66) - fix typing on load event listener.  Thanks @JackismyShephard!
- [#10854](https://github.com/gradio-app/gradio/pull/10854) [`1649b00`](https://github.com/gradio-app/gradio/commit/1649b0038482402d7f0ccdbf86ba65d82b4a12c9) - Add support for `mermaid.js` in `Markdown` component (as well as components like `gr.Chatbot` that use Markdown).  Thanks @abidlabs!
- [#10812](https://github.com/gradio-app/gradio/pull/10812) [`6384bcc`](https://github.com/gradio-app/gradio/commit/6384bcc11f13d22f4480e7ad7213486fecec8936) - Jedi-based Python code completion on `gr.Code`.  Thanks @whitphx!
- [#10870](https://github.com/gradio-app/gradio/pull/10870) [`f40e008`](https://github.com/gradio-app/gradio/commit/f40e00855593182faba3595fe9d913defbb8130f) - Change `gr.DeepLinkButton` default variant to be secondary.  Thanks @abidlabs!

### Fixes

- [#10841](https://github.com/gradio-app/gradio/pull/10841) [`8ff0a5e`](https://github.com/gradio-app/gradio/commit/8ff0a5e3e916ba6dfe6255ffcf4d09868ab29bde) - Fix path generation for returned files for bash API.  Thanks @cansik!
- [#10860](https://github.com/gradio-app/gradio/pull/10860) [`fb4c3da`](https://github.com/gradio-app/gradio/commit/fb4c3dacd06803fdf0634481e9db080425f67023) - bug fix logout if there is root_path in launch.  Thanks @azharizz!

## 5.22.0

### Features

- [#10824](https://github.com/gradio-app/gradio/pull/10824) [`4d78710`](https://github.com/gradio-app/gradio/commit/4d78710bbf266a13568d7920c19a6ef6dd167ecf) - Sketch code generator.  Thanks @aliabid94!
- [#10814](https://github.com/gradio-app/gradio/pull/10814) [`b42e461`](https://github.com/gradio-app/gradio/commit/b42e4612abad205e0269bd69917c09565daf0cf7) - Adds a watermark parameter to `gr.Chatbot` that is added to copied text.  Thanks @abidlabs!
- [#10820](https://github.com/gradio-app/gradio/pull/10820) [`4fa8e00`](https://github.com/gradio-app/gradio/commit/4fa8e00c31812797d1a73d18f1e0ce7cdf17ab27) - Update `markupsafe` dependency version.  Thanks @abidlabs!

### Fixes

- [#10829](https://github.com/gradio-app/gradio/pull/10829) [`e0ab4f0`](https://github.com/gradio-app/gradio/commit/e0ab4f07ab3af83cbc62ede6d9c78674e684c688) - Fix gr.load_chat.  Thanks @aliabid94!
- [#10819](https://github.com/gradio-app/gradio/pull/10819) [`ac075ad`](https://github.com/gradio-app/gradio/commit/ac075ad6aaea855bfd4839cef7140719a584498e) - Fix cell menu not showing in non-editable dataframes.  Thanks @hannahblair!

## 5.21.0

### Features

- [#10784](https://github.com/gradio-app/gradio/pull/10784) [`6812544`](https://github.com/gradio-app/gradio/commit/681254453a15dadde068feaec176bb984710292b) - On Windows OS, hide `gr.Dataframe` scrollbars while keeping scrolling functionality.  Thanks @abidlabs!
- [#10802](https://github.com/gradio-app/gradio/pull/10802) [`9ec8898`](https://github.com/gradio-app/gradio/commit/9ec8898c0f5753fb548a89f9804b71b69797d00c) - Fix excess scroll bug in dataframe.  Thanks @hannahblair!
- [#10805](https://github.com/gradio-app/gradio/pull/10805) [`8d03368`](https://github.com/gradio-app/gradio/commit/8d03368243b6365d279563cf38a18b67a0efaf69) - Fix max characters in non-editable dataframes.  Thanks @hannahblair!
- [#10787](https://github.com/gradio-app/gradio/pull/10787) [`b3e8c26`](https://github.com/gradio-app/gradio/commit/b3e8c263be51f9553e9f19939be0f880092b44c9) - Implement cell selection via drag in dataframe.  Thanks @hannahblair!
- [#10734](https://github.com/gradio-app/gradio/pull/10734) [`c44b8f4`](https://github.com/gradio-app/gradio/commit/c44b8f47b927258552af61c3af06f2e30449f571) - Add `static_columns` param for interactive dataframes.  Thanks @hannahblair!
- [#10778](https://github.com/gradio-app/gradio/pull/10778) [`373007b`](https://github.com/gradio-app/gradio/commit/373007b3e9d019ee41589d1dbb09a7511a024a51) - Allow sorting by multiple columns in dataframe.  Thanks @hannahblair!
- [#10804](https://github.com/gradio-app/gradio/pull/10804) [`39c30be`](https://github.com/gradio-app/gradio/commit/39c30be1628028a86400c1e4b993db51e91b2580) - Add parent focus for drag selection.  Thanks @hannahblair!
- [#10777](https://github.com/gradio-app/gradio/pull/10777) [`3b48367`](https://github.com/gradio-app/gradio/commit/3b483672f4778f5b19d2f529328c1f71b3742f45) - Allow navigating down from header cells, as well as support cmd/ctrl + arrow keys.  Thanks @abidlabs!
- [#10776](https://github.com/gradio-app/gradio/pull/10776) [`85f6132`](https://github.com/gradio-app/gradio/commit/85f6132f1f9f653329edfa22f627e342e8b42731) - Fix cell selection when using shift + arrow keys.  Thanks @abidlabs!
- [#10733](https://github.com/gradio-app/gradio/pull/10733) [`731ab92`](https://github.com/gradio-app/gradio/commit/731ab92001c88d4cf1062acf0a4f1108a4513014) - Autocompletion on code editor component.  Thanks @whitphx!
- [#10743](https://github.com/gradio-app/gradio/pull/10743) [`3086343`](https://github.com/gradio-app/gradio/commit/3086343a6832a941864d77821b23c31c8b26be7f) - Fixed size for pending thoughts.  Thanks @dawoodkhan82!
- [#10768](https://github.com/gradio-app/gradio/pull/10768) [`0ce7bfe`](https://github.com/gradio-app/gradio/commit/0ce7bfe1bd733b30645a4833ba29988b4641acc7) - Allow tags for chatbot models using `gr.load`.  Thanks @dawoodkhan82!

### Fixes

- [#10757](https://github.com/gradio-app/gradio/pull/10757) [`b4342d2`](https://github.com/gradio-app/gradio/commit/b4342d24a88acaa4ed4028c8fdd44eea0d1b8b57) - Fix dataframe search and filter functionality.  Thanks @hannahblair!
- [#10786](https://github.com/gradio-app/gradio/pull/10786) [`88941b6`](https://github.com/gradio-app/gradio/commit/88941b655e708ab14611341ed3fe57452fbbfc58) - Remove fixed layouts from dataframe.  Thanks @hannahblair!
- [#10631](https://github.com/gradio-app/gradio/pull/10631) [`b5ca1dc`](https://github.com/gradio-app/gradio/commit/b5ca1dcfdf496292eade31347ae1974d3a0976c4) - Refactor `gr.Dataframe`.  Thanks @hannahblair!
- [#10785](https://github.com/gradio-app/gradio/pull/10785) [`fb8c1cb`](https://github.com/gradio-app/gradio/commit/fb8c1cb6d159fbcec80749f691e9b783bc212936) - Move `gr.Textbox` lines logic to frontend.  Thanks @abidlabs!
- [#10765](https://github.com/gradio-app/gradio/pull/10765) [`3232cdd`](https://github.com/gradio-app/gradio/commit/3232cddc00be4a8ac441177e4fe408fb193fdb0f) - fix: latex rendering of markdown.  Thanks @Col0ring!
- [#10735](https://github.com/gradio-app/gradio/pull/10735) [`dd2de17`](https://github.com/gradio-app/gradio/commit/dd2de17064dc6794f94b0bfad973ab5aba671b10) - Fix windows path issue in FileExplorer.  Thanks @aliabid94!

## 5.20.1

### Features

- [#10694](https://github.com/gradio-app/gradio/pull/10694) [`16244f3`](https://github.com/gradio-app/gradio/commit/16244f3c1cb1a65ac1f719142f8fab67512fbb25) - Event Listeners in gradio sketch.  Thanks @aliabid94!
- [#10732](https://github.com/gradio-app/gradio/pull/10732) [`2b38420`](https://github.com/gradio-app/gradio/commit/2b3842066bc625518afeb182d65d2ef37a3e835e) - Changed warning stacklevel to improve warnings in console.  Thanks @wolph!
- [#10720](https://github.com/gradio-app/gradio/pull/10720) [`2248005`](https://github.com/gradio-app/gradio/commit/2248005b10056d858028e1bb65b5921117ab13f5) - Add `pwa` and `enable_monitoring` parameters to `mount_gradio_app`.  Thanks @abidlabs!
- [#10737](https://github.com/gradio-app/gradio/pull/10737) [`1cf992b`](https://github.com/gradio-app/gradio/commit/1cf992b04225580b9c7c4d4dd0c84e5a7ebe6ad3) - Sidebar fixed positioning.  Thanks @dawoodkhan82!
- [#10728](https://github.com/gradio-app/gradio/pull/10728) [`9fce28b`](https://github.com/gradio-app/gradio/commit/9fce28b76be0683ac5c9b07beac0479023671622) - Allow sending a custom TLS certificate or no TLS certificate when connecting to custom share servers.  Thanks @abidlabs!

### Fixes

- [#10748](https://github.com/gradio-app/gradio/pull/10748) [`19411c6`](https://github.com/gradio-app/gradio/commit/19411c6b15cde53371425a9eb6037ce4a10f7442) - Fix ClearButton.  Thanks @phos-phophy!
- [#10721](https://github.com/gradio-app/gradio/pull/10721) [`b3ac430`](https://github.com/gradio-app/gradio/commit/b3ac430d5e8f93ffea993f7af51f9171a50026a1) - Check for Node.js path only if SSR mode is true.  Thanks @anirbanbasu!
- [#10724](https://github.com/gradio-app/gradio/pull/10724) [`667f8a1`](https://github.com/gradio-app/gradio/commit/667f8a1f820d46a4d87ad0f65b9e3b37c4de449f) - Fix Chatbot avatar image position.  Thanks @abidlabs!
- [#10719](https://github.com/gradio-app/gradio/pull/10719) [`b710d7c`](https://github.com/gradio-app/gradio/commit/b710d7cf13c1277fd18c7809cad0f707b880ef70) - Fix error display.  Thanks @aliabid94!
- [#10706](https://github.com/gradio-app/gradio/pull/10706) [`5faa2a3`](https://github.com/gradio-app/gradio/commit/5faa2a34cc3b6ab647cab84d7495bfe8624955e3) - chore: bump Pyodide version to 0.27.3.  Thanks @peter-gy!

## 5.20.0

### Features

- [#10688](https://github.com/gradio-app/gradio/pull/10688) [`bd982df`](https://github.com/gradio-app/gradio/commit/bd982df85b07e4686e223241d68f08bf242c3ef9) - Change `gr.load` chatinterface behavior to streaming.  Thanks @abidlabs!
- [#10500](https://github.com/gradio-app/gradio/pull/10500) [`16d419b`](https://github.com/gradio-app/gradio/commit/16d419b9f1f18ae4507d18a4739eb83ac4f3fae9) - Allow functions that solely update component properties to run in the frontend by setting `js=True`.  Thanks @abidlabs!

## 5.19.0

### Features

- [#10647](https://github.com/gradio-app/gradio/pull/10647) [`b43200d`](https://github.com/gradio-app/gradio/commit/b43200d7df92e40285c1e5fb1a2f010278fce5d2) - Custom styling of the dataframe.  Thanks @abidlabs!
- [#10577](https://github.com/gradio-app/gradio/pull/10577) [`374b762`](https://github.com/gradio-app/gradio/commit/374b762b7fc94073517a2fd8b28473a558f454fc) - Support `gr.LoginButton` for `gr.load()`.  Thanks @abidlabs!
- [#10679](https://github.com/gradio-app/gradio/pull/10679) [`cb3c762`](https://github.com/gradio-app/gradio/commit/cb3c76205c3fc1fae55229b5efe223c6d5c5c907) - Add Thai Translate.  Thanks @haihandsome!
- [#10678](https://github.com/gradio-app/gradio/pull/10678) [`249eccd`](https://github.com/gradio-app/gradio/commit/249eccd81ae289658d0ba8e1033c12f407a07ee7) - Fix Dataframe header type to allow integer values.  Thanks @abidlabs!

### Fixes

- [#10659](https://github.com/gradio-app/gradio/pull/10659) [`36309ea`](https://github.com/gradio-app/gradio/commit/36309ea55fba6017f8a7f2be1484989ecccdac1b) - Automatically restore last scroll position in multiple-choice dropdowns.  Thanks @XcantloadX!
- [#10683](https://github.com/gradio-app/gradio/pull/10683) [`367fe14`](https://github.com/gradio-app/gradio/commit/367fe14381a971c45528d50052121439a023bfc0) - Fix chatbot share button payload too large.  Thanks @dawoodkhan82!

## 5.18.0

### Features

- [#10643](https://github.com/gradio-app/gradio/pull/10643) [`f0a920c`](https://github.com/gradio-app/gradio/commit/f0a920c4934880645fbad783077ae9c7519856ce) - added a show_line_numbers to toggle line numbers in gr.Code().  Thanks @lalitx17!
- [#10664](https://github.com/gradio-app/gradio/pull/10664) [`0b1f729`](https://github.com/gradio-app/gradio/commit/0b1f72941fd50298562102e39f4feafaa16f5968) - Allow websocket version 15.  Thanks @freddyaboulton!
- [#10636](https://github.com/gradio-app/gradio/pull/10636) [`d06f3e3`](https://github.com/gradio-app/gradio/commit/d06f3e3e08d0270b58cefa1be748e6cfd2362c21) - Chatbot thoughts generating animation.  Thanks @dawoodkhan82!

## 5.17.1

### Features

- [#10641](https://github.com/gradio-app/gradio/pull/10641) [`d7607a2`](https://github.com/gradio-app/gradio/commit/d7607a21b5247a9e82638c07359f70a6776f5747) - Ergonomics improvements & analytics for `gradio sketch`.  Thanks @abidlabs!
- [#10646](https://github.com/gradio-app/gradio/pull/10646) [`b01ce47`](https://github.com/gradio-app/gradio/commit/b01ce47056f5752fbf03e44600bf0f7dab69b64c) - Fixes cell-selection logic in `Table.svelte`.  Thanks @abidlabs!

### Fixes

- [#10650](https://github.com/gradio-app/gradio/pull/10650) [`7c8b0da`](https://github.com/gradio-app/gradio/commit/7c8b0dab0be2e87ad027d0c786bf741e205ae137) - Fix deployed Spaces.  Thanks @abidlabs!

## 5.17.0

### Features

- [#10569](https://github.com/gradio-app/gradio/pull/10569) [`bd4895a`](https://github.com/gradio-app/gradio/commit/bd4895a95a29fa1f0d12fefde26a82a1d60954e9) - Update Lite to support multi-page apps.  Thanks @whitphx!
- [#10630](https://github.com/gradio-app/gradio/pull/10630) [`77432c7`](https://github.com/gradio-app/gradio/commit/77432c7fa84c56ef76364bf23f4273e889a94a71) - gradio sketch - UI based gradio skeleton builder.  Thanks @aliabid94!

### Fixes

- [#10622](https://github.com/gradio-app/gradio/pull/10622) [`b505df0`](https://github.com/gradio-app/gradio/commit/b505df0b883d119d4660c25519497c4d86eea8d5) - Fix fill_width.  Thanks @aliabid94!
- [#10616](https://github.com/gradio-app/gradio/pull/10616) [`ae4ba46`](https://github.com/gradio-app/gradio/commit/ae4ba46cfb9235904f8bfc197c72ad22275edd67) - Change sidebar to absolute positioning and make accessible.  Thanks @dawoodkhan82!
- [#10637](https://github.com/gradio-app/gradio/pull/10637) [`75c9748`](https://github.com/gradio-app/gradio/commit/75c9748f50f5825dae601e0a15b85ec666819b6a) - Fix: Chatbot sharing payload too large.  Thanks @dawoodkhan82!

## 5.16.2

### Features

- [#10625](https://github.com/gradio-app/gradio/pull/10625) [`ce4fb99`](https://github.com/gradio-app/gradio/commit/ce4fb994e042489d8c6fbcab3e94d97b08369dce) - fix spelling of `resizable` parameter in `gr.Chatbot`.  Thanks @abidlabs!
- [#10594](https://github.com/gradio-app/gradio/pull/10594) [`f0e4fd0`](https://github.com/gradio-app/gradio/commit/f0e4fd0522dd0f02701e0c4d3e694f6e6198db9d) - Fix `Blocks.serve_static_file` and `Button.svelte` to work on Lite.  Thanks @whitphx!

### Fixes

- [#10580](https://github.com/gradio-app/gradio/pull/10580) [`4e70d74`](https://github.com/gradio-app/gradio/commit/4e70d74068b77ebb3d285aa78e9202fff76337a2) - Fix `gr.load()` for `gr.ChatInterface(save_history=True)` and any Gradio app where the upstream app includes a `gr.State` as input.  Thanks @abidlabs!
- [#10624](https://github.com/gradio-app/gradio/pull/10624) [`f8eb8e5`](https://github.com/gradio-app/gradio/commit/f8eb8e565b720977791824659d9eed270ea4b2d0) - Pass kwargs into `gr.ChatInterface` created by `gr.load()`.  Thanks @abidlabs!
- [#10597](https://github.com/gradio-app/gradio/pull/10597) [`8c87eb8`](https://github.com/gradio-app/gradio/commit/8c87eb83066278b0e28267a6648d4729d6f39aa9) - Fix issue where styling changes were overridden when value was updated simultaneously.  Thanks @abidlabs!

## 5.16.1

### Features

- [#10579](https://github.com/gradio-app/gradio/pull/10579) [`b640df2`](https://github.com/gradio-app/gradio/commit/b640df2517dee166634f279fcfaac8ba5f5aef2f) - Fix Sidebar for mobile.  Thanks @dawoodkhan82!
- [#10582](https://github.com/gradio-app/gradio/pull/10582) [`1299267`](https://github.com/gradio-app/gradio/commit/1299267a8a78546d3f9e13d6b3c58231cf88f2b9) - Change sidebar position.  Thanks @dawoodkhan82!
- [#10511](https://github.com/gradio-app/gradio/pull/10511) [`c4aa886`](https://github.com/gradio-app/gradio/commit/c4aa8864dabec4caeb59af91f6f1aaaf50e33b67) - Semantic search in the playground.  Thanks @aliabd!

### Fixes

- [#10607](https://github.com/gradio-app/gradio/pull/10607) [`c354f5f`](https://github.com/gradio-app/gradio/commit/c354f5ff16c787d722f4e53d5a97f729abba955e) - Add empty dataframe functionality.  Thanks @hannahblair!
- [#10596](https://github.com/gradio-app/gradio/pull/10596) [`a8bde76`](https://github.com/gradio-app/gradio/commit/a8bde76e2b0f65b3565019beb03ac8b1fd152963) - Fix margin above `gr.Dataframe` when no header is provided.  Thanks @abidlabs!
- [#10608](https://github.com/gradio-app/gradio/pull/10608) [`b8fada8`](https://github.com/gradio-app/gradio/commit/b8fada87724cdc76b5862f84a1025f7da151db42) - [ZeroGPU] Handshake-based postMessage part.2 (non-SSR mode).  Thanks @cbensimon!
- [#10595](https://github.com/gradio-app/gradio/pull/10595) [`12669f4`](https://github.com/gradio-app/gradio/commit/12669f4bf1a4d6bd8df29583b6c185ded51dff48) - Row scale changes.  Thanks @aliabid94!

## 5.16.0

### Features

- [#10561](https://github.com/gradio-app/gradio/pull/10561) [`26494ce`](https://github.com/gradio-app/gradio/commit/26494cea570ffe0ead1f8b7a7135ab5a89c6bcbd) - Allow freezing columns in `gr.Dataframe`.  Thanks @hannahblair!
- [#10554](https://github.com/gradio-app/gradio/pull/10554) [`b8ff5d6`](https://github.com/gradio-app/gradio/commit/b8ff5d6bfe1a9f3379580754b1e23857e2f0c96b) - Add optional search bar to `gr.Dataframe`'s toolbar.  Thanks @hannahblair!
- [#10529](https://github.com/gradio-app/gradio/pull/10529) [`196b600`](https://github.com/gradio-app/gradio/commit/196b600b3962b85781b53c512e17708644b86f6f) - Select entire row or column in dataframe.  Thanks @hannahblair!
- [#10558](https://github.com/gradio-app/gradio/pull/10558) [`1113002`](https://github.com/gradio-app/gradio/commit/111300242fdf135724a304920a93fc34a8037f7d) - Fix spacing issue with `gr.Dataframe` in Safari.  Thanks @hannahblair!
- [#10492](https://github.com/gradio-app/gradio/pull/10492) [`29880d5`](https://github.com/gradio-app/gradio/commit/29880d51fbe7fbd222b0765a83c95134dc7d0e90) - Allow showing progress updates on arbitrary components.  Thanks @abidlabs!
- [#10553](https://github.com/gradio-app/gradio/pull/10553) [`4c08b9f`](https://github.com/gradio-app/gradio/commit/4c08b9f3c0bcafb0edc56330d8d81e78a6e3763b) - Prevent scrolling when the dataframe cell menu is open.  Thanks @hannahblair!
- [#10541](https://github.com/gradio-app/gradio/pull/10541) [`e505fab`](https://github.com/gradio-app/gradio/commit/e505fabecb17c50e073483ed7d6aab2e04c9fcf2) - Add copy button feedback to `gr.Dataframe`.  Thanks @hannahblair!
- [#10507](https://github.com/gradio-app/gradio/pull/10507) [`3748e4c`](https://github.com/gradio-app/gradio/commit/3748e4c902683ff406fdd246fa8c07dbbbed3ad5) - Chatbot `allow_tags`.  Thanks @dawoodkhan82!
- [#10552](https://github.com/gradio-app/gradio/pull/10552) [`ed25a10`](https://github.com/gradio-app/gradio/commit/ed25a1053a55ddd2cf7d3067c72bdf77185ada8d) - Add 1920px wide resolution for wide monitors.  Thanks @Oncorporation!
- [#10540](https://github.com/gradio-app/gradio/pull/10540) [`deeebfb`](https://github.com/gradio-app/gradio/commit/deeebfba46f15bb3641b86e25156215d2d727087) - Revert editable text changes.  Thanks @hannahblair!

### Fixes

- [#10544](https://github.com/gradio-app/gradio/pull/10544) [`9b87e12`](https://github.com/gradio-app/gradio/commit/9b87e12f1a44e1bcee1373a877a6d39f4e6395e9) - Fix gr.Plot change/load events and plotly css loaded.  Thanks @freddyaboulton!
- [#10515](https://github.com/gradio-app/gradio/pull/10515) [`1269ad0`](https://github.com/gradio-app/gradio/commit/1269ad0f0096323d613e7c8d15728bb491bcc409) - Plotly 6.0 Fix: Install latest plotly js version.  Thanks @freddyaboulton!
- [#10490](https://github.com/gradio-app/gradio/pull/10490) [`178311b`](https://github.com/gradio-app/gradio/commit/178311b72d72a3c5f4a67bee5e0098be4232e68c) - Ensure row numbers functionality in dataframe works as expected.  Thanks @hannahblair!
- [#10560](https://github.com/gradio-app/gradio/pull/10560) [`4e72dfe`](https://github.com/gradio-app/gradio/commit/4e72dfef99b2614c00931a828ed78876f8f945d0) - Fix Auth.  Thanks @freddyaboulton!
- [#10466](https://github.com/gradio-app/gradio/pull/10466) [`8e2cf2f`](https://github.com/gradio-app/gradio/commit/8e2cf2f32c4ffe4540aed0dd8448089f0a19eedd) - Fix the wrapper function of micropip.install to throw the original error for better debug experience.  Thanks @whitphx!
- [#10548](https://github.com/gradio-app/gradio/pull/10548) [`bcbb7b6`](https://github.com/gradio-app/gradio/commit/bcbb7b69f5bda624f9d5537c6557258e70afb3a7) - Fix DF Postprocess for tuples.  Thanks @freddyaboulton!
- [#10546](https://github.com/gradio-app/gradio/pull/10546) [`27155cf`](https://github.com/gradio-app/gradio/commit/27155cfc0ca49b8d2727f3271ff413105b4da59e) - Native Plot respects the height parameters.  Thanks @freddyaboulton!
- [#10534](https://github.com/gradio-app/gradio/pull/10534) [`855d870`](https://github.com/gradio-app/gradio/commit/855d87001a492afce1aff9c2eb3de765d8855828) - Footer alignment fix.  Thanks @aliabid94!
- [#10535](https://github.com/gradio-app/gradio/pull/10535) [`d909868`](https://github.com/gradio-app/gradio/commit/d9098681f8883686a617c8f98b22c77057febed1) - Ensure `max_height` is applied in `gr.Dataframe`.  Thanks @hannahblair!
- [#10547](https://github.com/gradio-app/gradio/pull/10547) [`083d68b`](https://github.com/gradio-app/gradio/commit/083d68b223be82a65f18c553df9ae690a8118a49) - quick_fix_client.  Thanks @aliabid94!
- [#10521](https://github.com/gradio-app/gradio/pull/10521) [`79937fd`](https://github.com/gradio-app/gradio/commit/79937fd76021b31abdbc3f8f2c32ef123fd676aa) - Change word-break prop in dataframe headers.  Thanks @hannahblair!
- [#10520](https://github.com/gradio-app/gradio/pull/10520) [`2a1fc2a`](https://github.com/gradio-app/gradio/commit/2a1fc2a92888f622579e4b2daf86be487c73004d) - Ensure links work as expected in dataframe.  Thanks @hannahblair!
- [#10524](https://github.com/gradio-app/gradio/pull/10524) [`ccf590c`](https://github.com/gradio-app/gradio/commit/ccf590c6df0329eca653d94c2508b3bb19db8a29) - Expand tabs in row by default.  Thanks @aliabid94!
- [#10531](https://github.com/gradio-app/gradio/pull/10531) [`a18ac9c`](https://github.com/gradio-app/gradio/commit/a18ac9c56a67dbc0a1d0fb464fa12f531998b170) - Fix bug where plots wouldn't load when initial value provided.  Thanks @freddyaboulton!

## 5.15.0

### Features

- [#10345](https://github.com/gradio-app/gradio/pull/10345) [`39f0c23`](https://github.com/gradio-app/gradio/commit/39f0c233034449d0d0cdb77d0b34e4fca7b9cc8b) - Allow image uploads to gr.load_chat.  Thanks @aliabid94!
- [#10456](https://github.com/gradio-app/gradio/pull/10456) [`8e40c15`](https://github.com/gradio-app/gradio/commit/8e40c15669ed1244d6f2288e55c2223279bd37a4) - Implement multiple cell selection.  Thanks @hannahblair!
- [#10480](https://github.com/gradio-app/gradio/pull/10480) [`90f90b7`](https://github.com/gradio-app/gradio/commit/90f90b7989081b0e4422384ee699cb98781723d1) - Add sidebar to the docs.  Thanks @aliabd!
- [#10495](https://github.com/gradio-app/gradio/pull/10495) [`35fda36`](https://github.com/gradio-app/gradio/commit/35fda36de9745757298cafb3d8b91cbc1a4358c9) - Add an `anchor_links` parameter to `gr.ParamViewer` that allows linking to specific parameters.  Thanks @abidlabs!
- [#10433](https://github.com/gradio-app/gradio/pull/10433) [`2e8dc74`](https://github.com/gradio-app/gradio/commit/2e8dc74f751be02f7217f78d241806b42fcdca04) - Allow building multipage Gradio apps.  Thanks @aliabid94!
- [#10496](https://github.com/gradio-app/gradio/pull/10496) [`a9bfbc3`](https://github.com/gradio-app/gradio/commit/a9bfbc389d325592e83fd85c5f255864dc34c8be) - Add support for inference `providers` in `gr.load()`.  Thanks @abidlabs!
- [#10463](https://github.com/gradio-app/gradio/pull/10463) [`ed7a091`](https://github.com/gradio-app/gradio/commit/ed7a0919ab6b31184dc4d686b722dbeb013e9ce9) - Expand and collapse dataframe cells.  Thanks @hannahblair!
- [#10478](https://github.com/gradio-app/gradio/pull/10478) [`afb96c6`](https://github.com/gradio-app/gradio/commit/afb96c64451e5a282bfee89445d831d1c87f9746) - Improve dataframe's upload accessibility.  Thanks @hannahblair!
- [#10491](https://github.com/gradio-app/gradio/pull/10491) [`ff5f976`](https://github.com/gradio-app/gradio/commit/ff5f976bbb685fdd4f7c1faeda79e094f55a9f56) - Allow multiline headers in gr.Dataframe.  Thanks @hannahblair!
- [#10494](https://github.com/gradio-app/gradio/pull/10494) [`10932a2`](https://github.com/gradio-app/gradio/commit/10932a291ac7f591bb1d56e4e353b51f10ecc6e3) - Ensure dataframe is not editable when `interactive` is False.  Thanks @hannahblair!
- [#10485](https://github.com/gradio-app/gradio/pull/10485) [`6401d32`](https://github.com/gradio-app/gradio/commit/6401d32e79074f2e4c4beda6308c194eba4af6eb) - chore: update dropdown.py.  Thanks @eltociear!
- [#10446](https://github.com/gradio-app/gradio/pull/10446) [`2cf449a`](https://github.com/gradio-app/gradio/commit/2cf449abb38815bb3414ac9bee1535f5f0f834ae) - Add more ImageEditor js tests.  Thanks @freddyaboulton!
- [#10483](https://github.com/gradio-app/gradio/pull/10483) [`3750082`](https://github.com/gradio-app/gradio/commit/3750082b266464487cd5b7684ae1590ae03d3bef) - Sidebar Fixes.  Thanks @dawoodkhan82!

### Fixes

- [#10476](https://github.com/gradio-app/gradio/pull/10476) [`017ed46`](https://github.com/gradio-app/gradio/commit/017ed462720766f1d28205765aade6338f58da07) - Clean up `gr.DataFrame.postprocess()` and fix issue with getting headers of empty dataframes.  Thanks @abidlabs!

## 5.14.0

### Features

- [#10461](https://github.com/gradio-app/gradio/pull/10461) [`ca7c47e`](https://github.com/gradio-app/gradio/commit/ca7c47e5e50a309cd637c4f928ab90af6355b01d) - Add copy button to dataframe toolbar.  Thanks @hannahblair!
- [#10420](https://github.com/gradio-app/gradio/pull/10420) [`a69b8e8`](https://github.com/gradio-app/gradio/commit/a69b8e83ad7c89c627db2bdd5d25b0142731aaac) - Support column/row deletion in `gr.DataFrame`.  Thanks @abidlabs!
- [#10470](https://github.com/gradio-app/gradio/pull/10470) [`3465fdb`](https://github.com/gradio-app/gradio/commit/3465fdb19087471598ca07c93bc4ff3e1b6b2abf) - Format backend with latest `ruff`.  Thanks @abidlabs!
- [#10469](https://github.com/gradio-app/gradio/pull/10469) [`62d0669`](https://github.com/gradio-app/gradio/commit/62d06694ddafada677aff0d54d70ac3cf1448c91) - Request mic permissions only after the Record button is clicked in `gr.Audio()`.  Thanks @abidlabs!
- [#10435](https://github.com/gradio-app/gradio/pull/10435) [`ef66fe5`](https://github.com/gradio-app/gradio/commit/ef66fe52b22448a5125a314581f2ec6c73c24145) - Sidebar Component.  Thanks @dawoodkhan82!
- [#10460](https://github.com/gradio-app/gradio/pull/10460) [`324383f`](https://github.com/gradio-app/gradio/commit/324383fb814a955178a1f72ee1080a955ad593d0) - Fix typecheck error due to huggingface_hub update.  Thanks @freddyaboulton!

### Fixes

- [#10459](https://github.com/gradio-app/gradio/pull/10459) [`fa220a3`](https://github.com/gradio-app/gradio/commit/fa220a31a54d85f2851bd6717c81d1dbee77868e) - Patch plotly requirement to force to install v5 along with altair.  Thanks @whitphx!

## 5.13.2

### Features

- [#10452](https://github.com/gradio-app/gradio/pull/10452) [`dd178f3`](https://github.com/gradio-app/gradio/commit/dd178f3dd5968df445b43f5e3b8cb86b11374913) - Tiny tweak to example dataframes.  Thanks @hannahblair!
- [#10426](https://github.com/gradio-app/gradio/pull/10426) [`2167f58`](https://github.com/gradio-app/gradio/commit/2167f58fb8d64141d1b9d567af621c8b4d039e04) - Update Pyodide to 0.27.2.  Thanks @whitphx!
- [#10448](https://github.com/gradio-app/gradio/pull/10448) [`337b522`](https://github.com/gradio-app/gradio/commit/337b5224a682fe18dc8d1c1e5bab2a3341ce01dc) - Small tweaks to `gr.ChatMessage` and spacing between chatbot messages.  Thanks @abidlabs!

## 5.13.1

### Features

- [#10370](https://github.com/gradio-app/gradio/pull/10370) [`71c8b8a`](https://github.com/gradio-app/gradio/commit/71c8b8abbfae0e47eb46561b0104bd452e5dffe8) - Clear Image Editor Value with None.  Thanks @freddyaboulton!
- [#10416](https://github.com/gradio-app/gradio/pull/10416) [`3c2e12b`](https://github.com/gradio-app/gradio/commit/3c2e12b5ba52441f45565ae8e14cea46ea5b5b2c) - Fix ImageEditor Cropping - Cropping now crops the background image instead of the image + canvas.  Thanks @freddyaboulton!

### Fixes

- [#10405](https://github.com/gradio-app/gradio/pull/10405) [`92dda15`](https://github.com/gradio-app/gradio/commit/92dda15f6d1c71929d3bdca1910734309db72458) - Hide the waveform when playing recorded audio if `show_recording_waveform` is `False`.  Thanks @abidlabs!
- [#10421](https://github.com/gradio-app/gradio/pull/10421) [`90e0b47`](https://github.com/gradio-app/gradio/commit/90e0b47be30687347d5d7f2ec8bff16ac6a99560) - Update all md5 hashes to sha256.  Thanks @LArkema!
- [#10406](https://github.com/gradio-app/gradio/pull/10406) [`b7a7e59`](https://github.com/gradio-app/gradio/commit/b7a7e590945e938714a5c9a8694d4f188d54b314) - Support presigned URLs with gr.Video, gr.Model3D, and other components.  Thanks @abidlabs!

## 5.13.0

### Features

- [#10359](https://github.com/gradio-app/gradio/pull/10359) [`c44da25`](https://github.com/gradio-app/gradio/commit/c44da259feb3e27e155654d0c229ed299cdd40c6) - Allow modifying the chatbot value directly in `gr.ChatInterface`.  Thanks @abidlabs!
- [#10367](https://github.com/gradio-app/gradio/pull/10367) [`5881296`](https://github.com/gradio-app/gradio/commit/5881296ea59a4f4fcb5be79b21180bb4aae31ef2) - Improve component docstrings and misc docs.  Thanks @abidlabs!
- [#10377](https://github.com/gradio-app/gradio/pull/10377) [`feb1e81`](https://github.com/gradio-app/gradio/commit/feb1e81ecabf34fd3f9ec228dcf3bdaa4b0bd75e) - Add toolbar with fullscreen button to `gr.Dataframe`.  Thanks @hannahblair!
- [#10341](https://github.com/gradio-app/gradio/pull/10341) [`b0cf92f`](https://github.com/gradio-app/gradio/commit/b0cf92f03ba29f29fa540de8c5803a7263df0106) - PWA icon customization.  Thanks @whitphx!
- [#10392](https://github.com/gradio-app/gradio/pull/10392) [`4d47e4b`](https://github.com/gradio-app/gradio/commit/4d47e4b4e2f07d4dd5b600f7d9180c7ad3e67a1f) - Add a `log` parameter to Chatbot metadata that allows displaying `str` content next to the thought title.  Thanks @abidlabs!
- [#10352](https://github.com/gradio-app/gradio/pull/10352) [`6a7cfc4`](https://github.com/gradio-app/gradio/commit/6a7cfc4264822209148ad07d8f38a0550bdb32b7) - Compatibility between Client and ZeroGPU.  Thanks @abidlabs!
- [#10366](https://github.com/gradio-app/gradio/pull/10366) [`b10f5e1`](https://github.com/gradio-app/gradio/commit/b10f5e150a048ded255efdd34cfb7d5706ae2ff7) - Lite: retry install.  Thanks @whitphx!
- [#10376](https://github.com/gradio-app/gradio/pull/10376) [`2b7ba48`](https://github.com/gradio-app/gradio/commit/2b7ba4801398b6dd6b72496ea50245a0cd6852d6) - Add `show_row_numbers` param to gr.Dataframe.  Thanks @hannahblair!
- [#10368](https://github.com/gradio-app/gradio/pull/10368) [`8cf0461`](https://github.com/gradio-app/gradio/commit/8cf0461e36a9e1d5ada95bca2215a29592f29206) - Fix ReDoS.  Thanks @kevinbackhouse!
- [#10346](https://github.com/gradio-app/gradio/pull/10346) [`43e05d7`](https://github.com/gradio-app/gradio/commit/43e05d72f43c9ac8dc18e4b885c9da08605b09e6) - Document additional helper classes for `gr.Chatbot`.  Thanks @abidlabs!
- [#10340](https://github.com/gradio-app/gradio/pull/10340) [`a91cb9c`](https://github.com/gradio-app/gradio/commit/a91cb9c42c02b70273b4cd55ab18148a7436fe57) - Add `show_reset_button` to `gr.slider` initialization.  Thanks @amanchauhan11!
- [#10410](https://github.com/gradio-app/gradio/pull/10410) [`48809c7`](https://github.com/gradio-app/gradio/commit/48809c722bcbb3aaed72edfdb6c59de5413fdbc4) - Fix bug where dataframe `value` prop was not updating when an input value was changed manually.  Thanks @abidlabs!

### Fixes

- [#10369](https://github.com/gradio-app/gradio/pull/10369) [`eb85edf`](https://github.com/gradio-app/gradio/commit/eb85edf4b27b33038c0923387d6d1a6f57a73980) - Quick fix: 0 is ignored Slider/Number issue.  Thanks @dawoodkhan82!
- [#10357](https://github.com/gradio-app/gradio/pull/10357) [`43e7cce`](https://github.com/gradio-app/gradio/commit/43e7cce2bd8ddd274fcba890bfeaa7ead7f32434) - Fix ImageEditor Size Issues.  Thanks @freddyaboulton!
- [#10365](https://github.com/gradio-app/gradio/pull/10365) [`40e0c48`](https://github.com/gradio-app/gradio/commit/40e0c4832060cef457406896b2ad94639888897a) - Ensure clicking on a cell once enables editing mode.  Thanks @hannahblair!
- [#10383](https://github.com/gradio-app/gradio/pull/10383) [`9517043`](https://github.com/gradio-app/gradio/commit/951704346cff56f4a781605d8f323f9113975eb0) - Ensure columns hidden with pandas `.hide()` works as expected.  Thanks @hannahblair!
- [#10404](https://github.com/gradio-app/gradio/pull/10404) [`9dc5d15`](https://github.com/gradio-app/gradio/commit/9dc5d157aaf002f7699d3b2c1652f49d47e53e80) - Tweak behavior related to the `status` of `gr.Chatbot` thought messages.  Thanks @abidlabs!
- [#10390](https://github.com/gradio-app/gradio/pull/10390) [`9e6eded`](https://github.com/gradio-app/gradio/commit/9e6ededef144f3f1a8ebbc47076b55d60f5b2ef3) - Removes css tag that overrides Gradio theme setting.  Thanks @ericwu09!
- [#10348](https://github.com/gradio-app/gradio/pull/10348) [`62cd4ef`](https://github.com/gradio-app/gradio/commit/62cd4ef302cd7529d1f8842b416f9d8fcf6b5750) - Handle `row_count=0` in gr.Dataframe.  Thanks @hannahblair!
- [#10403](https://github.com/gradio-app/gradio/pull/10403) [`3219382`](https://github.com/gradio-app/gradio/commit/3219382eeea0a0047c74e0cdd2bf333e69f8f806) - Fix event triggers and recent regressions related to `gr.DataFrame`.  Thanks @abidlabs!
- [#10360](https://github.com/gradio-app/gradio/pull/10360) [`31cccc3`](https://github.com/gradio-app/gradio/commit/31cccc3e79a3d1b4a840610d9becb235f8829b13) - Fix logic for detecting changes in `gr.Dataframe` table value.  Thanks @abidlabs!
- [#10372](https://github.com/gradio-app/gradio/pull/10372) [`96bbde2`](https://github.com/gradio-app/gradio/commit/96bbde277e059f79bb2c9898576050e84dab147a) - Allow propogation of fill_height through Rows and Tabs, via scale.  Thanks @aliabid94!

## 5.12.0

### Features

- [#10323](https://github.com/gradio-app/gradio/pull/10323) [`391a4d0`](https://github.com/gradio-app/gradio/commit/391a4d09a90406b768eee30e1c12a0bc84fc27a2) - Add `.previous_value` to `gr.EditData`.  Thanks @abidlabs!
- [#10270](https://github.com/gradio-app/gradio/pull/10270) [`bb11a2a`](https://github.com/gradio-app/gradio/commit/bb11a2a702ca04fde245e7d54d155cbcbde7791e) - [ZeroGPU] Handshake-based postMessage.  Thanks @cbensimon!
- [#10305](https://github.com/gradio-app/gradio/pull/10305) [`be40307`](https://github.com/gradio-app/gradio/commit/be40307d1d11421e01bf91fa5e05ec4ab97b09d8) - Add support for thinking LLMs directly in `gr.ChatInterface`.  Thanks @abidlabs!
- [#10226](https://github.com/gradio-app/gradio/pull/10226) [`58b8391`](https://github.com/gradio-app/gradio/commit/58b839196e17776cbd0d48997905496f7746d31f) - Improve tool UI and support nested thoughts.  Thanks @hannahblair!

### Fixes

- [#10327](https://github.com/gradio-app/gradio/pull/10327) [`e0cb47f`](https://github.com/gradio-app/gradio/commit/e0cb47f0c5040049fb942a381c0335de4bf77d67) - Fix webcam.  Thanks @Col0ring!
- [#10308](https://github.com/gradio-app/gradio/pull/10308) [`3543418`](https://github.com/gradio-app/gradio/commit/354341826a629d06640ce3ec5e5881bcccd6e339) - ImageEditor: Trigger input event even if change event not defined.  Thanks @freddyaboulton!
- [#10322](https://github.com/gradio-app/gradio/pull/10322) [`d2691e7`](https://github.com/gradio-app/gradio/commit/d2691e7436f722781ee61db43ce3f2d5ccc3e253) - Quick Fix: Multimodal microphone audio not clearing.  Thanks @dawoodkhan82!
- [#10331](https://github.com/gradio-app/gradio/pull/10331) [`decb594`](https://github.com/gradio-app/gradio/commit/decb5944552e951525c283e069e116c1ff6b6807) - Update guide for `gr.load_chat` and allow `**kwargs`.  Thanks @abidlabs!
- [#10332](https://github.com/gradio-app/gradio/pull/10332) [`e742dcc`](https://github.com/gradio-app/gradio/commit/e742dcccb376692c9ddd5a6c251080e7c5936574) - Allow users to add a custom API route.  Thanks @aliabid94!
- [#10324](https://github.com/gradio-app/gradio/pull/10324) [`343503d`](https://github.com/gradio-app/gradio/commit/343503d62eabab7af1a8a524d16a8e076a75dd67) - Support `gr.load()`-ing Gradio apps with `Blocks.load()` events.  Thanks @abidlabs!

## 5.11.0

### Features

- [#10304](https://github.com/gradio-app/gradio/pull/10304) [`6b63fde`](https://github.com/gradio-app/gradio/commit/6b63fdec441b5c9bf910f910a2505d8defbb6bf8) - Blocked Paths Fix.  Thanks @freddyaboulton!
- [#10303](https://github.com/gradio-app/gradio/pull/10303) [`f19ca89`](https://github.com/gradio-app/gradio/commit/f19ca89cdd4040dbaa41bbc3b9915edc032603a0) - Add preview_open and preview_close events to Gallery.  Thanks @freddyaboulton!
- [#10314](https://github.com/gradio-app/gradio/pull/10314) [`84e72e4`](https://github.com/gradio-app/gradio/commit/84e72e401cdc97a91086301d2b25164e7d15623a) - Restore chat interface full height.  Thanks @aliabid94!

### Fixes

- [#10306](https://github.com/gradio-app/gradio/pull/10306) [`9fc988e`](https://github.com/gradio-app/gradio/commit/9fc988ebaf4bea24b71308922bb1889f1d3f4f6e) - Fix bug where ImageEditor always sends empty layers list to the backend.  Thanks @freddyaboulton!
- [#10297](https://github.com/gradio-app/gradio/pull/10297) [`1e253ff`](https://github.com/gradio-app/gradio/commit/1e253ff127e97c18852a32cbc1269494c6cee017) - Fix test_subclass_conversion with numpy==2.x.  Thanks @abidlabs!

## 5.10.0

### Features

- [#10203](https://github.com/gradio-app/gradio/pull/10203) [`c3a9e64`](https://github.com/gradio-app/gradio/commit/c3a9e647381f787085662828747e6ac61f8a0c01) - Allow editing chatbot messages.  Thanks @aliabid94!
- [#10272](https://github.com/gradio-app/gradio/pull/10272) [`a1f2649`](https://github.com/gradio-app/gradio/commit/a1f2649586752a013fb4d36b83d5fea2e137bb81) - Chat Interface flagging and chatbot feedback.  Thanks @aliabid94!
- [#10225](https://github.com/gradio-app/gradio/pull/10225) [`f0cf3b7`](https://github.com/gradio-app/gradio/commit/f0cf3b789a4ebb5ac2e33243fea80c6c6f080d42) - Dataframe support in Chatbot.  Thanks @dawoodkhan82!
- [#10292](https://github.com/gradio-app/gradio/pull/10292) [`f2bd72f`](https://github.com/gradio-app/gradio/commit/f2bd72f9ef23552f0c6018396320eca9baef04f5) - Reset flagged values when switching conversations in chat history.  Thanks @abidlabs!
- [#10191](https://github.com/gradio-app/gradio/pull/10191) [`5ce2832`](https://github.com/gradio-app/gradio/commit/5ce28324971e974ae24dc9a229b2160793140fb2) - Support saving chat history in `gr.ChatInterface`.  Thanks @abidlabs!
- [#10197](https://github.com/gradio-app/gradio/pull/10197) [`a95f8ef`](https://github.com/gradio-app/gradio/commit/a95f8ef3ee2663cf502129e829493a44b2641613) - Add support for returning multiple messages from `gr.ChatInterface` chat function.  Thanks @abidlabs!
- [#10186](https://github.com/gradio-app/gradio/pull/10186) [`9b17032`](https://github.com/gradio-app/gradio/commit/9b17032a6564c8bda4ab1749989a9797c670919c) - Add Microphone Input to MultimodalTextbox.  Thanks @dawoodkhan82!
- [#10192](https://github.com/gradio-app/gradio/pull/10192) [`4fc7fb7`](https://github.com/gradio-app/gradio/commit/4fc7fb777c42af537e4af612423fa44029657d41) - Ensure components can be remounted with their previous data.  Thanks @pngwn!
- [#10187](https://github.com/gradio-app/gradio/pull/10187) [`64d1864`](https://github.com/gradio-app/gradio/commit/64d1864f8fb6f2d0b274fcf7bd47bdb1f6a77980) - `manifest json` for PWA.  Thanks @whitphx!
- [#10262](https://github.com/gradio-app/gradio/pull/10262) [`f3bedd4`](https://github.com/gradio-app/gradio/commit/f3bedd4011bdfdecc952eb1275a9dd96af3e8d71) - add gr.Success and update windows contributing.  Thanks @not-lain!
- [#10254](https://github.com/gradio-app/gradio/pull/10254) [`da07707`](https://github.com/gradio-app/gradio/commit/da0770748db9ea40194a43c9138ee2c6536b1247) - Add a `settings` link to the footer with i18n options & pwa instructions.  Thanks @abidlabs!
- [#9984](https://github.com/gradio-app/gradio/pull/9984) [`45df1b1`](https://github.com/gradio-app/gradio/commit/45df1b1978e597546a208ecbf5b3aca56137edc5) - Lite: Capture stdout and stderr from the main thread.  Thanks @whitphx!
- [#10210](https://github.com/gradio-app/gradio/pull/10210) [`13a83e5`](https://github.com/gradio-app/gradio/commit/13a83e5001e29594990d61569887cb8562744964) - Allow reordering files in gr.File.  Thanks @hannahblair!
- [#10221](https://github.com/gradio-app/gradio/pull/10221) [`506bd28`](https://github.com/gradio-app/gradio/commit/506bd2884a9790fb6f8dbf5684576e80d2b8ee64) - Update Guides related to deploying Gradio chatbots to Discord, Slack, and website widgets.  Thanks @abidlabs!
- [#10229](https://github.com/gradio-app/gradio/pull/10229) [`1be31c1`](https://github.com/gradio-app/gradio/commit/1be31c14e2a6884a60babf690cfded560bca5144) - Allow editable ChatInterface.  Thanks @aliabid94!
- [#10245](https://github.com/gradio-app/gradio/pull/10245) [`3e4e0de`](https://github.com/gradio-app/gradio/commit/3e4e0de51a2ece9a1cab70a69c065bda685569e8) - Add `gr.BrowserState` change event.  Thanks @abidlabs!
- [#10222](https://github.com/gradio-app/gradio/pull/10222) [`9c6d83d`](https://github.com/gradio-app/gradio/commit/9c6d83d12e4b67c5638ba67281c6f018052c5b3e) - gr.load_chat: Allow loading any openai-compatible server immediately as a ChatInterface.  Thanks @aliabid94!

### Fixes

- [#10214](https://github.com/gradio-app/gradio/pull/10214) [`501adef`](https://github.com/gradio-app/gradio/commit/501adefd0c3d5769055ef2156c85e586eb60bf84) - Some agent low-hanging issues.  Thanks @freddyaboulton!
- [#10290](https://github.com/gradio-app/gradio/pull/10290) [`99123e7`](https://github.com/gradio-app/gradio/commit/99123e75f5f1c222d70bd86cd37dbc4450c62cba) - Fixed warning about not being able to find the app for some pattern.  Thanks @YanSte!
- [#10269](https://github.com/gradio-app/gradio/pull/10269) [`890eaa3`](https://github.com/gradio-app/gradio/commit/890eaa3a9e53dab5bcb16c5d017ae0470109b8fb) - Allow displaying SVG images securely in `gr.Image` and `gr.Gallery` components.  Thanks @abidlabs!
- [#10209](https://github.com/gradio-app/gradio/pull/10209) [`2700d18`](https://github.com/gradio-app/gradio/commit/2700d1898bc8eeb3fd9f65ce77be17c2614a388f) - Ensure the `height` param in `gr.File` works as expected.  Thanks @hannahblair!
- [#10235](https://github.com/gradio-app/gradio/pull/10235) [`9285dd9`](https://github.com/gradio-app/gradio/commit/9285dd9eb842ee05bd8a0fd4f0f9143788096bbc) - Fix typing for components in `gr.Interface` and docstring in `image.py`.  Thanks @abidlabs!
- [#10207](https://github.com/gradio-app/gradio/pull/10207) [`314a8b5`](https://github.com/gradio-app/gradio/commit/314a8b55f57a30806b37fe077b471df97d04245d) - fix: make sure `comp.instance` exists.  Thanks @Col0ring!
- [#10238](https://github.com/gradio-app/gradio/pull/10238) [`3f19210`](https://github.com/gradio-app/gradio/commit/3f192100d6997751d0246b396a4fd8eaa86a826b) - Declare exports in __all__ for type checking.  Thanks @dustalov!

## 5.9.1

### Fixes

- [#10212](https://github.com/gradio-app/gradio/pull/10212) [`3d8fc42`](https://github.com/gradio-app/gradio/commit/3d8fc42c94034a29edbc43852937684b478d4667) - Fix render trigger.  Thanks @aliabid94!

## 5.9.0

### Features

- [#10196](https://github.com/gradio-app/gradio/pull/10196) [`c9ba9a4`](https://github.com/gradio-app/gradio/commit/c9ba9a447596a9ccdd21955adb3b34b15cac7ade) - Use the modern lower-case Python types in the API typing information.  Thanks @abidlabs!
- [#10149](https://github.com/gradio-app/gradio/pull/10149) [`9cd291b`](https://github.com/gradio-app/gradio/commit/9cd291b7f1c37ef0ffd3e8721fb2b648003b50fc) - Resizeable chatbot.  Thanks @aliabid94!
- [#10109](https://github.com/gradio-app/gradio/pull/10109) [`48e4aa9`](https://github.com/gradio-app/gradio/commit/48e4aa9d627b6958a0b215d6312de508845f669c) - adds a `run_examples_on_click` parameter to `gr.ChatInterface` mirroring the the `run_on_click` parameter in `gr.Examples`.  Thanks @abidlabs!
- [#10135](https://github.com/gradio-app/gradio/pull/10135) [`3e93740`](https://github.com/gradio-app/gradio/commit/3e93740f057712278a7c2194a1702f48915683e1) - Improve pasted text behaviour in `Multimodaltextbox`.  Thanks @hannahblair!
- [#10098](https://github.com/gradio-app/gradio/pull/10098) [`9a6ce6f`](https://github.com/gradio-app/gradio/commit/9a6ce6f6b089d94c06da0b8620f28967f39f8383) - Refactor full screen logic to be reusable.  Thanks @hannahblair!
- [#10111](https://github.com/gradio-app/gradio/pull/10111) [`3665e81`](https://github.com/gradio-app/gradio/commit/3665e81b53555e2b499b877208686f3027eaceb4) - Allow Chatbot examples to show more than one image.  Thanks @hannahblair!
- [#10088](https://github.com/gradio-app/gradio/pull/10088) [`cb5b891`](https://github.com/gradio-app/gradio/commit/cb5b89108e0217131a914315be698827a4d05c15) - Refactor `NO_RELOAD` implementation.  Thanks @CNSeniorious000!
- [#10132](https://github.com/gradio-app/gradio/pull/10132) [`6645518`](https://github.com/gradio-app/gradio/commit/6645518a66e01ebcd2746626a4e2a14239172e76) - Tweak Chatbot `bubble_full_width` behaviour.  Thanks @hannahblair!
- [#10198](https://github.com/gradio-app/gradio/pull/10198) [`494c4dd`](https://github.com/gradio-app/gradio/commit/494c4ddf6c5ccefe5f5c1bb8dc0671e5b54cd79f) - Add note that SSR mode is experimental.  Thanks @abidlabs!
- [#10155](https://github.com/gradio-app/gradio/pull/10155) [`23a2958`](https://github.com/gradio-app/gradio/commit/23a2958f5e2104b4f371915986251e8ea09bd44b) - Add a `.click()` event and `padding` parameter to the `HTML` component.  Thanks @abidlabs!
- [#10158](https://github.com/gradio-app/gradio/pull/10158) [`19e1ef5`](https://github.com/gradio-app/gradio/commit/19e1ef52dcd2c7f2bae49ef7844fbfd31c1785fe) - make printing the error message from a `gr.Error` to the console configurable.  Thanks @obendidi!
- [#10137](https://github.com/gradio-app/gradio/pull/10137) [`fe7a9db`](https://github.com/gradio-app/gradio/commit/fe7a9db659e009bb5ac0e4e9cb4ac0eab1f2c2f4) - Improve uploaded file UI in Chatbot.  Thanks @hannahblair!
- [#10169](https://github.com/gradio-app/gradio/pull/10169) [`25484f4`](https://github.com/gradio-app/gradio/commit/25484f4bfbffdb18850cbd85d4468ea8324afe1a) - By default, consecutive messages are displayed in the same bubble. This is controlled by the new `display_consecutive_in_same_bubble` param of Chatbot.  Thanks @freddyaboulton!
- [#10092](https://github.com/gradio-app/gradio/pull/10092) [`20b9d72`](https://github.com/gradio-app/gradio/commit/20b9d72ebb1b962cb34a657cbdad15d003931c6e) - Pass value of `HF_TOKEN` environment variable when loading models with `gr.load`.  Thanks @abidlabs!
- [#10166](https://github.com/gradio-app/gradio/pull/10166) [`8ac5b13`](https://github.com/gradio-app/gradio/commit/8ac5b13c96f871ac4b0f13c6ebfbb5559a18bcc2) - Add Japanese translations for login UI.  Thanks @kazuhitoyokoi!
- [#10193](https://github.com/gradio-app/gradio/pull/10193) [`424365b`](https://github.com/gradio-app/gradio/commit/424365bdbd0b805e3b2d0c44ccc0f47201b1d96a) - JSON type fix in Client and and typing fix for `/chat` endpoint in `gr.ChatInterface`.  Thanks @abidlabs!
- [#10159](https://github.com/gradio-app/gradio/pull/10159) [`7ca3685`](https://github.com/gradio-app/gradio/commit/7ca36850c9e46a1eb5b7a3866b4b166776b4146f) - Add Japanese message into message catalog.  Thanks @kazuhitoyokoi!
- [#10188](https://github.com/gradio-app/gradio/pull/10188) [`22fe4ce`](https://github.com/gradio-app/gradio/commit/22fe4ce5a11d7bbdace2fa8e2fd63eccb74f5b07) - Fix  `multipart` ModuleNotFoundError by renaming import to `python_multipart`.  Thanks @archiloque!

### Fixes

- [#10168](https://github.com/gradio-app/gradio/pull/10168) [`7d70596`](https://github.com/gradio-app/gradio/commit/7d70596d0b3343dc4b357758f85420a0afdb65a2) - Multimodal autofocus fix.  Thanks @dawoodkhan82!
- [#10167](https://github.com/gradio-app/gradio/pull/10167) [`5f03649`](https://github.com/gradio-app/gradio/commit/5f03649668856a383066964b60cb14c9cd566140) - Let Gradio be typed!.  Thanks @abidlabs!
- [#10185](https://github.com/gradio-app/gradio/pull/10185) [`e525680`](https://github.com/gradio-app/gradio/commit/e52568031633fcecb67276f878382e05c111d258) - Clean up `gr.ChatInterface` and fix API type discrepancy.  Thanks @abidlabs!
- [#10131](https://github.com/gradio-app/gradio/pull/10131) [`4984e84`](https://github.com/gradio-app/gradio/commit/4984e847fa2575f9fb209c6b1b73a9003e79e564) - Fix API docs for `multimodal_textbox.py`.  Thanks @abidlabs!
- [#10129](https://github.com/gradio-app/gradio/pull/10129) [`2b55302`](https://github.com/gradio-app/gradio/commit/2b5530274af3936c82176f09db529168263acc2c) - Quick Fix: Fixes autoplay parameter for Audio/Video in Chatbot.  Thanks @dawoodkhan82!
- [#10190](https://github.com/gradio-app/gradio/pull/10190) [`b4004e3`](https://github.com/gradio-app/gradio/commit/b4004e37ae2e4c61c25012802a9d7aa559a2e690) - Support event + request data in gr.render triggers.  Thanks @aliabid94!
- [#10170](https://github.com/gradio-app/gradio/pull/10170) [`5e6e234`](https://github.com/gradio-app/gradio/commit/5e6e234cba820d29ebe29de2597d36ab3683093b) - Custom component in rerender.  Thanks @aliabid94!
- [#10161](https://github.com/gradio-app/gradio/pull/10161) [`3a053cc`](https://github.com/gradio-app/gradio/commit/3a053cc76c173c6386e0b5102b03e1a56786cbb9) - Fix chatbot `visible` prop not reacting to changes.  Thanks @freddyaboulton!
- [#10097](https://github.com/gradio-app/gradio/pull/10097) [`43d88c3`](https://github.com/gradio-app/gradio/commit/43d88c32bf5f636762acffba839800e05294e484) - Fix: Added support for show_api in mount_gradio_app.  Thanks @HongweiRuan!

## 5.8.0

### Features

- [#10083](https://github.com/gradio-app/gradio/pull/10083) [`b2a21c6`](https://github.com/gradio-app/gradio/commit/b2a21c643dc5e50581567cbde7b660357b3d982e) - Add HTML support to paramviewer descriptions.  Thanks @aliabd!
- [#10096](https://github.com/gradio-app/gradio/pull/10096) [`ec10aa3`](https://github.com/gradio-app/gradio/commit/ec10aa3b9b42d8c3fe930aff9465c469626992d4) - Fix paramviewer descriptions to only render markdown links.  Thanks @aliabd!
- [#10080](https://github.com/gradio-app/gradio/pull/10080) [`ebe25bc`](https://github.com/gradio-app/gradio/commit/ebe25bc13f3b2a90876c59a816c6976fd12b6b73) - Fix chatbot/chatinterface type mismatch.  Thanks @abidlabs!
- [#10071](https://github.com/gradio-app/gradio/pull/10071) [`01b919f`](https://github.com/gradio-app/gradio/commit/01b919f04b69732fd8adb52f6d156e5683589221) - Support `additional_outputs` in `gr.ChatInterface`.  Thanks @abidlabs!
- [#10081](https://github.com/gradio-app/gradio/pull/10081) [`b94f010`](https://github.com/gradio-app/gradio/commit/b94f010a5672730d50b191c0b92df1676bb7144c) - Apply Zero GPU for `gr.ChatInterface`.  Thanks @abidlabs!
- [#10099](https://github.com/gradio-app/gradio/pull/10099) [`8530b6e`](https://github.com/gradio-app/gradio/commit/8530b6e2f986421adceda98f972e6b843bc03fbe) - Redesign pending bubble in Chatbot.  Thanks @hannahblair!
- [#10032](https://github.com/gradio-app/gradio/pull/10032) [`e450674`](https://github.com/gradio-app/gradio/commit/e450674ce41ca28f1f37a27fb149c728593a6ddf) - add  `webcam_height` and `webcam_width` to specify the resolution of the Webcam.  Thanks @yinsumirage!

### Fixes

- [#10123](https://github.com/gradio-app/gradio/pull/10123) [`36e9597`](https://github.com/gradio-app/gradio/commit/36e95977b068a96661f06b56c5f4e73ba8a94a38) - Fixes options in the streaming chatbot case.  Thanks @abidlabs!
- [#10095](https://github.com/gradio-app/gradio/pull/10095) [`97d647e`](https://github.com/gradio-app/gradio/commit/97d647ecfdf3999b0a776e51abf69ef0cf6a050c) - Fix state changes within a gr.render.  Thanks @aliabid94!
- [#10094](https://github.com/gradio-app/gradio/pull/10094) [`98dd668`](https://github.com/gradio-app/gradio/commit/98dd6687e1d4cc527fdc21083cba74533032a417) - add http codes 303 and 307 to `url_ok`.  Thanks @sharon-wang!
- [#10125](https://github.com/gradio-app/gradio/pull/10125) [`b02c8b7`](https://github.com/gradio-app/gradio/commit/b02c8b7d4f85dab21a9fbd782e459de7b56558ed) - Fix sharing on chatbot with spaces.  Thanks @aliabid94!
- [#10124](https://github.com/gradio-app/gradio/pull/10124) [`5d61c7b`](https://github.com/gradio-app/gradio/commit/5d61c7b70131ed0a7e73b883b687b7df5255a17b) - Fix lazy caching.  Thanks @abidlabs!
- [#10114](https://github.com/gradio-app/gradio/pull/10114) [`ce5680f`](https://github.com/gradio-app/gradio/commit/ce5680f10fb572407a83d8ff8954379e2aaaab65) - Add event and gr.Select data support in gr.render blocks.  Thanks @aliabid94!
- [#10113](https://github.com/gradio-app/gradio/pull/10113) [`de42c85`](https://github.com/gradio-app/gradio/commit/de42c85661faff84bd02960751b12c4bb722e153) - fix `every=` support in render.  Thanks @aliabid94!
- [#10090](https://github.com/gradio-app/gradio/pull/10090) [`5ea3cb5`](https://github.com/gradio-app/gradio/commit/5ea3cb51a39ba01fda7f65ff31e59955e1d12cea) - Update `requirements.txt` for `gradio` and `gradio_client`.  Thanks @abidlabs!

## 5.7.1

### Features

- [#10068](https://github.com/gradio-app/gradio/pull/10068) [`cbd7032`](https://github.com/gradio-app/gradio/commit/cbd703270a479f5bb8fc7327026e6d3c72ca8e0c) - fix: stream node response to user.  Thanks @XciD!
- [#10064](https://github.com/gradio-app/gradio/pull/10064) [`c38cf64`](https://github.com/gradio-app/gradio/commit/c38cf64df606109b8b4fa029d82fbc64fd58d850) - Use get_token instead of HfFolder.get_token.  Thanks @Wauplin!

### Fixes

- [#10025](https://github.com/gradio-app/gradio/pull/10025) [`368ba73`](https://github.com/gradio-app/gradio/commit/368ba731069583b22fcf7ddc9501db349f6a2953) - Update Chat Interface examples and add more LLM libraries and API providers.  Thanks @abidlabs!
- [#10059](https://github.com/gradio-app/gradio/pull/10059) [`19d4ee6`](https://github.com/gradio-app/gradio/commit/19d4ee62c3111262c4dde172690faa2f468d068d) - Allow concurrent renders.  Thanks @aliabid94!
- [#10069](https://github.com/gradio-app/gradio/pull/10069) [`afd75de`](https://github.com/gradio-app/gradio/commit/afd75def9e979d9b255a6d22d33a3aee63b6f225) - Fix label placement in gr.HTML.  Thanks @hannahblair!

## 5.7.0

### Features

- [#10013](https://github.com/gradio-app/gradio/pull/10013) [`5d36c80`](https://github.com/gradio-app/gradio/commit/5d36c8088d4d7f7dccce55a3f2be3bcd8b345332) - Add `gr.datetime` a param `interactive:bool`.  Thanks @yinsumirage!
- [#10054](https://github.com/gradio-app/gradio/pull/10054) [`458941c`](https://github.com/gradio-app/gradio/commit/458941c508f11d43debf1cef6950f330145e336d) - Allow full screen mode in interactive gr.Image.  Thanks @hannahblair!
- [#10017](https://github.com/gradio-app/gradio/pull/10017) [`a95fda1`](https://github.com/gradio-app/gradio/commit/a95fda1f85e80ce8423f4373bb238422b9b7aa32) - fix small bug when join src & api_prefix.  Thanks @Chandler-Bing!
- [#10014](https://github.com/gradio-app/gradio/pull/10014) [`4aa0e88`](https://github.com/gradio-app/gradio/commit/4aa0e887a6e4b0245c01aac5a57f2adce67ade9a) - Add `container parameter` to `gr.HTML` component.  Thanks @yinsumirage!
- [#9987](https://github.com/gradio-app/gradio/pull/9987) [`a2a3cd4`](https://github.com/gradio-app/gradio/commit/a2a3cd466c25e99949d5c49ed5710825dc796030) - Add `show_heading` param to gr.Label.  Thanks @hannahblair!
- [#10030](https://github.com/gradio-app/gradio/pull/10030) [`ba05a7c`](https://github.com/gradio-app/gradio/commit/ba05a7cbb93af7ed565c563aa24fef920d14013d) - fix typing of launcher function.  Thanks @JackismyShephard!
- [#9979](https://github.com/gradio-app/gradio/pull/9979) [`e7629f7`](https://github.com/gradio-app/gradio/commit/e7629f7eacdc2a8960fae7472669b60405a4a06c) - Adds copy event to `gr.Markdown`, `gr.Chatbot`, and `gr.Textbox`.  Thanks @abidlabs!
- [#9989](https://github.com/gradio-app/gradio/pull/9989) [`369a44e`](https://github.com/gradio-app/gradio/commit/369a44e7f8c829b3c0e21830d3c2e92b89b4c243) - Add ability to provide preset response options in `gr.Chatbot` / `gr.ChatInterface`.  Thanks @abidlabs!
- [#10053](https://github.com/gradio-app/gradio/pull/10053) [`bea3d2e`](https://github.com/gradio-app/gradio/commit/bea3d2e363ed5471fcdfb12086b1ae4939c3bd35) - Add api_name for ChatInterface.  Thanks @freddyaboulton!

### Fixes

- [#9945](https://github.com/gradio-app/gradio/pull/9945) [`e9f0d03`](https://github.com/gradio-app/gradio/commit/e9f0d0315d27325f55a8b1c5c763d07e3d78fd06) - Ensure Enter is correctly handled in Safari and Firefox.  Thanks @hannahblair!
- [#9990](https://github.com/gradio-app/gradio/pull/9990) [`c3324d7`](https://github.com/gradio-app/gradio/commit/c3324d7f7f824f17fd1177b2f6b353ab5c803d05) - Fix issues related to examples and example caching in `gr.ChatInterface`.  Thanks @abidlabs!
- [#10055](https://github.com/gradio-app/gradio/pull/10055) [`5da6c1d`](https://github.com/gradio-app/gradio/commit/5da6c1da474cc5cfe2e6abfb242a3b1f3dcdfcb7) - Ensure chatbot messages are aligned correctly.  Thanks @hannahblair!
- [#10036](https://github.com/gradio-app/gradio/pull/10036) [`ed156e2`](https://github.com/gradio-app/gradio/commit/ed156e258bef2f0db2d9bd828e0748c2e6cb9fb5) - Fix state serialization issue.  Thanks @freddyaboulton!
- [#10016](https://github.com/gradio-app/gradio/pull/10016) [`7b8f1e4`](https://github.com/gradio-app/gradio/commit/7b8f1e447acae4506236db9819c7c4a54f8b8153) - Fix double gallery close button in preview.  Thanks @freddyaboulton!
- [#9822](https://github.com/gradio-app/gradio/pull/9822) [`2e2cdbf`](https://github.com/gradio-app/gradio/commit/2e2cdbfb609ca992ccc31bb38589486aaaa14012) - Fix css preload when serving from proxied subpaths.  Thanks @amol-!
- [#10037](https://github.com/gradio-app/gradio/pull/10037) [`d0b74ba`](https://github.com/gradio-app/gradio/commit/d0b74ba281b37d8883a4e4fbb98c5922600ca41e) - Ensure toolbar stays visible for large images in ImageEditor.  Thanks @hannahblair!
- [#10015](https://github.com/gradio-app/gradio/pull/10015) [`db162bf`](https://github.com/gradio-app/gradio/commit/db162bfc5907d16b437443fef3c6972065cfa836) - enable lazy caching for chatinterface.  Thanks @abidlabs!
- [#10000](https://github.com/gradio-app/gradio/pull/10000) [`29cfc03`](https://github.com/gradio-app/gradio/commit/29cfc03ecf92e459c538b0e17e942b0af4f5df4c) - Call `run_extra_startup_events` in Lite.  Thanks @whitphx!
- [#10038](https://github.com/gradio-app/gradio/pull/10038) [`7d134e0`](https://github.com/gradio-app/gradio/commit/7d134e0b30ea916d208b7b2eacbb4788456d1377) - Fix example loading issue.  Thanks @freddyaboulton!
- [#10011](https://github.com/gradio-app/gradio/pull/10011) [`74f22d5`](https://github.com/gradio-app/gradio/commit/74f22d57a153e087d81a8937cc9c918ff7d3eeb9) - Fix Starlette templating deprecation warning.  Thanks @abidlabs!
- [#10001](https://github.com/gradio-app/gradio/pull/10001) [`f2fa270`](https://github.com/gradio-app/gradio/commit/f2fa27058ad9170f67bb6a1e1960bfb6ed2a2a76) - Fix Node.js start in Windows.  Thanks @rrg92!
- [#10004](https://github.com/gradio-app/gradio/pull/10004) [`0879be7`](https://github.com/gradio-app/gradio/commit/0879be78b3ae220cb303ac275c8fd47d085aad18) - Ensure `show_label` param is used in HighlightedText.  Thanks @hannahblair!
- [#9988](https://github.com/gradio-app/gradio/pull/9988) [`2afcad8`](https://github.com/gradio-app/gradio/commit/2afcad80abd489111e47cf586a2a8221cc3dc9b6) - Allow negative values in gr.Slider.  Thanks @hannahblair!
- [#10041](https://github.com/gradio-app/gradio/pull/10041) [`c1fa13c`](https://github.com/gradio-app/gradio/commit/c1fa13c9c057ce05a325782e58b409cde79383b8) - Ensure ImageEditor brush colour is updated when changed.  Thanks @hannahblair!
- [#10056](https://github.com/gradio-app/gradio/pull/10056) [`e0ed480`](https://github.com/gradio-app/gradio/commit/e0ed480798b237cbf76a711d02a91100e7b6067e) - Remove duplicated share icon in gr.Chatbot.  Thanks @hannahblair!

## 5.6.0

### Features

- [#9906](https://github.com/gradio-app/gradio/pull/9906) [`eafe22c`](https://github.com/gradio-app/gradio/commit/eafe22cd9404d536b03d3fa80003acea78599d49) - Clearer error message in CheckboxGroup's preprocess function.  Thanks @muhammadyaseen!
- [#9930](https://github.com/gradio-app/gradio/pull/9930) [`eae345e`](https://github.com/gradio-app/gradio/commit/eae345e5fde39aea220b57c6a954cd7d72ff32d5) - Allow settings custom headers in js client.  Thanks @elgiano!
- [#9921](https://github.com/gradio-app/gradio/pull/9921) [`a70ba5e`](https://github.com/gradio-app/gradio/commit/a70ba5e0f01f0c376da0d4e45634bc967f5299f4) - Clearer error message in Dropdown's and Radio's preprocess function.  Thanks @muhammadyaseen!
- [#9933](https://github.com/gradio-app/gradio/pull/9933) [`66375ac`](https://github.com/gradio-app/gradio/commit/66375acb5c0a3a8eecc4cfa00701b14f21f3ed68) - Fix typo in Exception raised by base.py.  Thanks @meg-huggingface!
- [#9950](https://github.com/gradio-app/gradio/pull/9950) [`fc06fe4`](https://github.com/gradio-app/gradio/commit/fc06fe41f015678a0545f4e5c99f6ae2704f0031) - Add ability to read and write from LocalStorage.  Thanks @abidlabs!
- [#9966](https://github.com/gradio-app/gradio/pull/9966) [`da6f191`](https://github.com/gradio-app/gradio/commit/da6f1915547b03601d1808b28e57cca62308df71) - Remember token locally with `gr.load()`.  Thanks @abidlabs!

### Fixes

- [#9949](https://github.com/gradio-app/gradio/pull/9949) [`cfb62bf`](https://github.com/gradio-app/gradio/commit/cfb62bfdb52d88295f27287f788fca977e37ae6d) - Allow dataframe column content to wrap.  Thanks @hannahblair!
- [#9897](https://github.com/gradio-app/gradio/pull/9897) [`c0cf80b`](https://github.com/gradio-app/gradio/commit/c0cf80bddd99ad0f836e618cc3d2b13e73cb5611) - Allow datetime value to be null.  Thanks @hannahblair!
- [#9958](https://github.com/gradio-app/gradio/pull/9958) [`75ad3e3`](https://github.com/gradio-app/gradio/commit/75ad3e341978a521df3d11d4f97d6e55f784c9a1) - SSR Safari Fix.  Thanks @dawoodkhan82!
- [#9905](https://github.com/gradio-app/gradio/pull/9905) [`08f4b8b`](https://github.com/gradio-app/gradio/commit/08f4b8b000702456e04fac70961a4fbe0058f11c) - Add `allow_file_downloads` param to allow downloading image/video/audio media in chatbot.  Thanks @hannahblair!
- [#9913](https://github.com/gradio-app/gradio/pull/9913) [`d81f430`](https://github.com/gradio-app/gradio/commit/d81f430fd50546001b76c0ae5fded32c6d3093f7) - fix: Fix filename stripping to preserve extensions.  Thanks @TakaSoap!
- [#9946](https://github.com/gradio-app/gradio/pull/9946) [`a966e9f`](https://github.com/gradio-app/gradio/commit/a966e9f753af25eb9d813dfdbce39be6f3014d82) - Hide upload button after upload when `file_count="single"`.  Thanks @abidlabs!
- [#9901](https://github.com/gradio-app/gradio/pull/9901) [`74b4ff0`](https://github.com/gradio-app/gradio/commit/74b4ff0e61a2a32e1cd5e3354d3002b369c7ad83) - Ensure radio radius is consistent with checkbox radius.  Thanks @hannahblair!
- [#9904](https://github.com/gradio-app/gradio/pull/9904) [`f523c91`](https://github.com/gradio-app/gradio/commit/f523c915d3732859ff4a8019a82cb597b5208ae2) - Ensure dropped files are validated in MultimediaTextbox.  Thanks @hannahblair!

## 5.5.0

### Features

- [#9875](https://github.com/gradio-app/gradio/pull/9875) [`8305ff8`](https://github.com/gradio-app/gradio/commit/8305ff8712183f27174cfb891548ad7cc1c67fed) - Adds `.expand()` and `.collapse()` events to `gr.Accordion`.  Thanks @abidlabs!
- [#9424](https://github.com/gradio-app/gradio/pull/9424) [`a1582a6`](https://github.com/gradio-app/gradio/commit/a1582a6dca494618c734208cade87acfdac91004) - Lite worker refactoring.  Thanks @whitphx!
- [#9891](https://github.com/gradio-app/gradio/pull/9891) [`fc12496`](https://github.com/gradio-app/gradio/commit/fc124964a1b4922e54a4ca4755f0a536dfae1a21) - Allow uploading more files in gr.File.  Thanks @hannahblair!
- [#9898](https://github.com/gradio-app/gradio/pull/9898) [`dcfa7ad`](https://github.com/gradio-app/gradio/commit/dcfa7ad3e819002c0213a592ad726ccfd9e2bf0c) - Enforce `meta` key present during preprocess in FileData payloads.  Thanks @freddyaboulton!
- [#9887](https://github.com/gradio-app/gradio/pull/9887) [`d407c00`](https://github.com/gradio-app/gradio/commit/d407c007153705a7f5446f4601c12f208ec32a5b) - Add `.download()` event to `gr.File`.  Thanks @abidlabs!
- [#9726](https://github.com/gradio-app/gradio/pull/9726) [`b6725cf`](https://github.com/gradio-app/gradio/commit/b6725cf6c1fe9667dc10e1988976ed36d84d73d3) - Lite auto-load imported modules with `pyodide.loadPackagesFromImports`.  Thanks @whitphx!
- [#9786](https://github.com/gradio-app/gradio/pull/9786) [`f109497`](https://github.com/gradio-app/gradio/commit/f109497e8281b3429b58e3f6a293dd63ebcc08af) - Fix frontend errors on ApiDocs and RecordingSnippet.  Thanks @whitphx!
- [#9800](https://github.com/gradio-app/gradio/pull/9800) [`d1cfe1e`](https://github.com/gradio-app/gradio/commit/d1cfe1e9defa06f927aec2671656fe77514dd0fa) - Allow plot tooltip to show extra columns.  Thanks @aliabid94!

### Fixes

- [#9835](https://github.com/gradio-app/gradio/pull/9835) [`4d90883`](https://github.com/gradio-app/gradio/commit/4d9088354df528c8edf981f3e756d8927d3e8805) - Allows selection of directories in File Explorer.  Thanks @aliabid94!
- [#9883](https://github.com/gradio-app/gradio/pull/9883) [`e10bbd2`](https://github.com/gradio-app/gradio/commit/e10bbd236f5817698f5e5ac1c14c7ec179a725b6) - Fix live interfaces for audio/image streaming.  Thanks @freddyaboulton!
- [#9804](https://github.com/gradio-app/gradio/pull/9804) [`458a38c`](https://github.com/gradio-app/gradio/commit/458a38cabb8e378bb008b1abec8eee8b780fe712) - Fixes for ChatInterface Examples when additional inputs are provided.  Thanks @dawoodkhan82!
- [#9827](https://github.com/gradio-app/gradio/pull/9827) [`7ed8d02`](https://github.com/gradio-app/gradio/commit/7ed8d02979e8ad4db6ef62b29ce080f31bcf9a0d) - Fix Loading SSR'd apps via gr.load.  Thanks @freddyaboulton!
- [#9882](https://github.com/gradio-app/gradio/pull/9882) [`6c8a064`](https://github.com/gradio-app/gradio/commit/6c8a064feeaa89a2ffc96260032f24f18eb032fa) - Ensure non-form elements are correctly positioned when scale is applied.  Thanks @hannahblair!
- [#9880](https://github.com/gradio-app/gradio/pull/9880) [`120198f`](https://github.com/gradio-app/gradio/commit/120198fe2da2ded9e8f27549b9dfd1cd81992ec4) - Fixes LoginButton for SSR.  Thanks @dawoodkhan82!
- [#9881](https://github.com/gradio-app/gradio/pull/9881) [`6866a54`](https://github.com/gradio-app/gradio/commit/6866a5433afe7e29ad73bac10ecbc3b44f5867f4) - Ensure gallery share button is positioned correctly.  Thanks @hannahblair!
- [#9826](https://github.com/gradio-app/gradio/pull/9826) [`69acfeb`](https://github.com/gradio-app/gradio/commit/69acfebffd0d3479a40352de19c8763863557428) - Make sure the Tool accordion is closed if it is not the last message.  Thanks @freddyaboulton!
- [#9892](https://github.com/gradio-app/gradio/pull/9892) [`7d77024`](https://github.com/gradio-app/gradio/commit/7d77024cb8f9cfd39a6468de9534e58dcfa69f49) - Fix dataframe height increasing on scroll.  Thanks @abidlabs!
- [#9859](https://github.com/gradio-app/gradio/pull/9859) [`c1cb5be`](https://github.com/gradio-app/gradio/commit/c1cb5be2d79fce5d25032366b5864700ba9d1114) - Fix: Resolve copy button visibility issue in Textbox component.  Thanks @rahulsamant37!
- [#9886](https://github.com/gradio-app/gradio/pull/9886) [`fa5d433`](https://github.com/gradio-app/gradio/commit/fa5d4339d6aafda529150d9536b895e2b239c831) - Do not load code in gr.NO_RELOAD in the reload mode watch thread.  Thanks @freddyaboulton!

## 5.4.0

### Features

- [#9834](https://github.com/gradio-app/gradio/pull/9834) [`febbed6`](https://github.com/gradio-app/gradio/commit/febbed6db1c1f33cab52bf0d0bbe31fc4ba65305) - Pin multipart version to fix issues with yanking.  Thanks @aliabd!
- [#9792](https://github.com/gradio-app/gradio/pull/9792) [`d2b56a4`](https://github.com/gradio-app/gradio/commit/d2b56a4c0457c1d5f30a9bbef2572049e47de312) - more fix.  Thanks @pngwn!
- [#9795](https://github.com/gradio-app/gradio/pull/9795) [`ff5be45`](https://github.com/gradio-app/gradio/commit/ff5be457dc2ed901f3de1493bdbcb80ec341207a) - Use `safehttpx.get()` instead of `async_get_with_secure_transport()`.  Thanks @abidlabs!
- [#9807](https://github.com/gradio-app/gradio/pull/9807) [`5e89b6d`](https://github.com/gradio-app/gradio/commit/5e89b6d23a872e62e795f5bac969837b0d05de50) - Allow accepting user-provided-tokens in `gr.load`.  Thanks @abidlabs!
- [#9819](https://github.com/gradio-app/gradio/pull/9819) [`160b27c`](https://github.com/gradio-app/gradio/commit/160b27c0d1f92f487cb91b311edfa3aa9e8af561) - Update requirements.txt to allow pillow 11.x.  Thanks @bob-jones-cs!
- [#9649](https://github.com/gradio-app/gradio/pull/9649) [`b1b81c9`](https://github.com/gradio-app/gradio/commit/b1b81c9e1c10c2c14a5cb0661d2503259ece1a1b) - Hide option to add row/col when count is fixed in dataframe.  Thanks @hannahblair!
- [#9805](https://github.com/gradio-app/gradio/pull/9805) [`78e3b51`](https://github.com/gradio-app/gradio/commit/78e3b517af97dd11a3a0465bd34360b9bd8945c1) - Allow setting plotly margins.  Thanks @aliabid94!

### Fixes

- [#9831](https://github.com/gradio-app/gradio/pull/9831) [`767643f`](https://github.com/gradio-app/gradio/commit/767643fdeccb1ae1481e1d79034317082144b371) - Fix a bug in example textbox rendering when it is initially invisible.  Thanks @cornzz!
- [#9836](https://github.com/gradio-app/gradio/pull/9836) [`a4e70f3`](https://github.com/gradio-app/gradio/commit/a4e70f3c428d7a43e31b63d296e9c4c73b09eda8) - Fix Tabs in Rows.  Thanks @aliabid94!
- [#9769](https://github.com/gradio-app/gradio/pull/9769) [`3b9ed29`](https://github.com/gradio-app/gradio/commit/3b9ed299e9ffd7df834299cfcd547be0e844e1bb) - Fix avatar image placement in Chatbot.  Thanks @hannahblair!
- [#9757](https://github.com/gradio-app/gradio/pull/9757) [`f971ca6`](https://github.com/gradio-app/gradio/commit/f971ca6ab53100693152bb3f975fa753a6e29e3b) - added audioop-lts module to support pydub for python3.13+.  Thanks @samy-FERGUI!
- [#9651](https://github.com/gradio-app/gradio/pull/9651) [`1163a37`](https://github.com/gradio-app/gradio/commit/1163a372a61cf84d110160c1711892b9b689d1d3) - Fixes component info font size.  Thanks @dawoodkhan82!
- [#9814](https://github.com/gradio-app/gradio/pull/9814) [`6505d42`](https://github.com/gradio-app/gradio/commit/6505d4289a3e3d27d9133b1c8af41697fdc1476d) - support gradio apps on spaces served on subpaths.  Thanks @pngwn!
- [#9806](https://github.com/gradio-app/gradio/pull/9806) [`b538bda`](https://github.com/gradio-app/gradio/commit/b538bdaa067a01a1ac404356062086c9dc7001b5) - update docstring for the the "variant" parameter in `gr.Button`.  Thanks @fadingNA!
- [#9815](https://github.com/gradio-app/gradio/pull/9815) [`90d9d14`](https://github.com/gradio-app/gradio/commit/90d9d1451860d99fc7b74d5105543f5e71c4b6b9) - use different env var for node port range.  Thanks @pngwn!
- [#9825](https://github.com/gradio-app/gradio/pull/9825) [`f15808e`](https://github.com/gradio-app/gradio/commit/f15808eff361cdbba5237d1deb8b60128bc844e4) - fix: use system timezone in gr.DateTime with include_time=False.  Thanks @lcian!
- [#9783](https://github.com/gradio-app/gradio/pull/9783) [`caf3650`](https://github.com/gradio-app/gradio/commit/caf3650482970cf649ec17d1a2d7d43651b37a04) - Exclude python-multipart 0.0.13.  Thanks @whitphx!

## 5.3.0

### Features

- [#9746](https://github.com/gradio-app/gradio/pull/9746) [`5015abb`](https://github.com/gradio-app/gradio/commit/5015abbd78434754931c2b09d9f603f212c4566d) - fix `@gradio/sanitize` exports.  Thanks @pngwn!
- [#9756](https://github.com/gradio-app/gradio/pull/9756) [`92f337c`](https://github.com/gradio-app/gradio/commit/92f337cc85d545060ea343f1cee85c22b85f6444) - Fix website build issue.  Thanks @aliabd!
- [#9781](https://github.com/gradio-app/gradio/pull/9781) [`7579e92`](https://github.com/gradio-app/gradio/commit/7579e92971e67be3ae81dd00a3acfbb58dd9ba27) - Allow smoother plot changes.  Thanks @aliabid94!

### Fixes

- [#9770](https://github.com/gradio-app/gradio/pull/9770) [`47b5565`](https://github.com/gradio-app/gradio/commit/47b556523db3b63d6a9c2f9f69e8632bfa4ddff6) - Fix broken image select.  Thanks @aliabid94!
- [#9754](https://github.com/gradio-app/gradio/pull/9754) [`36a5076`](https://github.com/gradio-app/gradio/commit/36a50769095081a0e77f04f513d47a2e9d4531ba) - Update client.py: raise error on 429 get_config.  Thanks @Pendrokar!
- [#9780](https://github.com/gradio-app/gradio/pull/9780) [`a72e1a9`](https://github.com/gradio-app/gradio/commit/a72e1a97686601bf72c7df5e7e066a532bbb7f38) - Streaming Markdown in chatbot Component Fix.  Thanks @dawoodkhan82!
- [#9767](https://github.com/gradio-app/gradio/pull/9767) [`16895e8`](https://github.com/gradio-app/gradio/commit/16895e862871839db762f6318622a5a64b9d5199) - Fixes #9742.  Thanks @crypdick!
- [#9654](https://github.com/gradio-app/gradio/pull/9654) [`cd7dab7`](https://github.com/gradio-app/gradio/commit/cd7dab7ba5c81983f133dfa9e90ac6f92ac4fa1f) - Improve select event behaviour in gr.Dataframe.  Thanks @hannahblair!
- [#9700](https://github.com/gradio-app/gradio/pull/9700) [`2932e06`](https://github.com/gradio-app/gradio/commit/2932e067d5716a0f3939bfa3f310db8cdcf565c1) - Fix API info bug.  Thanks @freddyaboulton!
- [#9653](https://github.com/gradio-app/gradio/pull/9653) [`61cd768`](https://github.com/gradio-app/gradio/commit/61cd768490a12f5d63101d5434092bcd1cfc43a8) - Ensures tabs with visible set to false are not visible.  Thanks @hannahblair!
- [#9758](https://github.com/gradio-app/gradio/pull/9758) [`38701a9`](https://github.com/gradio-app/gradio/commit/38701a99710f9484dade8a93c5bf3a43ea30a0d3) - Fix icons not showing in Safari.  Thanks @hannahblair!
- [#9738](https://github.com/gradio-app/gradio/pull/9738) [`2ade59b`](https://github.com/gradio-app/gradio/commit/2ade59b95d4c3610a1a461cc95f020fbf9627305) - Export `Tabs` type from `@gradio/tabs` and fix the Playground to be compatible with the new Tabs API.  Thanks @whitphx!
- [#9762](https://github.com/gradio-app/gradio/pull/9762) [`bcb7d15`](https://github.com/gradio-app/gradio/commit/bcb7d15a8aef1cf1b873ba3d039fbec91432c5b2) - Add a `.clear` event to the `gr.Chatbot` component.  Thanks @abidlabs!
- [#9765](https://github.com/gradio-app/gradio/pull/9765) [`df34f58`](https://github.com/gradio-app/gradio/commit/df34f58c3db12abb3965af8ea83a1bbd25c22be7) - Fixes bug where SVG icons could not be used in Buttons/Chatbots.  Thanks @freddyaboulton!

## 5.2.1

### Fixes

- [#9730](https://github.com/gradio-app/gradio/pull/9730) [`39a0e8c`](https://github.com/gradio-app/gradio/commit/39a0e8c2fb038eb0afc213fa6290c9b2acee7941) - Fix chatbot component streaming bug and visible bug.  Thanks @freddyaboulton!

## 5.2.0

### Features

- [#9712](https://github.com/gradio-app/gradio/pull/9712) [`bad46f3`](https://github.com/gradio-app/gradio/commit/bad46f3e8c1b6e94ccb8c936fe6a0e1c1e6f87f8) - Set min FastAPI version.  Thanks @freddyaboulton!
- [#9699](https://github.com/gradio-app/gradio/pull/9699) [`ea2367c`](https://github.com/gradio-app/gradio/commit/ea2367ccb1b75827a086d1c19e2a4595d7a5aa0f) - allow setting initial value of `gr.Dropdown` to `None` to designate that no value should be initially selected.  Thanks @abidlabs!
- [#9681](https://github.com/gradio-app/gradio/pull/9681) [`2ed2361`](https://github.com/gradio-app/gradio/commit/2ed236187a9aab18e17fc4a8079eddef7dd195a5) - Allow setting title in gr.Info/Warning/Error.  Thanks @ABucket!

### Fixes

- [#9716](https://github.com/gradio-app/gradio/pull/9716) [`3c7f2ad`](https://github.com/gradio-app/gradio/commit/3c7f2ad15f80724bbc5c88c24621e6a078d2bb97) - Restore light/dark custom setting.  Thanks @aliabid94!
- [#9719](https://github.com/gradio-app/gradio/pull/9719) [`7ec57cb`](https://github.com/gradio-app/gradio/commit/7ec57cb018a97270cd00c6e1aa5558e378855c53) - Fix Lite dependencies.  Thanks @whitphx!
- [#9711](https://github.com/gradio-app/gradio/pull/9711) [`7134fc2`](https://github.com/gradio-app/gradio/commit/7134fc272e9e60be4b80dfd294ff8926d5995188) - Custom component fixes.  Thanks @freddyaboulton!
- [#9659](https://github.com/gradio-app/gradio/pull/9659) [`b1a0f6d`](https://github.com/gradio-app/gradio/commit/b1a0f6db0d6900cb4089f4d5809a5f1d5e2609ee) - Fix the behavior of `gr.LoginButton` locally and on Spaces.  Thanks @abidlabs!
- [#9693](https://github.com/gradio-app/gradio/pull/9693) [`c45b466`](https://github.com/gradio-app/gradio/commit/c45b46652d49e0a8a5d8217bbbc6ddbe4b4e91f0) - Fix progress bar compatibility with generators.  Thanks @brody715!
- [#9728](https://github.com/gradio-app/gradio/pull/9728) [`d0b2ce8`](https://github.com/gradio-app/gradio/commit/d0b2ce8c0f150f0b636ad7d2226f7c8c61401996) - Ensure tabs render in SSR mode and reduce time it takes for them to render.  Thanks @pngwn!
- [#9709](https://github.com/gradio-app/gradio/pull/9709) [`31418ef`](https://github.com/gradio-app/gradio/commit/31418ef388a2dc524069ee230c2735a4beaf55f1) - fix table type check.  Thanks @hannahblair!
- [#9731](https://github.com/gradio-app/gradio/pull/9731) [`ea283e7`](https://github.com/gradio-app/gradio/commit/ea283e739849dcbb1c49c04d4c756d3cb2d72dbb) - fix css syntax error.  Thanks @pngwn!
- [#9652](https://github.com/gradio-app/gradio/pull/9652) [`35bebf3`](https://github.com/gradio-app/gradio/commit/35bebf38eb0f61fe8e4f032ee093e92355baeecb) - Hide default slider background.  Thanks @hannahblair!
- [#9678](https://github.com/gradio-app/gradio/pull/9678) [`a25a26e`](https://github.com/gradio-app/gradio/commit/a25a26e208c3f3675ba857a889553c7ccc95e866) - Fix: `file_types` checking bug.  Thanks @jasongzy!

## 5.1.0

### Features

- [#9662](https://github.com/gradio-app/gradio/pull/9662) [`b1c5a68`](https://github.com/gradio-app/gradio/commit/b1c5a68f9003b77b5c70b641100f7db339295180) - Tweak message shown in Colab notebooks.  Thanks @abidlabs!
- [#9656](https://github.com/gradio-app/gradio/pull/9656) [`8f6626c`](https://github.com/gradio-app/gradio/commit/8f6626cd0e5a0c24e1966fbc3e28185c18a04b61) - Fix streaming Audio/Video Output.  Thanks @freddyaboulton!
- [#9660](https://github.com/gradio-app/gradio/pull/9660) [`3407b50`](https://github.com/gradio-app/gradio/commit/3407b505c706cd8e2bbe03603a5ff825f2d0a08a) - Chat Interface Functional test Fix + Chat Examples Center.  Thanks @dawoodkhan82!
- [#9677](https://github.com/gradio-app/gradio/pull/9677) [`3a19e69`](https://github.com/gradio-app/gradio/commit/3a19e690ef8de12c4494429d52988b863065eed3) - Revert text disable.  Thanks @whitphx!

### Fixes

- [#9676](https://github.com/gradio-app/gradio/pull/9676) [`fd0264f`](https://github.com/gradio-app/gradio/commit/fd0264f3358ef848690eceacb75481212dceecf0) - Fix Audio in Chatbot bug.  Thanks @freddyaboulton!

## 5.0.2

### Fixes

- [#9528](https://github.com/gradio-app/gradio/pull/9528) [`9004b11`](https://github.com/gradio-app/gradio/commit/9004b110640bdb54995343a870bf080ee15da02d) - Fix Lite to work on FireFox.  Thanks @whitphx!

## 5.0.1

### Features

- [#9632](https://github.com/gradio-app/gradio/pull/9632) [`9b58ab0`](https://github.com/gradio-app/gradio/commit/9b58ab00b78bedd892c221559b4b54a9211b4969) - bump to node 20.  Thanks @pngwn!
- [#9626](https://github.com/gradio-app/gradio/pull/9626) [`ec95b02`](https://github.com/gradio-app/gradio/commit/ec95b0212b3ce2bf1a14af92fcd40d15052dd672) - Fix stopping chat interface when stop button is clicked.  Thanks @aliabid94!
- [#9617](https://github.com/gradio-app/gradio/pull/9617) [`c163182`](https://github.com/gradio-app/gradio/commit/c163182d1b752ef91629f9caa13bf3cce0fb0869) - Fix dark mode detection and container height.  Thanks @pngwn!
- [#9623](https://github.com/gradio-app/gradio/pull/9623) [`5923c67`](https://github.com/gradio-app/gradio/commit/5923c679136cca68731393d5e4f3bd338e651f44) - Fix Chatbot Examples Error.  Thanks @freddyaboulton!
- [#9614](https://github.com/gradio-app/gradio/pull/9614) [`5d98550`](https://github.com/gradio-app/gradio/commit/5d985509b4b71aa4aa6b28acc38fe83c278dbbfa) - Fix `retry` and `undo` reactivity in gr.Chatbot.  Thanks @hannahblair!
- [#9619](https://github.com/gradio-app/gradio/pull/9619) [`1f3ee97`](https://github.com/gradio-app/gradio/commit/1f3ee97d10415bf7dfa693746517cf97897049b7) - Fix Functional Tests.  Thanks @dawoodkhan82!

### Fixes

- [#9630](https://github.com/gradio-app/gradio/pull/9630) [`2eaa066`](https://github.com/gradio-app/gradio/commit/2eaa0667e1d1a0edd1089bf8c3ffa3f563b9bca2) - Fix duplicate attribute error.  Thanks @pngwn!

## 5.0.0-beta.10

### Fixes

- [#9600](https://github.com/gradio-app/gradio/pull/9600) [`9f71086`](https://github.com/gradio-app/gradio/commit/9f71086036339bfdd14f3aab29729041a01fc2d4) - Ensure undo/try shows for final bot message in gr.Chatbot.  Thanks @hannahblair!

## 5.0.0-beta.9

### Features

- [#9437](https://github.com/gradio-app/gradio/pull/9437) [`c3d93be`](https://github.com/gradio-app/gradio/commit/c3d93bef94b9401747a363f7bad88a1d347d535b) - Adding new themes to Gradio 5.0.  Thanks @allisonwhilden!
- [#9593](https://github.com/gradio-app/gradio/pull/9593) [`cc61fe7`](https://github.com/gradio-app/gradio/commit/cc61fe7047ac61779a61cce52c666400b9517daa) - Some more chatbot fixes.  Thanks @dawoodkhan82!
- [#9583](https://github.com/gradio-app/gradio/pull/9583) [`b92a762`](https://github.com/gradio-app/gradio/commit/b92a7623e1ebd801587041e1ccca058a61058da9) - Disable the submit button and enter-key submit when the text is empty.  Thanks @whitphx!
- [#9590](https://github.com/gradio-app/gradio/pull/9590) [`e853c41`](https://github.com/gradio-app/gradio/commit/e853c413583d91186aef3aceb0849d0ec0494834) - SSR e2e + fixes.  Thanks @pngwn!
- [#9591](https://github.com/gradio-app/gradio/pull/9591) [`139152f`](https://github.com/gradio-app/gradio/commit/139152fe18bfdc5644a59d7bdfec9891b644f0bf) - Equal height in row false by default.  Thanks @aliabid94!
- [#9589](https://github.com/gradio-app/gradio/pull/9589) [`477f45c`](https://github.com/gradio-app/gradio/commit/477f45cb43be957684eb392e3d62c09490c22391) - Only move files to the cache that have a meta key.  Thanks @freddyaboulton!
- [#9584](https://github.com/gradio-app/gradio/pull/9584) [`6f8fa54`](https://github.com/gradio-app/gradio/commit/6f8fa5405528ad684084e4c7facfe36624fe7784) - Chat Interface Multimodal Fix & Fallback to `gr.Examples()`.  Thanks @dawoodkhan82!
- [#9482](https://github.com/gradio-app/gradio/pull/9482) [`bd6c5f2`](https://github.com/gradio-app/gradio/commit/bd6c5f237b0631d86273c7684c3bf2b1011992a3) - Fix custom component CLI on main/5.0.  Thanks @freddyaboulton!
- [#9601](https://github.com/gradio-app/gradio/pull/9601) [`c078892`](https://github.com/gradio-app/gradio/commit/c07889223cb64661b17560b707b977248809470a) - Tweak gr.Dataframe menu UX.  Thanks @hannahblair!
- [#9575](https://github.com/gradio-app/gradio/pull/9575) [`4ec2feb`](https://github.com/gradio-app/gradio/commit/4ec2feb04e452d2c77482c09543c59948567be67) - Update gr.Dataframe UI with action popover.  Thanks @hannahblair!
- [#9582](https://github.com/gradio-app/gradio/pull/9582) [`43a7f42`](https://github.com/gradio-app/gradio/commit/43a7f420d8ac34c7f7fa71d6e630a4c8618d3780) - Chatbot autoscroll.  Thanks @whitphx!
- [#9598](https://github.com/gradio-app/gradio/pull/9598) [`ffc33fa`](https://github.com/gradio-app/gradio/commit/ffc33facaec1bcc92add5892afb86b7b5ba037d4) - Fix markdown code copy/check button in gr.Chatbot.  Thanks @hannahblair!
- [#9576](https://github.com/gradio-app/gradio/pull/9576) [`430a26a`](https://github.com/gradio-app/gradio/commit/430a26a4fbcbabb5e9ddb6173bf658a00960e88e) - Fix reload mode.  Thanks @freddyaboulton!
- [#9580](https://github.com/gradio-app/gradio/pull/9580) [`a9ac396`](https://github.com/gradio-app/gradio/commit/a9ac396f19218eafc441b7614289b4828cde853d) - Deep equal check with hash.  Thanks @aliabid94!
- [#9499](https://github.com/gradio-app/gradio/pull/9499) [`17e6c84`](https://github.com/gradio-app/gradio/commit/17e6c84d6b11651cd03c1d47caec85de62030ea0) - Fix `gr.Chatbot` panels layout.  Thanks @hannahblair!
- [#9592](https://github.com/gradio-app/gradio/pull/9592) [`24fe222`](https://github.com/gradio-app/gradio/commit/24fe222fd17583d04dd31aebf60b649224e8382f) - Fix favicon in ssr mode.  Thanks @freddyaboulton!

## 5.0.0-beta.8

### Features

- [#9550](https://github.com/gradio-app/gradio/pull/9550) [`b0fedd7`](https://github.com/gradio-app/gradio/commit/b0fedd7ef718c0df797ec277db7e773543a70a4d) - Fix most flaky Python tests in `5.0-dev` branch.  Thanks @abidlabs!
- [#9577](https://github.com/gradio-app/gradio/pull/9577) [`9f532e0`](https://github.com/gradio-app/gradio/commit/9f532e03a6b91b9a5592152c19b9b2611774cae7) - Equal height columns.  Thanks @aliabid94!
- [#9570](https://github.com/gradio-app/gradio/pull/9570) [`e0ee3d5`](https://github.com/gradio-app/gradio/commit/e0ee3d5bb1020744cefa1abf66009fbf07da8cbe) - Update gr.ColorPicker UI.  Thanks @hannahblair!
- [#9483](https://github.com/gradio-app/gradio/pull/9483) [`8dc7c12`](https://github.com/gradio-app/gradio/commit/8dc7c12389311b60efcde1b9d3e3668a34d2dc00) - Send Streaming data over Websocket if possible. Also support base64 output format for images.  Thanks @freddyaboulton!
- [#9521](https://github.com/gradio-app/gradio/pull/9521) [`06ef22e`](https://github.com/gradio-app/gradio/commit/06ef22e83cdd27e7afb381396d153d9db3dea16e) - Allow `info=` to render markdown.  Thanks @dawoodkhan82!
- [#9571](https://github.com/gradio-app/gradio/pull/9571) [`148345d`](https://github.com/gradio-app/gradio/commit/148345d107763754710505281ad70368ebc6f3ec) - Fix chatinterface embedding height issues.  Thanks @aliabid94!
- [#9525](https://github.com/gradio-app/gradio/pull/9525) [`7c367b6`](https://github.com/gradio-app/gradio/commit/7c367b6cf0472d478671b7c7476e892b4c61c812) - Fix cut off in gr.ImageEditor.  Thanks @hannahblair!
- [#9522](https://github.com/gradio-app/gradio/pull/9522) [`3b71ed2`](https://github.com/gradio-app/gradio/commit/3b71ed21b7e2ecb67eb68fb946d25565169cb4df) - Api info fix.  Thanks @freddyaboulton!
- [#9508](https://github.com/gradio-app/gradio/pull/9508) [`b260389`](https://github.com/gradio-app/gradio/commit/b26038932a64f024bd149a56b1539e9e75802f29) - Change caching to occur not at the creation of a `gr.Examples()` but when the Blocks is actually launched.  Thanks @aliabid94!
- [#9524](https://github.com/gradio-app/gradio/pull/9524) [`cf39640`](https://github.com/gradio-app/gradio/commit/cf396404ec8052c7fbf5f045955028bc54a274a5) - Add `css_paths` and `head_paths` parameters.  Thanks @abidlabs!

## 5.0.0-beta.7

### Features

- [#9546](https://github.com/gradio-app/gradio/pull/9546) [`b82aa6f`](https://github.com/gradio-app/gradio/commit/b82aa6f115f6ad9a9690bdecb0fe63c162dc75c0) - Disable sagemaker_check() for now.  Thanks @vmatt!
- [#9545](https://github.com/gradio-app/gradio/pull/9545) [`098a009`](https://github.com/gradio-app/gradio/commit/098a009c05243967bd9e5acc28864eb40a135f6a) - Add Jinja2 language to Code component.  Thanks @CISC!
- [#9526](https://github.com/gradio-app/gradio/pull/9526) [`f60bb68`](https://github.com/gradio-app/gradio/commit/f60bb68f52cd0863d9087b3fbc56635e297adef1) - Fix single select dropdown.  Thanks @whitphx!
- [#9497](https://github.com/gradio-app/gradio/pull/9497) [`d826faa`](https://github.com/gradio-app/gradio/commit/d826faa8c2584cf0772d4e66b4073e33b83f3a00) - Hide x axis labels.  Thanks @aliabid94!

## 5.0.0-beta.6

### Features

- [#9460](https://github.com/gradio-app/gradio/pull/9460) [`7352a89`](https://github.com/gradio-app/gradio/commit/7352a89722da91461c32fd33588531f3edce9c48) - Playground requirements tab.  Thanks @whitphx!
- [#9496](https://github.com/gradio-app/gradio/pull/9496) [`1647ebd`](https://github.com/gradio-app/gradio/commit/1647ebddc3e2ed6fc143a62629409e32afcc5801) - UI theme fixes.  Thanks @aliabid94!
- [#9450](https://github.com/gradio-app/gradio/pull/9450) [`991883e`](https://github.com/gradio-app/gradio/commit/991883e217dc0a3512b3ae3245378812f373b8db) - Improve `gr.Code`.  Thanks @hannahblair!
- [#9504](https://github.com/gradio-app/gradio/pull/9504) [`d054262`](https://github.com/gradio-app/gradio/commit/d054262f611d5f1eb1a1c936db7152347a891f8e) - Centre components within `Block` when height and width are set.  Thanks @hannahblair!
- [#9481](https://github.com/gradio-app/gradio/pull/9481) [`2510a6e`](https://github.com/gradio-app/gradio/commit/2510a6e978a49432d7820e9518f164a70cf8acc8) - Fix `slider-color` var.  Thanks @hannahblair!
- [#9495](https://github.com/gradio-app/gradio/pull/9495) [`488ef76`](https://github.com/gradio-app/gradio/commit/488ef768ccc5008401f7e0aa4c357b93311190ff) - Fix custom component CLI unit tests.  Thanks @freddyaboulton!
- [#9488](https://github.com/gradio-app/gradio/pull/9488) [`4e6a47f`](https://github.com/gradio-app/gradio/commit/4e6a47f5a29cb885d5bc01a79ca4cc45d298f0b1) - Fixes: Chatbot examples for custom chatbot + rename `suggestions` -> `examples`.  Thanks @dawoodkhan82!
- [#9506](https://github.com/gradio-app/gradio/pull/9506) [`861f5e9`](https://github.com/gradio-app/gradio/commit/861f5e97ffde5f59e42cfa213364f19e84d799fd) - Fix node process to run with correct server name.  Thanks @abidlabs!
- [#9493](https://github.com/gradio-app/gradio/pull/9493) [`c307a0c`](https://github.com/gradio-app/gradio/commit/c307a0c9b81b66bde21f0af4a9f7d5726ea7a30d) - Minor fixes to docs and a demo.  Thanks @abidlabs!
- [#9519](https://github.com/gradio-app/gradio/pull/9519) [`0ab6ac5`](https://github.com/gradio-app/gradio/commit/0ab6ac5dc01b69e4f2462d00c4910f3354441227) - Fix change triggers for dropdown and radio.  Thanks @dawoodkhan82!

### Fixes

- [#9431](https://github.com/gradio-app/gradio/pull/9431) [`7065e11`](https://github.com/gradio-app/gradio/commit/7065e11e465fcdfe14688bd6ca2aeed0a25fcc36) - Check for `file_types` parameter in the backend.  Thanks @dawoodkhan82!

## 5.0.0-beta.5

### Features

- [#9470](https://github.com/gradio-app/gradio/pull/9470) [`b406139`](https://github.com/gradio-app/gradio/commit/b40613928c0e0d224ff2b4db5d0b45727c178560) - Add support for 3rd party providers to `gr.load`, and provide a better UX for conversational models.  Thanks @abidlabs!
- [#9383](https://github.com/gradio-app/gradio/pull/9383) [`30d13ac`](https://github.com/gradio-app/gradio/commit/30d13ac8a932d53abfd236d3e4e845570480e701) - Pre/post-processing download requests.  Thanks @aliabid94!
- [#9464](https://github.com/gradio-app/gradio/pull/9464) [`3ac5d9c`](https://github.com/gradio-app/gradio/commit/3ac5d9c972576d82bc365a6532e6e12f55441a30) - Fix plots.  Thanks @pngwn!

## 5.0.0-beta.4

### Features

- [#9419](https://github.com/gradio-app/gradio/pull/9419) [`018c140`](https://github.com/gradio-app/gradio/commit/018c140ef86cacc8211df05b57b26924dab7fa08) - Start/stop recoding from the backend. Add guide on conversational chatbots.  Thanks @freddyaboulton!
- [#9453](https://github.com/gradio-app/gradio/pull/9453) [`56dbf77`](https://github.com/gradio-app/gradio/commit/56dbf77671012015efd3c745bc33e5074ab7158f) - Chatbot bug fixes.  Thanks @dawoodkhan82!
- [#9448](https://github.com/gradio-app/gradio/pull/9448) [`e7a415b`](https://github.com/gradio-app/gradio/commit/e7a415b1ef923d31754b302b3cd8b5e71a9ea446) - Use or `pathlib.Path` objects to indicate filepaths for `css`, `js`, and `head` parameters.  Thanks @abidlabs!
- [#9469](https://github.com/gradio-app/gradio/pull/9469) [`f7c3396`](https://github.com/gradio-app/gradio/commit/f7c3396f55a5b8364d3880a29d766bd092d7f840) - Fix. Triggered dataframe change event for header change.  Thanks @Joodith!
- [#9447](https://github.com/gradio-app/gradio/pull/9447) [`afbd8e7`](https://github.com/gradio-app/gradio/commit/afbd8e7a2faadeea5a431f67a753dea14dd5829f) - Reduce analytics that are collected.  Thanks @abidlabs!
- [#9438](https://github.com/gradio-app/gradio/pull/9438) [`8f469e1`](https://github.com/gradio-app/gradio/commit/8f469e1d1d9d1636e4dedfb1c09e76a5e2ba8d4e) - Small changes to caching.  Thanks @abidlabs!
- [#9446](https://github.com/gradio-app/gradio/pull/9446) [`0c8fafb`](https://github.com/gradio-app/gradio/commit/0c8fafb31df7ef3ef5812d6efb47ca342a3bad3c) - Fix SSR mode flag with `mount_gradio_app` and revert changes to pytests.  Thanks @abidlabs!
- [#9456](https://github.com/gradio-app/gradio/pull/9456) [`4d75f02`](https://github.com/gradio-app/gradio/commit/4d75f029aacf0561f50c7afebbe8d54da2cb0af4) - Update object detection guide.  Thanks @freddyaboulton!
- [#9406](https://github.com/gradio-app/gradio/pull/9406) [`74f3b9d`](https://github.com/gradio-app/gradio/commit/74f3b9ded1ce0ff6f2f0dbcb113edd64b7bb8f60) - Allow skipping an arbitrary number of output components, and also raise a warning if the number of output components does not match the number of values returned from a function.  Thanks @abidlabs!
- [#9413](https://github.com/gradio-app/gradio/pull/9413) [`a16787a`](https://github.com/gradio-app/gradio/commit/a16787abdc8d507d75b986dbe882d21be4540908) - Lite: HTTPX client improvement.  Thanks @whitphx!

## 5.0.0-beta.3

### Features

- [#9376](https://github.com/gradio-app/gradio/pull/9376) [`d92c26f`](https://github.com/gradio-app/gradio/commit/d92c26fe63f6b88e16c356cb84c55b61f795db73) - Small fixes to `gr.Dataframe` and chatbot docs.  Thanks @abidlabs!
- [#9412](https://github.com/gradio-app/gradio/pull/9412) [`c2c2fd9`](https://github.com/gradio-app/gradio/commit/c2c2fd989348f826566773c07c0e0bda200199ff) - fix SSR apps on spaces.  Thanks @pngwn!

### Fixes

- [#9405](https://github.com/gradio-app/gradio/pull/9405) [`bf27ff4`](https://github.com/gradio-app/gradio/commit/bf27ff4ac8ada33ea03dd26d5c1c1115aa1f318a) - Center icon in button when no text is present.  Thanks @abidlabs!

## 5.0.0-beta.2

### Features

- [#9359](https://github.com/gradio-app/gradio/pull/9359) [`50c3a7f`](https://github.com/gradio-app/gradio/commit/50c3a7f1541f632853a96f3d979ebeef6ad82869) - Small tweak to how thoughts are shown in `gr.Chatbot`.  Thanks @abidlabs!
- [#9323](https://github.com/gradio-app/gradio/pull/9323) [`06babda`](https://github.com/gradio-app/gradio/commit/06babda0395fd3fbd323c1c3cb33704ecfd6deb0) - Disable liking user message in chatbot by default but make it configurable.  Thanks @freddyaboulton!
- [#8966](https://github.com/gradio-app/gradio/pull/8966) [`8e52b6a`](https://github.com/gradio-app/gradio/commit/8e52b6a3e75957462bc7fdbf6ff9c280084d5f08) - Chatbot Examples.  Thanks @dawoodkhan82!
- [#9261](https://github.com/gradio-app/gradio/pull/9261) [`73647a0`](https://github.com/gradio-app/gradio/commit/73647a07b0439efabe3dd218ff6c366ffa3b84a0) - Move icons into `IconButtonWrapper`.  Thanks @hannahblair!
- [#9316](https://github.com/gradio-app/gradio/pull/9316) [`4338f29`](https://github.com/gradio-app/gradio/commit/4338f29bce2430d765f20070d1823ecc19d940cb) - 9227 chatinterface retry bug.  Thanks @freddyaboulton!
- [#9313](https://github.com/gradio-app/gradio/pull/9313) [`1fef9d9`](https://github.com/gradio-app/gradio/commit/1fef9d9a26f0ebce4de18c486702661f6539b1c6) - Standardize `height` across components and add `max_height` and `min_height` parameters where appropriate.  Thanks @abidlabs!
- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!
- [#9250](https://github.com/gradio-app/gradio/pull/9250) [`350b0a5`](https://github.com/gradio-app/gradio/commit/350b0a5cafb9176f914f62e7c90de51d4352cc77) - Improve Icon Button consistency.  Thanks @hannahblair!
- [#9269](https://github.com/gradio-app/gradio/pull/9269) [`e05f568`](https://github.com/gradio-app/gradio/commit/e05f568f47e9fa33ef91dbbe5cc477d32762bc36) - Fix reload mode and streaming in 5.0 dev.  Thanks @freddyaboulton!
- [#9356](https://github.com/gradio-app/gradio/pull/9356) [`1daf259`](https://github.com/gradio-app/gradio/commit/1daf259b52d0b1ce16d916ff25a15d322b51ecf5) - Use `container` param in `gr.Markdown`.  Thanks @hannahblair!
- [#9321](https://github.com/gradio-app/gradio/pull/9321) [`81a356d`](https://github.com/gradio-app/gradio/commit/81a356d802f95b6a9a7aeb3759e05e47febbd0d3) - Remove two dependencies: `importlib_resources` and `urllib3` (if not in Wasm).  Thanks @abidlabs!
- [#9253](https://github.com/gradio-app/gradio/pull/9253) [`99648ec`](https://github.com/gradio-app/gradio/commit/99648ec7c4443e74799941e47b0015ac9ca581e1) - Adds ability to block event trigger when file is uploading.  Thanks @dawoodkhan82!
- [#9341](https://github.com/gradio-app/gradio/pull/9341) [`02369b3`](https://github.com/gradio-app/gradio/commit/02369b3159df72b2f4a36ce5684574eb65065731) - Improve is_in_or_equal and fuzzer.  Thanks @freddyaboulton!
- [#9333](https://github.com/gradio-app/gradio/pull/9333) [`5b86e2f`](https://github.com/gradio-app/gradio/commit/5b86e2f2a2bedcde79e425fd470473bc1fd6ae2e) - Enhance Lite E2E tests and fix a networking problem on Lite.  Thanks @whitphx!
- [#9338](https://github.com/gradio-app/gradio/pull/9338) [`19f6b31`](https://github.com/gradio-app/gradio/commit/19f6b31a73c6114093cbb5a7e69131175efa8a79) - Fix typo in `tunneling.py`.  Thanks @abidlabs!
- [#9336](https://github.com/gradio-app/gradio/pull/9336) [`736046f`](https://github.com/gradio-app/gradio/commit/736046f17db073b56023b5e077b0ae5ae4adeb02) - Object Detection From Webcam Stream Guide.  Thanks @freddyaboulton!
- [#9300](https://github.com/gradio-app/gradio/pull/9300) [`6309a48`](https://github.com/gradio-app/gradio/commit/6309a48e3a89a13137ec9d61c1c722eb59b8e3dc) - Raise ChecksumMismatchError.  Thanks @abidlabs!
- [#9373](https://github.com/gradio-app/gradio/pull/9373) [`6443062`](https://github.com/gradio-app/gradio/commit/64430620449ab5b19ea32b02ab82a2d1804dcb2e) - Fix Cached Examples for Streamed Media.  Thanks @freddyaboulton!
- [#9367](https://github.com/gradio-app/gradio/pull/9367) [`1c94328`](https://github.com/gradio-app/gradio/commit/1c94328cfe6ce0676c3850f5e9da5bcabf9ee570) - add local fonts and update themes.  Thanks @hannahblair!
- [#9335](https://github.com/gradio-app/gradio/pull/9335) [`b543465`](https://github.com/gradio-app/gradio/commit/b543465d06d7d1b399c4d0755da05e022611a97f) - Remove lite/theme.css from the Git-managed file tree.  Thanks @whitphx!
- [#9358](https://github.com/gradio-app/gradio/pull/9358) [`16c0485`](https://github.com/gradio-app/gradio/commit/16c0485a32be324a5f1c7252f5ce09fff79f7d67) - Small tweaks to improve the DX for the "tuples"/"messages" argument in `gr.Chatbot`.  Thanks @abidlabs!
- [#9303](https://github.com/gradio-app/gradio/pull/9303) [`34f46b0`](https://github.com/gradio-app/gradio/commit/34f46b0512fe30b4db9c9901cb23987d3cecc48d) - Dont move files to cache automatically in chatbot postprocess.  Thanks @freddyaboulton!
- [#9363](https://github.com/gradio-app/gradio/pull/9363) [`3ad28c7`](https://github.com/gradio-app/gradio/commit/3ad28c7e310e8589e0c53b7efee8031e129bece8) - Prevent HTML and Markdown height changing when status is hidden.  Thanks @hannahblair!
- [#9260](https://github.com/gradio-app/gradio/pull/9260) [`d47dd1f`](https://github.com/gradio-app/gradio/commit/d47dd1f8417a878ef731d2eeabf60f3069289dee) - Fix overflowing markdown in Chatbot.  Thanks @hannahblair!
- [#9320](https://github.com/gradio-app/gradio/pull/9320) [`98cbcae`](https://github.com/gradio-app/gradio/commit/98cbcaef827de7267462ccba180c7b2ffb1e825d) - chore: fix docs style.  Thanks @imba-tjd!
- [#9314](https://github.com/gradio-app/gradio/pull/9314) [`299879d`](https://github.com/gradio-app/gradio/commit/299879d02adf3bacb012c76a467aaf5df5b31493) - Make `gr.Image` preprocessing more efficient.  Thanks @abidlabs!
- [#9371](https://github.com/gradio-app/gradio/pull/9371) [`7bf3e99`](https://github.com/gradio-app/gradio/commit/7bf3e9989392b7edcdc18c1d840fb8130b15040e) - Fix `gr.ImageEditor` toolbar cutoff.  Thanks @hannahblair!
- [#9306](https://github.com/gradio-app/gradio/pull/9306) [`f3f0fef`](https://github.com/gradio-app/gradio/commit/f3f0fef199c7779aac9aaef794dd4af1861ce50f) - Fixes race condition in `update_root_in_config`.  Thanks @abidlabs!
- [#9312](https://github.com/gradio-app/gradio/pull/9312) [`7c0780b`](https://github.com/gradio-app/gradio/commit/7c0780b5677f8a1c05b9d2eee136e982917829b8) - Proposal: remove `gr.make_waveform` and remove `matplotlib` as a dependency.  Thanks @abidlabs!
- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Tweaks to SSR mode.  Thanks @pngwn!
- [#9270](https://github.com/gradio-app/gradio/pull/9270) [`b0b8500`](https://github.com/gradio-app/gradio/commit/b0b850081d8d10c1287b5d179b8db37482e21c8d) - Fix stop recording button colors.  Thanks @freddyaboulton!
- [#9268](https://github.com/gradio-app/gradio/pull/9268) [`c469d40`](https://github.com/gradio-app/gradio/commit/c469d40b0d9d807abb9fa92c67069c08833ce6bc) - Raise error instead of warning if checksums for binary do not match.  Thanks @abidlabs!
- [#9377](https://github.com/gradio-app/gradio/pull/9377) [`618e9fe`](https://github.com/gradio-app/gradio/commit/618e9fe941744cef4a4a06eb7840763c64b15e32) - Update babylon.js to `v7` for `gr.Model3D`.  Thanks @abidlabs!
- [#9282](https://github.com/gradio-app/gradio/pull/9282) [`54ea485`](https://github.com/gradio-app/gradio/commit/54ea485ba92165be96137ae35e2d3f2fc62a2873) - Further tweak to is_in_or_equal.  Thanks @freddyaboulton!
- [#9326](https://github.com/gradio-app/gradio/pull/9326) [`7afb9a1`](https://github.com/gradio-app/gradio/commit/7afb9a14fa64310eb8b70f43a3bad373e46e36c1) - 5.0 merge take 2.  Thanks @pngwn!
- [#9280](https://github.com/gradio-app/gradio/pull/9280) [`7122420`](https://github.com/gradio-app/gradio/commit/712242047fde3a594dfde7f48a44c7ea16239dc8) - Match style of textbox stop button to submit button.  Thanks @freddyaboulton!
- [#9348](https://github.com/gradio-app/gradio/pull/9348) [`61f794b`](https://github.com/gradio-app/gradio/commit/61f794bba78ef59e55beca0ba743548f33f3a3c3) - Do not attach `content_disposition_type = "attachment"` headers for files explicitly allowed by developer.  Thanks @abidlabs!
- [#9361](https://github.com/gradio-app/gradio/pull/9361) [`5eb860f`](https://github.com/gradio-app/gradio/commit/5eb860f739a187217ded1fc569676e0edd16bab0) - Refactor lazy caching.  Thanks @abidlabs!
- [#9311](https://github.com/gradio-app/gradio/pull/9311) [`c4afdcd`](https://github.com/gradio-app/gradio/commit/c4afdcdb1f1f80c5f95ab45d527236e9364ace82) - Added max lines and overflow scrollbar for `gr.Code`.  Thanks @micpst!

### Fixes

- [#9299](https://github.com/gradio-app/gradio/pull/9299) [`aa35b07`](https://github.com/gradio-app/gradio/commit/aa35b0788e613fdd45446d267513e6f94fa208ea) - Trigger state change event on iterators.  Thanks @freddyaboulton!
- [#9393](https://github.com/gradio-app/gradio/pull/9393) [`53ed0f0`](https://github.com/gradio-app/gradio/commit/53ed0f030551ad876a1fea28a9db9015ba6ec33e) - Fix File Types for MultimodalTextbox.  Thanks @dawoodkhan82!
- [#9328](https://github.com/gradio-app/gradio/pull/9328) [`6a7f631`](https://github.com/gradio-app/gradio/commit/6a7f63180b4105622298dd742d6a0d25216ea629) - Set the color of placeholder in a disabled textbox to gray instead of black, and disable typing while a response is generating in `gr.ChatInterface`, allow `gr.MultimodalTextbox` to accept string values.  Thanks @abidlabs!

## 5.0.0-beta.1

### Features

- [#9235](https://github.com/gradio-app/gradio/pull/9235) [`f8b411f`](https://github.com/gradio-app/gradio/commit/f8b411fe282ff0316ed4abebc0a043b044bf4dd9) - Built-in submit and stop buttons in `gr.ChatInterface(multimodal=False)`, adding `submit_btn` and `stop_btn` props to `gr.Textbox()` and `gr.MultimodalText()`.  Thanks @whitphx!
- [#9201](https://github.com/gradio-app/gradio/pull/9201) [`5492e74`](https://github.com/gradio-app/gradio/commit/5492e742b1f1fa618208cce523f50ad22a6e86f1) - Move buttons from chat_interface into Chatbot.  Thanks @freddyaboulton!
- [#9199](https://github.com/gradio-app/gradio/pull/9199) [`3175c7a`](https://github.com/gradio-app/gradio/commit/3175c7aebc6ad2466d31d6949580f5a3cb4cd698) - Redesign `gr.Tabs()`.  Thanks @hannahblair!
- [#9167](https://github.com/gradio-app/gradio/pull/9167) [`e9e737e`](https://github.com/gradio-app/gradio/commit/e9e737eeeb61d0bbf43277c75b6ffed8b34aa445) - Redesign `gr.Button()`.  Thanks @hannahblair!
- [#9218](https://github.com/gradio-app/gradio/pull/9218) [`4a832f4`](https://github.com/gradio-app/gradio/commit/4a832f4b0a8f35a10bc2301a56b711519e85034b) - Adds TLS to FRP tunnel.  Thanks @abidlabs!
- [#9166](https://github.com/gradio-app/gradio/pull/9166) [`8a75559`](https://github.com/gradio-app/gradio/commit/8a755596317c59bfb10803edc0f8642e62d7cecd) - Minor changes to flagging for 5.0.  Thanks @abidlabs!
- [#9254](https://github.com/gradio-app/gradio/pull/9254) [`03f3735`](https://github.com/gradio-app/gradio/commit/03f3735fba1fd4f1978b5431af9e67de3b6e7945) - Adds a "huggingface" button variant, and makes it the default for `gr.LoginButton` and `gr.DuplicateButton`.  Thanks @abidlabs!
- [#9187](https://github.com/gradio-app/gradio/pull/9187) [`5bf00b7`](https://github.com/gradio-app/gradio/commit/5bf00b7524ebf399b48719120a49d15bb21bd65c) - make all component SSR compatible.  Thanks @pngwn!
- [#9236](https://github.com/gradio-app/gradio/pull/9236) [`dd8e2e3`](https://github.com/gradio-app/gradio/commit/dd8e2e32c6c1ec42e13c55af870d0da291117dd3) - Improve button consistency across light/dark mode.  Thanks @hannahblair!
- [#9225](https://github.com/gradio-app/gradio/pull/9225) [`5f2e047`](https://github.com/gradio-app/gradio/commit/5f2e047c2ce114cebc95d5dba16c4df10fa73eb1) - Add a 'None' option to the gradio.Image component to disable image_m….  Thanks @GeeMoose!
- [#9204](https://github.com/gradio-app/gradio/pull/9204) [`3c73f00`](https://github.com/gradio-app/gradio/commit/3c73f00e3016b16917ebfe0bad390f2dff683457) - 🔡 Update default core Gradio font.  Thanks @hannahblair!
- [#9245](https://github.com/gradio-app/gradio/pull/9245) [`c8cfe93`](https://github.com/gradio-app/gradio/commit/c8cfe93c0971d904c29da60410952fd20c9439c0) - Lighten secondary button grey fill.  Thanks @hannahblair!
- [#9246](https://github.com/gradio-app/gradio/pull/9246) [`38cf712`](https://github.com/gradio-app/gradio/commit/38cf71234bf57fe9da6eea2d32b1d6e7ef35c700) - Stop using `multiprocessing` in `flagging.CSVLogger` on Lite v5.  Thanks @whitphx!
- [#9216](https://github.com/gradio-app/gradio/pull/9216) [`e137b30`](https://github.com/gradio-app/gradio/commit/e137b30b1a53ca32d3cd809d31e97d5d54a4e479) - Decrease component radii and remove input shadows.  Thanks @hannahblair!
- [#9200](https://github.com/gradio-app/gradio/pull/9200) [`2e179d3`](https://github.com/gradio-app/gradio/commit/2e179d35be6ed60a5a6bfc7303178d63e41781ad) - prefix api routes.  Thanks @pngwn!

## 5.0.0-beta.0

### Features

- [#9069](https://github.com/gradio-app/gradio/pull/9069) [`f9f84bf`](https://github.com/gradio-app/gradio/commit/f9f84bfe7064634164501d1023591b415ad2a03b) - No token passed by default in `gr.load()`.  Thanks @abidlabs!
- [#9160](https://github.com/gradio-app/gradio/pull/9160) [`8f5a895`](https://github.com/gradio-app/gradio/commit/8f5a8950c949996f7c439b11a7aa40edda3e8562) - Fix native plot lite demos.  Thanks @aliabd!
- [#9197](https://github.com/gradio-app/gradio/pull/9197) [`6773c4d`](https://github.com/gradio-app/gradio/commit/6773c4da22f957a11b2a07f032ce13c7b4c94f8c) - Redesign `gr.Slider()`.  Thanks @hannahblair!
- [#9140](https://github.com/gradio-app/gradio/pull/9140) [`c054ec8`](https://github.com/gradio-app/gradio/commit/c054ec85e49ab102b15afd305583ee394151d16c) - Drop python 3.8 and 3.9.  Thanks @abidlabs!
- [#8978](https://github.com/gradio-app/gradio/pull/8978) [`fe9d1cb`](https://github.com/gradio-app/gradio/commit/fe9d1cb0870a5b07d51e8cb05401af47efbacd13) - Improve url downloads for file objects.  Thanks @aliabid94!
- [#8810](https://github.com/gradio-app/gradio/pull/8810) [`4cf8af9`](https://github.com/gradio-app/gradio/commit/4cf8af9407a44ee914e0be567da38b29f00eff8e) - Prevent invalid values from being submitted to dropdown, etc.  Thanks @abidlabs!
- [#9194](https://github.com/gradio-app/gradio/pull/9194) [`20c0836`](https://github.com/gradio-app/gradio/commit/20c0836ed0e0698dbc81d2a4bda04363fd857334) - Deprecate type='tuples for chatbot and focus chatbot docs on 'messages' type.  Thanks @freddyaboulton!
- [#9122](https://github.com/gradio-app/gradio/pull/9122) [`2672ea2`](https://github.com/gradio-app/gradio/commit/2672ea297ef28414ecf2eeab7984b1e4b4ee40b8) - Postprocess hardening.  Thanks @freddyaboulton!
- [#9149](https://github.com/gradio-app/gradio/pull/9149) [`3d7a9b8`](https://github.com/gradio-app/gradio/commit/3d7a9b81f6fef06187eca832471dc1692eb493a0) - Open audio/image input stream only when queue is ready.  Thanks @freddyaboulton!
- [#9173](https://github.com/gradio-app/gradio/pull/9173) [`66349fe`](https://github.com/gradio-app/gradio/commit/66349fe26827e3a3c15b738a1177e95fec7f5554) - Streaming Guides.  Thanks @freddyaboulton!
- [#9185](https://github.com/gradio-app/gradio/pull/9185) [`2daf3d1`](https://github.com/gradio-app/gradio/commit/2daf3d10f5986675f6ceb75ebb50c9d991c282bf) - Adding `maxlength` attribute handling of `textarea` and `input` HTML element for the `gr.TextBox()` component via a `max_length` parameter.  Thanks @WH-Yoshi!
- [#8959](https://github.com/gradio-app/gradio/pull/8959) [`a0aac66`](https://github.com/gradio-app/gradio/commit/a0aac6694076529ff925ccd34b3503d35e86cb49) - Adds `strict_cors` parameter to `launch()`.  Thanks @abidlabs!
- [#9052](https://github.com/gradio-app/gradio/pull/9052) [`f3652eb`](https://github.com/gradio-app/gradio/commit/f3652ebe08211e12739df73c15fd97e5ff81276a) - Video gallery.  Thanks @dawoodkhan82!
- [#9213](https://github.com/gradio-app/gradio/pull/9213) [`ab4580b`](https://github.com/gradio-app/gradio/commit/ab4580bd5f755a07c9a9bd2a775220a9a2085f8c) - Remove grey background behind all components.  Thanks @hannahblair!
- [#9073](https://github.com/gradio-app/gradio/pull/9073) [`0d8a358`](https://github.com/gradio-app/gradio/commit/0d8a358cc86331aa0c83380326b30d04597f9ef9) - Set default `format` in `gr.Audio` to be `None` to avoid unnecessary preprocessing.  Thanks @abidlabs!
- [#9130](https://github.com/gradio-app/gradio/pull/9130) [`864cd0f`](https://github.com/gradio-app/gradio/commit/864cd0fd6aa85691b53bd0bf3a50af05b778813c) - Raise WasmUnsupportedError for ffmpeg usage on Lite.  Thanks @whitphx!
- [#8797](https://github.com/gradio-app/gradio/pull/8797) [`6e6818c`](https://github.com/gradio-app/gradio/commit/6e6818c3af836051fffdd070a9e33889b246186e) - Deprecate for 5.0.  Thanks @abidlabs!
- [#9132](https://github.com/gradio-app/gradio/pull/9132) [`5cedf16`](https://github.com/gradio-app/gradio/commit/5cedf162f2120e30dd58bf3a8eab27115030b4f5) - Deprecate passing a tuple for gr.Code value.  Thanks @freddyaboulton!
- [#8941](https://github.com/gradio-app/gradio/pull/8941) [`97a7bf6`](https://github.com/gradio-app/gradio/commit/97a7bf66a79179d1b91a3199d68e5c11216ca500) - Streaming inputs for 5.0.  Thanks @freddyaboulton!
- [#9150](https://github.com/gradio-app/gradio/pull/9150) [`80c966a`](https://github.com/gradio-app/gradio/commit/80c966af6e3d947abe96058de9b683ecf05d9803) - DNS resolver on ip check.  Thanks @aliabid94!
- [#9175](https://github.com/gradio-app/gradio/pull/9175) [`e6d456a`](https://github.com/gradio-app/gradio/commit/e6d456a9c3b7e80e0c9a16cd365288deff706635) - Change dark mode color theme from `gray` to `zinc`.  Thanks @hannahblair!
- [#8884](https://github.com/gradio-app/gradio/pull/8884) [`3408dba`](https://github.com/gradio-app/gradio/commit/3408dba7560a17371be679d0f01564a5606dc90b) - replace ip addresses with machine-specific hashes.  Thanks @abidlabs!

### Fixes

- [#9189](https://github.com/gradio-app/gradio/pull/9189) [`ab142ee`](https://github.com/gradio-app/gradio/commit/ab142ee13d19070b75b5eb03efcda7193b8993c2) - Fix serialization error in curl api.  Thanks @freddyaboulton!

## 4.44.1

### Features

- [#9320](https://github.com/gradio-app/gradio/pull/9320) [`98cbcae`](https://github.com/gradio-app/gradio/commit/98cbcaef827de7267462ccba180c7b2ffb1e825d) - chore: fix docs style.  Thanks @imba-tjd!

## 4.44.0

### Features

- [#9302](https://github.com/gradio-app/gradio/pull/9302) [`ac2c015`](https://github.com/gradio-app/gradio/commit/ac2c015bd8385c3f5e346b9cfce415f1e5f54c69) - Fileformat whitelist.  Thanks @aliabid94!
- [#9276](https://github.com/gradio-app/gradio/pull/9276) [`8362a10`](https://github.com/gradio-app/gradio/commit/8362a10a7e8a3c291fa0300a6f4a23a1ca997b8a) - Fix scrollbars everywhere.  Thanks @aliabid94!

### Fixes

- [#9188](https://github.com/gradio-app/gradio/pull/9188) [`8f8e1c6`](https://github.com/gradio-app/gradio/commit/8f8e1c6a0b09b0d1985b8377d94d693cb00f8a18) - Fix multiple trigger bug when function has js.  Thanks @freddyaboulton!
- [#9279](https://github.com/gradio-app/gradio/pull/9279) [`fb5845c`](https://github.com/gradio-app/gradio/commit/fb5845c3539e006235a2a52811a863ef2fefd66f) - Separate starlette.Request from PredictBody. Only set in new PredictBodyInternal object.  Thanks @freddyaboulton!
- [#9267](https://github.com/gradio-app/gradio/pull/9267) [`ecf9137`](https://github.com/gradio-app/gradio/commit/ecf9137762130ab2e9f8e747feda091392b25e7a) - Add root_url to components created by gr.render.  Thanks @freddyaboulton!

## 4.43.0

### Features

- [#9160](https://github.com/gradio-app/gradio/pull/9160) [`8f5a895`](https://github.com/gradio-app/gradio/commit/8f5a8950c949996f7c439b11a7aa40edda3e8562) - Fix native plot lite demos.  Thanks @aliabd!
- [#9185](https://github.com/gradio-app/gradio/pull/9185) [`2daf3d1`](https://github.com/gradio-app/gradio/commit/2daf3d10f5986675f6ceb75ebb50c9d991c282bf) - Adding `maxlength` attribute handling of `textarea` and `input` HTML element for the `gr.TextBox()` component via a `max_length` parameter.  Thanks @WH-Yoshi!
- [#9187](https://github.com/gradio-app/gradio/pull/9187) [`5bf00b7`](https://github.com/gradio-app/gradio/commit/5bf00b7524ebf399b48719120a49d15bb21bd65c) - make all component SSR compatible.  Thanks @pngwn!
- [#9225](https://github.com/gradio-app/gradio/pull/9225) [`5f2e047`](https://github.com/gradio-app/gradio/commit/5f2e047c2ce114cebc95d5dba16c4df10fa73eb1) - Add a 'None' option to the gradio.Image component to disable image_m….  Thanks @GeeMoose!

### Fixes

- [#9242](https://github.com/gradio-app/gradio/pull/9242) [`d0e93d7`](https://github.com/gradio-app/gradio/commit/d0e93d70e87ea64f144e8eda7d5d49c27b6158e5) - Fix for create_or_modify_pyi read_text Windows Issue in component_meta.py.  Thanks @SmirkingKitsune!
- [#9189](https://github.com/gradio-app/gradio/pull/9189) [`ab142ee`](https://github.com/gradio-app/gradio/commit/ab142ee13d19070b75b5eb03efcda7193b8993c2) - Fix serialization error in curl api.  Thanks @freddyaboulton!
- [#9277](https://github.com/gradio-app/gradio/pull/9277) [`d9c4c86`](https://github.com/gradio-app/gradio/commit/d9c4c8606acf9ab36390e35ab10e43bb3191ced5) - Pin `fastapi<0.113.0` in `requirements.txt`.  Thanks @abidlabs!

## 4.42.0

### Features

- [#9128](https://github.com/gradio-app/gradio/pull/9128) [`747013b`](https://github.com/gradio-app/gradio/commit/747013bbacebae6bfdda554b45e541e80b2894e0) - Allow accessing the entire row of selected values in `gr.DataFrame`.  Thanks @abidlabs!
- [#8935](https://github.com/gradio-app/gradio/pull/8935) [`f6b2b97`](https://github.com/gradio-app/gradio/commit/f6b2b97d473dd81571410cccc6e1ddfcf9fa00bc) - Initialize the client with the fake host for Lite server.  Thanks @whitphx!
- [#9031](https://github.com/gradio-app/gradio/pull/9031) [`04b7d32`](https://github.com/gradio-app/gradio/commit/04b7d327ec1227a693fc2dfea51b1e2729851bde) - Allow drag and replace image in `gr.Image` and Multimodal textbox.  Thanks @hannahblair!
- [#8930](https://github.com/gradio-app/gradio/pull/8930) [`41d5ab9`](https://github.com/gradio-app/gradio/commit/41d5ab987ba9728753be4509490c79041655809b) - Add `placeholder` param to Image and ImageEditor to replace upload image text.  Thanks @hannahblair!
- [#9023](https://github.com/gradio-app/gradio/pull/9023) [`87e3537`](https://github.com/gradio-app/gradio/commit/87e3537342017c7f19d012f0806a14bc264e09f9) - Add height param to gr.JSON.  Thanks @hannahblair!
- [#9013](https://github.com/gradio-app/gradio/pull/9013) [`5350f1f`](https://github.com/gradio-app/gradio/commit/5350f1feb20cb7458d188403f319c5087052f695) - Add copy all messages button to chatbot.  Thanks @hannahblair!
- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!
- [#9102](https://github.com/gradio-app/gradio/pull/9102) [`efdc323`](https://github.com/gradio-app/gradio/commit/efdc3231a7bde38cfe45d10086d0d36a24c1b9b4) - Initial SSR refactor.  Thanks @pngwn!

### Fixes

- [#9078](https://github.com/gradio-app/gradio/pull/9078) [`1a9d729`](https://github.com/gradio-app/gradio/commit/1a9d7297c17a3bc0493be34e8e762350ab7f0844) - Catch OSErrors in `HuggingFaceDatasetSaver._deserialize_components`.  Thanks @davidberenstein1957!
- [#9088](https://github.com/gradio-app/gradio/pull/9088) [`96f8ffa`](https://github.com/gradio-app/gradio/commit/96f8ffa5eea511290f203c5d13484731e7d82387) - Set non-zero exit codes for custom component build and install commands when failures occur.  Thanks @freddyaboulton!
- [#9161](https://github.com/gradio-app/gradio/pull/9161) [`173c7b8`](https://github.com/gradio-app/gradio/commit/173c7b8624371d89c40eb667bc28b9955c61b063) - Chatbot Image size and list fixes.  Thanks @dawoodkhan82!
- [#9151](https://github.com/gradio-app/gradio/pull/9151) [`f1ef94a`](https://github.com/gradio-app/gradio/commit/f1ef94a435439934610497eab34201a586e418e1) - Open media type files in browser.  Thanks @aliabid94!
- [#9148](https://github.com/gradio-app/gradio/pull/9148) [`8715f10`](https://github.com/gradio-app/gradio/commit/8715f103399c709717084335cfe5e971ebf9f2de) - Allow `gr.Request` to work with ZeroGPU.  Thanks @abidlabs!
- [#9093](https://github.com/gradio-app/gradio/pull/9093) [`60650d8`](https://github.com/gradio-app/gradio/commit/60650d84b2cfe93fd2ebf2d2997d6c0f382d5f1a) - Reset `Dataset` page to 0 when samples change.  Thanks @abidlabs!
- [#9116](https://github.com/gradio-app/gradio/pull/9116) [`ba6322e`](https://github.com/gradio-app/gradio/commit/ba6322ec2bb975f15389fe0700816bf671c6819d) - Fix image height content fit.  Thanks @hannahblair!
- [#9079](https://github.com/gradio-app/gradio/pull/9079) [`d6dc384`](https://github.com/gradio-app/gradio/commit/d6dc3846fd94fe03658f0fa8219d68ddf1f7aa64) - Add more typing to event listeners.  Thanks @JackismyShephard!
- [#9119](https://github.com/gradio-app/gradio/pull/9119) [`30b5d6f`](https://github.com/gradio-app/gradio/commit/30b5d6f2b75e1ff0ea03c7a6567e43a022871c9f) - Fix chatinterface multimodal bug.  Thanks @freddyaboulton!
- [#8987](https://github.com/gradio-app/gradio/pull/8987) [`7b288cf`](https://github.com/gradio-app/gradio/commit/7b288cf6772ec3dc1fa603db859975e5dab90127) - Fix unexpected rendering of Dataset.  Thanks @Col0ring!
- [#9089](https://github.com/gradio-app/gradio/pull/9089) [`508ac84`](https://github.com/gradio-app/gradio/commit/508ac84bc2ffbeff6daae8ae0956e14e7472c4c0) - Set orig_name in downloadbutton postprocess.  Thanks @freddyaboulton!
- [#8951](https://github.com/gradio-app/gradio/pull/8951) [`6e7d9e5`](https://github.com/gradio-app/gradio/commit/6e7d9e5b848e5af8cae97a4a4f021859c423ffa4) - Deal with OAuth too many redirects.  Thanks @Wauplin!

## 4.41.0

### Features

- [#8968](https://github.com/gradio-app/gradio/pull/8968) [`38b3682`](https://github.com/gradio-app/gradio/commit/38b3682c3a9b40fb4070f665d94711c43c6fe40e) - Improvements to FRP client download and usage.  Thanks @abidlabs!
- [#8965](https://github.com/gradio-app/gradio/pull/8965) [`d30432e`](https://github.com/gradio-app/gradio/commit/d30432e9c6d4cc1e5cfd989a1a3ae4aba7e21290) - harden CI.  Thanks @pngwn!
- [#8972](https://github.com/gradio-app/gradio/pull/8972) [`d4c503a`](https://github.com/gradio-app/gradio/commit/d4c503a471cfd202c56fbddd99d5da431a4b7478) - Type hint Correction.  Thanks @sthemeow!
- [#8964](https://github.com/gradio-app/gradio/pull/8964) [`bf6bbd9`](https://github.com/gradio-app/gradio/commit/bf6bbd971acddbf78f03bea431ed7d1e0003ccf9) - Add min/max-imize button to gr.Image and gr.Gallery.  Thanks @hannahblair!
- [#9059](https://github.com/gradio-app/gradio/pull/9059) [`981731a`](https://github.com/gradio-app/gradio/commit/981731acb7da3e78555abeb20f47f3a8a5f0d861) - Fix flaky tests and tests on Windows.  Thanks @abidlabs!
- [#9021](https://github.com/gradio-app/gradio/pull/9021) [`360350c`](https://github.com/gradio-app/gradio/commit/360350cfc46b7dcc41d8a015b7eb6e7056cc7938) - Minor fixes.  Thanks @aliabid94!
- [#9064](https://github.com/gradio-app/gradio/pull/9064) [`4ba7b23`](https://github.com/gradio-app/gradio/commit/4ba7b238e22ac042de14a6b69aa9d61536ddffba) - Improve plot guide, add double clicking to plots.  Thanks @aliabid94!
- [#8975](https://github.com/gradio-app/gradio/pull/8975) [`3feea64`](https://github.com/gradio-app/gradio/commit/3feea64a65688d710184604bb44636d513bcc36a) - Prevent overflow in Model3D.  Thanks @hannahblair!
- [#8967](https://github.com/gradio-app/gradio/pull/8967) [`2f89877`](https://github.com/gradio-app/gradio/commit/2f89877ac1ef9eab46115187ffe179d5da060edd) - Set `content_disposition_type` and `media_type` on downloaded files.  Thanks @aliabid94!
- [#8958](https://github.com/gradio-app/gradio/pull/8958) [`4ff91a3`](https://github.com/gradio-app/gradio/commit/4ff91a3e6538872c529b604d36120dd946dc3282) - Fixes some docstrings, particularly for the `show_progress` parameter.  Thanks @abidlabs!
- [#9020](https://github.com/gradio-app/gradio/pull/9020) [`08b5159`](https://github.com/gradio-app/gradio/commit/08b51590163b306fd874f543f6fcaf23ac7d2646) - Some tweaks to is_in_or_equal.  Thanks @freddyaboulton!

### Fixes

- [#8962](https://github.com/gradio-app/gradio/pull/8962) [`c68eefb`](https://github.com/gradio-app/gradio/commit/c68eefba6c18ba9fda98220fb273726522dc3340) - fix: httpx timeouts cause gradio to fail during launch.  Thanks @rsamborski!
- [#8847](https://github.com/gradio-app/gradio/pull/8847) [`4d8a473`](https://github.com/gradio-app/gradio/commit/4d8a473632e388a312aee5c705b3c1f79853441b) - Refactor Chatinterface to use Chatbot instead of gr.State variables.  Thanks @freddyaboulton!
- [#9054](https://github.com/gradio-app/gradio/pull/9054) [`9fa635a`](https://github.com/gradio-app/gradio/commit/9fa635a8fd0050cc16539b9a3d11846ec71edf13) - Fix multimodal chatinterface api bug.  Thanks @freddyaboulton!
- [#8847](https://github.com/gradio-app/gradio/pull/8847) [`4d8a473`](https://github.com/gradio-app/gradio/commit/4d8a473632e388a312aee5c705b3c1f79853441b) - fix: wrong named param check for js client.  Thanks @freddyaboulton!
- [#9011](https://github.com/gradio-app/gradio/pull/9011) [`0978de8`](https://github.com/gradio-app/gradio/commit/0978de8104046250593806c927b416e4ffbbe293) - Passes `gr.Request` if type hint is `Request | None`.  Thanks @abidlabs!
- [#9053](https://github.com/gradio-app/gradio/pull/9053) [`8b33393`](https://github.com/gradio-app/gradio/commit/8b33393586af695e4ccd07f55453df896785b089) - Fix `show_progress` in `gr.Interface`.  Thanks @abidlabs!

## 4.40.0

### Features

- [#8954](https://github.com/gradio-app/gradio/pull/8954) [`5010e95`](https://github.com/gradio-app/gradio/commit/5010e9579e5fdd5c3861b144c427551c2e5ead0f) - Add `overflow: wrap` to JSON to catch overflow in xs device widths.  Thanks @hannahblair!
- [#8932](https://github.com/gradio-app/gradio/pull/8932) [`600c97c`](https://github.com/gradio-app/gradio/commit/600c97c807b648bca11c2dd5dfa0a6a692756bd9) - Allow viewing JSON as list or dict with `show_indices` param.  Thanks @hannahblair!
- [#8929](https://github.com/gradio-app/gradio/pull/8929) [`3539787`](https://github.com/gradio-app/gradio/commit/3539787ebb39b3d00c34707b49d5de40fdc3d69a) - Add line numbering and collapse/expand logic to gr.JSON.  Thanks @hannahblair!
- [#8862](https://github.com/gradio-app/gradio/pull/8862) [`ac132e3`](https://github.com/gradio-app/gradio/commit/ac132e3cbc8dbc7bec3d607d52bef347e90feb41) - Support the use of custom authentication mechanism, timeouts, and other `httpx` parameters in Python Client.  Thanks @valgai!
- [#8947](https://github.com/gradio-app/gradio/pull/8947) [`96d36d7`](https://github.com/gradio-app/gradio/commit/96d36d70ad3bee048027cfbf89533020a8aa6e63) - Restore plot label angles.  Thanks @aliabid94!
- [#8948](https://github.com/gradio-app/gradio/pull/8948) [`f7fbd2c`](https://github.com/gradio-app/gradio/commit/f7fbd2c23795d97071296463779d41bd0e937164) - Bump websockets version max for gradio-client.  Thanks @evanscho!
- [#8907](https://github.com/gradio-app/gradio/pull/8907) [`9b42ba8`](https://github.com/gradio-app/gradio/commit/9b42ba8f1006c05d60a62450d3036ce0d6784f86) - Update guides esp plots.  Thanks @aliabid94!
- [#8888](https://github.com/gradio-app/gradio/pull/8888) [`70a0c56`](https://github.com/gradio-app/gradio/commit/70a0c5620043ae613af16008f4a683b0f238545d) - Added support for TokenClassificationPipeline.  Thanks @cswamy!
- [#8950](https://github.com/gradio-app/gradio/pull/8950) [`7e997a8`](https://github.com/gradio-app/gradio/commit/7e997a85bb21cbe7eb27df5b3f31ad636435b0a1) - Fix running local app with fake OAuth.  Thanks @Wauplin!
- [#8867](https://github.com/gradio-app/gradio/pull/8867) [`f8ccb5e`](https://github.com/gradio-app/gradio/commit/f8ccb5e663ed5df010f7a8e93d556bfc238d849d) - Make `update_root_in_config` atomic.  Thanks @abidlabs!
- [#8900](https://github.com/gradio-app/gradio/pull/8900) [`de997e6`](https://github.com/gradio-app/gradio/commit/de997e67c9a7feb9e2eccebf92969366dbd67eba) - Adds ability to watermark videos via a `watermark` parameter in Video component.  Thanks @meg-huggingface!

### Fixes

- [#8949](https://github.com/gradio-app/gradio/pull/8949) [`1e16f67`](https://github.com/gradio-app/gradio/commit/1e16f67ba2a02761d4b73afd723f8edc3c3124e9) - Fix check icon in gr.JSON and gr.Code.  Thanks @hannahblair!
- [#8899](https://github.com/gradio-app/gradio/pull/8899) [`20444f9`](https://github.com/gradio-app/gradio/commit/20444f9b56f95240d00759f31a1b831b9eb53160) - Fix Chatbot Multimodal Examples.  Thanks @dawoodkhan82!
- [#8933](https://github.com/gradio-app/gradio/pull/8933) [`5f9b8d0`](https://github.com/gradio-app/gradio/commit/5f9b8d093a17f4fcc689cbc83fd6db6c43b5174b) - Fix lazy caching.  Thanks @abidlabs!
- [#8879](https://github.com/gradio-app/gradio/pull/8879) [`67c08bf`](https://github.com/gradio-app/gradio/commit/67c08bfb9e59d801081591b8a59232c32d4467cf) - Fix file uploading in iOS.  Thanks @hannahblair!
- [#8905](https://github.com/gradio-app/gradio/pull/8905) [`4b14ea8`](https://github.com/gradio-app/gradio/commit/4b14ea860d5055410a3a2257974b61a5c8eaac9d) - Allow use of file extensions in gr.File in iOS.  Thanks @hannahblair!
- [#8927](https://github.com/gradio-app/gradio/pull/8927) [`223688b`](https://github.com/gradio-app/gradio/commit/223688b70a7a3cf4daa92ae77f8fca7b537cc2b4) - Fix `Could not resolve "virtual:component-loader"` in gradio/utils package.  Thanks @benzler!
- [#8934](https://github.com/gradio-app/gradio/pull/8934) [`8204425`](https://github.com/gradio-app/gradio/commit/8204425bfa2c08077948e59e7f5375b1b4d1e338) - Fix Json component serialization bug.  Thanks @freddyaboulton!
- [#8931](https://github.com/gradio-app/gradio/pull/8931) [`4c2d37d`](https://github.com/gradio-app/gradio/commit/4c2d37db849848fd38ba733a23a5aaceeaf58faf) - Add background to gr.Code line numbers.  Thanks @hannahblair!

## 4.39.0

### Features

- [#8832](https://github.com/gradio-app/gradio/pull/8832) [`e75f2ca`](https://github.com/gradio-app/gradio/commit/e75f2ca2da4f41f25459b98bedaa940c887e6a93) - Fix build for pre-release.  Thanks @pngwn!
- [#8618](https://github.com/gradio-app/gradio/pull/8618) [`aa4b7a7`](https://github.com/gradio-app/gradio/commit/aa4b7a71921fd5b7ad7e3c0cce7687a8f6d284da) - Improve styling of parameter tables in the docs.  Thanks @abidlabs!
- [#8745](https://github.com/gradio-app/gradio/pull/8745) [`4030f28`](https://github.com/gradio-app/gradio/commit/4030f28af6ae9f3eb94bb4e9cae83fb7016cdaad) - Allows updating the dataset of a `gr.Examples`.  Thanks @abidlabs!
- [#8757](https://github.com/gradio-app/gradio/pull/8757) [`6073736`](https://github.com/gradio-app/gradio/commit/60737366517f48d1a37ffce15425783a2887f305) - Document `FileData` class in docs.  Thanks @hannahblair!
- [#8846](https://github.com/gradio-app/gradio/pull/8846) [`76c1759`](https://github.com/gradio-app/gradio/commit/76c175935019833baef709a5cf401d2263ca72ee) - add space header.  Thanks @pngwn!
- [#8804](https://github.com/gradio-app/gradio/pull/8804) [`1d09925`](https://github.com/gradio-app/gradio/commit/1d09925469a5f96e8d3a972a28841903fa1c7265) - Fix Lite's <Playground />.  Thanks @whitphx!
- [#8807](https://github.com/gradio-app/gradio/pull/8807) [`a238af4`](https://github.com/gradio-app/gradio/commit/a238af4d688c4e030e37c2ef01d5c80d6d940912) - Refactor plots to drop `altair` and use `vega.js` directly.  Thanks @aliabid94!
- [#8806](https://github.com/gradio-app/gradio/pull/8806) [`a3d23b4`](https://github.com/gradio-app/gradio/commit/a3d23b43e71c22bc2b019ae96668605e744768d5) - Add `loop` parameters to `gr.Audio` and `gr.Video`.  Thanks @abidlabs!
- [#8856](https://github.com/gradio-app/gradio/pull/8856) [`5622331`](https://github.com/gradio-app/gradio/commit/5622331da724eb2510c74f156a2fd140a932cc55) - Extend `pyright` to cover tests as well.  Thanks @abidlabs!
- [#8851](https://github.com/gradio-app/gradio/pull/8851) [`914b193`](https://github.com/gradio-app/gradio/commit/914b1935de27c3b379ac9e759b6d10747e3b881a) - Add copy button to `gr.Markdown`.  Thanks @hannahblair!
- [#8837](https://github.com/gradio-app/gradio/pull/8837) [`0d76169`](https://github.com/gradio-app/gradio/commit/0d76169e46112dffbc2e7649355706e37e0a6372) - upgrade pyright==1.1.372.  Thanks @abidlabs!
- [#8816](https://github.com/gradio-app/gradio/pull/8816) [`9ee6839`](https://github.com/gradio-app/gradio/commit/9ee6839f94d23d685a800ed3a275206e0b0e48f6) - Change optionality of the `data` param in `submit` + `predict`.  Thanks @hannahblair!
- [#8809](https://github.com/gradio-app/gradio/pull/8809) [`7f41567`](https://github.com/gradio-app/gradio/commit/7f41567e9cc5222c4cede3ea5321e634ea038bd1) - Use constant-time comparison when checking user provided analytics key.  Thanks @abidlabs!
- [#8817](https://github.com/gradio-app/gradio/pull/8817) [`34510db`](https://github.com/gradio-app/gradio/commit/34510db468daae19ad618c347cb88a4769816fb2) - Allow HTML in alert modals.  Thanks @abidlabs!
- [#8803](https://github.com/gradio-app/gradio/pull/8803) [`e1a4040`](https://github.com/gradio-app/gradio/commit/e1a404093cfaf9d8f2a92bc1d28fb6aa254848d1) - Ensure all upload components have consistent upload regions.  Thanks @pngwn!
- [#8821](https://github.com/gradio-app/gradio/pull/8821) [`cea3bf9`](https://github.com/gradio-app/gradio/commit/cea3bf990057391f699bdeeabbdb62fdad9b43f5) - Fix dependency loop with statustracker and markdown.  Thanks @aliabd!
- [#8774](https://github.com/gradio-app/gradio/pull/8774) [`2d179f6`](https://github.com/gradio-app/gradio/commit/2d179f647baca48362863f5144298768149860c9) - Set the default format of gr.Plot as png for Wasm mode.  Thanks @whitphx!
- [#8775](https://github.com/gradio-app/gradio/pull/8775) [`e36bab7`](https://github.com/gradio-app/gradio/commit/e36bab77e5753c3b011c7e44bce2eed46fac27cc) - Refactoring loadPyodide typing.  Thanks @whitphx!

### Fixes

- [#8854](https://github.com/gradio-app/gradio/pull/8854) [`d1f0441`](https://github.com/gradio-app/gradio/commit/d1f044145ae93e5838042d9fb25f4f17def9c774) - Use covariant container types across the codebase and add typing to our demos.  Thanks @abidlabs!
- [#8818](https://github.com/gradio-app/gradio/pull/8818) [`2de9a97`](https://github.com/gradio-app/gradio/commit/2de9a97ae953cc5c58c0d33d8966e638e76f950f) - Refactoring <gradio-lite /> component making the code simpler and fixing a Playground mode bug.  Thanks @whitphx!
- [#8799](https://github.com/gradio-app/gradio/pull/8799) [`61bb588`](https://github.com/gradio-app/gradio/commit/61bb5883a2af50534ef6994ba4829a1a3ea00e65) - Remove Pydantic v2 patch from Lite.  Thanks @whitphx!
- [#8822](https://github.com/gradio-app/gradio/pull/8822) [`3a81fb2`](https://github.com/gradio-app/gradio/commit/3a81fb2578c6f73607c4e240d228dccb69153e0a) - Latex Rendering Fix.  Thanks @dawoodkhan82!
- [#8865](https://github.com/gradio-app/gradio/pull/8865) [`2f630ab`](https://github.com/gradio-app/gradio/commit/2f630abf53ec493a3ff5e827b5951b26c74b7242) - Chatbot Examples Scroll Fix.  Thanks @dawoodkhan82!
- [#8820](https://github.com/gradio-app/gradio/pull/8820) [`5050b36`](https://github.com/gradio-app/gradio/commit/5050b36221e75a18d8a5d4f74a725e70768a4c4a) - fix: wrong named param check for js client.  Thanks @JacobLinCool!
- [#8836](https://github.com/gradio-app/gradio/pull/8836) [`7e8c829`](https://github.com/gradio-app/gradio/commit/7e8c829aad85d3d5a31a03f4f2e41483d1e6b53e) - Add `.input()` events to `gr.Audio` and `gr.Image`.  Thanks @abidlabs!
- [#8802](https://github.com/gradio-app/gradio/pull/8802) [`7b19474`](https://github.com/gradio-app/gradio/commit/7b19474cb2dd8f2c34d630f43edb0fcb0e05aa0c) - Ensure `ImageEditor` brush color can be updated with `gr.update`.  Thanks @pngwn!
- [#8852](https://github.com/gradio-app/gradio/pull/8852) [`16b8200`](https://github.com/gradio-app/gradio/commit/16b820038df43905447ab7623d39d91ceb0d6238) - Fix gr.Image height inconsistencies.  Thanks @hannahblair!

## 4.38.1

### Features

- [#8766](https://github.com/gradio-app/gradio/pull/8766) [`2b4636e`](https://github.com/gradio-app/gradio/commit/2b4636e75cf728846253451b7104b724609a9cd1) - Fix width of assistant's chatbot bubble.  Thanks @pngwn!

## 4.38.0

### Highlights

#### Support message format in chatbot 💬 ([#8422](https://github.com/gradio-app/gradio/pull/8422) [`4221290`](https://github.com/gradio-app/gradio/commit/4221290d847041024b1faa3df5585bba0775b8b3))

`gr.Chatbot` and `gr.ChatInterface` now support the [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api#messages-api), which is fully compatible with LLM API providers such as Hugging Face Text Generation Inference, OpenAI's chat completions API, and Llama.cpp server. 

Building Gradio applications around these LLM solutions is now even easier! 

`gr.Chatbot` and `gr.ChatInterface` now have a `type` parameter that can accept two values - `'tuples'` and `'messages'`. If set to `'tuples'`, the default chatbot data format is expected. If set to `'messages'`, a list of dictionaries with `content` and `role` keys is expected. See below - 

```python
def chat_greeter(msg, history):
    history.append({"role": "assistant", "content": "Hello!"})
    return history
```

Additionally, gradio now exposes a `gr.ChatMessage` dataclass you can use for IDE type hints and auto completion.

<img width="852" alt="image" src="https://github.com/freddyaboulton/freddyboulton/assets/41651716/d283e8f3-b194-466a-8194-c7e697dca9ad">


#### Tool use in Chatbot 🛠️

The Gradio Chatbot can now natively display tool usage and intermediate thoughts common in Agent and chain-of-thought workflows!

If you are using the new "messages" format, simply add a `metadata` key with a dictionary containing a `title` key and `value`. This will display the assistant message in an expandable message box to show the result of a tool or intermediate step.

```python
import gradio as gr
from gradio import ChatMessage
import time

def generate_response(history):
    history.append(ChatMessage(role="user", content="What is the weather in San Francisco right now?"))
    yield history
    time.sleep(0.25)
    history.append(ChatMessage(role="assistant",
                               content="In order to find the current weather in San Francisco, I will need to use my weather tool.")
                               )
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="API Error when connecting to weather service.",
                              metadata={"title": "💥 Error using tool 'Weather'"})
                  )
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="I will try again",
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="Weather 72 degrees Fahrenheit with 20% chance of rain.",
                                metadata={"title": "🛠️ Used tool 'Weather'"}
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="Now that the API succeeded I can complete my task.",
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="It's a sunny day in San Francisco with a current temperature of 72 degrees Fahrenheit and a 20% chance of rain. Enjoy the weather!",
                              ))
    yield history


with gr.Blocks() as demo:
    chatbot  = gr.Chatbot(type="messages")
    button = gr.Button("Get San Francisco Weather")
    button.click(generate_response, chatbot, chatbot)

if __name__ == "__main__":
    demo.launch()
```



![tool-box-demo](https://github.com/freddyaboulton/freddyboulton/assets/41651716/cf73ecc9-90ac-42ce-bca5-768e0cc00a48)

 Thanks @freddyaboulton!

### Features

- [#8683](https://github.com/gradio-app/gradio/pull/8683) [`a92c3e8`](https://github.com/gradio-app/gradio/commit/a92c3e8015c1951f995f52f9750a0364bd5d5e8d) - Warn against Falsy credentials.  Thanks @Paillat-dev!
- [#8743](https://github.com/gradio-app/gradio/pull/8743) [`ee497d5`](https://github.com/gradio-app/gradio/commit/ee497d5c3c96041e5b624452596762248de114cc) - Perform CORS validation when the request has a cookie.  Thanks @abidlabs!
- [#8744](https://github.com/gradio-app/gradio/pull/8744) [`b736c8d`](https://github.com/gradio-app/gradio/commit/b736c8db343087a4854f659b92732c8859fa999a) - Refactor `gr.ParamViewer` to use HTML `<details>` and other tweaks.  Thanks @abidlabs!
- [#8665](https://github.com/gradio-app/gradio/pull/8665) [`3b8238c`](https://github.com/gradio-app/gradio/commit/3b8238c2e222a6537b19b8901198b7e369e8319a) - Add c/cpp code support.  Thanks @ginazhouhuiwu!
- [#8713](https://github.com/gradio-app/gradio/pull/8713) [`e3c7079`](https://github.com/gradio-app/gradio/commit/e3c7079e380880d5759d98d180eaf688122f1c69) - Time range component.  Thanks @aliabid94!
- [#8705](https://github.com/gradio-app/gradio/pull/8705) [`280a3f4`](https://github.com/gradio-app/gradio/commit/280a3f4afe0500fe67a02fafa2ac31344c3a0149) - GRADIO_ALLOWED_PATHS & GRADIO_BLOCKED_PATHS comma separated environme….  Thanks @cocktailpeanut!
- [#8733](https://github.com/gradio-app/gradio/pull/8733) [`fb0daf3`](https://github.com/gradio-app/gradio/commit/fb0daf3730ffbe6aab5ebe4210eae150729a40b1) - Improvements to `gr.Examples`: adds events as attributes and documents, them, adds `sample_labels`, and `visible` properties.  Thanks @abidlabs!
- [#8750](https://github.com/gradio-app/gradio/pull/8750) [`5e36144`](https://github.com/gradio-app/gradio/commit/5e361442328cf01fa92ecdadfa420054b8da2a81) - Add guides for msg format and llm agents.  Thanks @freddyaboulton!
- [#8687](https://github.com/gradio-app/gradio/pull/8687) [`bc1d45d`](https://github.com/gradio-app/gradio/commit/bc1d45d8745a677bbe2a32f8d7553fe0d4ef3fd7) - Model3D point cloud and wireframe display modes.  Thanks @dawoodkhan82!

### Fixes

- [#8699](https://github.com/gradio-app/gradio/pull/8699) [`012da05`](https://github.com/gradio-app/gradio/commit/012da05287846d94beb0ecdc28d7fbc48c4248ff) - Ensure JS client `status_callback` functionality works and improve status messages.  Thanks @hannahblair!
- [#8763](https://github.com/gradio-app/gradio/pull/8763) [`c1ecfde`](https://github.com/gradio-app/gradio/commit/c1ecfde50e55902140aafc3551968e26c1bb4cd0) - 8394 df hidden items.  Thanks @pngwn!
- [#8505](https://github.com/gradio-app/gradio/pull/8505) [`2943d6d`](https://github.com/gradio-app/gradio/commit/2943d6d68847314885dc6c5c0247083116017ca0) - Add Timer component.  Thanks @aliabid94!
- [#8715](https://github.com/gradio-app/gradio/pull/8715) [`a6b3c6c`](https://github.com/gradio-app/gradio/commit/a6b3c6ce4e1d06253860c72740024a9138e3a93a) - Ensure `@gradio/client`'s `submit` iterator releases as expected.  Thanks @pngwn!
- [#8758](https://github.com/gradio-app/gradio/pull/8758) [`26cdd0f`](https://github.com/gradio-app/gradio/commit/26cdd0ffe049ecfe751f3831cbdb4c04c0ecf934) - Revert chatbot styling.  Thanks @pngwn!
- [#8658](https://github.com/gradio-app/gradio/pull/8658) [`0482453`](https://github.com/gradio-app/gradio/commit/0482453fd5815446c8efa21bfbba0b00d6e4113d) - Chatbot LaTeX Crash Fix.  Thanks @dawoodkhan82!
- [#8716](https://github.com/gradio-app/gradio/pull/8716) [`e834d30`](https://github.com/gradio-app/gradio/commit/e834d302e44f7a54565129bf2c11acf4e882a59b) - ensure `@gradio/client` always returns the correct data.  Thanks @pngwn!
- [#8737](https://github.com/gradio-app/gradio/pull/8737) [`31a876d`](https://github.com/gradio-app/gradio/commit/31a876d0274d7b74a90d30148f3e9c098f486242) - Fix `Share to community` button for images.  Thanks @hannahblair!
- [#8719](https://github.com/gradio-app/gradio/pull/8719) [`d15ada9`](https://github.com/gradio-app/gradio/commit/d15ada9a1c270dd86e1751b1846510a70dc48510) - Fix multimodal textbox custom components.  Thanks @freddyaboulton!
- [#8714](https://github.com/gradio-app/gradio/pull/8714) [`1b5b5b0`](https://github.com/gradio-app/gradio/commit/1b5b5b0b43e69ee84f3baad2aae59ffc9c4d995a) - Bind `fetch` and `stream` in JS client.  Thanks @hannahblair!
- [#8677](https://github.com/gradio-app/gradio/pull/8677) [`c946c6f`](https://github.com/gradio-app/gradio/commit/c946c6f31a34bfd888a6a16c3fb479fe34710206) - Allow supplying custom `gr.Chatbot` with events to `gr.ChatInterface`.  Thanks @abidlabs!
- [#8748](https://github.com/gradio-app/gradio/pull/8748) [`a9307c6`](https://github.com/gradio-app/gradio/commit/a9307c64525c5b323e56ea6f7475faa7c3dad4a4) - Chatbot generating scroll and click fix.  Thanks @freddyaboulton!
- [#8720](https://github.com/gradio-app/gradio/pull/8720) [`936c713`](https://github.com/gradio-app/gradio/commit/936c7137a99ef59efdf75bae5dd27eea2ac1f577) - Documents auth in the guides, in the view API page, and also types the Blocks.config object.  Thanks @abidlabs!

## 4.37.2

### Features

- [#8632](https://github.com/gradio-app/gradio/pull/8632) [`ea6482c`](https://github.com/gradio-app/gradio/commit/ea6482cc89a883075a9008d1758e97f5ea73a9ec) - remove `chatbot_multimodal` demo from `gr.Chatbot` documentation page.  Thanks @abidlabs!
- [#8649](https://github.com/gradio-app/gradio/pull/8649) [`4b6c8b1`](https://github.com/gradio-app/gradio/commit/4b6c8b1c004cee67345a7f103ba2dc8e90b82e6c) - ensure `File` objects are handled in JS client `handle_file`.  Thanks @hannahblair!
- [#8604](https://github.com/gradio-app/gradio/pull/8604) [`b6fa6b5`](https://github.com/gradio-app/gradio/commit/b6fa6b543f226540247cd50748019cde59b93005) - Add docs for `.on()`, `.then()`, and `.success()`, as well as the subclasses of `gr.EventData`.  Thanks @abidlabs!

### Fixes

- [#8655](https://github.com/gradio-app/gradio/pull/8655) [`3896398`](https://github.com/gradio-app/gradio/commit/38963984800d58bfad81bc928f2d631cb4bac773) - Ensure copy button on chatbot shows when appropriate.  Thanks @pngwn!
- [#8645](https://github.com/gradio-app/gradio/pull/8645) [`9933e53`](https://github.com/gradio-app/gradio/commit/9933e538c9544c386851d90adacd148763ccc878) - Update file_explorer.py for str type `height`.  Thanks @magical-l!
- [#8608](https://github.com/gradio-app/gradio/pull/8608) [`c12f82a`](https://github.com/gradio-app/gradio/commit/c12f82a36dc75ff30918dc2ce5f24e583b676f22) - Bugfix: Add a `file_count` parameter to `gr.MultimodalTextbox`. Multiple files cab be uploaded by setting `file_count="multiple"`. Default is `"single"` to preserve the previous behavior.  Thanks @freddyaboulton!
- [#8631](https://github.com/gradio-app/gradio/pull/8631) [`9b8840a`](https://github.com/gradio-app/gradio/commit/9b8840ab5f712a6634b77df014083071fa253ba0) - Ensure chatbot messages are visible to screenreaders.  Thanks @hannahblair!
- [#8637](https://github.com/gradio-app/gradio/pull/8637) [`c348392`](https://github.com/gradio-app/gradio/commit/c34839293f7ebad91d71caced84eea4a3790a558) - Multimodal textbox buttons alignment.  Thanks @dawoodkhan82!

## 4.37.1

### Fixes

- [#8610](https://github.com/gradio-app/gradio/pull/8610) [`9204d86`](https://github.com/gradio-app/gradio/commit/9204d86ed48b4a45ed5de5ea628b756d092ce910) - Add guide on cleaning up state and file resources.  Thanks @freddyaboulton!

## 4.37.0

### Features

- [#8131](https://github.com/gradio-app/gradio/pull/8131) [`bb504b4`](https://github.com/gradio-app/gradio/commit/bb504b494947a287d6386e0e7ead3860c0f15223) - Gradio components in `gr.Chatbot()`.  Thanks @dawoodkhan82!
- [#8489](https://github.com/gradio-app/gradio/pull/8489) [`c2a0d05`](https://github.com/gradio-app/gradio/commit/c2a0d056d679d90631d9ccd944dadd67e7e03b7f) - Control Display of Error, Info, Warning.  Thanks @freddyaboulton!
- [#8571](https://github.com/gradio-app/gradio/pull/8571) [`a77877f`](https://github.com/gradio-app/gradio/commit/a77877f62df7c610fcfac7b3b00e186a087c8ec6) - First time loading performance optimization.  Thanks @baojianting!
- [#8607](https://github.com/gradio-app/gradio/pull/8607) [`c7cd0a0`](https://github.com/gradio-app/gradio/commit/c7cd0a0e9aefe0e5ee5584df676f3cc69a403059) - Ensure chatbot background is consistent with other components.  Thanks @pngwn!
- [#8555](https://github.com/gradio-app/gradio/pull/8555) [`7fc7455`](https://github.com/gradio-app/gradio/commit/7fc7455553c04c52c8e25d520f3d67f1b5609637) - support html in chatbot.  Thanks @pngwn!
- [#8590](https://github.com/gradio-app/gradio/pull/8590) [`65afffd`](https://github.com/gradio-app/gradio/commit/65afffd34b79ba9117e8d9506ea82477204cb57d) - Fix multimodal chat look.  Thanks @aliabid94!
- [#8603](https://github.com/gradio-app/gradio/pull/8603) [`affce4c`](https://github.com/gradio-app/gradio/commit/affce4cbd9e2df14175c79da27408ccce57a74e9) - Fix resizer on altair.  Thanks @aliabid94!
- [#8580](https://github.com/gradio-app/gradio/pull/8580) [`797621b`](https://github.com/gradio-app/gradio/commit/797621b81a0ab9b794e6872f8d43bf6d19a68b78) - Improved plot rendering to thematically match.  Thanks @aliabid94!/n  highlight:Expect visual changes in gr.Plot, gr.BarPlot, gr.LinePlot, gr.ScatterPlot, including changes to color and width sizing.
- [#8520](https://github.com/gradio-app/gradio/pull/8520) [`595ecf3`](https://github.com/gradio-app/gradio/commit/595ecf35da6cd5f9aa7d9135282d005b63fbdef1) - Add build target option to the custom component `gradio.config.js` file.  Thanks @pngwn!
- [#8593](https://github.com/gradio-app/gradio/pull/8593) [`d35c290`](https://github.com/gradio-app/gradio/commit/d35c290aadcb85113ee7ceea96a7ed7dc894b1d2) - Adding more docs for using components in chatbot.  Thanks @abidlabs!
- [#8609](https://github.com/gradio-app/gradio/pull/8609) [`36b2af9`](https://github.com/gradio-app/gradio/commit/36b2af9a31e43e92f61f39636b7c32001c34734d) - Changed gradio version check from print statement to warning.  Thanks @gdevakumar!
- [#8600](https://github.com/gradio-app/gradio/pull/8600) [`7289c4b`](https://github.com/gradio-app/gradio/commit/7289c4b036d8a78c48f8c9e66ba998e6730e80d2) - Add credentials: include and Cookie header to prevent 401 error.  Thanks @yinkiu602!
- [#8488](https://github.com/gradio-app/gradio/pull/8488) [`b03da67`](https://github.com/gradio-app/gradio/commit/b03da67d8f17c36e78b47bfad78e30c94d577828) - Minor changes to monitoring.  Thanks @freddyaboulton!
- [#8569](https://github.com/gradio-app/gradio/pull/8569) [`6f99a02`](https://github.com/gradio-app/gradio/commit/6f99a028ed0071e3f588076c059d19f3ff5d85f8) - Upgrade pyodide 0.26.  Thanks @whitphx!
- [#8565](https://github.com/gradio-app/gradio/pull/8565) [`fd5aab1`](https://github.com/gradio-app/gradio/commit/fd5aab10be53a4215b5eeca03cd1c99c5a30c21d) - Remove duplicated code in `routes.py`.  Thanks @sadra-barikbin!
- [#8529](https://github.com/gradio-app/gradio/pull/8529) [`d43d696`](https://github.com/gradio-app/gradio/commit/d43d69648669da98a4fdf741071501e531b68d86) - feat: exception handling about file_count params of File component.  Thanks @young-hun-jo!
- [#8528](https://github.com/gradio-app/gradio/pull/8528) [`2b0c157`](https://github.com/gradio-app/gradio/commit/2b0c1577b27fcf30920196f815ec7be604893b19) - Added an optional `height` and overflow scrollbar for the Markdown Component.  Thanks @ShruAgarwal!
- [#8516](https://github.com/gradio-app/gradio/pull/8516) [`de6aa2b`](https://github.com/gradio-app/gradio/commit/de6aa2b67668605b65ad92842b2c798afa2c6d8a) - Add helper classes to docs.  Thanks @aliabd!
- [#8522](https://github.com/gradio-app/gradio/pull/8522) [`bdaa678`](https://github.com/gradio-app/gradio/commit/bdaa678d0c0a22250b41104f32e9121f98dc7437) - add handle_file docs.  Thanks @pngwn!

### Fixes

- [#8599](https://github.com/gradio-app/gradio/pull/8599) [`ca125b7`](https://github.com/gradio-app/gradio/commit/ca125b728a0803a5b5ed71a5189e6b68175edcad) - Fix reload mode for jupyter notebook and stateful demos.  Thanks @freddyaboulton!
- [#8521](https://github.com/gradio-app/gradio/pull/8521) [`900cf25`](https://github.com/gradio-app/gradio/commit/900cf25256a5b0563860097d69aac28b6afbfd8b) - Ensure frontend functions work when they don't return a value.  Thanks @pngwn!
- [#8594](https://github.com/gradio-app/gradio/pull/8594) [`530f8a0`](https://github.com/gradio-app/gradio/commit/530f8a0b056b35dabe9bdd148e1ab7c4577f017d) - chatbot component tweaks.  Thanks @pngwn!
- [#8530](https://github.com/gradio-app/gradio/pull/8530) [`d429690`](https://github.com/gradio-app/gradio/commit/d429690611eacd7b19cf4609332b0c12c93a1591) - Fix request serialization for fastapi `/docs`.  Thanks @zhzLuke96!
- [#8589](https://github.com/gradio-app/gradio/pull/8589) [`34430b9`](https://github.com/gradio-app/gradio/commit/34430b934dbab3bc525f56b390dbc054f76cf56c) - Handle GIFs correct in `gr.Image` preprocessing.  Thanks @abidlabs!
- [#8506](https://github.com/gradio-app/gradio/pull/8506) [`7c5fec3`](https://github.com/gradio-app/gradio/commit/7c5fec3a2606b7a40f4cdc60f2553ba55fc8df99) - Use root url for monitoring url.  Thanks @abidlabs!
- [#8524](https://github.com/gradio-app/gradio/pull/8524) [`546d14e`](https://github.com/gradio-app/gradio/commit/546d14e4f2773f91be7afc37355327044e7cb6e6) - add test + demo.  Thanks @pngwn!
- [#8588](https://github.com/gradio-app/gradio/pull/8588) [`1e61644`](https://github.com/gradio-app/gradio/commit/1e6164462431111e8c4c698cc2c57ab0d0076ba2) - move `deploy_space_action.yaml` to correct location.  Thanks @abidlabs!
- [#8543](https://github.com/gradio-app/gradio/pull/8543) [`a4433be`](https://github.com/gradio-app/gradio/commit/a4433be25c183080d397413dc8c4330cd8c2b562) - Ability to disable orange progress animation for generators by setting `show_progress='minimal'` or `show_progress='hidden'` in the event definition. This is a small visual breaking change but it aligns better with the expected behavior of the `show_progress` parameter. Also added `show_progress` to `gr.Interface` and `gr.ChatInterface`.  Thanks @freddyaboulton!
- [#8579](https://github.com/gradio-app/gradio/pull/8579) [`bc5fccf`](https://github.com/gradio-app/gradio/commit/bc5fccfeee4ff6941c927c982cfbabed7b90213c) - Allow `gr.load` to work inside `gr.Blocks` automatically.  Thanks @abidlabs!
- [#8573](https://github.com/gradio-app/gradio/pull/8573) [`56af40f`](https://github.com/gradio-app/gradio/commit/56af40f5e3bc4ea98bcfe6838f7ffcda1f47b63f) - Fixes the `favicon_path` working error.  Thanks @ShruAgarwal!
- [#8548](https://github.com/gradio-app/gradio/pull/8548) [`7fc0f51`](https://github.com/gradio-app/gradio/commit/7fc0f5149bb8d31f3d01b4151b478070499751ee) - Fix reload mode by implementing `close` on the client.  Thanks @freddyaboulton!
- [#8531](https://github.com/gradio-app/gradio/pull/8531) [`88de38e`](https://github.com/gradio-app/gradio/commit/88de38e2597bc39532be77b917f1f02b1a11647d) - Fix custom components on windows.  Thanks @freddyaboulton!
- [#8581](https://github.com/gradio-app/gradio/pull/8581) [`a1c21cb`](https://github.com/gradio-app/gradio/commit/a1c21cb69a688bd38139153fe9c85a50c6ae86f2) - fix dataset update.  Thanks @abidlabs!
- [#8537](https://github.com/gradio-app/gradio/pull/8537) [`81ae766`](https://github.com/gradio-app/gradio/commit/81ae7663b303ac7738bc216d9bf916f0515dd22e) - Many small fixes to website and docs.  Thanks @aliabd!

## 4.36.1

### Features

- [#8491](https://github.com/gradio-app/gradio/pull/8491) [`ffd53fa`](https://github.com/gradio-app/gradio/commit/ffd53fa2dcb13d564fd07aa441d4016df8d2f155) - Remove broken guide redirect.  Thanks @aliabd!
- [#8499](https://github.com/gradio-app/gradio/pull/8499) [`c5f6e77`](https://github.com/gradio-app/gradio/commit/c5f6e7722a197d4706419ade14276ddecf3196f8) - Cache break themes on change.  Thanks @aliabid94!

### Fixes

- [#8504](https://github.com/gradio-app/gradio/pull/8504) [`2a59bab`](https://github.com/gradio-app/gradio/commit/2a59bab3bb537373e2823b2416e42b7a8370d7ec) - Fixes TabbedInterface bug where only first interface events get triggered.  Thanks @freddyaboulton!

## 4.36.0

### Features

- [#8478](https://github.com/gradio-app/gradio/pull/8478) [`73e1108`](https://github.com/gradio-app/gradio/commit/73e11087a0d212c568c361e84e50fcb59d4a37b0) - Adds a monitoring dashboard to Gradio apps that can be used to view usage.  Thanks @aliabid94!

## 4.35.0

### Features

- [#8481](https://github.com/gradio-app/gradio/pull/8481) [`41a4493`](https://github.com/gradio-app/gradio/commit/41a449383a34b7d6e4c83cfbf61c222fd5501206) - fix client flaky tests.  Thanks @abidlabs!
- [#8483](https://github.com/gradio-app/gradio/pull/8483) [`e2271e2`](https://github.com/gradio-app/gradio/commit/e2271e207d98074bf39b02ae3c5443b2f097627d) - documentation for @gradio/client.  Thanks @pngwn!
- [#8485](https://github.com/gradio-app/gradio/pull/8485) [`f8ebace`](https://github.com/gradio-app/gradio/commit/f8ebaceccef60a112603d290d10072ef4e938a6a) - Ensure all status are reported internally when calling `predict`.  Thanks @pngwn!

## 4.34.0

### Features

- [#8370](https://github.com/gradio-app/gradio/pull/8370) [`48eeea4`](https://github.com/gradio-app/gradio/commit/48eeea4eaab7e24168688e3c3fbafb30e4e78d51) - Refactor Cancelling Logic To Use /cancel.  Thanks @freddyaboulton!
- [#8460](https://github.com/gradio-app/gradio/pull/8460) [`8628899`](https://github.com/gradio-app/gradio/commit/86288993d9589ceb7bcc3e4d10f0adb6419d4ac5) - Support Bash in Api Recorder.  Thanks @aliabd!
- [#8417](https://github.com/gradio-app/gradio/pull/8417) [`96d8de2`](https://github.com/gradio-app/gradio/commit/96d8de231270321da5f310768643363276df3204) - add delete event to `File` component.  Thanks @pngwn!
- [#8444](https://github.com/gradio-app/gradio/pull/8444) [`2cd02ff`](https://github.com/gradio-app/gradio/commit/2cd02ff3b7c57cd69635d111ff25643eba30b9b0) - Remove deprecated parameters from Python Client.  Thanks @abidlabs!
- [#8473](https://github.com/gradio-app/gradio/pull/8473) [`8ca93d4`](https://github.com/gradio-app/gradio/commit/8ca93d45dd9f8948cfe87fe16ef5943139e756a7) - Improve design of api recorder.  Thanks @aliabd!
- [#8445](https://github.com/gradio-app/gradio/pull/8445) [`5c8915b`](https://github.com/gradio-app/gradio/commit/5c8915b11308756c3b7279864d240ea85f5a0b4a) - Add cURL to view API Page and add a dedicated Guide.  Thanks @abidlabs!

### Fixes

- [#8477](https://github.com/gradio-app/gradio/pull/8477) [`d5a9604`](https://github.com/gradio-app/gradio/commit/d5a960493017a4890685af61d78ce7d3b3b12e6b) - Fix js client bundle.  Thanks @pngwn!
- [#8451](https://github.com/gradio-app/gradio/pull/8451) [`9d2d605`](https://github.com/gradio-app/gradio/commit/9d2d6051caed5c8749a26a6fa7480a5ae6e6c4f3) - Change client submit API to be an AsyncIterable and support more platforms.  Thanks @pngwn!
- [#8462](https://github.com/gradio-app/gradio/pull/8462) [`6447dfa`](https://github.com/gradio-app/gradio/commit/6447dface4d46db1c69460e8325a1928d0476a46) - Improve file handling in JS Client.  Thanks @hannahblair!
- [#8439](https://github.com/gradio-app/gradio/pull/8439) [`63d36fb`](https://github.com/gradio-app/gradio/commit/63d36fbbf4bf6dc909be9a0ffc7b6bf6621d83e8) - Handle gradio apps using `state` in the JS Client.  Thanks @hannahblair!

## 4.33.0

### Features

- [#8429](https://github.com/gradio-app/gradio/pull/8429) [`d393a4a`](https://github.com/gradio-app/gradio/commit/d393a4a2245675d161f03bb9e7a7a62348748581) - Fix type hints for render and on.  Thanks @freddyaboulton!
- [#8377](https://github.com/gradio-app/gradio/pull/8377) [`341844f`](https://github.com/gradio-app/gradio/commit/341844f04efe0e7e512c7ca443f3f2b195a32fa7) - Click to preview images in chatbot.  Thanks @dawoodkhan82!
- [#8455](https://github.com/gradio-app/gradio/pull/8455) [`a970589`](https://github.com/gradio-app/gradio/commit/a970589cf57c72650f45fbc6a82ad9c52a6e4712) - Fix multimodal textbox placeholder.  Thanks @dawoodkhan82!
- [#8446](https://github.com/gradio-app/gradio/pull/8446) [`4a55157`](https://github.com/gradio-app/gradio/commit/4a55157ed9796b8a69cadae0d87a85203eab2cb3) - state.change listener with deep hash check.  Thanks @aliabid94!

### Fixes

- [#8400](https://github.com/gradio-app/gradio/pull/8400) [`33c8081`](https://github.com/gradio-app/gradio/commit/33c8081aa967ffc6fec68e15946b9bce2e848ee2) - Handle special arguments when extracting parameter names for view API page.  Thanks @abidlabs!
- [#8369](https://github.com/gradio-app/gradio/pull/8369) [`4795c6e`](https://github.com/gradio-app/gradio/commit/4795c6e9e942b5ce489e4451ef84fa75128d89d2) - Fix multimodal textbox styling for certain themes.  Thanks @dawoodkhan82!
- [#8440](https://github.com/gradio-app/gradio/pull/8440) [`83bdf5c`](https://github.com/gradio-app/gradio/commit/83bdf5c4478c0c6138cc639818dd5e403ea712a0) - Add support for `numpy~=2.0`.  Thanks @freddyaboulton!

## 4.32.2

### Fixes

- [#8431](https://github.com/gradio-app/gradio/pull/8431) [`9909b28`](https://github.com/gradio-app/gradio/commit/9909b28364b82b5e8bfd7d47a858a204f68b963a) - fix scrolling on spaces.  Thanks @pngwn!

## 4.32.1

### Features

- [#8415](https://github.com/gradio-app/gradio/pull/8415) [`227de35`](https://github.com/gradio-app/gradio/commit/227de352982b3dcdf9384eaa28b7e9cf09afb6e8) - Fix spaces load error.  Thanks @aliabid94!

## 4.32.0

### Features

- [#8401](https://github.com/gradio-app/gradio/pull/8401) [`d078621`](https://github.com/gradio-app/gradio/commit/d078621928136c09ca902d2f37594ed887c67d2e) - Add CDN installation to JS docs.  Thanks @hannahblair!
- [#8243](https://github.com/gradio-app/gradio/pull/8243) [`55f664f`](https://github.com/gradio-app/gradio/commit/55f664f2979a49acc29a73cde16c6ebdfcc91db2) - Add event listener support to render blocks.  Thanks @aliabid94!
- [#8398](https://github.com/gradio-app/gradio/pull/8398) [`945ac83`](https://github.com/gradio-app/gradio/commit/945ac837e779b120790814ea6f6f81bd2712f5f8) - Improve rendering.  Thanks @aliabid94!
- [#8299](https://github.com/gradio-app/gradio/pull/8299) [`ab65360`](https://github.com/gradio-app/gradio/commit/ab653608045ff9462db7ad9fe63e1c60bf20e773) - Allow JS Client to work with authenticated spaces 🍪.  Thanks @hannahblair!
- [#8386](https://github.com/gradio-app/gradio/pull/8386) [`e738e26`](https://github.com/gradio-app/gradio/commit/e738e26a5d0f31c60cfd24d47c11dc9d4bc2d1a6) - Include instructions on starting from someone else's custom component repository.  Thanks @freddyaboulton!
- [#8363](https://github.com/gradio-app/gradio/pull/8363) [`94a1143`](https://github.com/gradio-app/gradio/commit/94a1143686733c7fe16e204764b9a3e7240ccf02) - Add allow-credentials to preflight header.  Thanks @abidlabs!
- [#8403](https://github.com/gradio-app/gradio/pull/8403) [`5efd35c`](https://github.com/gradio-app/gradio/commit/5efd35c7a06d894fdcb68898bdaaf9b457e608f1) - Editable Docs.  Thanks @aliabd!
- [#8355](https://github.com/gradio-app/gradio/pull/8355) [`33e8bab`](https://github.com/gradio-app/gradio/commit/33e8babb17b2094327860bc1996ab855d6c22d46) - Enable hiding the inline category in HighlightedText with a `show_inline_category` argument.  Thanks @xu-song!
- [#8409](https://github.com/gradio-app/gradio/pull/8409) [`8028c33`](https://github.com/gradio-app/gradio/commit/8028c33bbc5a324a5e9e8b28906443db28683d79) - Render decorator documentation.  Thanks @aliabid94!
- [#8378](https://github.com/gradio-app/gradio/pull/8378) [`3fbf2e8`](https://github.com/gradio-app/gradio/commit/3fbf2e8e7059f3bab64b0839ab7a0f9f864f0a66) - chore: update docs.py.  Thanks @eltociear!

### Fixes

- [#8408](https://github.com/gradio-app/gradio/pull/8408) [`e86dd01`](https://github.com/gradio-app/gradio/commit/e86dd01b6e8f7bab3d3c25b84f2ad33129138af4) - Connect heartbeat if state created in render. Also fix config cleanup bug #8407.  Thanks @freddyaboulton!
- [#8258](https://github.com/gradio-app/gradio/pull/8258) [`1f8e5c4`](https://github.com/gradio-app/gradio/commit/1f8e5c44e054b943052d8f24d044696ddfd01a54) - Improve URL handling in JS Client.  Thanks @hannahblair!
- [#8376](https://github.com/gradio-app/gradio/pull/8376) [`aebd2e9`](https://github.com/gradio-app/gradio/commit/aebd2e952e3a19633b9b95a49f51664bc8a0c20d) - Model3D right-handed coordinate system.  Thanks @dylanebert!
- [#8381](https://github.com/gradio-app/gradio/pull/8381) [`24ab22d`](https://github.com/gradio-app/gradio/commit/24ab22d26179ee3d1e5f4957067ebf8722ef2e6f) - Fix encoding error.  Thanks @xu-song!
- [#8364](https://github.com/gradio-app/gradio/pull/8364) [`6a1b58c`](https://github.com/gradio-app/gradio/commit/6a1b58cf3e4796ccb695db5baae190c894b30df0) - Add `--table-text-color` var to fix body text in `Examples`.  Thanks @hannahblair!
- [#8284](https://github.com/gradio-app/gradio/pull/8284) [`2d705bc`](https://github.com/gradio-app/gradio/commit/2d705bcf7475eb46822358fed21dc081a800a73d) - Add body color to `gr.Accordion`.  Thanks @hannahblair!
- [#8371](https://github.com/gradio-app/gradio/pull/8371) [`a373b0e`](https://github.com/gradio-app/gradio/commit/a373b0edd36613a9a6a25a1a2893edd6533a7291) - Set orig_name in python client file uploads.  Thanks @freddyaboulton!
- [#8385](https://github.com/gradio-app/gradio/pull/8385) [`97ac79b`](https://github.com/gradio-app/gradio/commit/97ac79bf563f8423604a9b0e91eac4df6833f4fc) - Fix bug in reload mode equality check. Better equality conversion for state variables.  Thanks @freddyaboulton!
- [#8372](https://github.com/gradio-app/gradio/pull/8372) [`89d6a17`](https://github.com/gradio-app/gradio/commit/89d6a176b39f713dd8144a1e6df1419303412ed2) - Change z-index of status tracker.  Thanks @hannahblair!

## 4.31.5

### Features

- [#8311](https://github.com/gradio-app/gradio/pull/8311) [`35905c5`](https://github.com/gradio-app/gradio/commit/35905c5c8f7acbe669486ac8f57b6955328e4783) - Cleanup markdown styling.  Thanks @aliabid94!

### Fixes

- [#8339](https://github.com/gradio-app/gradio/pull/8339) [`4dc7fa7`](https://github.com/gradio-app/gradio/commit/4dc7fa7cd7f514224686b891299e46533edffd66) - Fix Chatbot, Dataframe, Markdown custom components.  Thanks @freddyaboulton!
- [#8336](https://github.com/gradio-app/gradio/pull/8336) [`f138b41`](https://github.com/gradio-app/gradio/commit/f138b4159ea364204108de14f7597674fcc9469e) - Use Any if JsonValue cannot be imported.  Thanks @freddyaboulton!
- [#8334](https://github.com/gradio-app/gradio/pull/8334) [`0236b1a`](https://github.com/gradio-app/gradio/commit/0236b1ab12149ddd11b03e1382ceb09d19ac0d48) - fix: prevent triggering gr.File.select on delete.  Thanks @gtm-nayan!
- [#8341](https://github.com/gradio-app/gradio/pull/8341) [`82ba397`](https://github.com/gradio-app/gradio/commit/82ba3975921760c727875948fb7275c2f5f9ea2b) - add missing orig_name (follow up to #8334).  Thanks @gtm-nayan!
- [#8322](https://github.com/gradio-app/gradio/pull/8322) [`47012a0`](https://github.com/gradio-app/gradio/commit/47012a0c4e3e8a80fcae620aaf08b16ceb343cde) - ensure the client correctly handles all binary data.  Thanks @Saghen!

## 4.31.4

### Features

- [#8318](https://github.com/gradio-app/gradio/pull/8318) [`9e31697`](https://github.com/gradio-app/gradio/commit/9e31697d9435ea926a194262d9e845624df0e74e) - Added image-to-image diffusers pipeline.  Thanks @cswamy!

### Fixes

- [#8247](https://github.com/gradio-app/gradio/pull/8247) [`8f46556`](https://github.com/gradio-app/gradio/commit/8f46556b38e35cffbadac74ff80445dceea3bcf5) - Fix api recorder.  Thanks @abidlabs!

## 4.31.3

### Features

- [#8229](https://github.com/gradio-app/gradio/pull/8229) [`7c81897`](https://github.com/gradio-app/gradio/commit/7c81897076ddcd0bb05e0e4ffec35bb9a986d330) - chore(deps): update dependency esbuild to ^0.21.0.  Thanks @renovate!
- [#8279](https://github.com/gradio-app/gradio/pull/8279) [`4350215`](https://github.com/gradio-app/gradio/commit/4350215348981aba6dea473884b047f096dcdf0f) - Link to troubleshooting guide in the custom component loading status.  Thanks @freddyaboulton!

### Fixes

- [#8292](https://github.com/gradio-app/gradio/pull/8292) [`ee1e294`](https://github.com/gradio-app/gradio/commit/ee1e2942e0a1ae84a08a05464e41c8108a03fa9c) - Ensure JSON component outputs handled properly in postprocess.  Thanks @freddyaboulton!
- [#8296](https://github.com/gradio-app/gradio/pull/8296) [`929d216`](https://github.com/gradio-app/gradio/commit/929d216d49aa05614bc83f0761cf7b1cd803d8fe) - always create a jwt when connecting to a space if a hf_token is present.  Thanks @pngwn!

## 4.31.2

### Fixes

- [#8285](https://github.com/gradio-app/gradio/pull/8285) [`7d9d8ea`](https://github.com/gradio-app/gradio/commit/7d9d8eab50d36cbecbb84c6a0f3cc1bca7215604) - use the correct query param to pass the jwt to the heartbeat event.  Thanks @pngwn!

## 4.31.1

### Features

- [#8264](https://github.com/gradio-app/gradio/pull/8264) [`a9e1a8a`](https://github.com/gradio-app/gradio/commit/a9e1a8ac5633c5336fea1c63d7f66a9883e7e6e1) - Make exceptions in the Client more specific.  Thanks @abidlabs!
- [#8263](https://github.com/gradio-app/gradio/pull/8263) [`de52f0e`](https://github.com/gradio-app/gradio/commit/de52f0e5af75688713e4e96a195208576a4d64ad) - Reduce the analytics that are collected in Gradio.  Thanks @abidlabs!

### Fixes

- [#8276](https://github.com/gradio-app/gradio/pull/8276) [`0bf3d1a`](https://github.com/gradio-app/gradio/commit/0bf3d1a992db2753c1a55452b569027190f26ef6) - Fix bug where client could not connect to apps that had self signed certificates.  Thanks @freddyaboulton!
- [#8260](https://github.com/gradio-app/gradio/pull/8260) [`7e976fd`](https://github.com/gradio-app/gradio/commit/7e976fd9bf5273841915b3722d3eadfcf6c11fc3) - Send ProcessCompleted message when job is cancelled.  Thanks @freddyaboulton!
- [#8261](https://github.com/gradio-app/gradio/pull/8261) [`719d596`](https://github.com/gradio-app/gradio/commit/719d5962bb7018412f073b55eb3b62d8b4e02d63) - Fix bug where status tracker was the target of pointer events.  Thanks @freddyaboulton!
- [#8272](https://github.com/gradio-app/gradio/pull/8272) [`fbf4edd`](https://github.com/gradio-app/gradio/commit/fbf4edde7c896cdf4c903463e44c31ed96111b3c) - ensure client works for private spaces.  Thanks @pngwn!

## 4.31.0

### Features

- [#8226](https://github.com/gradio-app/gradio/pull/8226) [`892181b`](https://github.com/gradio-app/gradio/commit/892181b4fdb13dd6048a620dd985d47bc3c26ed7) - chore(deps): update dependency @types/prismjs to v1.26.4.  Thanks @renovate!
- [#8254](https://github.com/gradio-app/gradio/pull/8254) [`0a6f0a7`](https://github.com/gradio-app/gradio/commit/0a6f0a7e02199cb4094d796aafa39207d718ad22) - Fix custom component detection logic in analytics.  Thanks @freddyaboulton!
- [#8244](https://github.com/gradio-app/gradio/pull/8244) [`52dac63`](https://github.com/gradio-app/gradio/commit/52dac637a379ace892e3652a411392927e46613f) - Adds `examples_per_page` to `gr.ChatInterface` and allows `clear_btn` in `gr.Interface` to be hidden.  Thanks @abidlabs!
- [#8219](https://github.com/gradio-app/gradio/pull/8219) [`32d915a`](https://github.com/gradio-app/gradio/commit/32d915aad5c6d9b2f5fdcafef39e246fc1b2d852) - Apply clean_indent() to the file contents specified with <gradio-file> tags.  Thanks @whitphx!
- [#8110](https://github.com/gradio-app/gradio/pull/8110) [`5436031`](https://github.com/gradio-app/gradio/commit/5436031f92c1596282eb64e1e74d555f279e9697) - Render decorator 2.  Thanks @aliabid94!
- [#8197](https://github.com/gradio-app/gradio/pull/8197) [`e09b4e8`](https://github.com/gradio-app/gradio/commit/e09b4e8216b970bc1b142a0f08e7d190b954eb35) - Add support for passing keyword args to `data` in JS client.  Thanks @hannahblair!
- [#8236](https://github.com/gradio-app/gradio/pull/8236) [`bf909bd`](https://github.com/gradio-app/gradio/commit/bf909bd14532a27e119fb401003a7d94c0618ffb) - Change upload icon for MultimodalTextbox.  Thanks @dawoodkhan82!

### Fixes

- [#8245](https://github.com/gradio-app/gradio/pull/8245) [`c562a3d`](https://github.com/gradio-app/gradio/commit/c562a3d9a440c8f94ca070bd07b8d4121d6ab7b3) - Cancel  server progress from the python client.  Thanks @freddyaboulton!
- [#8242](https://github.com/gradio-app/gradio/pull/8242) [`05fe491`](https://github.com/gradio-app/gradio/commit/05fe4918c0e24677a1ff86fbca4cd6f4d4ef974c) - Allow Spaces with `.success()` to be `gr.load`-ed.  Thanks @abidlabs!
- [#8252](https://github.com/gradio-app/gradio/pull/8252) [`22df61a`](https://github.com/gradio-app/gradio/commit/22df61a26adf8023f6dd49c051979990e8d3879a) - Client node fix.  Thanks @pngwn!
- [#8227](https://github.com/gradio-app/gradio/pull/8227) [`9ece050`](https://github.com/gradio-app/gradio/commit/9ece050a702618d3260f80506f3405a4a6dabbb9) - Fix bug where updating a component's value in reload mode would not be shown in UI.  Thanks @freddyaboulton!

## 4.29.0

### Highlights

#### Support custom components in gr.load ([#8200](https://github.com/gradio-app/gradio/pull/8200) [`72039be`](https://github.com/gradio-app/gradio/commit/72039be93acda856d92ceac7f21f1ec1a054fae2))

It is now possible to load a demo with a custom component with `gr.load`.

The custom component must be installed in your system and imported in your python session.

```python
import gradio as gr
import gradio_pdf

demo = gr.load("freddyaboulton/gradiopdf", src="spaces")

if __name__ == "__main__":
    demo.launch()
```

<img width="1284" alt="image" src="https://github.com/gradio-app/gradio/assets/41651716/9c3e846b-f3f2-4c1c-8cb6-53a6d186aaa0">

 Thanks @freddyaboulton!

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!
- [#8174](https://github.com/gradio-app/gradio/pull/8174) [`a81e369`](https://github.com/gradio-app/gradio/commit/a81e36967c0973012e90ec7cf03b99cf3fea88ec) - Remove hatch installation in js/app/package.json which is no longer needed.  Thanks @whitphx!
- [#8209](https://github.com/gradio-app/gradio/pull/8209) [`b9afe93`](https://github.com/gradio-app/gradio/commit/b9afe93915401df5bd6737c89395c2477acfa585) - Rename `eventSource_Factory` and `fetch_implementation`.  Thanks @hannahblair!
- [#8109](https://github.com/gradio-app/gradio/pull/8109) [`bed2f82`](https://github.com/gradio-app/gradio/commit/bed2f82e2297b50f7b59423a3de05af0b9910724) - Implement JS Client tests.  Thanks @hannahblair!
- [#8106](https://github.com/gradio-app/gradio/pull/8106) [`d0a759f`](https://github.com/gradio-app/gradio/commit/d0a759f3df8b564e2f21421d448b24fecf287306) - Pass Error status in /dev/reload stream.  Thanks @freddyaboulton!
- [#7855](https://github.com/gradio-app/gradio/pull/7855) [`611c927`](https://github.com/gradio-app/gradio/commit/611c9273a301e925b5aad93a19272dccd53c39fa) - Lite wheel optimization.  Thanks @whitphx!
- [#8211](https://github.com/gradio-app/gradio/pull/8211) [`91b5cd6`](https://github.com/gradio-app/gradio/commit/91b5cd6132fb8903c92f70fce0800324836a1fc3) - remove redundant event source logic.  Thanks @hannahblair!
- [#8127](https://github.com/gradio-app/gradio/pull/8127) [`24b2286`](https://github.com/gradio-app/gradio/commit/24b2286a22ed247b86ee299487174c8cea2988fe) - allow the canvas size to be set on the `ImageEditor`.  Thanks @pngwn!
- [#8205](https://github.com/gradio-app/gradio/pull/8205) [`cfc272f`](https://github.com/gradio-app/gradio/commit/cfc272ff7910ffcce64a7cc9d560a020f0f6ac7d) - Set the show_api flag on Lite.  Thanks @whitphx!
- [#8052](https://github.com/gradio-app/gradio/pull/8052) [`1435d1d`](https://github.com/gradio-app/gradio/commit/1435d1d2dcfd1accf742726396f2213a54ae0837) - Extend Interface.from_pipeline() to support Transformers.js.py pipelines on Lite.  Thanks @whitphx!
- [#8189](https://github.com/gradio-app/gradio/pull/8189) [`68dcae5`](https://github.com/gradio-app/gradio/commit/68dcae512c0fb699304446c3b1ae2afaba1a63d2) - Use workspace version for code in _website.  Thanks @aliabd!

### Fixes

- [#8179](https://github.com/gradio-app/gradio/pull/8179) [`6a218b4`](https://github.com/gradio-app/gradio/commit/6a218b4148095aaa0c58d8c20973ba01c8764fc2) - rework upload to be a class method + pass client into each component.  Thanks @pngwn!
- [#8181](https://github.com/gradio-app/gradio/pull/8181) [`cf52ca6`](https://github.com/gradio-app/gradio/commit/cf52ca6a51320ece97f009a177792840b5fbc785) - Ensure connectivity to private HF spaces with SSE protocol.  Thanks @hannahblair!
- [#8169](https://github.com/gradio-app/gradio/pull/8169) [`3a6f1a5`](https://github.com/gradio-app/gradio/commit/3a6f1a50b263e0a733f609a08019fc4d05480e1a) - Only connect to heartbeat if needed.  Thanks @freddyaboulton!
- [#8118](https://github.com/gradio-app/gradio/pull/8118) [`7aca673`](https://github.com/gradio-app/gradio/commit/7aca673b38a087533524b2fd8dd3a03e0e4bacfe) - Add eventsource polyfill for Node.js and browser environments.  Thanks @hannahblair!
- [#8158](https://github.com/gradio-app/gradio/pull/8158) [`5671ff1`](https://github.com/gradio-app/gradio/commit/5671ff129a3ad488b307f71fffe9566bd4f7f52a) - fix: handling SIGINT correctly in reload.py, single entrance of block_thread in blocks.py.  Thanks @Tiger3018!
- [#8180](https://github.com/gradio-app/gradio/pull/8180) [`449d0e6`](https://github.com/gradio-app/gradio/commit/449d0e6e145686b4c6cc2cf80bbcd9acded603dd) - Refactor analytics to not use api.gradio.app.  Thanks @freddyaboulton!
- [#8182](https://github.com/gradio-app/gradio/pull/8182) [`39791eb`](https://github.com/gradio-app/gradio/commit/39791eb186d3a4ce82c8c27979a28311c37a4067) - Convert sse calls in client from async to sync.  Thanks @abidlabs!
- [#8170](https://github.com/gradio-app/gradio/pull/8170) [`08b4e61`](https://github.com/gradio-app/gradio/commit/08b4e6172340952460ae4947ff45c4bbef9ec285) - Add ETag to `/custom_component` route to control browser caching.  Thanks @freddyaboulton!
- [#8194](https://github.com/gradio-app/gradio/pull/8194) [`2471f79`](https://github.com/gradio-app/gradio/commit/2471f79527ebae0838eabedd2a4adab6c7667608) - run python reload only if python file changed.  Thanks @jameszhou02!
- [#8204](https://github.com/gradio-app/gradio/pull/8204) [`376dfaa`](https://github.com/gradio-app/gradio/commit/376dfaaa808866cc114eff3cf1635746c3c50c5d) - Specify the fastapi version on Lite to avoid ujson installation which is not available on Pyodide yet.  Thanks @whitphx!

## 4.28.3

### Fixes

- [#8144](https://github.com/gradio-app/gradio/pull/8144) [`7ba2780`](https://github.com/gradio-app/gradio/commit/7ba2780dc096a21f790695bf9368d2b39a79e2fa) - fix missing dependencies for `@gradio/preview`.  Thanks @pngwn!

## 4.28.2

### Fixes

- [#8142](https://github.com/gradio-app/gradio/pull/8142) [`44eb8ac`](https://github.com/gradio-app/gradio/commit/44eb8ac6c315ffe4f0e3f544b0664c93813b6f68) - ensure @gradio/preview dist files are published.  Thanks @pngwn!

## 4.28.1

### Fixes

- [#8140](https://github.com/gradio-app/gradio/pull/8140) [`0d41b22`](https://github.com/gradio-app/gradio/commit/0d41b221dc69eb543396504a276b84a485c98901) - fix publish build.  Thanks @pngwn!

## 4.28.0

### Highlights

#### Setting File Upload Limits ([#7909](https://github.com/gradio-app/gradio/pull/7909) [`2afca65`](https://github.com/gradio-app/gradio/commit/2afca6541912b37dc84f447c7ad4af21607d7c72))

We have added a `max_file_size` size parameter to `launch()` that limits to size of files uploaded to the server. This limit applies to each individual file. This parameter can be specified as a string or an integer (corresponding to the size in bytes).

The following code snippet sets a max file size of 5 megabytes.

```python
import gradio as gr

demo = gr.Interface(lambda x: x, "image", "image")

demo.launch(max_file_size="5mb")
# or
demo.launch(max_file_size=5 * gr.FileSize.MB)
```

![max_file_size_upload](https://github.com/gradio-app/gradio/assets/41651716/7547330c-a082-4901-a291-3f150a197e45)


#### Error states can now be cleared

When a component encounters an error, the error state shown in the UI can now be cleared by clicking on the `x` icon in the top right of the component. This applies to all types of errors, whether it's raised in the UI or the server.

![error_modal_calculator](https://github.com/gradio-app/gradio/assets/41651716/16cb071c-accd-45a6-9c18-0dea27d4bd98)

 Thanks @freddyaboulton!

### Features

- [#8092](https://github.com/gradio-app/gradio/pull/8092) [`659d3c5`](https://github.com/gradio-app/gradio/commit/659d3c51ae8591b8c90879f17b2b10d1d79cb331) - chore(deps): update dependency iframe-resizer to v4.3.11.  Thanks @renovate!
- [#8067](https://github.com/gradio-app/gradio/pull/8067) [`0fb058e`](https://github.com/gradio-app/gradio/commit/0fb058ec232bfaceb24f1515d16a41fa432a1ee8) - Fix the Lite custom element parser so it doesn't add the .code option when the entrypoint file is already specified.  Thanks @whitphx!
- [#8051](https://github.com/gradio-app/gradio/pull/8051) [`d665f40`](https://github.com/gradio-app/gradio/commit/d665f409704b4938d57bee6476a2d000617643c8) - Fix custom JS function caller to concat the outputs of a dep to the inputs as the arguments.  Thanks @whitphx!
- [#8056](https://github.com/gradio-app/gradio/pull/8056) [`2e469a5`](https://github.com/gradio-app/gradio/commit/2e469a5f99e52a5011a010f46e47dde7bb0c7140) - Using keys to preserve values between reloads.  Thanks @aliabid94!
- [#7646](https://github.com/gradio-app/gradio/pull/7646) [`450b8cc`](https://github.com/gradio-app/gradio/commit/450b8cc898f130f15caa3742f65c17b9f7a8f398) - Refactor JS Client.  Thanks @hannahblair!
- [#8115](https://github.com/gradio-app/gradio/pull/8115) [`595ebf7`](https://github.com/gradio-app/gradio/commit/595ebf74c5e09ad90fca0ca8a9a312f161a981aa) - Cache an error from app.submit() and show it on frontend.  Thanks @whitphx!
- [#8084](https://github.com/gradio-app/gradio/pull/8084) [`1c99570`](https://github.com/gradio-app/gradio/commit/1c99570f3cbf28f020d6e92527754dd4cae3bcdb) - Adjust `View Api` container `z-index`.  Thanks @hannahblair!
- [#8107](https://github.com/gradio-app/gradio/pull/8107) [`cbf2d4e`](https://github.com/gradio-app/gradio/commit/cbf2d4ec51a2e0713c53ff678d0bc70117442ec0) - fix typo from #8105.  Thanks @abidlabs!
- [#8100](https://github.com/gradio-app/gradio/pull/8100) [`cbdfbdf`](https://github.com/gradio-app/gradio/commit/cbdfbdfc973fa67665911fb5d8cb005a025b0e58) - upgrade `ruff` test dependency to `ruff==0.4.1`.  Thanks @abidlabs!
- [#6787](https://github.com/gradio-app/gradio/pull/6787) [`15a7106`](https://github.com/gradio-app/gradio/commit/15a7106a36874310f5ace9cf6e32744069ca1cce) - allow custom component authors to provide custom vite plugins and svelte preprocessors.  Thanks @pngwn!
- [#8080](https://github.com/gradio-app/gradio/pull/8080) [`568eeb2`](https://github.com/gradio-app/gradio/commit/568eeb26a90182519f491df34b1bc75ac67a7313) - Fix `gr.Interface.from_pipeline()` to allow audio uploads and to display classification labels correctly.  Thanks @whitphx!
- [#8040](https://github.com/gradio-app/gradio/pull/8040) [`32cfa61`](https://github.com/gradio-app/gradio/commit/32cfa614d641b2358ea5d679b30497d1dfbee533) - Remove auto-created files from `gradio cc publish` and other tweaks.  Thanks @freddyaboulton!
- [#8117](https://github.com/gradio-app/gradio/pull/8117) [`6864035`](https://github.com/gradio-app/gradio/commit/68640358fe186fe5822a72b7a50d9df5020944eb) - Add session hash to gr request.  Thanks @freddyaboulton!
- [#8061](https://github.com/gradio-app/gradio/pull/8061) [`17e83c9`](https://github.com/gradio-app/gradio/commit/17e83c958ebb35b3e122ca486067d1bd5ce33a22) - Docs Reorg and Intro Page.  Thanks @aliabd!
- [#8065](https://github.com/gradio-app/gradio/pull/8065) [`5bf61cb`](https://github.com/gradio-app/gradio/commit/5bf61cb15b7a1f8af12c87ae710df07099b5e460) - Hide the scroll bar in WaveformControls when it's not necessary.  Thanks @whitphx!
- [#8130](https://github.com/gradio-app/gradio/pull/8130) [`0efd72e`](https://github.com/gradio-app/gradio/commit/0efd72e6085ebf5ec9989b659e0d2369d5a692f6) - Add Analytics for custom components.  Thanks @freddyaboulton!
- [#8087](https://github.com/gradio-app/gradio/pull/8087) [`b50a67d`](https://github.com/gradio-app/gradio/commit/b50a67defe1c1ecc0dac324f6bb7aad4599e1271) - Fix `GRADIO_CACHE_EXAMPLES` environment variable to only take effect if `fn` and `outputs` parameters are provided.  Thanks @abidlabs!
- [#8093](https://github.com/gradio-app/gradio/pull/8093) [`ac30e07`](https://github.com/gradio-app/gradio/commit/ac30e07f9266f84088a0b8677a259a5b64c037c5) - [HF OAuth] Logout user if oauth token has expired.  Thanks @Wauplin!
- [#8063](https://github.com/gradio-app/gradio/pull/8063) [`72f4ca8`](https://github.com/gradio-app/gradio/commit/72f4ca88ab569aae47941b3fb0609e57f2e13a27) - Fix `gr.Label` styling and a11y markup.  Thanks @whitphx!
- [#8105](https://github.com/gradio-app/gradio/pull/8105) [`006fa3c`](https://github.com/gradio-app/gradio/commit/006fa3c6d03f4bcb76e6628cc2052ed18dabb988) - improve the documentation for `js` parameter in `Blocks`, `Interface`, `ChatInterface`.  Thanks @abidlabs!
- [#8054](https://github.com/gradio-app/gradio/pull/8054) [`176a8a4`](https://github.com/gradio-app/gradio/commit/176a8a4d713246383c760d86fcb964298ee68c6b) - Fix Label component's value change detection to avoid infinite loop dispatching the change event.  Thanks @whitphx!
- [#8030](https://github.com/gradio-app/gradio/pull/8030) [`91a7a31`](https://github.com/gradio-app/gradio/commit/91a7a31cd15c6fb7b249d124b874d3e63831d09b) - Store configs per session in the backend.  Thanks @aliabid94!

### Fixes

- [#8077](https://github.com/gradio-app/gradio/pull/8077) [`d7461aa`](https://github.com/gradio-app/gradio/commit/d7461aab51b08bc899048230c0f79cf38a1b5ff2) - Fix an encoding issue in gradio/components/code.py.  Thanks @3210448723!
- [#8075](https://github.com/gradio-app/gradio/pull/8075) [`5d9db89`](https://github.com/gradio-app/gradio/commit/5d9db89aa6a377d7b56b3075a5d6b73f767b319f) - Fix causing Hot Reload (#8070).  Thanks @zolgear!
- [#8041](https://github.com/gradio-app/gradio/pull/8041) [`937c858`](https://github.com/gradio-app/gradio/commit/937c8583714216e926606b251bc9225271bdc5a7) - Use orjson to serialize dict including np.array.  Thanks @whitphx!
- [#8097](https://github.com/gradio-app/gradio/pull/8097) [`487db7b`](https://github.com/gradio-app/gradio/commit/487db7b5d57e1a1350494efdf37c121cbf627780) - Respect `auth_dependency` parameter in `launch()`.  Thanks @abidlabs!
- [#8133](https://github.com/gradio-app/gradio/pull/8133) [`0a42e96`](https://github.com/gradio-app/gradio/commit/0a42e96537ab11b4dc441c5c2780938be7faf464) - Allow users to template the `ImageEditor` when using custom components.  Thanks @pngwn!
- [#8066](https://github.com/gradio-app/gradio/pull/8066) [`624f9b9`](https://github.com/gradio-app/gradio/commit/624f9b9477f74a581a6c14119234f9efdfcda398) - make gradio dev tools a local dependency rather than bundling.  Thanks @pngwn!

## 4.27.0

### Highlights

#### Refreshed `ImageEditor`

The `ImageEditor` component has been refreshed to make it more user-friendly and reliable.

This release contains a host of improvements to the `ImageEditor` component, that will be of particular interest to those building real-time image editing applications or complex image processing pipelines:

- Cleaner and more compact interface.
- New option to hide the layer controls for a more minimal UI.
- Improved stability when updating the sources programmatically.
- Improved support for `input`, `upload`, `change` and `apply` events.
- Support for realtime drawing via the `change` event.
- Many bug fixes!

![output](https://github.com/gradio-app/gradio/assets/12937446/826dde7d-942b-4e1f-9a3e-aa4dc1f74402)

### Features

- [#7998](https://github.com/gradio-app/gradio/pull/7998) [`06bdf0e`](https://github.com/gradio-app/gradio/commit/06bdf0eddf59bf79b6b4d1268fc9290955ef2490) - Restore chatbot formatting.  Thanks @aliabid94!
- [#7986](https://github.com/gradio-app/gradio/pull/7986) [`05f935c`](https://github.com/gradio-app/gradio/commit/05f935c8d8e5bb7133affc50da8443cad0d4986d) - GRADIO_SHARE Environment Variable.  Thanks @cocktailpeanut!
- [#8062](https://github.com/gradio-app/gradio/pull/8062) [`cecd6e4`](https://github.com/gradio-app/gradio/commit/cecd6e4c4accb3ef220284dc54a87510b3503ec9) - Update dependency iframe-resizer to v4.3.10.  Thanks @renovate!
- [#8042](https://github.com/gradio-app/gradio/pull/8042) [`92139f3`](https://github.com/gradio-app/gradio/commit/92139f3d7d6b832b649ff1f6c10c87e6fb522cde) - refresh the `ImageEditor` UI.  Thanks @pngwn!
- [#8000](https://github.com/gradio-app/gradio/pull/8000) [`a0c2848`](https://github.com/gradio-app/gradio/commit/a0c2848ab510623b29e215f543e935e275ca35c6) - Fix internal server error in HF OAuth workflow.  Thanks @Wauplin!
- [#7887](https://github.com/gradio-app/gradio/pull/7887) [`5f0248e`](https://github.com/gradio-app/gradio/commit/5f0248e797af087c7fd0ad35ea7f2bd778a7cc41) - When authenticating with HF OAuth, stay in same tab.  Thanks @Wauplin!
- [#8059](https://github.com/gradio-app/gradio/pull/8059) [`074ce38`](https://github.com/gradio-app/gradio/commit/074ce3805ada6ba829c17da3af5f186d9f5f9865) - ensure the `ImageEditor` works correctly with layers and `change` events.  Thanks @pngwn!
- [#7845](https://github.com/gradio-app/gradio/pull/7845) [`dbb7373`](https://github.com/gradio-app/gradio/commit/dbb7373dde69d4ed2741942b5a1898f8620cec24) - ensure `ImageEditor` events work as expected.  Thanks @pngwn!
- [#7975](https://github.com/gradio-app/gradio/pull/7975) [`c9ddd84`](https://github.com/gradio-app/gradio/commit/c9ddd847d6c57d5efc4e887180d219f2a0b5b98d) - Update the Lite custom element parser.  Thanks @whitphx!
- [#8012](https://github.com/gradio-app/gradio/pull/8012) [`299c87c`](https://github.com/gradio-app/gradio/commit/299c87c47717b42387ac323b4c7f6fcab9097b1c) - Document that show_copy_button in gr.Textbox is not visible when show_label=False.  Thanks @lappemic!

### Fixes

- [#8025](https://github.com/gradio-app/gradio/pull/8025) [`55ef4a5`](https://github.com/gradio-app/gradio/commit/55ef4a52c3d600344d8cf1a667f3f352c52c8e57) - Fixes Chatbot Image Sizing.  Thanks @dawoodkhan82!
- [#8014](https://github.com/gradio-app/gradio/pull/8014) [`e10ec6a`](https://github.com/gradio-app/gradio/commit/e10ec6a6124cecb2454266609b951d4768675e50) - Fix multimode interface double box on file upload.  Thanks @TALLEC-Scott!
- [#8028](https://github.com/gradio-app/gradio/pull/8028) [`6fafce0`](https://github.com/gradio-app/gradio/commit/6fafce06704ab8f2cd5fe6fbdb58b842e144e44d) - ensure maps are correctly shallow cloned when updating state.  Thanks @pngwn!
- [#7974](https://github.com/gradio-app/gradio/pull/7974) [`79e0aa8`](https://github.com/gradio-app/gradio/commit/79e0aa81c94e755faa6e85d76ac5d5a666313e6a) - Fix heartbeat in the js client to be Lite compatible.  Thanks @whitphx!
- [#8002](https://github.com/gradio-app/gradio/pull/8002) [`8903415`](https://github.com/gradio-app/gradio/commit/8903415e49b1526d31ff454b2235ea238e319c2c) - Add show_progress prop to Upload Component to bring back upload progress animation.  Thanks @freddyaboulton!
- [#8046](https://github.com/gradio-app/gradio/pull/8046) [`d6c289b`](https://github.com/gradio-app/gradio/commit/d6c289b34668f0011676737ee8edb4cb62b0620a) - round [x, y, w, h] before cropping to avoid unexpected interpolation on pixel values.  Thanks @ernestchu!
- [#8011](https://github.com/gradio-app/gradio/pull/8011) [`f17d1a0`](https://github.com/gradio-app/gradio/commit/f17d1a0a6fa61869dc78fb12fb153f6b7abaa5f5) - Add an explicit dependency of `urllib3~=2.0` and update `processing_utils.save_url_to_cache` to use `urllib3` for Lite support.  Thanks @whitphx!
- [#7981](https://github.com/gradio-app/gradio/pull/7981) [`c1df2f8`](https://github.com/gradio-app/gradio/commit/c1df2f818ce285a8e7871d43b76c4959beb00956) - Fix example loading for custom components.  Thanks @freddyaboulton!
- [#8026](https://github.com/gradio-app/gradio/pull/8026) [`522daf7`](https://github.com/gradio-app/gradio/commit/522daf787a8427b92ed769ccea3c71a490cbca29) - Patch `async_save_url_to_cache` for Lite.  Thanks @whitphx!
- [#7959](https://github.com/gradio-app/gradio/pull/7959) [`2a5cb97`](https://github.com/gradio-app/gradio/commit/2a5cb978240960fd8b150a1eae6ae8328a5c0c59) - ensure `ImageEditor` always draws at the correct position.  Thanks @hrrbay!
- [#8050](https://github.com/gradio-app/gradio/pull/8050) [`0424c75`](https://github.com/gradio-app/gradio/commit/0424c759d8a790529406229c52f47cb469e78d3e) - Update `typer` to drop `[all]` as it is no longer needed.  Thanks @joennlae!

## 4.26.0

### Features

- [#7811](https://github.com/gradio-app/gradio/pull/7811) [`b43055b`](https://github.com/gradio-app/gradio/commit/b43055b297dfe1aa56fda4cd722d878f7297a1b5) - Lite playground design changes.  Thanks @aliabd!
- [#7850](https://github.com/gradio-app/gradio/pull/7850) [`2bae1cf`](https://github.com/gradio-app/gradio/commit/2bae1cfbd41ed8ae3eea031a64899611a22a1821) - Adds an "API Recorder" to the view API page, some internal methods have been made async.  Thanks @abidlabs!
- [#7936](https://github.com/gradio-app/gradio/pull/7936) [`b165193`](https://github.com/gradio-app/gradio/commit/b165193902985b77a732ed703423ebebeaf0da27) - Restore Markdown formatting for Chatbots, MarkdownCode.  Thanks @aliabid94!
- [#7912](https://github.com/gradio-app/gradio/pull/7912) [`a4782f7`](https://github.com/gradio-app/gradio/commit/a4782f7a09ed69ebfa9953b029bd4ffa1c60220a) - Allow displaying gr.Code examples by their filename if value is a tuple.  Thanks @freddyaboulton!
- [#7938](https://github.com/gradio-app/gradio/pull/7938) [`8250a1a`](https://github.com/gradio-app/gradio/commit/8250a1a0dfb8219943beef500ddf29e0fcc4e38d) - Handle the case of multiple headers when constructing root url.  Thanks @abidlabs!
- [#7932](https://github.com/gradio-app/gradio/pull/7932) [`b78129d`](https://github.com/gradio-app/gradio/commit/b78129d90fc800e6987226114adc2f062dc403ec) - Use asyncio.Event to stop stream in heartbeat route.  Thanks @freddyaboulton!
- [#7961](https://github.com/gradio-app/gradio/pull/7961) [`eae97c2`](https://github.com/gradio-app/gradio/commit/eae97c29ce8bb81670e1ee0533efa02afa38cc23) - Fix task bug in python 3.9.  Thanks @freddyaboulton!
- [#7967](https://github.com/gradio-app/gradio/pull/7967) [`1a7851c`](https://github.com/gradio-app/gradio/commit/1a7851c5125b7dd2bccf9f3f1ead38be5da2c9ad) - Fix handling of single font name in theme.  Thanks @sd109!

### Fixes

- [#7963](https://github.com/gradio-app/gradio/pull/7963) [`1eb4c20`](https://github.com/gradio-app/gradio/commit/1eb4c2012065c678d722477f3555ec45a9e78c14) - ensure kwargs are always in sync across the whole application.  Thanks @pngwn!
- [#7916](https://github.com/gradio-app/gradio/pull/7916) [`7c9a964`](https://github.com/gradio-app/gradio/commit/7c9a964ac6b9c2231c7439758e87b4fac56db99f) - Fix programmatic tab selection.  Thanks @aliabid94!
- [#7754](https://github.com/gradio-app/gradio/pull/7754) [`057d171`](https://github.com/gradio-app/gradio/commit/057d171c717737a522b55b0d66962f9c62dd87c3) - Correctly handle device selection in `Image` and `ImageEditor`.  Thanks @hannahblair!
- [#7756](https://github.com/gradio-app/gradio/pull/7756) [`b729f10`](https://github.com/gradio-app/gradio/commit/b729f10321b571e7de418596d1cf605773b0b8e6) - Bugfix: Fix color and size keys in theme builder app.  Thanks @shubhamofbce!
- [#7918](https://github.com/gradio-app/gradio/pull/7918) [`be46ab1`](https://github.com/gradio-app/gradio/commit/be46ab1213b32a40e4ac1c399499d69eaf6ec0f1) - ensure entire dropdown is clickable.  Thanks @dawoodkhan82!
- [#7966](https://github.com/gradio-app/gradio/pull/7966) [`bad3836`](https://github.com/gradio-app/gradio/commit/bad383645ec659433086b174f1ec5a7e2669d43b) - Adding hint `list[list]` for example parameter.  Thanks @WH-Yoshi!
- [#7817](https://github.com/gradio-app/gradio/pull/7817) [`867ff16`](https://github.com/gradio-app/gradio/commit/867ff16cd47ceb5bbf076503538a262b6fe64638) - Trigger the "clear" event of Image Editor.  Thanks @uebian!
- [#7935](https://github.com/gradio-app/gradio/pull/7935) [`919afff`](https://github.com/gradio-app/gradio/commit/919afffcee87bee25a6905c488484936df92189d) - Adds a Guide on deploying Gradio apps with Docker.  Thanks @abidlabs!
- [#7915](https://github.com/gradio-app/gradio/pull/7915) [`efd9524`](https://github.com/gradio-app/gradio/commit/efd95245081f5657b1d13f34038205fc8791c1f7) - Fix gr.CheckboxGroup change event.  Thanks @freddyaboulton!
- [#7926](https://github.com/gradio-app/gradio/pull/7926) [`9666854`](https://github.com/gradio-app/gradio/commit/966685479078f59430b3bced7e6068eb8157c003) - Fixes streaming event race condition.  Thanks @aliabid94!

## 4.25.0

### Highlights

#### Automatically delete state after user has disconnected from the webpage ([#7829](https://github.com/gradio-app/gradio/pull/7829) [`6a4bf7a`](https://github.com/gradio-app/gradio/commit/6a4bf7abe29059dbdc6a342e0366fdaa2e4120ee))

Gradio now automatically deletes `gr.State` variables stored in the server's RAM when users close their browser tab.
The deletion will happen 60 minutes after the server detected a disconnect from the user's browser.
If the user connects again in that timeframe, their state will not be deleted.

Additionally, Gradio now includes a `Blocks.unload()` event, allowing you to run arbitrary cleanup functions when users disconnect (this does not have a 60 minute delay).
You can think of the `unload` event as the opposite of the `load` event.


```python
with gr.Blocks() as demo:
    gr.Markdown(
"""# State Cleanup Demo
🖼️ Images are saved in a user-specific directory and deleted when the users closes the page via demo.unload.
""")
    with gr.Row():
        with gr.Column(scale=1):
            with gr.Row():
                img = gr.Image(label="Generated Image", height=300, width=300)
            with gr.Row():
                gen = gr.Button(value="Generate")
            with gr.Row():
                history = gr.Gallery(label="Previous Generations", height=500, columns=10)
                state = gr.State(value=[], delete_callback=lambda v: print("STATE DELETED"))

    demo.load(generate_random_img, [state], [img, state, history]) 
    gen.click(generate_random_img, [state], [img, state, history])
    demo.unload(delete_directory)


demo.launch(auth=lambda user,pwd: True,
            auth_message="Enter any username and password to continue")
```

 Thanks @freddyaboulton!

### Features

- [#7863](https://github.com/gradio-app/gradio/pull/7863) [`024b44c`](https://github.com/gradio-app/gradio/commit/024b44c553e73f1d6c00d4c8cf12ae38181a454d) - Add support for lazy caching of examples, as well as add `GRADIO_CACHE_EXAMPLES` env variable.  Thanks @abidlabs!
- [#7892](https://github.com/gradio-app/gradio/pull/7892) [`c7933ff`](https://github.com/gradio-app/gradio/commit/c7933ffedb3e2b952152f7d3ce49de2e2da5cc07) - Suppress printing "Running on local URL:" when quiet is set.  Thanks @dnoliver!
- [#7869](https://github.com/gradio-app/gradio/pull/7869) [`b9dbcf7`](https://github.com/gradio-app/gradio/commit/b9dbcf7aa22fe9a19edbc0c52d46a973d8d57ad4) - Make buttons in `gr.ChatInterface` more mobile-friendly.  Thanks @abidlabs!
- [#7875](https://github.com/gradio-app/gradio/pull/7875) [`e6d051d`](https://github.com/gradio-app/gradio/commit/e6d051dc8a497fdd6b4cfbd57efd4c8015b97a66) - Paste Images into MultimodalTextbox.  Thanks @abidlabs!
- [#7893](https://github.com/gradio-app/gradio/pull/7893) [`f42d3e2`](https://github.com/gradio-app/gradio/commit/f42d3e29c7b8cdedd7aea75cffce81857db28eeb) - Make internal event handlers of gr.Interface and gr.ChatInterface async.  Thanks @freddyaboulton!

### Fixes

- [#7886](https://github.com/gradio-app/gradio/pull/7886) [`ccdab9b`](https://github.com/gradio-app/gradio/commit/ccdab9b7e729c438649075d7d54afc9a91183677) - logout route deleting cookie fix.  Thanks @MichaelPerger!
- [#7888](https://github.com/gradio-app/gradio/pull/7888) [`946487c`](https://github.com/gradio-app/gradio/commit/946487cf8e477cbf8d6fad4e772ff574a21782c3) - Cache view_api info in server and python client.  Thanks @freddyaboulton!
- [#7881](https://github.com/gradio-app/gradio/pull/7881) [`5e66e01`](https://github.com/gradio-app/gradio/commit/5e66e01abc4e2e90bd51f0cb9a41e05157cb0df4) - Fix audio streaming out.  Thanks @aliabid94!
- [#7865](https://github.com/gradio-app/gradio/pull/7865) [`7bbc3b6`](https://github.com/gradio-app/gradio/commit/7bbc3b62bf85af2d2230e5f7539efb7f1f0007a1) - JS functions break entire app if there's no input, fixed.  Thanks @aliabid94!

## 4.24.0

### Features

- [#7849](https://github.com/gradio-app/gradio/pull/7849) [`7af3cd7`](https://github.com/gradio-app/gradio/commit/7af3cd7ccb8cc556fd2b290af0bed1c7ec07d174) - Adds a `placeholder` argument to `gr.Chatbot`.  Thanks @abidlabs!
- [#7835](https://github.com/gradio-app/gradio/pull/7835) [`ee804b2`](https://github.com/gradio-app/gradio/commit/ee804b2d567b4381ef90b1f035d42fe6bb2506bc) - Stop running iterators when js client disconnects.  Thanks @freddyaboulton!
- [#7852](https://github.com/gradio-app/gradio/pull/7852) [`72661e3`](https://github.com/gradio-app/gradio/commit/72661e3391a432ccd77fb3100e69fbdf95093931) - Revert the minify setting in vite.config.js which was mistakingly introduced in #6261.  Thanks @whitphx!
- [#7818](https://github.com/gradio-app/gradio/pull/7818) [`1a7c8d3`](https://github.com/gradio-app/gradio/commit/1a7c8d32239d1e304e9f9063d7e2301c4f081b54) - Stop importing gradio.ipython_ext in Wasm mode.  Thanks @whitphx!
- [#7830](https://github.com/gradio-app/gradio/pull/7830) [`75a2bf7`](https://github.com/gradio-app/gradio/commit/75a2bf745dee3b9e9521dbcf5b74af8bd53ba12f) - Add guide on Client state and and fix default values of components.  Thanks @abidlabs!
- [#7823](https://github.com/gradio-app/gradio/pull/7823) [`e0a8b7f`](https://github.com/gradio-app/gradio/commit/e0a8b7fa2c60591f7fc6861707f65bf85f4ad27f) - Exclude `typer` from the requirements list for Wasm env and fix `gradio.cli` not to be imported.  Thanks @whitphx!
- [#7851](https://github.com/gradio-app/gradio/pull/7851) [`e3b1236`](https://github.com/gradio-app/gradio/commit/e3b12369b71e2e3b6b25225f4414d1a28d9faf7d) - Lazy-import pandas.  Thanks @whitphx!
- [#7840](https://github.com/gradio-app/gradio/pull/7840) [`ecf5c52`](https://github.com/gradio-app/gradio/commit/ecf5c524c23f76119e5b2e17f7a592555fa6557b) - Fix gradio/components/dataframe.py not to import `pandas.io`.  Thanks @whitphx!
- [#7801](https://github.com/gradio-app/gradio/pull/7801) [`05db0c4`](https://github.com/gradio-app/gradio/commit/05db0c4a59b7a2c4f6297b5007946f5c7b8df1b1) - Refactor CORS Middleware to be much faster.  Thanks @abidlabs!
- [#7810](https://github.com/gradio-app/gradio/pull/7810) [`425fd1c`](https://github.com/gradio-app/gradio/commit/425fd1ca9d83daf58fd95f3a1e3d566d06064ac3) - Benchmark fix test.  Thanks @aliabid94!

### Fixes

- [#7795](https://github.com/gradio-app/gradio/pull/7795) [`1c257f5`](https://github.com/gradio-app/gradio/commit/1c257f5ebce06e61cd17fc3c0463757f8bc88930) - Bugfix: `..` in filename throwing error while loading in output.  Thanks @shubhamofbce!
- [#7862](https://github.com/gradio-app/gradio/pull/7862) [`0e125d7`](https://github.com/gradio-app/gradio/commit/0e125d7befe436509af6a41b5c92de0ac6d6057c) - Trigger click event from `gr.DownloadButton` even when no file is present.  Thanks @abidlabs!
- [#7848](https://github.com/gradio-app/gradio/pull/7848) [`8d7b3ca`](https://github.com/gradio-app/gradio/commit/8d7b3caebd8f95b1372f8412cadbb5862766c365) - Multimodal Textbox Loading + other fixes.  Thanks @dawoodkhan82!

## 4.23.0

### Features

- [#7782](https://github.com/gradio-app/gradio/pull/7782) [`2c8cd0a`](https://github.com/gradio-app/gradio/commit/2c8cd0a73d5c113853ff96ee2da57be12774a238) - Lazy-import altair.  Thanks @whitphx!
- [#7800](https://github.com/gradio-app/gradio/pull/7800) [`b0a3ea9`](https://github.com/gradio-app/gradio/commit/b0a3ea951c06d4f3ff2755b567629fe988a3e30d) - Small fix to client.view_api() in the case of default file values.  Thanks @abidlabs!
- [#7684](https://github.com/gradio-app/gradio/pull/7684) [`755157f`](https://github.com/gradio-app/gradio/commit/755157f99c2961f2e5caeaa9b76d248b4225ea8f) - Do not reload code inside gr.NO_RELOAD context.  Thanks @freddyaboulton!
- [#7770](https://github.com/gradio-app/gradio/pull/7770) [`dd3e363`](https://github.com/gradio-app/gradio/commit/dd3e363261ae63823fb1672443ff2d31c63d656f) - Fail CI if lint or typecheck fails.  Thanks @abidlabs!
- [#7796](https://github.com/gradio-app/gradio/pull/7796) [`aad209f`](https://github.com/gradio-app/gradio/commit/aad209f0c0faa0bf3e39d0c8624f972118b32830) - Decrease latency: do not run pre and postprocess in threadpool.  Thanks @freddyaboulton!
- [#7744](https://github.com/gradio-app/gradio/pull/7744) [`d831040`](https://github.com/gradio-app/gradio/commit/d8310400326adbf8d036333f4f1b7df68b7043f6) - Remove Ruff and Uvicorn in Wasm env.  Thanks @whitphx!
- [#7732](https://github.com/gradio-app/gradio/pull/7732) [`2efb05e`](https://github.com/gradio-app/gradio/commit/2efb05ed99a8a3575aab0a6c14a8d8b91f4e9ed7) - Adds support for kwargs and default arguments in the python client, and improves how parameter information is displayed in the "view API" page.  Thanks @abidlabs!
- [#7661](https://github.com/gradio-app/gradio/pull/7661) [`c62a57e`](https://github.com/gradio-app/gradio/commit/c62a57e7f8f2f6dad0110d06e915c48e7f628073) - Convert Docs Demos to Lite.  Thanks @aliabd!
- [#7814](https://github.com/gradio-app/gradio/pull/7814) [`f7df92f`](https://github.com/gradio-app/gradio/commit/f7df92f3f3ff4bb1300ed6d6eb1828615a728acd) - Improve UX of non-interactive slider.  Thanks @Pythongor!
- [#7789](https://github.com/gradio-app/gradio/pull/7789) [`ff6bf3e`](https://github.com/gradio-app/gradio/commit/ff6bf3ec8f418a7222ca80240c75a1735202e5cc) - Remove the aiohttp mock from the Wasm worker as it's removed in https://github.com/gradio-app/gradio/pull/5244.  Thanks @whitphx!

### Fixes

- [#7783](https://github.com/gradio-app/gradio/pull/7783) [`43ae23f`](https://github.com/gradio-app/gradio/commit/43ae23f092927af2defa8104ee476da012a7b4fa) - Fix accidental bug that prevented custom textboxes from being passed to chatinterface.  Thanks @freddyaboulton!
- [#7762](https://github.com/gradio-app/gradio/pull/7762) [`e78bca4`](https://github.com/gradio-app/gradio/commit/e78bca4f3789b5b229f6e5f402a1028c7b3bad33) - Trigger input event for Radio even when radio is output component.  Thanks @freddyaboulton!
- [#7787](https://github.com/gradio-app/gradio/pull/7787) [`781678b`](https://github.com/gradio-app/gradio/commit/781678b3ac0e44ea1401ff55af3e98b474cf36ec) - Fix root url resolution from `x_forwarded_host` headers.  Thanks @abidlabs!
- [#7794](https://github.com/gradio-app/gradio/pull/7794) [`cf98c7e`](https://github.com/gradio-app/gradio/commit/cf98c7ed18c0211b89e8eed81a5fb61c34b705c3) - Adds trigger_mode to gr.on. Use it to set trigger_model="always_last" for live interfaces.  Thanks @freddyaboulton!
- [#7761](https://github.com/gradio-app/gradio/pull/7761) [`ca42748`](https://github.com/gradio-app/gradio/commit/ca42748590536e1d940b44ec7c9b6ea402905707) - Ensure `paginate` updates when samples value changes in `Dataset`.  Thanks @hannahblair!

## 4.22.0

### Features

- [#7743](https://github.com/gradio-app/gradio/pull/7743) [`a2badf1`](https://github.com/gradio-app/gradio/commit/a2badf151e3f4b1b5ac80621ee189870a71893c5) - Migrate to Storybook 8.  Thanks @hannahblair!
- [#7680](https://github.com/gradio-app/gradio/pull/7680) [`853d945`](https://github.com/gradio-app/gradio/commit/853d945e75c93a4b380b57dc6408f91d0f2e648f) - Add format parameter to gr.Image, gr.Gallery, gr.AnnotatedImage, gr.Plot to control format to save image files in.  Thanks @dfl!
- [#7691](https://github.com/gradio-app/gradio/pull/7691) [`84f81fe`](https://github.com/gradio-app/gradio/commit/84f81fec9287b041203a141bbf2852720f7d199c) - Closing stream from the backend.  Thanks @aliabid94!
- [#7420](https://github.com/gradio-app/gradio/pull/7420) [`15da39f`](https://github.com/gradio-app/gradio/commit/15da39fca01d09a30cf47e7e72d7efa5052f61f8) - Multimodal Textbox (Chat Input Component).  Thanks @dawoodkhan82!
- [#7712](https://github.com/gradio-app/gradio/pull/7712) [`aca4892`](https://github.com/gradio-app/gradio/commit/aca4892ea591d089e3121ffd144ad6767e0bad71) - More fixes for `gr.load()` as well as a tweaking the `__str__` and `__repr__` methods of components.  Thanks @abidlabs!
- [#7660](https://github.com/gradio-app/gradio/pull/7660) [`f739bef`](https://github.com/gradio-app/gradio/commit/f739bef6c70a2b012dd896456709eae5ee4de7d5) - Add Playground to Lite Custom Element.  Thanks @aliabd!
- [#7710](https://github.com/gradio-app/gradio/pull/7710) [`0a3870d`](https://github.com/gradio-app/gradio/commit/0a3870d52b5efc64b2d1f9a8c7314a3a8b48b90a) - Call handle_darkmode() even if `window.__gradio_mode__ === "website"` but enforce the light theme.  Thanks @whitphx!
- [#7572](https://github.com/gradio-app/gradio/pull/7572) [`7d3c868`](https://github.com/gradio-app/gradio/commit/7d3c868d0a67fe7cba6df412bd5f34ec8a5d289d) - Detailed error message for wasm_utils.get_registered_app().  Thanks @whitphx!
- [#7734](https://github.com/gradio-app/gradio/pull/7734) [`04857bc`](https://github.com/gradio-app/gradio/commit/04857bc524569fad426604046d5a522c3e87ca56) - Add `allowed_paths`, `blocked_paths`, `show_error`, and `favicon_path` parameters to `gr.mount_gradio_app`.  Thanks @abidlabs!
- [#7667](https://github.com/gradio-app/gradio/pull/7667) [`aba4470`](https://github.com/gradio-app/gradio/commit/aba44707af20b78a7b87f5f7bd3f189d971afc71) - Add `auth`, `auth_message`, and `root_path` parameters to `mount_gradio_app`.  Thanks @abidlabs!

### Fixes

- [#7716](https://github.com/gradio-app/gradio/pull/7716) [`188b86b`](https://github.com/gradio-app/gradio/commit/188b86b76669a411ee70233e16bf181786a5909c) - Add support for object-detection models in `gr.load()`.  Thanks @abidlabs!
- [#7564](https://github.com/gradio-app/gradio/pull/7564) [`5d1e8da`](https://github.com/gradio-app/gradio/commit/5d1e8dae5ac23f605c3b5f41dbe18751dff380a0) - batch UI updates on a per frame basis.  Thanks @pngwn!
- [#7718](https://github.com/gradio-app/gradio/pull/7718) [`6390d0b`](https://github.com/gradio-app/gradio/commit/6390d0bf6c2be0aefa56102dd029f25161bfebc3) - Add support for python client connecting to gradio apps running with self-signed SSL certificates.  Thanks @abidlabs!
- [#7697](https://github.com/gradio-app/gradio/pull/7697) [`a1c24db`](https://github.com/gradio-app/gradio/commit/a1c24dbf2ecace4db8692b7ed434f1ebfc4de75a) - Fix OAuth + fix OAuth documentation + undocument logout button.  Thanks @Wauplin!
- [#7623](https://github.com/gradio-app/gradio/pull/7623) [`c9aba8d`](https://github.com/gradio-app/gradio/commit/c9aba8d8a5886ef6456479154a14c69188c20413) - Fixes: gr.Markdown is not updated properly when it has an image tag.  Thanks @dawoodkhan82!
- [#7704](https://github.com/gradio-app/gradio/pull/7704) [`95c6bc8`](https://github.com/gradio-app/gradio/commit/95c6bc897be14e28a568242ea31516bfe2df13e8) - Fix flagged files and ensure that flagging_mode="auto" saves output components as well.  Thanks @abidlabs!
- [#7706](https://github.com/gradio-app/gradio/pull/7706) [`bc61ff6`](https://github.com/gradio-app/gradio/commit/bc61ff6b1603eedf3111f1b5c3d2751629902d98) - Several fixes to `gr.load`.  Thanks @abidlabs!
- [#7733](https://github.com/gradio-app/gradio/pull/7733) [`7f9b291`](https://github.com/gradio-app/gradio/commit/7f9b291922751f92e6296aa6b138124c546ba497) - Cast button value as string in postprocess.  Thanks @heaversm!
- [#7691](https://github.com/gradio-app/gradio/pull/7691) [`84f81fe`](https://github.com/gradio-app/gradio/commit/84f81fec9287b041203a141bbf2852720f7d199c) - Fix race condition between state updates and loading_status updates.  Thanks @aliabid94!
- [#7709](https://github.com/gradio-app/gradio/pull/7709) [`f67759d`](https://github.com/gradio-app/gradio/commit/f67759dcee665cfd7c44f102f36ab23128ee2c2c) - Fix wasm_proxied_mount_css to not reuse an existing style element.  Thanks @whitphx!
- [#7703](https://github.com/gradio-app/gradio/pull/7703) [`598ad7b`](https://github.com/gradio-app/gradio/commit/598ad7baf722181a25200e9a8ba858bae39c7d82) - fix dev mode.  Thanks @pngwn!
- [#7707](https://github.com/gradio-app/gradio/pull/7707) [`28342a2`](https://github.com/gradio-app/gradio/commit/28342a204001c98b86628635582fcf54aa0855aa) - Fix httpx timeout issues.  Thanks @freddyaboulton!

## 4.21.0

### Features

- [#7577](https://github.com/gradio-app/gradio/pull/7577) [`7c66a29`](https://github.com/gradio-app/gradio/commit/7c66a29dea0e4e56106d95d93972225b886a9df3) - Fix the Lite custom element to initialize the app in the connected callback and dispose the app in the disconnected callback.  Thanks @whitphx!
- [#7620](https://github.com/gradio-app/gradio/pull/7620) [`1a4b089`](https://github.com/gradio-app/gradio/commit/1a4b089e78d1efff47b4606daebde02e9b246ed4) - Refactor `example_inputs()`, separating its logic into two separate methods: `example_payload()` and `example_value()`.  Thanks @abidlabs!
- [#7265](https://github.com/gradio-app/gradio/pull/7265) [`6ebf0ce`](https://github.com/gradio-app/gradio/commit/6ebf0cedf5b357a14a8f5a0a9add849924f59ab0) - Add support for diffuser pipelines in gr.Interface.from_pipeline().  Thanks @shubhamofbce!
- [#7650](https://github.com/gradio-app/gradio/pull/7650) [`048364c`](https://github.com/gradio-app/gradio/commit/048364c6b0ffe790086c5e2fee5fab1c63c167a0) - downgrade contourpy.  Thanks @abidlabs!
- [#7571](https://github.com/gradio-app/gradio/pull/7571) [`2edba13`](https://github.com/gradio-app/gradio/commit/2edba133e2a3b58b953ac0894d486faf2819beeb) - Fix `CrossOriginWorkerMaker` to cache the blob URL.  Thanks @whitphx!

### Fixes

- [#7643](https://github.com/gradio-app/gradio/pull/7643) [`9482c7a`](https://github.com/gradio-app/gradio/commit/9482c7a3d2d7b6abd81b786100ddc385133095a5) - fix: redundant meta tags that are unwanted.  Thanks @qkdxorjs1002!
- [#7628](https://github.com/gradio-app/gradio/pull/7628) [`ba8cc48`](https://github.com/gradio-app/gradio/commit/ba8cc48b136e701717c0c5d15ce410b4f8bf6a21) - feature detect CSSStylesheet.  Thanks @pngwn!
- [#7575](https://github.com/gradio-app/gradio/pull/7575) [`d0688b3`](https://github.com/gradio-app/gradio/commit/d0688b3c25feabb4fc7dfa0ab86086b3af7eb337) - Files should now be supplied as `file(...)` in the Client, and some fixes to `gr.load()` as well.  Thanks @abidlabs!
- [#7624](https://github.com/gradio-app/gradio/pull/7624) [`a22f3e0`](https://github.com/gradio-app/gradio/commit/a22f3e062d8d30f630e0cf8e373ad7cb0f99330f) - Fixing root path issue with subpath being repeated twice.  Thanks @abidlabs!
- [#7638](https://github.com/gradio-app/gradio/pull/7638) [`b3b0ea3`](https://github.com/gradio-app/gradio/commit/b3b0ea3e111ef8a3cdd82ecc310a4accc6af6120) - Add --python-path, --pip-path, --gradio-path CLI arguments to let custom component developers control which executable is used.  Thanks @freddyaboulton!
- [#7618](https://github.com/gradio-app/gradio/pull/7618) [`0ae1e44`](https://github.com/gradio-app/gradio/commit/0ae1e4486c06e06bb7a4bad45d58d14f1f8d1b94) - Control which files get moved to cache with gr.set_static_paths.  Thanks @freddyaboulton!
- [#7641](https://github.com/gradio-app/gradio/pull/7641) [`cb3999e`](https://github.com/gradio-app/gradio/commit/cb3999eec707609d5371ef3bad1152f55ed35b2f) - Use `x-forwarded-host` header to determine the root url, and let users provide a full `root_path` to override the automatically determined root url.  Thanks @abidlabs!

## 4.20.1

### Features

- [#7625](https://github.com/gradio-app/gradio/pull/7625) [`8181695`](https://github.com/gradio-app/gradio/commit/8181695e70187e8bc2bf7518697098c8d1b9843d) - image upload fix.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 4.20.0

### Features

- [#7557](https://github.com/gradio-app/gradio/pull/7557) [`4d5789e`](https://github.com/gradio-app/gradio/commit/4d5789e905b5915f3d03fae2ac1d38a54c3e67ea) - Allow mounted Gradio apps to work with external / arbitrary authentication providers.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7614](https://github.com/gradio-app/gradio/pull/7614) [`355ed66`](https://github.com/gradio-app/gradio/commit/355ed666d9f6da018e8a03cdc6e367d00e6b10fb) - Fix the `root_url` logic for streaming files.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7119](https://github.com/gradio-app/gradio/pull/7119) [`9c6de6d`](https://github.com/gradio-app/gradio/commit/9c6de6d85092c1c9378d7f81e5ec734221536812) - Upgrade Pyodide to 0.25.0.  Thanks [@whitphx](https://github.com/whitphx)!
- [#7447](https://github.com/gradio-app/gradio/pull/7447) [`a57e34e`](https://github.com/gradio-app/gradio/commit/a57e34ef87d24f40f09380b7b71a052f120a19fe) - Add delete_cache parameter to gr.Blocks to delete files created by app on shutdown.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7547](https://github.com/gradio-app/gradio/pull/7547) [`98aa808`](https://github.com/gradio-app/gradio/commit/98aa8082dd228dd481e05c888adb2e91b04f8f48) - Add `/logout` functionality for Gradio auth.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7407](https://github.com/gradio-app/gradio/pull/7407) [`375bfd2`](https://github.com/gradio-app/gradio/commit/375bfd28d2def576b4e1c12e0a60127b7419e826) - Fix server_messages.py to use the patched BaseModel class for Wasm env.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7516](https://github.com/gradio-app/gradio/pull/7516) [`3645da5`](https://github.com/gradio-app/gradio/commit/3645da5f1e5539668cad75071a82fdd78f50263c) - Fix incorrect relative mouse coordinates for `Gallery` preview overlay.  Thanks [@MMP0](https://github.com/MMP0)!
- [#7528](https://github.com/gradio-app/gradio/pull/7528) [`eda33b3`](https://github.com/gradio-app/gradio/commit/eda33b3763897a542acf298e523fa493dc655aee) - Refactors `get_fetchable_url_or_file()` to remove it from the frontend.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7340](https://github.com/gradio-app/gradio/pull/7340) [`4b0d589`](https://github.com/gradio-app/gradio/commit/4b0d58933057432758a54169a360eb352903d6b4) - chore(deps): update all non-major dependencies.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#7345](https://github.com/gradio-app/gradio/pull/7345) [`561579d`](https://github.com/gradio-app/gradio/commit/561579d9b7b860c5cb3f8131e0dced0c8114463f) - fix-tests.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7518](https://github.com/gradio-app/gradio/pull/7518) [`bd2c695`](https://github.com/gradio-app/gradio/commit/bd2c69532801f9a0626cd1192de158bde6068b9a) - Adds a `gr.DownloadButton` component.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7598](https://github.com/gradio-app/gradio/pull/7598) [`d3384cb`](https://github.com/gradio-app/gradio/commit/d3384cb926ca9bab7ccbf910547ec8a0c361531f) - Prevent additional paths that can trigger credential leakage on Windows.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7544](https://github.com/gradio-app/gradio/pull/7544) [`f84720c`](https://github.com/gradio-app/gradio/commit/f84720cd76e5bf3321f06383642bdb246a9a36e2) - Prevent paths beginning with `//` or `\\`.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#7565](https://github.com/gradio-app/gradio/pull/7565) [`1c22123`](https://github.com/gradio-app/gradio/commit/1c22123268da5f7fcf6e7c74ee0bf6b225c7aa11) - Fixes method to resolve the `root` URLs.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7559](https://github.com/gradio-app/gradio/pull/7559) [`26356a6`](https://github.com/gradio-app/gradio/commit/26356a623c4196f48ca236d973a597831743cdb8) - Fixes: Invalid file_type breaks drag and drop.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#7555](https://github.com/gradio-app/gradio/pull/7555) [`fc4c2db`](https://github.com/gradio-app/gradio/commit/fc4c2dbd994c49e37296978da1cb85e424080d1c) - Allow Python Client to upload/download files when connecting to Gradio apps with auth enabled.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7510](https://github.com/gradio-app/gradio/pull/7510) [`08c2d49`](https://github.com/gradio-app/gradio/commit/08c2d491ecac83268ad20f05769ef7e1335089e2) - when adding custom head html, ensure there are no duplicate meta tags.  Thanks [@qkdxorjs1002](https://github.com/qkdxorjs1002)!
- [#7545](https://github.com/gradio-app/gradio/pull/7545) [`1fa2e91`](https://github.com/gradio-app/gradio/commit/1fa2e914ca4663a47743cc34acdf98c7fcc469c8) - Fixes `auth_message` so that it correctly renders HTML.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7599](https://github.com/gradio-app/gradio/pull/7599) [`f26aba0`](https://github.com/gradio-app/gradio/commit/f26aba00a71a5b4eff60c37580c8d25f9bc048da) - Prevent audio speeding up when trimming.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7567](https://github.com/gradio-app/gradio/pull/7567) [`e340894`](https://github.com/gradio-app/gradio/commit/e340894b1cf2f44dd45e597fd8d9e547f408fbb3) - Quick fix: custom dropdown value.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 4.19.2

### Features

- [#7495](https://github.com/gradio-app/gradio/pull/7495) [`ddd4d3e`](https://github.com/gradio-app/gradio/commit/ddd4d3e4d3883fb7540d1df240fb08202fc77705) - Enable Ruff S101.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7443](https://github.com/gradio-app/gradio/pull/7443) [`b7a97f2`](https://github.com/gradio-app/gradio/commit/b7a97f29b84a72678a717db03d2932ed6caae6ce) - Update `httpx` to `httpx>=0.24.1` in `requirements.txt`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7465](https://github.com/gradio-app/gradio/pull/7465) [`16fbe9c`](https://github.com/gradio-app/gradio/commit/16fbe9cd0cffa9f2a824a0165beb43446114eec7) - Prevent components from working with non-uploaded files.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7503](https://github.com/gradio-app/gradio/pull/7503) [`84802ee`](https://github.com/gradio-app/gradio/commit/84802ee6a4806c25287344dce581f9548a99834a) - Tighten CORS rules.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#7466](https://github.com/gradio-app/gradio/pull/7466) [`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89) - Fix z-index layer of orange generating border.  Thanks [@daviirodrig](https://github.com/daviirodrig)!
- [#7507](https://github.com/gradio-app/gradio/pull/7507) [`9c36572`](https://github.com/gradio-app/gradio/commit/9c36572e32aeec6e6352a861dfea6ee0f9a15e79) - Quick fix: File height overflow.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#7495](https://github.com/gradio-app/gradio/pull/7495) [`ddd4d3e`](https://github.com/gradio-app/gradio/commit/ddd4d3e4d3883fb7540d1df240fb08202fc77705) - ensure Dataframe headers are aligned with content when scrolling.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7470](https://github.com/gradio-app/gradio/pull/7470) [`ba3ec13`](https://github.com/gradio-app/gradio/commit/ba3ec1300e81e64be7389d759b89284c66473158) - Tab select fix.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7505](https://github.com/gradio-app/gradio/pull/7505) [`b186767`](https://github.com/gradio-app/gradio/commit/b18676774448f44a2ef3a9490224703254cffa7c) - Fix `Gallery` preview overlay and backdrop.  Thanks [@MMP0](https://github.com/MMP0)!
- [#7511](https://github.com/gradio-app/gradio/pull/7511) [`33f68cb`](https://github.com/gradio-app/gradio/commit/33f68cb6c22897f7996b6c84b0e528c47fae00b5) - Fix Canvas3D/Canvas3DGS async imports.  Thanks [@whitphx](https://github.com/whitphx)!

## 4.19.1

### Features

- [#7453](https://github.com/gradio-app/gradio/pull/7453) [`ba747ad`](https://github.com/gradio-app/gradio/commit/ba747adb87e1937c0a791186eee3997d034363e6) - Make fix in #7444 (Block /file= filepaths that could expose credentials on Windows) more general.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7416](https://github.com/gradio-app/gradio/pull/7416) [`c88290d`](https://github.com/gradio-app/gradio/commit/c88290d90a81811911361e26fa9523c9b13db527) - WIP: Optimize /file route.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7440](https://github.com/gradio-app/gradio/pull/7440) [`e329f1f`](https://github.com/gradio-app/gradio/commit/e329f1fd38935213fe0e73962e8cbd5d3af6e87b) - Prevent timing attacks to guess Gradio passwords.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7425](https://github.com/gradio-app/gradio/pull/7425) [`3e4e680`](https://github.com/gradio-app/gradio/commit/3e4e680a52ba5a73c108ef1b328dacd7b6e4b566) - Fixes to the `.key_up()` method to make it usable for a dynamic dropdown autocomplete.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#7444](https://github.com/gradio-app/gradio/pull/7444) [`4faf8a7`](https://github.com/gradio-app/gradio/commit/4faf8a7e86bfe811ef3d90ac5abdbd41409fafb1) - Block `/file=` filepaths that could expose credentials on Windows.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7441](https://github.com/gradio-app/gradio/pull/7441) [`f52cab6`](https://github.com/gradio-app/gradio/commit/f52cab634b94638d7f4625d40bf3d9afbe68040b) - Dispatch change event for file explorer.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7327](https://github.com/gradio-app/gradio/pull/7327) [`fb1f6be`](https://github.com/gradio-app/gradio/commit/fb1f6befad12106faafd94d221c1ed0e50b0a037) - Run pre/post processing in threadpool.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7431](https://github.com/gradio-app/gradio/pull/7431) [`6b8a7e5`](https://github.com/gradio-app/gradio/commit/6b8a7e5d36887cdfcfbfec1536a915128df0d6b2) - Ensure `gr.Dropdown` can have an empty initial value.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6991](https://github.com/gradio-app/gradio/pull/6991) [`f191786`](https://github.com/gradio-app/gradio/commit/f1917867916647d383b8d7ce15e0c17f2abbdec1) - Improve responsiveness of `gr.Audio()` controls.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 4.19.0

### Features

- [#7406](https://github.com/gradio-app/gradio/pull/7406) [`3e886d8`](https://github.com/gradio-app/gradio/commit/3e886d8f0ac55c416dae51c1c2661e16eb34718e) - Model3D Gaussian Splatting.  Thanks [@dylanebert](https://github.com/dylanebert)!

### Fixes

- [#7402](https://github.com/gradio-app/gradio/pull/7402) [`fa8225d`](https://github.com/gradio-app/gradio/commit/fa8225d24d86c0ec9a48cadee78dcc11b7084584) - Use updated component in `postprocess()`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7361](https://github.com/gradio-app/gradio/pull/7361) [`17fb116`](https://github.com/gradio-app/gradio/commit/17fb116492f951ab66e3a39b5fdfb598f5446b6f) - Fixes gr.Markdown() does not render spaces around links correctly.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#7337](https://github.com/gradio-app/gradio/pull/7337) [`65437ce`](https://github.com/gradio-app/gradio/commit/65437ce832f806da316aa074539b6263e1d8b7ac) - Improve File Explorer performance.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7410](https://github.com/gradio-app/gradio/pull/7410) [`c2dfc59`](https://github.com/gradio-app/gradio/commit/c2dfc592a4988efd5a96a062eec3fb4906f71748) - remove static while pending behaviour.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7389](https://github.com/gradio-app/gradio/pull/7389) [`b5c74ff`](https://github.com/gradio-app/gradio/commit/b5c74ffadbee351b2d5d79e578246f5343255508) - Fix HTTPX package crash for some values of "article" parameter in the interface.  Thanks [@YuryYakhno](https://github.com/YuryYakhno)!
- [#7415](https://github.com/gradio-app/gradio/pull/7415) [`4ab399f`](https://github.com/gradio-app/gradio/commit/4ab399f40a300f267231f1b2dbe2a07494322d4d) - Allow config to include non-pickle-able values.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7404](https://github.com/gradio-app/gradio/pull/7404) [`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7) - Add `.key_up` event listener to `gr.Dropdown()`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7417](https://github.com/gradio-app/gradio/pull/7417) [`314ccfa`](https://github.com/gradio-app/gradio/commit/314ccfa781810e777a944ff6d832dbd4b043631a) - Fix File Explorer interactivity.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7401](https://github.com/gradio-app/gradio/pull/7401) [`dff4109`](https://github.com/gradio-app/gradio/commit/dff410955e41145848376784c03fe28ba1c4fd85) - Retain dropdown value if choices have been changed.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7411](https://github.com/gradio-app/gradio/pull/7411) [`32b317f`](https://github.com/gradio-app/gradio/commit/32b317f24e3d43f26684bb9f3964f31efd0ea556) - Set `root` correctly for Gradio apps that are deployed behind reverse proxies.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7395](https://github.com/gradio-app/gradio/pull/7395) [`46b4568`](https://github.com/gradio-app/gradio/commit/46b45683e1ea9eb40013121a8de5bee7aa98bf0b) - Allow applying `@media`, `@keyframes` and `@import` in custom CSS.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 4.18.0

### Features

- [#7299](https://github.com/gradio-app/gradio/pull/7299) [`f35f615`](https://github.com/gradio-app/gradio/commit/f35f615e33a5dd90bfeb106b6f5dca689849fcef) - Added remove button for every file in file preview, to remove individual file in gr.File().  Thanks [@shubhamofbce](https://github.com/shubhamofbce)!
- [#7183](https://github.com/gradio-app/gradio/pull/7183) [`49d9c48`](https://github.com/gradio-app/gradio/commit/49d9c48537aa706bf72628e3640389470138bdc6) - [WIP] Refactor file normalization to be in the backend and remove it from the frontend of each component.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7333](https://github.com/gradio-app/gradio/pull/7333) [`7e9b206`](https://github.com/gradio-app/gradio/commit/7e9b206a149740a421e03c8adb64978a5070f28f) - Stop using deprecated pydantic config class and filter gradio warnings from tests.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7377](https://github.com/gradio-app/gradio/pull/7377) [`6dfd40f`](https://github.com/gradio-app/gradio/commit/6dfd40fc6b2fa461490d2370ab91fcda7e07c0da) - Make set_documentation_group a no-op.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7328](https://github.com/gradio-app/gradio/pull/7328) [`c1a7ea7`](https://github.com/gradio-app/gradio/commit/c1a7ea7c0c294aa970624f02225717c12bcf9b58) - Add SQL Support for gr.Code.  Thanks [@aersam](https://github.com/aersam)!
- [#7369](https://github.com/gradio-app/gradio/pull/7369) [`7b10d97`](https://github.com/gradio-app/gradio/commit/7b10d97b0f928fde6a71a94460fb8ca784e7a31d) - Remove the `@gradio/wasm` dependency from `@gradio/gallery` that is not used.  Thanks [@whitphx](https://github.com/whitphx)!
- [#7334](https://github.com/gradio-app/gradio/pull/7334) [`b95d0d0`](https://github.com/gradio-app/gradio/commit/b95d0d043c739926af986e573200af92732bbc01) - Allow setting custom headers in Python Client.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7365](https://github.com/gradio-app/gradio/pull/7365) [`1e68561`](https://github.com/gradio-app/gradio/commit/1e68561167cd240d053444db091b297a3129cebb) - Update Pydantic patch for Lite that emulates PydanticV2 API using V1.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6890](https://github.com/gradio-app/gradio/pull/6890) [`cccab27`](https://github.com/gradio-app/gradio/commit/cccab27fe8b6ae6860b3fff68694fa33060e18a7) - E2E tests for Lite.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#7354](https://github.com/gradio-app/gradio/pull/7354) [`a7fa47a`](https://github.com/gradio-app/gradio/commit/a7fa47a175fbcf0fd6573ca19334a3a55b55bb24) - ensure Dataframes in background tabs are visible when the tab is selected.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7355](https://github.com/gradio-app/gradio/pull/7355) [`2244059`](https://github.com/gradio-app/gradio/commit/2244059cdbacb713530a3b760205c5464c05491c) - Ensure CSS `.dark` rule selectors are applied.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7375](https://github.com/gradio-app/gradio/pull/7375) [`4dc9ffb`](https://github.com/gradio-app/gradio/commit/4dc9ffbf70e2233c5b18ed3f722c1189a310a036) - Store `gr.Accordion`'s `open` value.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7374](https://github.com/gradio-app/gradio/pull/7374) [`7f19ba2`](https://github.com/gradio-app/gradio/commit/7f19ba272c5a46d7f2c11ad5c9f0ab15d4e27083) - Stop caching root url.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7350](https://github.com/gradio-app/gradio/pull/7350) [`7302a6e`](https://github.com/gradio-app/gradio/commit/7302a6e151dac553c17833be64d4639ee4cf97aa) - Fix `gr.load` for file-based Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.17.0

### Features

- [#7129](https://github.com/gradio-app/gradio/pull/7129) [`ccdaec4`](https://github.com/gradio-app/gradio/commit/ccdaec45002d0a9d6016e8e2078b843a1ff9172b) - Add a `simpleimage` template for custom components.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7313](https://github.com/gradio-app/gradio/pull/7313) [`edfd05d`](https://github.com/gradio-app/gradio/commit/edfd05d18d20542d350d883d5e7f84d2774ad99e) - Expand chatinterface to full window height.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7292](https://github.com/gradio-app/gradio/pull/7292) [`aa97a5e`](https://github.com/gradio-app/gradio/commit/aa97a5e33a04ef8a0309b6ec3b2df4caaa26173e) - Improvements to API Docs.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7205](https://github.com/gradio-app/gradio/pull/7205) [`e418edd`](https://github.com/gradio-app/gradio/commit/e418edd011d06df519c778b9a50573288d5bf30f) - Fix SimpleImage package json.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7222](https://github.com/gradio-app/gradio/pull/7222) [`5181957`](https://github.com/gradio-app/gradio/commit/51819577068addde8fab1f4d4cfe691f20396f3f) - Add mobile Chromatic tests.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7298](https://github.com/gradio-app/gradio/pull/7298) [`e5344ba`](https://github.com/gradio-app/gradio/commit/e5344ba0cd63d21dbb525330bbc07ca2eca57832) - chore(deps): update dependency marked to v12.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#7206](https://github.com/gradio-app/gradio/pull/7206) [`572e360`](https://github.com/gradio-app/gradio/commit/572e360fff4a03c335b86e1a7517a44cb6af2bcd) - Upload tweak.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7062](https://github.com/gradio-app/gradio/pull/7062) [`0fddd0f`](https://github.com/gradio-app/gradio/commit/0fddd0f971761bff3ef6ccc7ab9deb1891cd80d0) - Determine documentation group automatically.  Thanks [@akx](https://github.com/akx)!
- [#7102](https://github.com/gradio-app/gradio/pull/7102) [`68a54a7`](https://github.com/gradio-app/gradio/commit/68a54a7a310d8d7072fdae930bf1cfdf12c45a7f) - Improve chatbot streaming performance with diffs.  Thanks [@aliabid94](https://github.com/aliabid94)!/n  Note that this PR changes the API format for generator functions, which would be a breaking change for any clients reading the EventStream directly
- [#7208](https://github.com/gradio-app/gradio/pull/7208) [`efacc7d`](https://github.com/gradio-app/gradio/commit/efacc7d5cb0d1c6448cbec82abfc00ad6da05b3f) - Ensure `open` reactivity in Accordion.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7228](https://github.com/gradio-app/gradio/pull/7228) [`2e6672c`](https://github.com/gradio-app/gradio/commit/2e6672c815e39fd6af78353e66661100b9102cd4) - Allow start/pause of streaming image input. Only access the webcam while it's needed.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7236](https://github.com/gradio-app/gradio/pull/7236) [`dec6a71`](https://github.com/gradio-app/gradio/commit/dec6a715d6219b00bd0151dd7c13bb2bc99c86da) - Fix PIL imports.  Thanks [@akx](https://github.com/akx)!
- [#7274](https://github.com/gradio-app/gradio/pull/7274) [`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557) - chore: Change time format (thanks @jjshoots for the independent contribution).  Thanks [@arian81](https://github.com/arian81)!
- [#7116](https://github.com/gradio-app/gradio/pull/7116) [`3c8c4ac`](https://github.com/gradio-app/gradio/commit/3c8c4ac2db284e1cb503c397205a79a6dcc27e23) - Document the `gr.ParamViewer` component, and fix component preprocessing/postprocessing docstrings.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7157](https://github.com/gradio-app/gradio/pull/7157) [`46919c5`](https://github.com/gradio-app/gradio/commit/46919c5a4721ca2b0e17e38dc8c641f7ef336bcc) - Defer importing matplotlib.  Thanks [@akx](https://github.com/akx)!
- [#7332](https://github.com/gradio-app/gradio/pull/7332) [`8bb0ce2`](https://github.com/gradio-app/gradio/commit/8bb0ce2e40abc4da3c782d5bc5ef5ac0f31f966f) - Hotfix for: `stt_or_tts` demo.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7309](https://github.com/gradio-app/gradio/pull/7309) [`200e251`](https://github.com/gradio-app/gradio/commit/200e2518e4d449aa82819a8d119e912bd1d95c15) - Add `gr.Image` interaction test + `gr.ImageEditor` interaction test improvement.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7319](https://github.com/gradio-app/gradio/pull/7319) [`87d5105`](https://github.com/gradio-app/gradio/commit/87d510580e7061c00848b70613c74838d9c71de7) - Handle httpx.InvalidURL when setting non-URL article strings.  Thanks [@nopperl](https://github.com/nopperl)!
- [#7154](https://github.com/gradio-app/gradio/pull/7154) [`aab2a75`](https://github.com/gradio-app/gradio/commit/aab2a75f0610dd7ed0b481264c6b9f01cfe92094) - Allow selecting texts in dataframe cells.  Thanks [@shubhamofbce](https://github.com/shubhamofbce)!
- [#7061](https://github.com/gradio-app/gradio/pull/7061) [`05d8a3c`](https://github.com/gradio-app/gradio/commit/05d8a3c8030b733bd47250f5db6f89f230f9a707) - Update ruff to 0.1.13, enable more rules, fix issues.  Thanks [@akx](https://github.com/akx)!
- [#7315](https://github.com/gradio-app/gradio/pull/7315) [`b3a9c83`](https://github.com/gradio-app/gradio/commit/b3a9c830955a5ded8528d6118aaf1b6e019857a2) - Lite: Wasm-compatible Model3D.  Thanks [@whitphx](https://github.com/whitphx)!
- [#7059](https://github.com/gradio-app/gradio/pull/7059) [`7ea8336`](https://github.com/gradio-app/gradio/commit/7ea8336709726dbe14dd00303fe2db3fe27f0502) - Remove flag_dir from read_from_flag().  Thanks [@akx](https://github.com/akx)!
- [#7229](https://github.com/gradio-app/gradio/pull/7229) [`6a7e98b`](https://github.com/gradio-app/gradio/commit/6a7e98bfefdc9530f0390f0d780edc5a35266d56) - Fix hyphen-bug in gradio cc publish.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7225](https://github.com/gradio-app/gradio/pull/7225) [`60078df`](https://github.com/gradio-app/gradio/commit/60078df07f38c0ef90ef2ba90f8e3272b92c9e3d) - Fix test requirements to be compatible with python 3.11.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7256](https://github.com/gradio-app/gradio/pull/7256) [`09257ef`](https://github.com/gradio-app/gradio/commit/09257ef1f1307e2886418f6dd93dcffdf010c32b) - Fix ci cache.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7240](https://github.com/gradio-app/gradio/pull/7240) [`1893756`](https://github.com/gradio-app/gradio/commit/18937564ab8906710549d5bccc48f7188c836f38) - Small cleanups of `Code` component.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7295](https://github.com/gradio-app/gradio/pull/7295) [`aea14c4`](https://github.com/gradio-app/gradio/commit/aea14c44961be8b0e732e05799df8104d7b906ed) - Refactor Inference API and rename it to Serverless Inference Endpoints.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#7117](https://github.com/gradio-app/gradio/pull/7117) [`24157a3`](https://github.com/gradio-app/gradio/commit/24157a36028b3f606194bd9977634318650b2d46) - add background color based on the OS mode.  Thanks [@aileenvl](https://github.com/aileenvl)!
- [#7192](https://github.com/gradio-app/gradio/pull/7192) [`8dd6f4b`](https://github.com/gradio-app/gradio/commit/8dd6f4bc1901792f05cd59e86df7b1dbab692739) - Handle the case where examples is `null` for all components.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7283](https://github.com/gradio-app/gradio/pull/7283) [`757dba6`](https://github.com/gradio-app/gradio/commit/757dba66baf624eae11ff076f0e8d6bfc2314630) - Add `show_label` check to `gr.Dataframe`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7190](https://github.com/gradio-app/gradio/pull/7190) [`2d51a9d`](https://github.com/gradio-app/gradio/commit/2d51a9dbd97167aa7a2b3aa672142c1a5137e898) - Add missing parameters and docstrings for `gr.TabbedInterface`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7178](https://github.com/gradio-app/gradio/pull/7178) [`9f23b0b`](https://github.com/gradio-app/gradio/commit/9f23b0bc54b4ef63c056b309370df52ec2c2a43c) - Optimize client view_api method.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7158](https://github.com/gradio-app/gradio/pull/7158) [`ded5256`](https://github.com/gradio-app/gradio/commit/ded5256c4a39a84155b9c3d7f4e8e7060d798186) - Fix audio recording events not dispatching.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7325](https://github.com/gradio-app/gradio/pull/7325) [`733ca26`](https://github.com/gradio-app/gradio/commit/733ca266bb1ba9049ed7309b8f0614199682e173) - Ensure examples Images displays as expected.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7276](https://github.com/gradio-app/gradio/pull/7276) [`a3aa22f`](https://github.com/gradio-app/gradio/commit/a3aa22f6f0bc664646bb409844899bc8810e421e) - Adjust Value to Fix .Label Display.  Thanks [@codydh](https://github.com/codydh)!
- [#7286](https://github.com/gradio-app/gradio/pull/7286) [`0d36ac0`](https://github.com/gradio-app/gradio/commit/0d36ac05aa54e53f0ea61f5b129af59ab55f3224) - Fixes issue with datatype setting in gr.Dataframe. Setting no longer dependent on col_count.  Thanks [@cswamy](https://github.com/cswamy)!
- [#7290](https://github.com/gradio-app/gradio/pull/7290) [`db27df3`](https://github.com/gradio-app/gradio/commit/db27df36d2ea42dd20f275e9b9d6fe15f1a960f8) - Escape triple quotes when creating `space.py` for custom components.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7141](https://github.com/gradio-app/gradio/pull/7141) [`c3e61e4`](https://github.com/gradio-app/gradio/commit/c3e61e4f70696a71aede67b65d28447eb67daf16) - Few File component drag and drop.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#7221](https://github.com/gradio-app/gradio/pull/7221) [`cae05c0`](https://github.com/gradio-app/gradio/commit/cae05c05ecde56c4d92c6b5ed8d13353505cbd14) - Fix single file upload display.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7207](https://github.com/gradio-app/gradio/pull/7207) [`e3217b4`](https://github.com/gradio-app/gradio/commit/e3217b41862925a6a05f44070ac2bdabbeee6769) - Amend audio waveform colour.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7322](https://github.com/gradio-app/gradio/pull/7322) [`b25e95e`](https://github.com/gradio-app/gradio/commit/b25e95e164e80d66203ef71ce6bdb67ceb6b24df) - Fix `processing_utils.save_url_to_cache()` to follow redirects when accessing the URL.  Thanks [@whitphx](https://github.com/whitphx)!
- [#7294](https://github.com/gradio-app/gradio/pull/7294) [`d7095c4`](https://github.com/gradio-app/gradio/commit/d7095c4699658f2acc5af7557dd455e8655954f4) - Number example fix.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7219](https://github.com/gradio-app/gradio/pull/7219) [`faead14`](https://github.com/gradio-app/gradio/commit/faead1403cdba6415912a6ad512291ac63b04173) - Show label in interactive image editor.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7220](https://github.com/gradio-app/gradio/pull/7220) [`3b8dfc6`](https://github.com/gradio-app/gradio/commit/3b8dfc684dc0eb0544d06300fa546b23f587c63f) - Add `visible` check to Tab.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7257](https://github.com/gradio-app/gradio/pull/7257) [`daaaf95`](https://github.com/gradio-app/gradio/commit/daaaf9593e9b2094bf59f3f5e01244ffb8a01bb1) - Fixes issues related to `gr.Dataframe` receiving an empty dataframe.  Thanks [@cswamy](https://github.com/cswamy)!

## 4.16.0

### Features

- [#7124](https://github.com/gradio-app/gradio/pull/7124) [`21a16c6`](https://github.com/gradio-app/gradio/commit/21a16c60e8f34b870bd2aae9af07713eb1307252) - add params to `gr.Interface` and `gr.ChatInterface`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7139](https://github.com/gradio-app/gradio/pull/7139) [`6abad53`](https://github.com/gradio-app/gradio/commit/6abad536778517a2ab9f5fc75d52afc576f01218) - Added polars dataframe support with demo.  Thanks [@cswamy](https://github.com/cswamy)!
- [#7084](https://github.com/gradio-app/gradio/pull/7084) [`94aa271`](https://github.com/gradio-app/gradio/commit/94aa271ab11fc3426a7e143ebaa757eb30c9911d) - Improve rapid generation performance via UI throttling.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7104](https://github.com/gradio-app/gradio/pull/7104) [`bc2cdc1`](https://github.com/gradio-app/gradio/commit/bc2cdc1df95b38025486cf76df4a494b66d98585) - Allow download button for interactive Audio and Video components.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7109](https://github.com/gradio-app/gradio/pull/7109) [`125a832`](https://github.com/gradio-app/gradio/commit/125a832ab7ee2b5affa574e8b32c88f430cc6663) - generate docs when running `gradio cc build`.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7148](https://github.com/gradio-app/gradio/pull/7148) [`c60ad4d`](https://github.com/gradio-app/gradio/commit/c60ad4d34ab5b56a89bf6796822977e51e7a4a32) - Use Gallery as input component.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7049](https://github.com/gradio-app/gradio/pull/7049) [`1718c4a`](https://github.com/gradio-app/gradio/commit/1718c4aeb23a88ef02b17b30a1d1cb72e413e04a) - add STL 3D model support.  Thanks [@Mon-ius](https://github.com/Mon-ius)!
- [#7159](https://github.com/gradio-app/gradio/pull/7159) [`6ee22dc`](https://github.com/gradio-app/gradio/commit/6ee22dc6a8f6419e127a0f650e58c87a31bc59c9) - Ensure `gradio cc publish` uploads the documentation space, if it exists.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7034](https://github.com/gradio-app/gradio/pull/7034) [`82fe73d`](https://github.com/gradio-app/gradio/commit/82fe73d04297ac4e2c3ef42edc62bab4300bf915) - Redirect with query params after oauth.  Thanks [@Wauplin](https://github.com/Wauplin)!
- [#7063](https://github.com/gradio-app/gradio/pull/7063) [`2cdcf4a`](https://github.com/gradio-app/gradio/commit/2cdcf4a890202a55673588c16f27b327d27915b6) - Single oauth button.  Thanks [@Wauplin](https://github.com/Wauplin)!

### Fixes

- [#7126](https://github.com/gradio-app/gradio/pull/7126) [`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b) - Allow buttons to take null value.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7112](https://github.com/gradio-app/gradio/pull/7112) [`217bfe3`](https://github.com/gradio-app/gradio/commit/217bfe39ca6a0de885824f16be4a707e7f032d57) - Support audio data in `np.int8` format in the `gr.Audio` component.  Thanks [@Ram-Pasupula](https://github.com/Ram-Pasupula)!
- [#7029](https://github.com/gradio-app/gradio/pull/7029) [`ac73555`](https://github.com/gradio-app/gradio/commit/ac735551bb2ccc288b2bbf10b008b6c3d9e65132) - Run before_fn and after_fn for each generator iteration.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7131](https://github.com/gradio-app/gradio/pull/7131) [`7d53aa1`](https://github.com/gradio-app/gradio/commit/7d53aa13a304d056d1973b8e86c6f89ff84cbd28) - Miscellaneous doc fixes.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7138](https://github.com/gradio-app/gradio/pull/7138) [`ca8753b`](https://github.com/gradio-app/gradio/commit/ca8753bb3d829d0077f758ba8d0ddc866ff74d3d) - Fixes: Chatbot crashes when given empty url following http:// or https://.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#7115](https://github.com/gradio-app/gradio/pull/7115) [`cb90b3d`](https://github.com/gradio-app/gradio/commit/cb90b3d5d6a291270e047e10f9173cbc03678e1c) - Programmatically determine max wheel version to push to spaces.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7107](https://github.com/gradio-app/gradio/pull/7107) [`80f8fbf`](https://github.com/gradio-app/gradio/commit/80f8fbf0e8900627b9c2575bbd7c68fad8108544) - Add logic to handle non-interactive or hidden tabs.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7142](https://github.com/gradio-app/gradio/pull/7142) [`b961652`](https://github.com/gradio-app/gradio/commit/b9616528ab099aab0adc7027bce4655111f7366c) - Remove kwargs from template components.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7125](https://github.com/gradio-app/gradio/pull/7125) [`45f725f`](https://github.com/gradio-app/gradio/commit/45f725f8d0dc7813b3d2e768ca9582d6ad878d6f) - un-disable output components after exception is raised.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7081](https://github.com/gradio-app/gradio/pull/7081) [`44c53d9`](https://github.com/gradio-app/gradio/commit/44c53d9bde7cab605b7dbd16331683d13cae029e) - Fix dropdown refocusing due to `<label />` element.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7130](https://github.com/gradio-app/gradio/pull/7130) [`e7ab406`](https://github.com/gradio-app/gradio/commit/e7ab4063eb2624820b9f1076960e9596791d9427) - Fix ParamViewer css.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7113](https://github.com/gradio-app/gradio/pull/7113) [`28e8a8a`](https://github.com/gradio-app/gradio/commit/28e8a8a3ec8acd653182577273be4244a4817082) - Reduce CPU usage of dev mode.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7082](https://github.com/gradio-app/gradio/pull/7082) [`c35fac0`](https://github.com/gradio-app/gradio/commit/c35fac049a44b14719509443c68690e7f23ce70d) - Ensure device selection works in Audio when streaming.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7045](https://github.com/gradio-app/gradio/pull/7045) [`13cb6af`](https://github.com/gradio-app/gradio/commit/13cb6af8b23be063d85b2c632f36afa37d874e5d) - Ensure microphone devices list updates.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7150](https://github.com/gradio-app/gradio/pull/7150) [`be56c76`](https://github.com/gradio-app/gradio/commit/be56c76c7b5d2814ea8239c7dbeddc4b1d3701c4) - Lite: Add the `home_dir` to `sys.path`.  Thanks [@whitphx](https://github.com/whitphx)!
- [#7133](https://github.com/gradio-app/gradio/pull/7133) [`8c355a4`](https://github.com/gradio-app/gradio/commit/8c355a47844296e3aab250fe61e2ecc706122e78) - Add ruff mock for Lite.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6826](https://github.com/gradio-app/gradio/pull/6826) [`e8b2d8b`](https://github.com/gradio-app/gradio/commit/e8b2d8b2f81b7c4b2d107765f06eaf09a030f1df) - Add sample rate config option to `gr.Audio()`.  Thanks [@tsukumijima](https://github.com/tsukumijima)!

## 4.15.0

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

### Features

- [#7075](https://github.com/gradio-app/gradio/pull/7075) [`1fc8a94`](https://github.com/gradio-app/gradio/commit/1fc8a941384775f587a6ef30365960f43353cb0d) - fix lint.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7069](https://github.com/gradio-app/gradio/pull/7069) [`07d520c`](https://github.com/gradio-app/gradio/commit/07d520c7a2590eb5544bd0b17f82ea31ecf43e00) - fix versions.  Thanks [@pngwn](https://github.com/pngwn)!
- [#7058](https://github.com/gradio-app/gradio/pull/7058) [`3642b7a`](https://github.com/gradio-app/gradio/commit/3642b7ac93128793b75b94f8d785457869a4447e) - publish: simplify twine_files code.  Thanks [@akx](https://github.com/akx)!
- [#7054](https://github.com/gradio-app/gradio/pull/7054) [`64c65d8`](https://github.com/gradio-app/gradio/commit/64c65d821983961111297a969946d87e2fc4105d) - Add encoding to open/writing files on the deploy_discord function.  Thanks [@WilliamHarer](https://github.com/WilliamHarer)!
- [#7024](https://github.com/gradio-app/gradio/pull/7024) [`f2d69fc`](https://github.com/gradio-app/gradio/commit/f2d69fc7d0c1c3457112e702b53e38a0255fc1b7) - Fix gallery thumbnail design regression.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7018](https://github.com/gradio-app/gradio/pull/7018) [`ec28b4e`](https://github.com/gradio-app/gradio/commit/ec28b4e7c47a9233d9e3a725cc9fe8f9044dfa94) - Add `visible` and `interactive` params to `gr.Tab()`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#7060](https://github.com/gradio-app/gradio/pull/7060) [`aaecfe5`](https://github.com/gradio-app/gradio/commit/aaecfe54d913c1c4713e23233f32ae1e4239730e) - Themes: fix bogus header image URL.  Thanks [@akx](https://github.com/akx)!

### Fixes

- [#7050](https://github.com/gradio-app/gradio/pull/7050) [`a336508`](https://github.com/gradio-app/gradio/commit/a3365086468568db871940fa2807454ac047cadd) - Fix bug preventing layout components to be used as custom components.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7055](https://github.com/gradio-app/gradio/pull/7055) [`3c3cf86`](https://github.com/gradio-app/gradio/commit/3c3cf8618a8cad1ef66a7f96664923d2c9f5e0e2) - Fix UI freeze on rapid generators.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#7046](https://github.com/gradio-app/gradio/pull/7046) [`9201f86`](https://github.com/gradio-app/gradio/commit/9201f86450c377f78a77ac003a5d5ff009a8894c) - Raise error in build step if custom component package is not installed.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6933](https://github.com/gradio-app/gradio/pull/6933) [`9cefd2e`](https://github.com/gradio-app/gradio/commit/9cefd2e90a1d0cc4d3e4e953fc5b9b1a7afb68dd) - Refactor examples so they accept data in the same format as is returned by function, rename `.as_example()` to `.process_example()`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6980](https://github.com/gradio-app/gradio/pull/6980) [`523b6bc`](https://github.com/gradio-app/gradio/commit/523b6bc534e221b028a3ea3f274c7466fe242d5a) - `gr.update(value=[])` for `gr.File()` clears it.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#7038](https://github.com/gradio-app/gradio/pull/7038) [`6be3c2c`](https://github.com/gradio-app/gradio/commit/6be3c2c47a616c904c8497d1fbef7a851c54d488) - Fix Chatbot custom component template.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6982](https://github.com/gradio-app/gradio/pull/6982) [`3f139c7`](https://github.com/gradio-app/gradio/commit/3f139c7c995f749562bb007d2a567bb167669de9) - Fix File drag and drop for specific file_types.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 4.14.0

### Features

- [#6994](https://github.com/gradio-app/gradio/pull/6994) [`623bc1a`](https://github.com/gradio-app/gradio/commit/623bc1aeb19945c1f3c68ea66fa669d1169483a3) - Switch default order for sources for `gr.Video` so that upload is the default.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6965](https://github.com/gradio-app/gradio/pull/6965) [`5d00dd3`](https://github.com/gradio-app/gradio/commit/5d00dd37ca14bbfef2ceac550b29dbe05ba8cab0) - Make <UploadProgress /> Wasm-compatible.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6945](https://github.com/gradio-app/gradio/pull/6945) [`ccf317f`](https://github.com/gradio-app/gradio/commit/ccf317fc9797675a748b50118aa59a7e4b129d9d) - Add `additional_inputs`, `additional_inputs_accordion` parameters to `gr.Interface`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6963](https://github.com/gradio-app/gradio/pull/6963) [`8dfabee`](https://github.com/gradio-app/gradio/commit/8dfabee00495ccbbd6743da07fa06c75cac3fb5f) - fixed typo.  Thanks [@Cassini-chris](https://github.com/Cassini-chris)!

### Fixes

- [#6969](https://github.com/gradio-app/gradio/pull/6969) [`793bf8f`](https://github.com/gradio-app/gradio/commit/793bf8f7b1943f265c5d016c1a0c682ee549232a) - Display pending file in `<Upload />` while waiting for upload request.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6885](https://github.com/gradio-app/gradio/pull/6885) [`640b7fe`](https://github.com/gradio-app/gradio/commit/640b7fe05276e11720b4341cadf088491395e53d) - Fix issue with Webcam Recording.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6967](https://github.com/gradio-app/gradio/pull/6967) [`5e00162`](https://github.com/gradio-app/gradio/commit/5e0016267f1d683e2daab82ee4a33d2f09513a34) - Make <Gallery /> Wasm-compatible.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6983](https://github.com/gradio-app/gradio/pull/6983) [`6e285be`](https://github.com/gradio-app/gradio/commit/6e285be8edeacf8730bac10b7ecd3fd5e309a950) - Fix the reloader.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6958](https://github.com/gradio-app/gradio/pull/6958) [`0f0498b`](https://github.com/gradio-app/gradio/commit/0f0498bf97a036efe47d01b47c4b26000d8d1df3) - Ensure Chatbot theme text size is set correctly.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 4.13.0

### Features

- [#6133](https://github.com/gradio-app/gradio/pull/6133) [`f742d0e`](https://github.com/gradio-app/gradio/commit/f742d0e861c8e25c5d77d9102c9d50f94b0d3383) - Lite: Support AnnotatedImage on Wasm.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6778](https://github.com/gradio-app/gradio/pull/6778) [`8a093e2`](https://github.com/gradio-app/gradio/commit/8a093e23d7993a044e5e0ff73f93a74cb75dad56) - Add a dev instruction for lite in SharedWorker mode.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6931](https://github.com/gradio-app/gradio/pull/6931) [`6c863af`](https://github.com/gradio-app/gradio/commit/6c863af92fa9ceb5c638857eb22cc5ddb718d549) - Fix functional tests.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6897](https://github.com/gradio-app/gradio/pull/6897) [`fb9c6ca`](https://github.com/gradio-app/gradio/commit/fb9c6cacd7ca4598c000f1f97d7d39a8c4463519) - Lite: Chatbot.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6900](https://github.com/gradio-app/gradio/pull/6900) [`4511d57`](https://github.com/gradio-app/gradio/commit/4511d57c46bf82c48e8e575040ff7dab528b8d51) - Fix the aria-label attrs in `gr.Chatbot()`.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6820](https://github.com/gradio-app/gradio/pull/6820) [`649cd4d`](https://github.com/gradio-app/gradio/commit/649cd4d68041d11fcbe31f8efa455345ac49fc74) - Use `EventSource_factory` in `open_stream()` for Wasm.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6916](https://github.com/gradio-app/gradio/pull/6916) [`02c2442`](https://github.com/gradio-app/gradio/commit/02c24422174065b79bfccb258cdfefc6b2b69dc6) - Fix docstring of deprecated parameter concurrency_count.  Thanks [@ronensc](https://github.com/ronensc)!
- [#6884](https://github.com/gradio-app/gradio/pull/6884) [`24a5836`](https://github.com/gradio-app/gradio/commit/24a583688046867ca8b8b02959c441818bdb34a2) - Component Server fix.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6887](https://github.com/gradio-app/gradio/pull/6887) [`8333db8`](https://github.com/gradio-app/gradio/commit/8333db83ac6e2c8511c104534c48137576d0bcd7) - Fix the Wasm worker to initialize the app directories.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6932](https://github.com/gradio-app/gradio/pull/6932) [`e671e54`](https://github.com/gradio-app/gradio/commit/e671e5415fecae52328e426ee2e9f3c09f410606) - Allow `gr.ClearButton` and `gr.DuplicateButton` to be made hidden (and otherwise updated).  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6942](https://github.com/gradio-app/gradio/pull/6942) [`b1b78c2`](https://github.com/gradio-app/gradio/commit/b1b78c2168e24fb65251a9b9b6cbc9382179a8ca) - Fix `.select` for `gr.Image`, `gr.CheckboxGroup`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6899](https://github.com/gradio-app/gradio/pull/6899) [`bd11d6e`](https://github.com/gradio-app/gradio/commit/bd11d6e570755405eac637f1ef71b8d7be09ff67) - Remove the styles on the audio elements in the Chatbot component.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6871](https://github.com/gradio-app/gradio/pull/6871) [`d361a0f`](https://github.com/gradio-app/gradio/commit/d361a0f179752d9e849ec420fc67c8b4060fc154) - Ensure camera settings only update when necessary in Model3D.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6938](https://github.com/gradio-app/gradio/pull/6938) [`459c5dc`](https://github.com/gradio-app/gradio/commit/459c5dc989849b1f0134467d260710fe891045d6) - replacing distutils.StrictVersion dependency for Python 3.12.  Thanks [@velaia](https://github.com/velaia)!
- [#6956](https://github.com/gradio-app/gradio/pull/6956) [`7bab755`](https://github.com/gradio-app/gradio/commit/7bab755f7c4cf38102c87d825066ff49b518222e) - Fixed (this this).  Thanks [@Cassini-chris](https://github.com/Cassini-chris)!
- [#6874](https://github.com/gradio-app/gradio/pull/6874) [`31c2316`](https://github.com/gradio-app/gradio/commit/31c23166f0113ab6506575f345c31c952e57e137) - fix issue 6873: File with file_count='directory' bug.  Thanks [@joshwilson-dev](https://github.com/joshwilson-dev)!
- [#6940](https://github.com/gradio-app/gradio/pull/6940) [`c00da89`](https://github.com/gradio-app/gradio/commit/c00da89c3ec6aa9ce43b25f12fde575d681d6870) - Fix returning copies of a component instance from a prediction function.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.12.0

### Features

- [#6839](https://github.com/gradio-app/gradio/pull/6839) [`e974cf0`](https://github.com/gradio-app/gradio/commit/e974cf045c82ce8d79efdda36b9dbf6ea557baa4) - Custom JS Guide.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6854](https://github.com/gradio-app/gradio/pull/6854) [`e528f98`](https://github.com/gradio-app/gradio/commit/e528f98b88f4322f61d315e1770fce0448ca5e26) - chore(deps): update dependency mrmime to v2.  Thanks [@renovate](https://github.com/apps/renovate)!

### Fixes

- [#6863](https://github.com/gradio-app/gradio/pull/6863) [`d406855`](https://github.com/gradio-app/gradio/commit/d4068557953746662235d595ec435c42ceb24414) - Fix JS Client when app is running behind a proxy.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6846](https://github.com/gradio-app/gradio/pull/6846) [`48d6534`](https://github.com/gradio-app/gradio/commit/48d6534b40f80e7e70a4061f97d9f2e23ba77fe1) - Add `show_api` parameter to events, and fix `gr.load()`. Also makes some minor improvements to the "view API" page when running on Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6865](https://github.com/gradio-app/gradio/pull/6865) [`15c97c6`](https://github.com/gradio-app/gradio/commit/15c97c6d346c475141d20615b5a865e9c44bdc76) - Fix webcam when `streaming=True`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6767](https://github.com/gradio-app/gradio/pull/6767) [`7bb561a`](https://github.com/gradio-app/gradio/commit/7bb561a294ca41d1044927cb34d8645c4175cae0) - Rewriting parts of the README and getting started guides for 4.0.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.11.0

### Features

- [#6842](https://github.com/gradio-app/gradio/pull/6842) [`846d52d`](https://github.com/gradio-app/gradio/commit/846d52d1c92d429077382ce494eea27fd062d9f6) - Fix md highlight.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6831](https://github.com/gradio-app/gradio/pull/6831) [`f3abde8`](https://github.com/gradio-app/gradio/commit/f3abde80884d96ad69b825020c46486d9dd5cac5) - Add an option to enable header links for markdown.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6814](https://github.com/gradio-app/gradio/pull/6814) [`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d) - Refactor queue so that there are separate queues for each concurrency id.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6809](https://github.com/gradio-app/gradio/pull/6809) [`1401d99`](https://github.com/gradio-app/gradio/commit/1401d99ade46d87da75b5f5808a3354c49f1d1ea) - Fix `ImageEditor` interaction story.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6803](https://github.com/gradio-app/gradio/pull/6803) [`77c9003`](https://github.com/gradio-app/gradio/commit/77c900311e2ba37b8f849ce088ceb48aa196af18) - Fixes issue 5781: Enables specifying a caching directory for Examples.  Thanks [@cswamy](https://github.com/cswamy)!
- [#6823](https://github.com/gradio-app/gradio/pull/6823) [`67a2b7f`](https://github.com/gradio-app/gradio/commit/67a2b7f12cb06355fcc41e40d47e8b2ad211d7d1) - Fixed duplicate word ("this this").  Thanks [@Cassini-chris](https://github.com/Cassini-chris)!
- [#6833](https://github.com/gradio-app/gradio/pull/6833) [`1b9d423`](https://github.com/gradio-app/gradio/commit/1b9d4234d6c25ef250d882c7b90e1f4039ed2d76) - Prevent file traversals.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#6829](https://github.com/gradio-app/gradio/pull/6829) [`50496f9`](https://github.com/gradio-app/gradio/commit/50496f967f8209032b753912a4379eb9cea66627) - Adjust rounding logic when precision is `None` in `gr.Number()`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6766](https://github.com/gradio-app/gradio/pull/6766) [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144) - Improve source selection UX.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 4.10.0

### Features

- [#6798](https://github.com/gradio-app/gradio/pull/6798) [`245d58e`](https://github.com/gradio-app/gradio/commit/245d58eff788e8d44a59d37a2d9b26d0f08a62b4) - Improve how server/js client handle unexpected errors.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6794](https://github.com/gradio-app/gradio/pull/6794) [`7ba8c5d`](https://github.com/gradio-app/gradio/commit/7ba8c5da45b004edd12c0460be9222f5b5f5f055) - Fix SSRF vulnerability on `/file=` route.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#6799](https://github.com/gradio-app/gradio/pull/6799) [`c352811`](https://github.com/gradio-app/gradio/commit/c352811f76d4126613ece0a584f8c552fdd8d1f6) - Adds docstrings for `gr.WaveformOptions`, `gr.Brush`, and `gr.Eraser`, fixes examples for `ImageEditor`, and allows individual images to be used as the initial `value` for `ImageEditor`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6808](https://github.com/gradio-app/gradio/pull/6808) [`6b130e2`](https://github.com/gradio-app/gradio/commit/6b130e26b9a6061e7984923b355a04a5484a1c96) - Ensure LoginButton `value` text is displayed.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6810](https://github.com/gradio-app/gradio/pull/6810) [`526fb6c`](https://github.com/gradio-app/gradio/commit/526fb6c446468f1567d614c83266bb5f5797ce9c) - Fix `gr.load()` so that it works with the SSE v1 protocol.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.9.1

### Features

- [#6781](https://github.com/gradio-app/gradio/pull/6781) [`a807ede`](https://github.com/gradio-app/gradio/commit/a807ede818e0690949aca41020e75a96f0110ece) - Fix backend tests on Windows.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#6525](https://github.com/gradio-app/gradio/pull/6525) [`5d51fbc`](https://github.com/gradio-app/gradio/commit/5d51fbce7826da840a2fd4940feb5d9ad6f1bc5a) - Fixes Drag and Drop for Upload.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6780](https://github.com/gradio-app/gradio/pull/6780) [`51e241a`](https://github.com/gradio-app/gradio/commit/51e241addd20dad9a0cdf3e72f747cab112815d1) - Fix flaky CI tests (again 😓 ).  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6693](https://github.com/gradio-app/gradio/pull/6693) [`34f9431`](https://github.com/gradio-app/gradio/commit/34f943101bf7dd6b8a8974a6131c1ed7c4a0dac0) - Python client properly handles hearbeat and log messages. Also handles responses longer than 65k.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 4.9.0

### Features

- [#6726](https://github.com/gradio-app/gradio/pull/6726) [`21cfb0a`](https://github.com/gradio-app/gradio/commit/21cfb0acc309bb1a392f4d8a8e42f6be864c5978) - Remove the styles from the Image/Video primitive components and Fix the container styles.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6398](https://github.com/gradio-app/gradio/pull/6398) [`67ddd40`](https://github.com/gradio-app/gradio/commit/67ddd40b4b70d3a37cb1637c33620f8d197dbee0) - Lite v4.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6399](https://github.com/gradio-app/gradio/pull/6399) [`053bec9`](https://github.com/gradio-app/gradio/commit/053bec98be1127e083414024e02cf0bebb0b5142) - Improve CSS token documentation in Storybook.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6745](https://github.com/gradio-app/gradio/pull/6745) [`3240d04`](https://github.com/gradio-app/gradio/commit/3240d042e907a3f2f679c2310c0dc6a688d2c07e) - Add `editable` parameter to Audio.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6616](https://github.com/gradio-app/gradio/pull/6616) [`9a0bd27`](https://github.com/gradio-app/gradio/commit/9a0bd27502894e2488b4732be081cb2027aa636e) - Add support for OAuth tokens.  Thanks [@Wauplin](https://github.com/Wauplin)!
- [#6738](https://github.com/gradio-app/gradio/pull/6738) [`f3c4d78`](https://github.com/gradio-app/gradio/commit/f3c4d78b710854b94d9a15db78178e504a02c680) - reload on css changes + fix css specificity.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6671](https://github.com/gradio-app/gradio/pull/6671) [`299f5e2`](https://github.com/gradio-app/gradio/commit/299f5e238bb6fb3f51376ef8b73fc44351859bbe) - Update HF token used in CI tests.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6680](https://github.com/gradio-app/gradio/pull/6680) [`cfd5700`](https://github.com/gradio-app/gradio/commit/cfd57005bce715271c3073ecd322890b8d30f594) - Cause `gr.ClearButton` to reset the value of `gr.State`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6603](https://github.com/gradio-app/gradio/pull/6603) [`6b1401c`](https://github.com/gradio-app/gradio/commit/6b1401c514c2ec012b0a50c72a6ec81cb673bf1d) - chore(deps): update dependency marked to v11.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#6666](https://github.com/gradio-app/gradio/pull/6666) [`30c9fbb`](https://github.com/gradio-app/gradio/commit/30c9fbb5c74f0dc879e85dbdb6778c0782aeff38) - Set gradio api server from env.  Thanks [@aisensiy](https://github.com/aisensiy)!
- [#6677](https://github.com/gradio-app/gradio/pull/6677) [`51b54b3`](https://github.com/gradio-app/gradio/commit/51b54b3411934ce46a27e7d525dd90b43c9fc016) - Tweak to our bug issue template.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6598](https://github.com/gradio-app/gradio/pull/6598) [`7cbf96e`](https://github.com/gradio-app/gradio/commit/7cbf96e0bdd12db7ecac7bf99694df0a912e5864) - Issue 5245: consolidate usage of requests and httpx.  Thanks [@cswamy](https://github.com/cswamy)!
- [#6704](https://github.com/gradio-app/gradio/pull/6704) [`24e0481`](https://github.com/gradio-app/gradio/commit/24e048196e8f7bd309ef5c597d4ffc6ca4ed55d0) - Hotfix: update `huggingface_hub` dependency version.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6432](https://github.com/gradio-app/gradio/pull/6432) [`bdf81fe`](https://github.com/gradio-app/gradio/commit/bdf81fead86e1d5a29e6b036f1fff677f6480e6b) - Lite: Set the home dir path per appId at each runtime.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6569](https://github.com/gradio-app/gradio/pull/6569) [`4d1cbbc`](https://github.com/gradio-app/gradio/commit/4d1cbbcf30833ef1de2d2d2710c7492a379a9a00) - Allow passing height and width as string in `Blocks.svelte`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6416](https://github.com/gradio-app/gradio/pull/6416) [`5177132`](https://github.com/gradio-app/gradio/commit/5177132d718c77f6d47869b4334afae6380394cb) - Lite: Fix the `isMessagePort()` type guard in js/wasm/src/worker-proxy.ts.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6543](https://github.com/gradio-app/gradio/pull/6543) [`8a70e83`](https://github.com/gradio-app/gradio/commit/8a70e83db9c7751b46058cdd2514e6bddeef6210) - switch from black to ruff formatter.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!

### Fixes

- [#6709](https://github.com/gradio-app/gradio/pull/6709) [`6a9151d`](https://github.com/gradio-app/gradio/commit/6a9151d5c9432c724098da7d88a539aaaf5ffe88) - Remove progress animation on streaming.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6660](https://github.com/gradio-app/gradio/pull/6660) [`5238053`](https://github.com/gradio-app/gradio/commit/523805360bbf292d9d82443b1f521528beba68bb) - Fix reload mode warning about not being able to find the app.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6672](https://github.com/gradio-app/gradio/pull/6672) [`1234c37`](https://github.com/gradio-app/gradio/commit/1234c3732b52327a00b917af2ef75821771e2c92) - use gr.Error for audio length errors.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6676](https://github.com/gradio-app/gradio/pull/6676) [`fe40308`](https://github.com/gradio-app/gradio/commit/fe40308894efb2c6ff18e5e328163f6641b7476c) - Rotate Images to Upright Position in preprocess.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6487](https://github.com/gradio-app/gradio/pull/6487) [`9a5811d`](https://github.com/gradio-app/gradio/commit/9a5811df9218b622af59ba243a937a9c36ba00f9) - Fix the download button of the `gr.Gallery()` component to work.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6689](https://github.com/gradio-app/gradio/pull/6689) [`c9673ca`](https://github.com/gradio-app/gradio/commit/c9673cacd6470296ee01d7717e2080986e750572) - Fix directory-only glob for FileExplorer.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6639](https://github.com/gradio-app/gradio/pull/6639) [`9a6ff70`](https://github.com/gradio-app/gradio/commit/9a6ff704cd8429289c5376d3af5e4b8492df4773) - Fix issue with `head` param when adding more than one script tag.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6556](https://github.com/gradio-app/gradio/pull/6556) [`d76bcaa`](https://github.com/gradio-app/gradio/commit/d76bcaaaf0734aaf49a680f94ea9d4d22a602e70) - Fix api event drops.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6754](https://github.com/gradio-app/gradio/pull/6754) [`a1b966e`](https://github.com/gradio-app/gradio/commit/a1b966edf761a20ef30e688b1ea1641a5ef1c860) - Fixed an issue where files could not be filed.  Thanks [@duolabmeng6](https://github.com/duolabmeng6)!
- [#6694](https://github.com/gradio-app/gradio/pull/6694) [`dfc61ec`](https://github.com/gradio-app/gradio/commit/dfc61ec4d09da72ddd6e7ab726820529621dbd38) - Fix dropdown blur bug when values are provided as tuples.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6691](https://github.com/gradio-app/gradio/pull/6691) [`128ab5d`](https://github.com/gradio-app/gradio/commit/128ab5d65b51390e706a515a1708fe6c88659209) - Ensure checked files persist after FileExplorer rerenders.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6698](https://github.com/gradio-app/gradio/pull/6698) [`798eca5`](https://github.com/gradio-app/gradio/commit/798eca524d44289c536c47eec7c4fdce9fe81905) - Fit video media within Video component.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6759](https://github.com/gradio-app/gradio/pull/6759) [`28a7aa9`](https://github.com/gradio-app/gradio/commit/28a7aa917f6a0d57af2c18261d1c01ff76423030) - Mount on a FastAPI app with lifespan manager.  Thanks [@Xmaster6y](https://github.com/Xmaster6y)!

## 4.8.0

### Features

- [#6624](https://github.com/gradio-app/gradio/pull/6624) [`1751f14`](https://github.com/gradio-app/gradio/commit/1751f14c1b26c72c0fcc6ba4c69c060c7a199e5d) - Remove 2 slider demos from docs.  Thanks [@aliabd](https://github.com/aliabd)!
- [#6622](https://github.com/gradio-app/gradio/pull/6622) [`4396f3f`](https://github.com/gradio-app/gradio/commit/4396f3f8f0984d7fcd7e1b88a793af86c7d4e5bb) - Fix encoding issue #6364 of reload mode.  Thanks [@curiousRay](https://github.com/curiousRay)!
- [#5885](https://github.com/gradio-app/gradio/pull/5885) [`9919b8a`](https://github.com/gradio-app/gradio/commit/9919b8ab43bee3d1d7cc65fd641fc8bc9725e102) - Fix the docstring decoration.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6565](https://github.com/gradio-app/gradio/pull/6565) [`9bf1ad4`](https://github.com/gradio-app/gradio/commit/9bf1ad43eac543c9991e59f37e1910f217f8d739) - Fix uploaded file wasn't moved to custom temp dir at different disks.  Thanks [@dodysw](https://github.com/dodysw)!
- [#6584](https://github.com/gradio-app/gradio/pull/6584) [`9bcb1da`](https://github.com/gradio-app/gradio/commit/9bcb1da189a9738d023ef6daad8c6c827e3f6371) - Feat: make UploadButton accept icon.  Thanks [@Justin-Xiang](https://github.com/Justin-Xiang)!
- [#6512](https://github.com/gradio-app/gradio/pull/6512) [`4f040c7`](https://github.com/gradio-app/gradio/commit/4f040c752bb3b0586a4e16eca25a1e5f596eee48) - Update zh-CN.json.  Thanks [@cibimo](https://github.com/cibimo)!

### Fixes

- [#6607](https://github.com/gradio-app/gradio/pull/6607) [`13ace03`](https://github.com/gradio-app/gradio/commit/13ace035ed58f14f8f5ce584d94b81c56f83b5d4) - Update file_explorer.py - Fixing error if nothing selected in file_count=single mode (return None rather).  Thanks [@v-chabaux](https://github.com/v-chabaux)!
- [#6574](https://github.com/gradio-app/gradio/pull/6574) [`2b625ad`](https://github.com/gradio-app/gradio/commit/2b625ad9403c3449b34a8a3da68ae48c4347c2db) - Ensure Chatbot messages are properly aligned when `rtl` is true.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6635](https://github.com/gradio-app/gradio/pull/6635) [`b639e04`](https://github.com/gradio-app/gradio/commit/b639e040741e6c0d9104271c81415d7befbd8cf3) - Quick Image + Text Component Fixes.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6572](https://github.com/gradio-app/gradio/pull/6572) [`206af31`](https://github.com/gradio-app/gradio/commit/206af31d7c1a31013364a44e9b40cf8df304ba50) - Improve like/dislike functionality.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6566](https://github.com/gradio-app/gradio/pull/6566) [`d548202`](https://github.com/gradio-app/gradio/commit/d548202d2b5bd8a99e3ebc5bf56820b0282ce0f5) - Improve video trimming and error handling.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6653](https://github.com/gradio-app/gradio/pull/6653) [`d92c819`](https://github.com/gradio-app/gradio/commit/d92c8194191d0e3530d6780a72d6f5c4c545e175) - Add concurrency_limit to ChatInterface, add IDE support for concurrency_limit.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6551](https://github.com/gradio-app/gradio/pull/6551) [`8fc562a`](https://github.com/gradio-app/gradio/commit/8fc562a8abc0932fc312ac33bcc015f6cf2700f6) - Add `show_recording_waveform` to Audio.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6550](https://github.com/gradio-app/gradio/pull/6550) [`3156598`](https://github.com/gradio-app/gradio/commit/315659817e5e67a04a1375d35ea6fa58d20622d2) - Make FileExplorer work on python 3.8 and 3.9. Also make it update on changes to root, glob, or glob_dir.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6602](https://github.com/gradio-app/gradio/pull/6602) [`b8034a1`](https://github.com/gradio-app/gradio/commit/b8034a1e72c3aac649ee0ad9178ffdbaaa60fc61) - Fix: Gradio Client work with private Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.7.1

### Features

- [#6537](https://github.com/gradio-app/gradio/pull/6537) [`6d3fecfa4`](https://github.com/gradio-app/gradio/commit/6d3fecfa42dde1c70a60c397434c88db77289be6) - chore(deps): update all non-major dependencies.  Thanks [@renovate](https://github.com/apps/renovate)!

### Fixes

- [#6530](https://github.com/gradio-app/gradio/pull/6530) [`13ef0f0ca`](https://github.com/gradio-app/gradio/commit/13ef0f0caa13e5a1cea70d572684122419419599) - Quick fix: Make component interactive when it is in focus.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 4.6.0

### Features

- [#6532](https://github.com/gradio-app/gradio/pull/6532) [`96290d304`](https://github.com/gradio-app/gradio/commit/96290d304a61064b52c10a54b2feeb09ca007542) - tweak deps.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6511](https://github.com/gradio-app/gradio/pull/6511) [`71f1a1f99`](https://github.com/gradio-app/gradio/commit/71f1a1f9931489d465c2c1302a5c8d768a3cd23a) - Mark `FileData.orig_name` optional on the frontend aligning the type definition on the Python side.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6520](https://github.com/gradio-app/gradio/pull/6520) [`f94db6b73`](https://github.com/gradio-app/gradio/commit/f94db6b7319be902428887867500311a6a32a165) - File table style with accessible file name texts.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6523](https://github.com/gradio-app/gradio/pull/6523) [`63f466882`](https://github.com/gradio-app/gradio/commit/63f466882104453b56a7f52c6bea5b5d497ec698) - Fix typo in base.py.  Thanks [@eltociear](https://github.com/eltociear)!
- [#6296](https://github.com/gradio-app/gradio/pull/6296) [`46f13f496`](https://github.com/gradio-app/gradio/commit/46f13f4968c8177e318c9d75f2eed1ed55c2c042) - chore(deps): update all non-major dependencies.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#6517](https://github.com/gradio-app/gradio/pull/6517) [`901f3eebd`](https://github.com/gradio-app/gradio/commit/901f3eebda0a67fa8f3050d80f7f7b5800c7f566) - Allow reselecting the original option in `gr.Dropdown` after value has changed programmatically.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6538](https://github.com/gradio-app/gradio/pull/6538) [`147926196`](https://github.com/gradio-app/gradio/commit/147926196a074d3fe62e59b5a80997e133c0f707) - Some tweaks to `ImageEditor`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6518](https://github.com/gradio-app/gradio/pull/6518) [`d4e3a5189`](https://github.com/gradio-app/gradio/commit/d4e3a518905620c184a0315ff3bdfbf5e7945bd6) - Allows setting parameters of `gr.ChatInterface`'s `Accordion`.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#6528](https://github.com/gradio-app/gradio/pull/6528) [`f53b01cbf`](https://github.com/gradio-app/gradio/commit/f53b01cbfbfccec66e0cda1d428ef72f05a3dfc0) - Fix Theme Dropdown in deployed theme space.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6546](https://github.com/gradio-app/gradio/pull/6546) [`a424fdbb2`](https://github.com/gradio-app/gradio/commit/a424fdbb2389219661b9a73197f4cc095a08cfe9) - Ensure audio waveform `autoplay` updates.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6536](https://github.com/gradio-app/gradio/pull/6536) [`1bbd6cab3`](https://github.com/gradio-app/gradio/commit/1bbd6cab3f0abe183b514b82061f0937c8480966) - Fix undefined `data` TypeError in Blocks.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6500](https://github.com/gradio-app/gradio/pull/6500) [`830b6c0e6`](https://github.com/gradio-app/gradio/commit/830b6c0e6e52c4fa33fddfa4d3f6162e29801f74) - Process and convert .svg files in `Image`.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 4.5.0

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

- [#6497](https://github.com/gradio-app/gradio/pull/6497) [`1baed201b`](https://github.com/gradio-app/gradio/commit/1baed201b12ecb5791146aed9a86b576c3595130) - Fix SourceFileReloader to watch the module with a qualified name to avoid importing a module with the same name from a different path.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6502](https://github.com/gradio-app/gradio/pull/6502) [`070f71c93`](https://github.com/gradio-app/gradio/commit/070f71c933d846ce8e2fe11cdd9bc0f3f897f29f) - Ensure image editor crop and draw cursor works as expected when the scroll position changes.  Thanks [@pngwn](https://github.com/pngwn)!

## 4.4.1

### Features

- [#6467](https://github.com/gradio-app/gradio/pull/6467) [`739e3a5a0`](https://github.com/gradio-app/gradio/commit/739e3a5a09771a4a386cab0c6605156cf9fda7f6) - Fix dev mode.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 4.4.0

### Features

- [#6428](https://github.com/gradio-app/gradio/pull/6428) [`ac4ca59c9`](https://github.com/gradio-app/gradio/commit/ac4ca59c929bbe0bdf92155766883797d4e01ea0) - Extract video filenames correctly from URLs.  Thanks [@112292454](https://github.com/112292454)!
- [#6461](https://github.com/gradio-app/gradio/pull/6461) [`6b53330a5`](https://github.com/gradio-app/gradio/commit/6b53330a5be53579d9128aea4858713082ce302d) - UploadButton tests.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6439](https://github.com/gradio-app/gradio/pull/6439) [`a1e3c61f4`](https://github.com/gradio-app/gradio/commit/a1e3c61f41b16166656b46254a201b37abcf20a8) - Allow setting a `default_concurrency_limit` other than 1.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6455](https://github.com/gradio-app/gradio/pull/6455) [`179f5bcde`](https://github.com/gradio-app/gradio/commit/179f5bcde16539bb9e828685d95dcd2167d3a215) - Add py.typed to gradio backend.  Thanks [@aleneum](https://github.com/aleneum)!
- [#6436](https://github.com/gradio-app/gradio/pull/6436) [`58e3ca826`](https://github.com/gradio-app/gradio/commit/58e3ca8260a6635e10e7a7f141221c4f746e9386) - Custom Component CLI Improvements.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6462](https://github.com/gradio-app/gradio/pull/6462) [`2761b6d19`](https://github.com/gradio-app/gradio/commit/2761b6d197acc1c6a2fd9534e7633b463bd3f1e0) - Catch ValueError, KeyError when saving PIL Image.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6423](https://github.com/gradio-app/gradio/pull/6423) [`62d35c3d1`](https://github.com/gradio-app/gradio/commit/62d35c3d1b3e9d6e39bddbb32ff6b6cf9f1f7f72) - Issue 2085: Transformers object detection pipeline added.  Thanks [@cswamy](https://github.com/cswamy)!
- [#6456](https://github.com/gradio-app/gradio/pull/6456) [`3953a1467`](https://github.com/gradio-app/gradio/commit/3953a146750b09161b50d972590cae8bf980990c) - Preserve original image extension in backend processing.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6427](https://github.com/gradio-app/gradio/pull/6427) [`e0fc14659`](https://github.com/gradio-app/gradio/commit/e0fc146598ba9b081bc5fa9616d0a41c2aba2427) - Allow google analytics to work on Spaces (and other iframe situations).  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6419](https://github.com/gradio-app/gradio/pull/6419) [`1959471a8`](https://github.com/gradio-app/gradio/commit/1959471a8d939275c7b9184913a5a6f92e567604) - Add download tests for audio/video.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6424](https://github.com/gradio-app/gradio/pull/6424) [`2727f45fb`](https://github.com/gradio-app/gradio/commit/2727f45fb0c9c3116a7e1a3f88cb3a401c4c7e93) - Do not show warnings when renaming api_names.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6437](https://github.com/gradio-app/gradio/pull/6437) [`727ae2597`](https://github.com/gradio-app/gradio/commit/727ae2597603f026d74d5acafac8709326300836) - chore: rename api_key to hf_token.  Thanks [@NickCrews](https://github.com/NickCrews)!

### Fixes

- [#6441](https://github.com/gradio-app/gradio/pull/6441) [`2f805a7dd`](https://github.com/gradio-app/gradio/commit/2f805a7dd3d2b64b098f659dadd5d01258290521) - Small but important bugfixes for gr.Image: The upload event was not triggering at all. The paste-from-clipboard was not triggering an upload event. The clear button was not triggering a change event. The change event was triggering infinitely. Uploaded images were not preserving their original names. Uploading a new image should clear out the previous image.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6454](https://github.com/gradio-app/gradio/pull/6454) [`2777f326e`](https://github.com/gradio-app/gradio/commit/2777f326e595541fbec8ce14f56340b9e740f1da) - Ensure Audio ouput events are dispatched.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6254](https://github.com/gradio-app/gradio/pull/6254) [`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a) - Add volume control to Audio.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6457](https://github.com/gradio-app/gradio/pull/6457) [`d00fcf89d`](https://github.com/gradio-app/gradio/commit/d00fcf89d1c3ecbc910e81bb1311479ec2b73e4e) - Gradio custom component dev mode now detects changes to Example.svelte file.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6418](https://github.com/gradio-app/gradio/pull/6418) [`bce6ca109`](https://github.com/gradio-app/gradio/commit/bce6ca109feadd6ba94a69843689cefc381dd054) - Send more than one heartbeat message.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6425](https://github.com/gradio-app/gradio/pull/6425) [`b3ba17dd1`](https://github.com/gradio-app/gradio/commit/b3ba17dd1167d254756d93f1fb01e8be071819b6) - Update the selected indices in `Dropdown` when value changes programmatically.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.3.0

### Features

- [#6395](https://github.com/gradio-app/gradio/pull/6395) [`8ef48f852`](https://github.com/gradio-app/gradio/commit/8ef48f85241a0f06f4bcdaa0a2010917b3a536be) - Async functions and async generator functions with the `every` option to work.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6403](https://github.com/gradio-app/gradio/pull/6403) [`9cfeb4f17`](https://github.com/gradio-app/gradio/commit/9cfeb4f17e76efad7772e0cbe53dfb3e8310f565) - Remove  websockets dependency.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6406](https://github.com/gradio-app/gradio/pull/6406) [`0401c77f3`](https://github.com/gradio-app/gradio/commit/0401c77f3d35763b79e040dbe876e69083defd36) - Move ffmpeg to `Video` deps.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6099](https://github.com/gradio-app/gradio/pull/6099) [`d84209703`](https://github.com/gradio-app/gradio/commit/d84209703b7a0728cdb49221e543500ddb6a8d33) - Lite: SharedWorker mode.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6412](https://github.com/gradio-app/gradio/pull/6412) [`649f3ceb6`](https://github.com/gradio-app/gradio/commit/649f3ceb6c784c82fa88bdb7f04535f6419b14dd) - Added docs on gr.Examples.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6378](https://github.com/gradio-app/gradio/pull/6378) [`d31d8c6ad`](https://github.com/gradio-app/gradio/commit/d31d8c6ad888aa4f094820d07288e9d0e2778521) - Allows `sources` to be a string for `gr.Image`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6382](https://github.com/gradio-app/gradio/pull/6382) [`2090aad73`](https://github.com/gradio-app/gradio/commit/2090aad731b186ef0a3f63ec2b4d1a6e3acb1754) - Move wavesurfer dep to js/audio.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6383](https://github.com/gradio-app/gradio/pull/6383) [`324867f63`](https://github.com/gradio-app/gradio/commit/324867f63c920113d89a565892aa596cf8b1e486) - Fix event target.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6405](https://github.com/gradio-app/gradio/pull/6405) [`03491ef49`](https://github.com/gradio-app/gradio/commit/03491ef49708753fc51566c3dc17df09ae98fb98) - Fix docstrings and default value for `api_name`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6386](https://github.com/gradio-app/gradio/pull/6386) [`e76a9e8fc`](https://github.com/gradio-app/gradio/commit/e76a9e8fcbbfc393298de2aa539f2b152c0d6400) - Fix Chatbot Pending Message Issues.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6414](https://github.com/gradio-app/gradio/pull/6414) [`da1e31832`](https://github.com/gradio-app/gradio/commit/da1e31832f85ec76540e474ae35badfde8a18b6f) - Fix Model3D download button and other issues.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6379](https://github.com/gradio-app/gradio/pull/6379) [`de998b281`](https://github.com/gradio-app/gradio/commit/de998b28127ecef10c403890ff08674f527a3708) - Processes `avatar_images` for `gr.Chatbot` and `icon` for `gr.Button` correctly, so that respective files are moved to cache.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.2.0

### Features

- [#6333](https://github.com/gradio-app/gradio/pull/6333) [`42f76aeeb`](https://github.com/gradio-app/gradio/commit/42f76aeeb7b7263abccc038b699fb7fae7fe2313) - Add AsyncGenerator to the check-list of `dependencies.types.generator`.  Thanks [@whitphx](https://github.com/whitphx)!
- [#6347](https://github.com/gradio-app/gradio/pull/6347) [`d64787b88`](https://github.com/gradio-app/gradio/commit/d64787b885a26ecb6771bfdd20aac33c8a90afe6) - Fix `colorFrom` in theme space readmes.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6363](https://github.com/gradio-app/gradio/pull/6363) [`4d3aad33a`](https://github.com/gradio-app/gradio/commit/4d3aad33a0b66639dbbb2928f305a79fb7789b2d) - Fix image upload.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6356](https://github.com/gradio-app/gradio/pull/6356) [`854b482f5`](https://github.com/gradio-app/gradio/commit/854b482f598e0dc47673846631643c079576da9c) - Redesign file upload.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6343](https://github.com/gradio-app/gradio/pull/6343) [`37dd335e5`](https://github.com/gradio-app/gradio/commit/37dd335e5f04a8e689dd7f23ae24ad1934ea08d8) - Fix audio streaming output issues in 4.0.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6307](https://github.com/gradio-app/gradio/pull/6307) [`f1409f95e`](https://github.com/gradio-app/gradio/commit/f1409f95ed39c5565bed6a601e41f94e30196a57) - Provide status updates on file uploads.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6368](https://github.com/gradio-app/gradio/pull/6368) [`8a3f45c26`](https://github.com/gradio-app/gradio/commit/8a3f45c2612a36112d797465e14cd6f1801ccbd9) - Fix component update bug.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6322](https://github.com/gradio-app/gradio/pull/6322) [`6204ccac5`](https://github.com/gradio-app/gradio/commit/6204ccac5967763e0ebde550d04d12584243a120) - Fixes `gr.load()` so it works properly with Images and Examples.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6323](https://github.com/gradio-app/gradio/pull/6323) [`55fda81fa`](https://github.com/gradio-app/gradio/commit/55fda81fa5918b48952729232d6e2fc55af9351d) - Textbox and Code Component Blur/Focus Fixes.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 4.1.2

### Features

- [#6318](https://github.com/gradio-app/gradio/pull/6318) [`d3b53a457`](https://github.com/gradio-app/gradio/commit/d3b53a4577ea05cd27e37ce7fec952028c18ed45) - Fix for stylized DataFrame.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6326](https://github.com/gradio-app/gradio/pull/6326) [`ed546f2e1`](https://github.com/gradio-app/gradio/commit/ed546f2e13915849b0306d017c40933b856bb792) - Fix Model3D template.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6310](https://github.com/gradio-app/gradio/pull/6310) [`dfdaf1092`](https://github.com/gradio-app/gradio/commit/dfdaf109263b7b88c125558028ee9609f817fd10) - Fix data model for `gr.DataFrame`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6316](https://github.com/gradio-app/gradio/pull/6316) [`4b1011bab`](https://github.com/gradio-app/gradio/commit/4b1011bab03c0b6a09329e0beb9c1b17b2189878) - Maintain text selection in `Chatbot` button elements.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6327](https://github.com/gradio-app/gradio/pull/6327) [`bca6c2c80`](https://github.com/gradio-app/gradio/commit/bca6c2c80f7e5062427019de45c282238388af95) - Restore query parameters in request.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6317](https://github.com/gradio-app/gradio/pull/6317) [`19af2806a`](https://github.com/gradio-app/gradio/commit/19af2806a58419cc551d2d1d6d8987df0db91ccb) - Add autoplay to `waveform_settings`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6294](https://github.com/gradio-app/gradio/pull/6294) [`7ab73df48`](https://github.com/gradio-app/gradio/commit/7ab73df48ea9dc876c1eaedfb424fcead6326dc9) - fix regarding callable function error.  Thanks [@SrijanSahaySrivastava](https://github.com/SrijanSahaySrivastava)!
- [#6279](https://github.com/gradio-app/gradio/pull/6279) [`3cdeabc68`](https://github.com/gradio-app/gradio/commit/3cdeabc6843000310e1a9e1d17190ecbf3bbc780) - Ensure source selection does not get hidden in overflow.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6311](https://github.com/gradio-app/gradio/pull/6311) [`176c4d140`](https://github.com/gradio-app/gradio/commit/176c4d140000b1be698b6caf0d0efd26a5c7897d) - Temporary fix to be able to load themes from Hub.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6314](https://github.com/gradio-app/gradio/pull/6314) [`fad92c29d`](https://github.com/gradio-app/gradio/commit/fad92c29dc1f5cd84341aae417c495b33e01245f) - Improve default source behaviour in Audio.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6320](https://github.com/gradio-app/gradio/pull/6320) [`570866a3b`](https://github.com/gradio-app/gradio/commit/570866a3bd95a45a197afec38b982bbc6c7cd0a0) - Hide show API link when in gradio lite.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6309](https://github.com/gradio-app/gradio/pull/6309) [`c56128781`](https://github.com/gradio-app/gradio/commit/c561287812797aa1b6b464b0e76419350570ba83) - Fix updating choices in `gr.Dropdown` and updates related to other components.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.1.1

### Fixes

- [#6288](https://github.com/gradio-app/gradio/pull/6288) [`92278729e`](https://github.com/gradio-app/gradio/commit/92278729ee008126af15ffe6be399236211b2f34) - Gallery preview fix and optionally skip download of urls in postprcess.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6289](https://github.com/gradio-app/gradio/pull/6289) [`5668036ee`](https://github.com/gradio-app/gradio/commit/5668036eef89051c1dbc5a74dc20988a3012ccbd) - Fix file upload on windows.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6290](https://github.com/gradio-app/gradio/pull/6290) [`e8216be94`](https://github.com/gradio-app/gradio/commit/e8216be948f76ce064595183d11e9148badf9421) - ensure `gr.Dataframe` updates as expected.  Thanks [@pngwn](https://github.com/pngwn)!

## 4.1.0

### Features

- [#6261](https://github.com/gradio-app/gradio/pull/6261) [`8bbeca0e7`](https://github.com/gradio-app/gradio/commit/8bbeca0e772a5a2853d02a058b35abb2c15ffaf1) - Improve Embed and CDN handling and fix a couple of related bugs.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6241](https://github.com/gradio-app/gradio/pull/6241) [`61c155e9b`](https://github.com/gradio-app/gradio/commit/61c155e9ba0f8f7ebd5a2a71687597dafb842219) - Remove session if browser closed on mobile.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6227](https://github.com/gradio-app/gradio/pull/6227) [`4840b4bc2`](https://github.com/gradio-app/gradio/commit/4840b4bc297703d317cad9c0f566e857a20b9375) - Add that api routes are automatically named to CHANGELOG.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6240](https://github.com/gradio-app/gradio/pull/6240) [`dd901c1b0`](https://github.com/gradio-app/gradio/commit/dd901c1b0af73a78fca8b6875b2bb00f84071ac8) - Model3D panning, improved UX.  Thanks [@dylanebert](https://github.com/dylanebert)!
- [#6272](https://github.com/gradio-app/gradio/pull/6272) [`12d8e90a1`](https://github.com/gradio-app/gradio/commit/12d8e90a1646374b46eb8258be7356c868d1cca3) - Fixes input `Image` component with `streaming=True`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6268](https://github.com/gradio-app/gradio/pull/6268) [`de36820ef`](https://github.com/gradio-app/gradio/commit/de36820ef51097b47937b41fb76e4038aaa369cb) - Fix various issues with demos on website.  Thanks [@aliabd](https://github.com/aliabd)!
- [#6232](https://github.com/gradio-app/gradio/pull/6232) [`ac4f2bcde`](https://github.com/gradio-app/gradio/commit/ac4f2bcded61672bfe1d54c279d527de2eabdb7a) - Remove **kwargs from queue.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6255](https://github.com/gradio-app/gradio/pull/6255) [`e3ede2ff7`](https://github.com/gradio-app/gradio/commit/e3ede2ff7d4a36fb21bb0b146b8d5ad239c0e086) - Ensure Model 3D updates when attributes change.  Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#6266](https://github.com/gradio-app/gradio/pull/6266) [`e32bac894`](https://github.com/gradio-app/gradio/commit/e32bac8944c85e0ec4831963299889d6bbfa0351) - Fix updating interactive prop.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6213](https://github.com/gradio-app/gradio/pull/6213) [`27194a987`](https://github.com/gradio-app/gradio/commit/27194a987fa7ba1234b5fc0ce8bf7fabef7033a9) - Ensure the statustracker for `gr.Image` displays in static mode.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6234](https://github.com/gradio-app/gradio/pull/6234) [`aaa55ce85`](https://github.com/gradio-app/gradio/commit/aaa55ce85e12f95aba9299445e9c5e59824da18e) - Video/Audio fixes.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6236](https://github.com/gradio-app/gradio/pull/6236) [`6bce259c5`](https://github.com/gradio-app/gradio/commit/6bce259c5db7b21b327c2067e74ea20417bc89ec) - Ensure `gr.CheckboxGroup` updates as expected.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6262](https://github.com/gradio-app/gradio/pull/6262) [`afb72bd19`](https://github.com/gradio-app/gradio/commit/afb72bd1970e6c43ddba0638fe9861330bdabb64) - Fix bug where radio.select passes the previous value to the function instead of the selected value.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6231](https://github.com/gradio-app/gradio/pull/6231) [`3e31c1752`](https://github.com/gradio-app/gradio/commit/3e31c1752e0e5bf90339b816f9895529d9368bbd) - Add likeable to config for Chatbot.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6249](https://github.com/gradio-app/gradio/pull/6249) [`2cffcf3c3`](https://github.com/gradio-app/gradio/commit/2cffcf3c39acd782f314f8a406100ae22e0809b7) - ensure radios have different names.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6229](https://github.com/gradio-app/gradio/pull/6229) [`5cddd6588`](https://github.com/gradio-app/gradio/commit/5cddd658809d147fafef5e9502ccfab5bd105aa6) - Fixes: Initial message is overwrtitten in chat interface.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6277](https://github.com/gradio-app/gradio/pull/6277) [`5fe091367`](https://github.com/gradio-app/gradio/commit/5fe091367fbe0eecdd504aa734ca1c70b0621f52) - handle selected_index prop change for gallery.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6211](https://github.com/gradio-app/gradio/pull/6211) [`a4a931dd3`](https://github.com/gradio-app/gradio/commit/a4a931dd39a48bceac50486558b049ca7b874195) - fix`FileExplorer` preprocess.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5876](https://github.com/gradio-app/gradio/pull/5876) [`d7a1a6559`](https://github.com/gradio-app/gradio/commit/d7a1a6559005e6a1e0be03a3bd5212d1bc60d1ee) - Fix file overflow and add keyboard navigation to `FileExplorer`.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 4.0.2

### Fixes

- [#6191](https://github.com/gradio-app/gradio/pull/6191) [`b555bc09f`](https://github.com/gradio-app/gradio/commit/b555bc09ffe8e58b10da6227e2f11a0c084aa71d) - fix cdn build.  Thanks [@pngwn](https://github.com/pngwn)!

## 4.0.1

### Features

- [#6137](https://github.com/gradio-app/gradio/pull/6137) [`2ba14b284`](https://github.com/gradio-app/gradio/commit/2ba14b284f908aa13859f4337167a157075a68eb) - JS Param.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6181](https://github.com/gradio-app/gradio/pull/6181) [`62ec2075c`](https://github.com/gradio-app/gradio/commit/62ec2075ccad8025a7721a08d0f29eb5a4f87fad) - modify preprocess to use pydantic models.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 4.0.0

### Highlights

4.0 is a big release, so here are the main highlights:

**1. Custom Components**: 
We've introduced the ability to create and publish you own custom `gradio` components. A custom Gradio component is a combination of Python and JavaScript (specifically, Svelte) that you can write to fully customize a Gradio component. A custom component can be used just like a regular Gradio component (with `gr.Interface`, `gr.Blocks`, etc.) and can be published so that other users can use it within their apps. To get started with Custom Components, [read our quickstart guide here](https://www.gradio.app/guides/five-minute-guide).

<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMm9pbzhvaTd1MTFlM3FrMmRweTh1ZWZiMmpvemhpNnVvaXVoeDZ2byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/V3N5jnv0D1eKbPYins/giphy.gif">

**2. Redesigned Media Components and Accessibility**:

We redesigned our media components (`gr.Audio`, `gr.Image`, and `gr.Video`) from scratch and improved accessibilty across the board. All components are now keyboard navigable and include better colors to be usable by a wider audience.

<img src="https://media0.giphy.com/media/Kv1bAN7MX3ya5krkEU/giphy.gif">

**3. Server Side Events**: 

Gradio's built-in queuing system is now the default for every Gradio app. We now use Server Side Events instead of Websockets for the queue. SSE means everything is served over HTTP and has better device support and better scaling than websockets.

<img style="width:50%" src="https://i.imgur.com/ewUIuUc.png">

**4. Custom Share Servers**: 

Gradio share links can now run on custom domains. You can now set up your own server to serve Gradio share links. To get started, [read our guide here](https://github.com/huggingface/frp/).

<img style="width:50%" src="https://i.imgur.com/VFWVsqn.png">

5. We now support adding arbitrary JS to your apps using the `js` parameter in Blocks, and arbitrary modifications to the <head> of your app using the `head` parameter in Blocks

6. We no longer expose a user's working directory by default when you release a Gradio app. There are some other improvements around security as well.

7. Previously, a Gradio app's API endpoints were exposed, allowing you to bypass the queue. As a Gradio developer, you needed to set `api_open=False` to prevent this misuse. We've now made this the default.

8. You can now control whether a user should be able to trigger the same event multiple times (by using the `trigger_mode` parameter of each event)

9. You now have fine-grained control over how many times each event can be running concurrently in the backend (using the `concurrency_limit` parameter of each event)

10. We no longer serialize images into base64 before sending them to the server or on the way back. This should make any Gradio app that includes `gr.Image` components much faster.


### Breaking Changes

Gradio 4.0 is a new major version, and includes breaking changes from 3.x. Here's a list of all the breaking changes, along with migration steps where appropriate.

**Components**: 

* Removes `**kwarg` from every component, meaning that components cannot accept arbitrary (unused) parameters. Previously, warnings would be thrown.
* Removes deprecated parameters. For example, `plain` is no longer an alias for `secondary` for the `variant` argument in the `gr.Button` class
* Removes the deprecated `Carousel` class and `StatusTracker` class and `Box` layout class
* Removes the deprecated `Variable` alias for `State`
* Removes the deprecated `.style()` methods from component classes
* Removes the deprecated `.update()` method from component classes
* Removes `get_interpretation_neighbors()` and `get_interpretation_scores()` from component classes
* Removes `deprecation.py` -- this was designed for internal usage so unlikely to break gradio apps
* Moves save to cache methods from component methods to standalone functions in processing_utils
* Renames `source` param in `gr.Audio` and `gr.Video` to `sources`
* Removes `show_edit_button` param from `gr.Audio`
* The `tool=` argument in `gr.Image()` has been removed. As of `gradio==4.5.0`, we have a new `gr.ImageEditor` component that takes its place. The `ImageEditor` component is a streamlined component that allows you to do basic manipulation of images. It supports setting a background image (which can be uploaded, pasted, or recorded through a webcam), as well the ability to "edit" the background image by using a brush to create strokes and an eraser to erase strokes in layers on top of the background image. See the **Migrating to Gradio 4.0** section below.

**Other changes related to the `gradio` library**:

* Removes the deprecated `status_tracker` parameter from events
* Removes the deprecated `HuggingFaceDatasetJSONSaver` class
* Now `Blocks.load()` can only be use an is instance method to attach an event that runs when the page loads. To use the class method, use `gr.load()` instead
* Similarly, `Interface.load()` has been removed
* If you are runnin Gradio 4.x, you can not `gr.load` a Space that is running Gradio 3.x. However, you can still use the client libraries (see changes to the client libraries below).
* Removes deprecated parameters, such as `enable_queue` from `launch()`
* Many of the positional arguments in launch() are now keyword only, and show_tips has been removed
* Changes the format of flagged data to json instead of filepath for media and chatbot
* Removes `gr.Series` and `gr.Parallel`
* All API endpoints are named by deafult. If `api_name=None`, the api name is the name of the python function.


**Changes related to the Client libraries**:

* When using the gradio Client libraries in 3.x with any component that returned JSON data (including `gr.Chatbot`, `gr.Label`, and `gr.JSON`), the data would get saved to a file and the filepath would be returned. Similarly, you would have to pass input JSON as a filepath. Now, the JSON data is passed and returned directly, making it easier to work with these components using the clients. 

### Migrating to Gradio 4.0

Here are some concrete tips to help migrate to Gradio 4.0:

#### **Using `allowed_paths`**

Since the working directory is now not served by default, if you reference local files within your CSS or in a `gr.HTML` component using the `/file=` route, you will need to explicitly allow access to those files (or their parent directories) using the `allowed_paths` parameter in `launch()`

For example, if your code looks like this:

```py
import gradio as gr

with gr.Blocks() as demo:
    gr.HTML("<img src='/file=image.png' alt='image One'>")
    
demo.launch()
```

In order for the HTML component to be able to serve `image.png`, you will need to add `image.png` in `allowed_paths` like this:

```py
import gradio as gr

with gr.Blocks() as demo:
    gr.HTML("<img src='/file=image.png' alt='image One'>")
    
demo.launch(allowed_paths=["image.png"])
```

or if you want to expose all files in your working directory as was the case in Gradio 3.x (not recommended if you plan to share your app with others), you could do:

```py
import gradio as gr

with gr.Blocks() as demo:
    gr.HTML("<img src='/file=image.png' alt='image One'>")
    
demo.launch(allowed_paths=["."])
```


#### **Using `concurrency_limit` instead of `concurrency_count`**

Previously, in Gradio 3.x, there was a single global `concurrency_count` parameter that controlled how many threads could execute tasks from the queue simultaneously. By default `concurrency_count` was 1, which meant that only a single event could be executed at a time (to avoid OOM errors when working with prediction functions that utilized a large amount of memory or GPU usage). You could bypass the queue by setting `queue=False`. 

In Gradio 4.0, the `concurrency_count` parameter has been removed. You can still control the number of total threads by using the `max_threads` parameter. The default value of this parameter is `40`, but you don't have worry (as much) about OOM errors, because even though there are 40 threads, we use a single-worker-single-event model, which means each worker thread only executes a specific function. So effectively, each function has its own "concurrency count" of 1. If you'd like to change this behavior, you can do so by setting a parameter `concurrency_limit`, which is now a parameter of *each event*, not a global parameter. By default this is `1` for each event, but you can set it to a higher value, or to `None` if you'd like to allow an arbitrary number of executions of this event simultaneously. Events can also be grouped together using the `concurrency_id` parameter so that they share the same limit, and by default, events that call the same function share the same `concurrency_id`.

Lastly, it should be noted that the default value of the `concurrency_limit` of all events in a Blocks (which is normally 1) can be changed using the `default_concurrency_limit` parameter in `Blocks.queue()`. You can set this to a higher integer or to `None`. This in turn sets the `concurrency_limit` of all events that don't have an explicit `conurrency_limit` specified. 

To summarize migration:

* For events that execute quickly or don't use much CPU or GPU resources, you should set `concurrency_limit=None` in Gradio 4.0. (Previously you would set `queue=False`.)
* For events that take significant resources (like the prediction function of your machine learning model), and you only want 1 execution of this function at a time, you don't have to set any parameters.
* For events that take significant resources (like the prediction function of your machine learning model), and you only want `X` executions of this function at a time, you should set `concurrency_limit=X` parameter in the event trigger.(Previously you would set a global `concurrency_count=X`.)


**The new `ImageEditor` component**

In Gradio 4.0, the `tool=` argument in `gr.Image()` was removed. It has been replaced, as of Gradio 4.5.0, with a new `gr.ImageEditor()` component. The `ImageEditor` component is a streamlined component that allows you to do basic manipulation of images. It supports setting a background image (which can be uploaded, pasted, or recorded through a webcam), as well the ability to "edit" the background by using a brush to create strokes and an eraser to erase strokes in layers on top of the background image.

The `ImageEditor` component is much more performant and also offers much more flexibility to customize the component, particularly through the new `brush` and `eraser` arguments, which take `Brush` and `Eraser` objects respectively. 

Here are some examples of how you might migrate from `Image(tool=...)` to `gr.ImageEditor()`. 

* To create a sketchpad input that supports writing black strokes on a white background, you might have previously written:

```py
gr.Image(source="canvas", tools="sketch")
```

Now, you should write:

```py
gr.ImageEditor(sources=(), brush=gr.Brush(colors=["#000000"]))
```

Note: you can supply a list of supported stroke colors in `gr.Brush`, as well as control whether users can choose their own colors by setting the `color_mode` parameter of `gr.Brush` to be either `"fixed"` or `"defaults"`.

* If you want to create a sketchpad where users can draw in any color, simply omit the `brush` parameter. In other words, where previously, you would do:

```py
gr.Image(source="canvas", tools="color-sketch")
```

Now, you should write:

```py
gr.ImageEditor(sources=())
```


* If you want to allow users to choose a background image and then draw on the image, previously, you would do:

```py
gr.Image(source="upload", tools="color-sketch")
```

Now, this is the default behavior of the `ImageEditor` component, so you should just write:

```py
gr.ImageEditor()
```

Unlike the `Image` component, which passes the input image as a single value into the prediction function, the `ImageEditor` passes a dictionary consisting of three key-value pairs:

* the key `"background"`, whose value is the background image
* the key `"layers"`, which consists of a list of values, with the strokes in each layer corresponding to one list element.
* the key `"composite"`, whose value is to the complete image consisting of background image and all of the strokes.

The type of each value can be set by the `type` parameter (`"filepath"`, `"pil"`, or `"numpy"`, with the default being `"numpy"`), just like in the `Image` component.

Please see the documentation of the `gr.ImageEditor` component for more details: https://www.gradio.app/docs/imageeditor

### Features

- [#6184](https://github.com/gradio-app/gradio/pull/6184) [`86edc0199`](https://github.com/gradio-app/gradio/commit/86edc01995d9f888bac093c44c3d4535fe6483b3) - Remove gr.mix.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - fix circular dependency with client + upload.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6177](https://github.com/gradio-app/gradio/pull/6177) [`59f5a4e30`](https://github.com/gradio-app/gradio/commit/59f5a4e30ed9da1c6d6f6ab0886285150b3e89ec) - Part I: Remove serializes.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Don't serve files in working directory by default.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Small change to make `api_open=False` by default.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Add json schema unit tests.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Remove duplicate `elem_ids` from components.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6182](https://github.com/gradio-app/gradio/pull/6182) [`911829ac2`](https://github.com/gradio-app/gradio/commit/911829ac278080fc81155d4b75502692e72fd3de) - Allow data at queue join.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Moves `gradio_cached_folder` inside the gradio temp direcotry.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - V4: Fix constructor_args.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Remove interpretation for good.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Improve Audio Component.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - pass props to example components and to example outputs.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Clean root url.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Adds the ability to build the frontend and backend of custom components in preparation for publishing to pypi using `gradio_component build`.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Fix selectable prop in the backend.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Set api=False for cancel events.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Improve Video Component.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Try to trigger a major beta release.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6172](https://github.com/gradio-app/gradio/pull/6172) [`79c8156eb`](https://github.com/gradio-app/gradio/commit/79c8156ebbf35369dc9cfb1522f88df3cd49c89c) - Queue concurrency count.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Open source FRP server and allow `gradio` to connect to custom share servers.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - File upload optimization.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Removes deprecated arguments and parameters from v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - V4: Use async version of shutil in upload route.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - V4: Set cache dir for some component tests.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Proposal: sample demo for custom components should be a `gr.Interface`.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - fix cc build.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - --overwrite deletes previous content.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6171](https://github.com/gradio-app/gradio/pull/6171) [`28322422c`](https://github.com/gradio-app/gradio/commit/28322422cb9d8d3e471e439ad602959662e79312) - strip dangling svelte imports.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Swap websockets for SSE.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6153](https://github.com/gradio-app/gradio/pull/6153) [`1162ed621`](https://github.com/gradio-app/gradio/commit/1162ed6217fe58d66a1923834c390150599ad81f) - Remove `show_edit_button` param in Audio.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6124](https://github.com/gradio-app/gradio/pull/6124) [`a7435ba9e`](https://github.com/gradio-app/gradio/commit/a7435ba9e6f8b88a838e80893eb8fedf60ccda67) - Fix static issues with Lite on v4.  Thanks [@aliabd](https://github.com/aliabd)!
- [#6143](https://github.com/gradio-app/gradio/pull/6143) [`e4f7b4b40`](https://github.com/gradio-app/gradio/commit/e4f7b4b409323b01aa01b39e15ce6139e29aa073) - fix circular dependency with client + upload.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6142](https://github.com/gradio-app/gradio/pull/6142) [`103416d17`](https://github.com/gradio-app/gradio/commit/103416d17f021c82f5ff0583dcc2d80906ad279e) - JS READMEs and Storybook on Docs.  Thanks [@aliabd](https://github.com/aliabd)!
- [#6094](https://github.com/gradio-app/gradio/pull/6094) [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6149](https://github.com/gradio-app/gradio/pull/6149) [`90318b1dd`](https://github.com/gradio-app/gradio/commit/90318b1dd118ae08a695a50e7c556226234ab6dc) - swap `mode` on the frontned to `interactive` to match the backend.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6128](https://github.com/gradio-app/gradio/pull/6128) [`9c3bf3175`](https://github.com/gradio-app/gradio/commit/9c3bf31751a414093d103e5a115772f3ef1a67aa) - Don't serve files in working directory by default.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6138](https://github.com/gradio-app/gradio/pull/6138) [`d2dfc1b9a`](https://github.com/gradio-app/gradio/commit/d2dfc1b9a9bd4940f70b62066b1aeaa905b9c7a9) - Small change to make `api_open=False` by default.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6152](https://github.com/gradio-app/gradio/pull/6152) [`982bff2fd`](https://github.com/gradio-app/gradio/commit/982bff2fdd938b798c400fb90d1cf0caf7278894) - Remove duplicate `elem_ids` from components.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6155](https://github.com/gradio-app/gradio/pull/6155) [`f71ea09ae`](https://github.com/gradio-app/gradio/commit/f71ea09ae796b85e9fe35956d426f0a19ee48f85) - Moves `gradio_cached_folder` inside the gradio temp direcotry.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6154](https://github.com/gradio-app/gradio/pull/6154) [`a8ef6d5dc`](https://github.com/gradio-app/gradio/commit/a8ef6d5dc97b35cc1da589d1a653209a3c327d98) - Remove interpretation for good.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6135](https://github.com/gradio-app/gradio/pull/6135) [`bce37ac74`](https://github.com/gradio-app/gradio/commit/bce37ac744496537e71546d2bb889bf248dcf5d3) - Fix selectable prop in the backend.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6118](https://github.com/gradio-app/gradio/pull/6118) [`88bccfdba`](https://github.com/gradio-app/gradio/commit/88bccfdba3df2df4b2747ea5d649ed528047cf50) - Improve Video Component.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6126](https://github.com/gradio-app/gradio/pull/6126) [`865a22d5c`](https://github.com/gradio-app/gradio/commit/865a22d5c60fd97aeca968e55580b403743a23ec) - Refactor `Blocks.load()` so that it is in the same style as the other listeners.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6098](https://github.com/gradio-app/gradio/pull/6098) [`c3bc515bf`](https://github.com/gradio-app/gradio/commit/c3bc515bf7d430427182143f7fb047bb4b9f4e5e) - Gradio custom component publish.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6157](https://github.com/gradio-app/gradio/pull/6157) [`db143bdd1`](https://github.com/gradio-app/gradio/commit/db143bdd13b830f3bfd513bbfbc0cd1403522b84) - Make output components not editable if they are being updated.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6091](https://github.com/gradio-app/gradio/pull/6091) [`d5d29c947`](https://github.com/gradio-app/gradio/commit/d5d29c947467e54a8514790894ffffba1c796772) - Open source FRP server and allow `gradio` to connect to custom share servers.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6129](https://github.com/gradio-app/gradio/pull/6129) [`0d261c6ec`](https://github.com/gradio-app/gradio/commit/0d261c6ec1e783e284336023885f67b2ce04084c) - Fix fallback demo app template code.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6140](https://github.com/gradio-app/gradio/pull/6140) [`71bf2702c`](https://github.com/gradio-app/gradio/commit/71bf2702cd5b810c89e2e53452532650acdcfb87) - Fix video.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6069](https://github.com/gradio-app/gradio/pull/6069) [`bf127e124`](https://github.com/gradio-app/gradio/commit/bf127e1241a41401e144874ea468dff8474eb505) - Swap websockets for SSE.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6082](https://github.com/gradio-app/gradio/pull/6082) [`037e5af33`](https://github.com/gradio-app/gradio/commit/037e5af3363c5b321b95efc955ee8d6ec0f4504e) - WIP: Fix docs.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6071](https://github.com/gradio-app/gradio/pull/6071) [`f08da1a6f`](https://github.com/gradio-app/gradio/commit/f08da1a6f288f6ab8ec40534d5a9e2c64bed4b3b) - Fixes markdown rendering in examples.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5970](https://github.com/gradio-app/gradio/pull/5970) [`0c571c044`](https://github.com/gradio-app/gradio/commit/0c571c044035989d6fe33fc01fee63d1780635cb) - Add json schema unit tests.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6093](https://github.com/gradio-app/gradio/pull/6093) [`fadc057bb`](https://github.com/gradio-app/gradio/commit/fadc057bb7016f90dd94049c79fc10d38150c561) - V4: Fix constructor_args.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5966](https://github.com/gradio-app/gradio/pull/5966) [`9cad2127b`](https://github.com/gradio-app/gradio/commit/9cad2127b965023687470b3abfe620e188a9da6e) - Improve Audio Component.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6014](https://github.com/gradio-app/gradio/pull/6014) [`cad537aac`](https://github.com/gradio-app/gradio/commit/cad537aac57998560c9f44a37499be734de66349) - pass props to example components and to example outputs.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5955](https://github.com/gradio-app/gradio/pull/5955) [`825c9cddc`](https://github.com/gradio-app/gradio/commit/825c9cddc83a09457d8c85ebeecb4bc705572d82) - Fix dev mode model3D.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6107](https://github.com/gradio-app/gradio/pull/6107) [`9a40de7bf`](https://github.com/gradio-app/gradio/commit/9a40de7bff5844c8a135e73c7d175eb02b63a966) - Fix: Move to cache in init postprocess + Fallback Fixes.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6018](https://github.com/gradio-app/gradio/pull/6018) [`184834d02`](https://github.com/gradio-app/gradio/commit/184834d02d448bff387eeb3aef64d9517962f146) - Add a cli command to list available templates.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6092](https://github.com/gradio-app/gradio/pull/6092) [`11d67ae75`](https://github.com/gradio-app/gradio/commit/11d67ae7529e0838565e4131b185c413489c5aa6) - Add a stand-alone install command and tidy-up the fallback template.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6026](https://github.com/gradio-app/gradio/pull/6026) [`338969af2`](https://github.com/gradio-app/gradio/commit/338969af290de032f9cdc204dab8a50be3bf3cc5) - V4: Single-file implementation of form components.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6114](https://github.com/gradio-app/gradio/pull/6114) [`39227b6fa`](https://github.com/gradio-app/gradio/commit/39227b6fac274d5f5b301bc14039571c1bfe510c) - Try to trigger a major beta release.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6060](https://github.com/gradio-app/gradio/pull/6060) [`447dfe06b`](https://github.com/gradio-app/gradio/commit/447dfe06bf19324d88696eb646fd1c5f1c4e86ed) - Clean up backend of `File` and `UploadButton` and change the return type of `preprocess()` from TemporaryFIle to string filepath.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6073](https://github.com/gradio-app/gradio/pull/6073) [`abff6fb75`](https://github.com/gradio-app/gradio/commit/abff6fb758bd310053a23c938bf1dd8fbdc5d333) - Fix remaining xfail tests in backend.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6089](https://github.com/gradio-app/gradio/pull/6089) [`cd8146ba0`](https://github.com/gradio-app/gradio/commit/cd8146ba053fbcb56cf5052e658e4570d457fb8a) - Update logos for v4.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5961](https://github.com/gradio-app/gradio/pull/5961) [`be2ed5e13`](https://github.com/gradio-app/gradio/commit/be2ed5e13222cbe5013b63b36685987518034a76) - File upload optimization.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5968](https://github.com/gradio-app/gradio/pull/5968) [`6b0bb5e6a`](https://github.com/gradio-app/gradio/commit/6b0bb5e6a252ce8c4ef38455a9f56f1dcda56ab0) - Removes deprecated arguments and parameters from v4.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6027](https://github.com/gradio-app/gradio/pull/6027) [`de18102b8`](https://github.com/gradio-app/gradio/commit/de18102b8ca38c1d6d6edfa8c0571b81089166bb) - V4: Fix component update bug.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5996](https://github.com/gradio-app/gradio/pull/5996) [`9cf40f76f`](https://github.com/gradio-app/gradio/commit/9cf40f76fed1c0f84b5a5336a9b0100f8a9b4ee3) - V4: Simple dropdown.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5990](https://github.com/gradio-app/gradio/pull/5990) [`85056de5c`](https://github.com/gradio-app/gradio/commit/85056de5cd4e90a10cbfcefab74037dbc622b26b) - V4: Simple textbox.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6044](https://github.com/gradio-app/gradio/pull/6044) [`9053c95a1`](https://github.com/gradio-app/gradio/commit/9053c95a10de12aef572018ee37c71106d2da675) - Simplify File Component.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6077](https://github.com/gradio-app/gradio/pull/6077) [`35a227fbf`](https://github.com/gradio-app/gradio/commit/35a227fbfb0b0eb11806c0382c5f6910dc9777cf) - Proposal: sample demo for custom components should be a `gr.Interface`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6079](https://github.com/gradio-app/gradio/pull/6079) [`3b2d9eaa3`](https://github.com/gradio-app/gradio/commit/3b2d9eaa3e84de3e4a0799e4585a94510d665f26) - fix cc build.  Thanks [@pngwn](https://github.com/pngwn)!


### Fixes

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Pending events behavior.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Reinstate types that were removed in error in #5832.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Fixes: slider bar are too thin on FireFox.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6146](https://github.com/gradio-app/gradio/pull/6146) [`40a171ea6`](https://github.com/gradio-app/gradio/commit/40a171ea60c74afa9519d6cb159def16ce68e1ca) - Fix image double change bug.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6148](https://github.com/gradio-app/gradio/pull/6148) [`0000a1916`](https://github.com/gradio-app/gradio/commit/0000a191688c5480c977c80acdd0c9023865d57e) - fix dropdown arrow size.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6067](https://github.com/gradio-app/gradio/pull/6067) [`bf38e5f06`](https://github.com/gradio-app/gradio/commit/bf38e5f06a7039be913614901c308794fea83ae0) - remove dupe component.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6065](https://github.com/gradio-app/gradio/pull/6065) [`7d07001e8`](https://github.com/gradio-app/gradio/commit/7d07001e8e7ca9cbd2251632667b3a043de49f49) - fix storybook.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5826](https://github.com/gradio-app/gradio/pull/5826) [`ce036c5d4`](https://github.com/gradio-app/gradio/commit/ce036c5d47e741e29812654bcc641ea6be876504) - Pending events behavior.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6042](https://github.com/gradio-app/gradio/pull/6042) [`e27997fe6`](https://github.com/gradio-app/gradio/commit/e27997fe6c2bcfebc7015fc26100cee9625eb13a) - Fix `root` when user is unauthenticated so that login page appears correctly.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6076](https://github.com/gradio-app/gradio/pull/6076) [`f3f98f923`](https://github.com/gradio-app/gradio/commit/f3f98f923c9db506284b8440e18a3ac7ddd8398b) - Lite error handler.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5984](https://github.com/gradio-app/gradio/pull/5984) [`66549d8d2`](https://github.com/gradio-app/gradio/commit/66549d8d256b1845c8c5efa0384695b36cb46eab) - Fixes: slider bar are too thin on FireFox.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!


## 3.45.0-beta.13

### Features

- [#5964](https://github.com/gradio-app/gradio/pull/5964) [`5fbda0bd2`](https://github.com/gradio-app/gradio/commit/5fbda0bd2b2bbb2282249b8875d54acf87cd7e84) - Wasm release.  Thanks [@pngwn](https://github.com/pngwn)!

## 3.45.0-beta.12

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - V4: Some misc fixes.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Add host to dev mode for vite.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`d2314e53b`](https://github.com/gradio-app/gradio/commit/d2314e53bc088ff6f307a122a9a01bafcdcff5c2) - BugFix: Make FileExplorer Component Templateable.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Use tags to identify custom component dirs and ignore uninstalled components.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5956](https://github.com/gradio-app/gradio/pull/5956) [`f769876e0`](https://github.com/gradio-app/gradio/commit/f769876e0fa62336425c4e8ada5e09f38353ff01) - Apply formatter (and small refactoring) to the Lite-related frontend code.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Adds the ability to build the frontend and backend of custom components in preparation for publishing to pypi using `gradio_component build`.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Fix deployed demos on v4 branch.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Set api=False for cancel events.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Use full path to executables in CLI.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5949](https://github.com/gradio-app/gradio/pull/5949) [`1c390f101`](https://github.com/gradio-app/gradio/commit/1c390f10199142a41722ba493a0c86b58245da15) - Merge main again.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Simplify how files are handled in components in 4.0.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Name Endpoints if api_name is None.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5937](https://github.com/gradio-app/gradio/pull/5937) [`dcf13d750`](https://github.com/gradio-app/gradio/commit/dcf13d750b1465f905e062a1368ba754446cc23f) - V4: Update Component pyi file.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Rename gradio_component to gradio component.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - V4: Use async version of shutil in upload route.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - V4: Set cache dir for some component tests.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5894](https://github.com/gradio-app/gradio/pull/5894) [`fee3d527e`](https://github.com/gradio-app/gradio/commit/fee3d527e83a615109cf937f6ca0a37662af2bb6) - Adds `column_widths` to `gr.Dataframe` and hide overflowing text when `wrap=False`.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Better logs in dev mode.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5946](https://github.com/gradio-app/gradio/pull/5946) [`d0cc6b136`](https://github.com/gradio-app/gradio/commit/d0cc6b136fd59121f74d0c5a1a4b51740ffaa838) - fixup.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5944](https://github.com/gradio-app/gradio/pull/5944) [`465f58957`](https://github.com/gradio-app/gradio/commit/465f58957f70c7cf3e894beef8a117b28339e3c1) - Show empty JSON icon when `value` is `null`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Reinstate types that were removed in error in #5832.  Thanks [@pngwn](https://github.com/pngwn)!

## 3.48.0

### Features

- [#5627](https://github.com/gradio-app/gradio/pull/5627) [`b67115e8e`](https://github.com/gradio-app/gradio/commit/b67115e8e6e489fffd5271ea830211863241ddc5) - Lite: Make the Examples component display media files using pseudo HTTP requests to the Wasm server.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5821](https://github.com/gradio-app/gradio/pull/5821) [`1aa186220`](https://github.com/gradio-app/gradio/commit/1aa186220dfa8ee3621b818c4cdf4d7b9d690b40) - Lite: Fix Examples.create() to be a normal func so it can be called in the Wasm env.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5886](https://github.com/gradio-app/gradio/pull/5886) [`121f25b2d`](https://github.com/gradio-app/gradio/commit/121f25b2d50a33e1e06721b79e20b4f5651987ba) - Lite: Fix is_self_host() to detect `127.0.0.1` as localhost as well.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5915](https://github.com/gradio-app/gradio/pull/5915) [`e24163e15`](https://github.com/gradio-app/gradio/commit/e24163e15afdfc51ec8cb00a0dc46c2318b245be) - Added dimensionality check to avoid bad array dimensions.  Thanks [@THEGAMECHANGER416](https://github.com/THEGAMECHANGER416)!
- [#5835](https://github.com/gradio-app/gradio/pull/5835) [`46334780d`](https://github.com/gradio-app/gradio/commit/46334780dbbb7e83f31971d45a7047ee156a0578) - Mention that audio is normalized when converting to wav in docs.  Thanks [@aileenvl](https://github.com/aileenvl)!
- [#5877](https://github.com/gradio-app/gradio/pull/5877) [`a55b80942`](https://github.com/gradio-app/gradio/commit/a55b8094231ae462ac53f52bbdb460c1286ffabb) - Add styling (e.g. font colors and background colors) support to `gr.DataFrame` through the `pd.Styler` object.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5819](https://github.com/gradio-app/gradio/pull/5819) [`5f1cbc436`](https://github.com/gradio-app/gradio/commit/5f1cbc4363b09302334e9bc864587f8ef398550d) - Add support for gr.Request to gr.ChatInterface.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!
- [#5901](https://github.com/gradio-app/gradio/pull/5901) [`c4e3a9274`](https://github.com/gradio-app/gradio/commit/c4e3a92743a3b41edad8b45c5d5b0ccbc2674a30) - Fix curly brackets in docstrings.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5934](https://github.com/gradio-app/gradio/pull/5934) [`8d909624f`](https://github.com/gradio-app/gradio/commit/8d909624f61a49536e3c0f71cb2d9efe91216219) - Fix styling issues with Audio, Image and Video components.  Thanks [@aliabd](https://github.com/aliabd)!
- [#5864](https://github.com/gradio-app/gradio/pull/5864) [`e70805d54`](https://github.com/gradio-app/gradio/commit/e70805d54cc792452545f5d8eccc1aa0212a4695) - Change `BlockLabel` element to use `<label>`.  Thanks [@aileenvl](https://github.com/aileenvl)!
- [#5862](https://github.com/gradio-app/gradio/pull/5862) [`c07207e0b`](https://github.com/gradio-app/gradio/commit/c07207e0bc98cc32b6db629c432fadf877e451ff) - Remove deprecated `.update()` usage from Interface internals.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5905](https://github.com/gradio-app/gradio/pull/5905) [`b450cef15`](https://github.com/gradio-app/gradio/commit/b450cef15685c934ba7c4e4d57cbed233e925fb1) - Fix type the docstring of the Code component.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#5840](https://github.com/gradio-app/gradio/pull/5840) [`4e62b8493`](https://github.com/gradio-app/gradio/commit/4e62b8493dfce50bafafe49f1a5deb929d822103) - Ensure websocket polyfill doesn't load if there is already a `global.Webocket` property set.  Thanks [@Jay2theWhy](https://github.com/Jay2theWhy)!
- [#5839](https://github.com/gradio-app/gradio/pull/5839) [`b83064da0`](https://github.com/gradio-app/gradio/commit/b83064da0005ca055fc15ee478cf064bf91702a4) - Fix error when scrolling dropdown with scrollbar.  Thanks [@Kit-p](https://github.com/Kit-p)!
- [#5822](https://github.com/gradio-app/gradio/pull/5822) [`7b63db271`](https://github.com/gradio-app/gradio/commit/7b63db27161ab538f20cf8523fc04c9c3b604a98) - Convert async methods in the Examples class into normal sync methods.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5904](https://github.com/gradio-app/gradio/pull/5904) [`891d42e9b`](https://github.com/gradio-app/gradio/commit/891d42e9baa7ab85ede2a5eadb56c274b0ed2785) - Define Font.__repr__() to be printed in the doc in a readable format.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5811](https://github.com/gradio-app/gradio/pull/5811) [`1d5b15a2d`](https://github.com/gradio-app/gradio/commit/1d5b15a2d24387154f2cfb40a36de25b331471d3) - Assert refactor in external.py.  Thanks [@harry-urek](https://github.com/harry-urek)!
- [#5827](https://github.com/gradio-app/gradio/pull/5827) [`48e09ee88`](https://github.com/gradio-app/gradio/commit/48e09ee88799efa38a5cc9b1b61e462f72ec6093) - Quick fix: Chatbot change event.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5890](https://github.com/gradio-app/gradio/pull/5890) [`c4ba832b3`](https://github.com/gradio-app/gradio/commit/c4ba832b318dad5e8bf565cfa0daf93ca188498f) - Remove deprecation warning from `gr.update` and clean up associated code.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5897](https://github.com/gradio-app/gradio/pull/5897) [`0592c301d`](https://github.com/gradio-app/gradio/commit/0592c301df9cd949b52159c85b7042f38d113e86) - Fix Dataframe `line_breaks`.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5878](https://github.com/gradio-app/gradio/pull/5878) [`fbce277e5`](https://github.com/gradio-app/gradio/commit/fbce277e50c5885371fd49c68adf8565c25c1d39) - Keep Markdown rendered lists within dataframe cells.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5930](https://github.com/gradio-app/gradio/pull/5930) [`361823896`](https://github.com/gradio-app/gradio/commit/3618238960d54df65c34895f4eb69d08acc3f9b6) - Fix dataframe `line_breaks`.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 3.47.1

### Fixes

- [#5816](https://github.com/gradio-app/gradio/pull/5816) [`796145e2c`](https://github.com/gradio-app/gradio/commit/796145e2c48c4087bec17f8ec0be4ceee47170cb) - Fix calls to the component server so that `gr.FileExplorer` works on Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.47.0

### Highlights

#### new `FileExplorer` component ([#5672](https://github.com/gradio-app/gradio/pull/5672) [`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e))

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function. 

Users can then navigate the virtual filesystem and select files which will be accessible in your predict function. This component will allow developers to build more complex spaces, with more flexible input options.

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).

 Thanks [@aliabid94](https://github.com/aliabid94)!

### Features

- [#5780](https://github.com/gradio-app/gradio/pull/5780) [`ed0f9a21b`](https://github.com/gradio-app/gradio/commit/ed0f9a21b04ad6b941b63d2ce45100dbd1abd5c5) - Adds `change()` event to `gr.Gallery`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5783](https://github.com/gradio-app/gradio/pull/5783) [`4567788bd`](https://github.com/gradio-app/gradio/commit/4567788bd1fc25df9322902ba748012e392b520a) - Adds the ability to set the `selected_index` in a `gr.Gallery`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5787](https://github.com/gradio-app/gradio/pull/5787) [`caeee8bf7`](https://github.com/gradio-app/gradio/commit/caeee8bf7821fd5fe2f936ed82483bed00f613ec) - ensure the client does not depend on `window` when running in a node environment.  Thanks [@gibiee](https://github.com/gibiee)!

### Fixes

- [#5798](https://github.com/gradio-app/gradio/pull/5798) [`a0d3cc45c`](https://github.com/gradio-app/gradio/commit/a0d3cc45c6db48dc0db423c229b8fb285623cdc4) - Fix `gr.SelectData` so that the target attribute is correctly attached, and the filedata is included in the data attribute with `gr.Gallery`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5795](https://github.com/gradio-app/gradio/pull/5795) [`957ba5cfd`](https://github.com/gradio-app/gradio/commit/957ba5cfde18e09caedf31236a2064923cd7b282) - Prevent bokeh from injecting bokeh js multiple times.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5790](https://github.com/gradio-app/gradio/pull/5790) [`37e70842d`](https://github.com/gradio-app/gradio/commit/37e70842d59f5aed6fab0086b1abf4b8d991f1c9) - added try except block in `state.py`.  Thanks [@SrijanSahaySrivastava](https://github.com/SrijanSahaySrivastava)!
- [#5794](https://github.com/gradio-app/gradio/pull/5794) [`f096c3ae1`](https://github.com/gradio-app/gradio/commit/f096c3ae168c0df00f90fe131c1e48c572e0574b) - Throw helpful error when media devices are not found.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5776](https://github.com/gradio-app/gradio/pull/5776) [`c0fef4454`](https://github.com/gradio-app/gradio/commit/c0fef44541bfa61568bdcfcdfc7d7d79869ab1df) - Revert replica proxy logic and instead implement using the `root` variable.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 3.46.1

### Features

- [#5124](https://github.com/gradio-app/gradio/pull/5124) [`6e56a0d9b`](https://github.com/gradio-app/gradio/commit/6e56a0d9b0c863e76c69e1183d9d40196922b4cd) - Lite: Websocket queueing.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#5775](https://github.com/gradio-app/gradio/pull/5775) [`e2874bc3c`](https://github.com/gradio-app/gradio/commit/e2874bc3cb1397574f77dbd7f0408ed4e6792970) - fix pending chatbot message styling and ensure messages with value `None` don't render.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 3.46.0

### Features

- [#5699](https://github.com/gradio-app/gradio/pull/5699) [`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2) - Improve chatbot accessibility and UX.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5569](https://github.com/gradio-app/gradio/pull/5569) [`2a5b9e03b`](https://github.com/gradio-app/gradio/commit/2a5b9e03b15ea324d641fe6982f26d81b1ca7210) - Added support for pandas `Styler` object to `gr.DataFrame` (initially just sets the `display_value`).  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5735](https://github.com/gradio-app/gradio/pull/5735) [`abb5e9df4`](https://github.com/gradio-app/gradio/commit/abb5e9df47989b2c56c2c312d74944678f9f2d4e) - Ensure images with no caption download in gallery.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5754](https://github.com/gradio-app/gradio/pull/5754) [`502054848`](https://github.com/gradio-app/gradio/commit/502054848fdbe39fc03ec42445242b4e49b7affc) - Fix Gallery `columns` and `rows` params.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5755](https://github.com/gradio-app/gradio/pull/5755) [`e842a561a`](https://github.com/gradio-app/gradio/commit/e842a561af4394f8109291ee5725bcf74743e816) - Fix new line issue in chatbot.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5731](https://github.com/gradio-app/gradio/pull/5731) [`c9af4f794`](https://github.com/gradio-app/gradio/commit/c9af4f794060e218193935d7213f0991a374f502) - Added timeout and error handling for frpc tunnel.  Thanks [@cansik](https://github.com/cansik)!
- [#5766](https://github.com/gradio-app/gradio/pull/5766) [`ef96d3512`](https://github.com/gradio-app/gradio/commit/ef96d351229272738fc3c9680f7111f159590341) - Don't raise warnings when returning an updated component in a dictionary.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5767](https://github.com/gradio-app/gradio/pull/5767) [`caf6d9c0e`](https://github.com/gradio-app/gradio/commit/caf6d9c0e1f5b867cc20f2b4f6abb5ef47503a5f) - Set share=True for all Gradio apps in Colab by default.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.45.2

### Features

- [#5722](https://github.com/gradio-app/gradio/pull/5722) [`dba651904`](https://github.com/gradio-app/gradio/commit/dba651904c97dcddcaae2691540ac430d3eefd18) - Fix for deepcopy errors when running the replica-related logic on Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5721](https://github.com/gradio-app/gradio/pull/5721) [`84e03fe50`](https://github.com/gradio-app/gradio/commit/84e03fe506e08f1f81bac6d504c9fba7924f2d93) - Adds copy buttons to website, and better descriptions to API Docs.  Thanks [@aliabd](https://github.com/aliabd)!

### Fixes

- [#5714](https://github.com/gradio-app/gradio/pull/5714) [`a0fc5a296`](https://github.com/gradio-app/gradio/commit/a0fc5a29678baa2d9ba997a2124cadebecfb2c36) - Make Tab and Tabs updatable.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5713](https://github.com/gradio-app/gradio/pull/5713) [`c10dabd6b`](https://github.com/gradio-app/gradio/commit/c10dabd6b18b49259441eb5f956a19046f466339) - Fixes gr.select() Method Issues with Dataframe Cells.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5693](https://github.com/gradio-app/gradio/pull/5693) [`c2b31c396`](https://github.com/gradio-app/gradio/commit/c2b31c396f6d260cdf93377b715aee7ff162df75) - Context-based Progress tracker.  Thanks [@cbensimon](https://github.com/cbensimon)!
- [#5705](https://github.com/gradio-app/gradio/pull/5705) [`78e7cf516`](https://github.com/gradio-app/gradio/commit/78e7cf5163e8d205e8999428fce4c02dbdece25f) - ensure internal data has updated before dispatching `success` or `then` events.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5668](https://github.com/gradio-app/gradio/pull/5668) [`d626c21e9`](https://github.com/gradio-app/gradio/commit/d626c21e91df026b04fdb3ee5c7dba74a261cfd3) - Fully resolve generated filepaths when running on Hugging Face Spaces with multiple replicas.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5711](https://github.com/gradio-app/gradio/pull/5711) [`aefb556ac`](https://github.com/gradio-app/gradio/commit/aefb556ac6dbadc320c618b11bb48371ef19dd61) - prevent internal log_message error from `/api/predict`.  Thanks [@cbensimon](https://github.com/cbensimon)!
- [#5726](https://github.com/gradio-app/gradio/pull/5726) [`96c4b97c7`](https://github.com/gradio-app/gradio/commit/96c4b97c742311e90a87d8e8ee562c6ad765e9f0) - Adjust translation.  Thanks [@ylhsieh](https://github.com/ylhsieh)!
- [#5732](https://github.com/gradio-app/gradio/pull/5732) [`3a48490bc`](https://github.com/gradio-app/gradio/commit/3a48490bc5e4136ec9bc0354b0d6fb6c04280505) - Add a bare `Component` type to the acceptable type list of `gr.load()`'s `inputs` and `outputs`.  Thanks [@whitphx](https://github.com/whitphx)!

## 3.45.1

### Fixes

- [#5701](https://github.com/gradio-app/gradio/pull/5701) [`ee8eec1e5`](https://github.com/gradio-app/gradio/commit/ee8eec1e5e544a0127e0aa68c2522a7085b8ada5) - Fix for regression in rendering empty Markdown.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.45.0

### Features

- [#5675](https://github.com/gradio-app/gradio/pull/5675) [`b619e6f6e`](https://github.com/gradio-app/gradio/commit/b619e6f6e4ca55334fb86da53790e45a8f978566) - Reorganize Docs Navbar and Fill in Gaps.  Thanks [@aliabd](https://github.com/aliabd)!
- [#5669](https://github.com/gradio-app/gradio/pull/5669) [`c5e969559`](https://github.com/gradio-app/gradio/commit/c5e969559612f956afcdb0c6f7b22ab8275bc49a) - Fix small issues in docs and guides.  Thanks [@aliabd](https://github.com/aliabd)!
- [#5682](https://github.com/gradio-app/gradio/pull/5682) [`c57f1b75e`](https://github.com/gradio-app/gradio/commit/c57f1b75e272c76b0af4d6bd0c7f44743ff34f26) - Fix functional tests.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5681](https://github.com/gradio-app/gradio/pull/5681) [`40de3d217`](https://github.com/gradio-app/gradio/commit/40de3d2178b61ebe424b6f6228f94c0c6f679bea) - add query parameters to the `gr.Request` object through the `query_params` attribute.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!
- [#5653](https://github.com/gradio-app/gradio/pull/5653) [`ea0e00b20`](https://github.com/gradio-app/gradio/commit/ea0e00b207b4b90a10e9d054c4202d4e705a29ba) - Prevent Clients from accessing API endpoints that set `api_name=False`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5639](https://github.com/gradio-app/gradio/pull/5639) [`e1874aff8`](https://github.com/gradio-app/gradio/commit/e1874aff814d13b23f3e59ef239cc13e18ad3fa7) - Add `gr.on` listener method.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5652](https://github.com/gradio-app/gradio/pull/5652) [`2e25d4305`](https://github.com/gradio-app/gradio/commit/2e25d430582264945ae3316acd04c4453a25ce38) - Pause autoscrolling if a user scrolls up in a `gr.Textbox` and resume autoscrolling if they go all the way down.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5642](https://github.com/gradio-app/gradio/pull/5642) [`21c7225bd`](https://github.com/gradio-app/gradio/commit/21c7225bda057117a9d3311854323520218720b5) - Improve plot rendering.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5677](https://github.com/gradio-app/gradio/pull/5677) [`9f9af327c`](https://github.com/gradio-app/gradio/commit/9f9af327c9115356433ec837f349d6286730fb97) - [Refactoring] Convert async functions that don't contain `await` statements to normal functions.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5660](https://github.com/gradio-app/gradio/pull/5660) [`d76555a12`](https://github.com/gradio-app/gradio/commit/d76555a122b545f0df7c9e7c1ca7bd2a6e262c86) - Fix secondary hue bug in gr.themes.builder().  Thanks [@hellofreckles](https://github.com/hellofreckles)!
- [#5697](https://github.com/gradio-app/gradio/pull/5697) [`f4e4f82b5`](https://github.com/gradio-app/gradio/commit/f4e4f82b58a65efca9030a7e8e7c5ace60d8cc10) - Increase Slider clickable area.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5671](https://github.com/gradio-app/gradio/pull/5671) [`6a36c3b78`](https://github.com/gradio-app/gradio/commit/6a36c3b786700600d3826ce1e0629cc5308ddd47) - chore(deps): update dependency @types/prismjs to v1.26.1.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#5240](https://github.com/gradio-app/gradio/pull/5240) [`da05e59a5`](https://github.com/gradio-app/gradio/commit/da05e59a53bbad15e5755a47f46685da18e1031e) - Cleanup of .update and .get_config per component.  Thanks [@aliabid94](https://github.com/aliabid94)!/n  get_config is removed, the config used is simply any attribute that is in the Block that shares a name with one of the constructor paramaters./n  update is not removed for backwards compatibility, but deprecated. Instead return the component itself. Created a updateable decorator that simply checks to see if we're in an update, and if so, skips the constructor and wraps the args and kwargs in an update dictionary. easy peasy.
- [#5635](https://github.com/gradio-app/gradio/pull/5635) [`38fafb9e2`](https://github.com/gradio-app/gradio/commit/38fafb9e2a5509b444942e1d5dd48dffa20066f4) - Fix typos in Gallery docs.  Thanks [@atesgoral](https://github.com/atesgoral)!
- [#5590](https://github.com/gradio-app/gradio/pull/5590) [`d1ad1f671`](https://github.com/gradio-app/gradio/commit/d1ad1f671caef9f226eb3965f39164c256d8615c) - Attach `elem_classes` selectors to layout elements, and an id to the Tab button (for targeting via CSS/JS).  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5598](https://github.com/gradio-app/gradio/pull/5598) [`6b1714386`](https://github.com/gradio-app/gradio/commit/6b17143868bdd2c1400af1199a01c1c0d5c27477) - Upgrade Pyodide to 0.24.0 and install the native orjson package.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#5625](https://github.com/gradio-app/gradio/pull/5625) [`9ccc4794a`](https://github.com/gradio-app/gradio/commit/9ccc4794a72ce8319417119f6c370e7af3ffca6d) - Use ContextVar instead of threading.local().  Thanks [@cbensimon](https://github.com/cbensimon)!
- [#5602](https://github.com/gradio-app/gradio/pull/5602) [`54d21d3f1`](https://github.com/gradio-app/gradio/commit/54d21d3f18f2ddd4e796d149a0b41461f49c711b) - Ensure `HighlightedText` with `merge_elements` loads without a value.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5636](https://github.com/gradio-app/gradio/pull/5636) [`fb5964fb8`](https://github.com/gradio-app/gradio/commit/fb5964fb88082e7b956853b543c468116811cab9) - Fix bug in example cache loading event.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5633](https://github.com/gradio-app/gradio/pull/5633) [`341402337`](https://github.com/gradio-app/gradio/commit/34140233794c29d4722020e13c2d045da642dfae) - Allow Gradio apps containing `gr.Radio()`, `gr.Checkboxgroup()`, or `gr.Dropdown()` to be loaded with `gr.load()`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5616](https://github.com/gradio-app/gradio/pull/5616) [`7c34b434a`](https://github.com/gradio-app/gradio/commit/7c34b434aae0eb85f112a1dc8d66cefc7e2296b2) - Fix width and height issues that would cut off content in `gr.DataFrame`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5604](https://github.com/gradio-app/gradio/pull/5604) [`faad01f8e`](https://github.com/gradio-app/gradio/commit/faad01f8e10ef6d18249b1a4587477c59b74adb2) - Add `render_markdown` parameter to chatbot.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5593](https://github.com/gradio-app/gradio/pull/5593) [`88d43bd12`](https://github.com/gradio-app/gradio/commit/88d43bd124792d216da445adef932a2b02f5f416) - Fixes avatar image in chatbot being squashed.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5690](https://github.com/gradio-app/gradio/pull/5690) [`6b8c8afd9`](https://github.com/gradio-app/gradio/commit/6b8c8afd981fea984da568e9a0bd8bfc2a9c06c4) - Fix incorrect behavior of `gr.load()` with `gr.Examples`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5696](https://github.com/gradio-app/gradio/pull/5696) [`e51fcd5d5`](https://github.com/gradio-app/gradio/commit/e51fcd5d54315e8b65ee40e3de4dab17579ff6d5) - setting share=True on Spaces or in wasm should warn instead of raising error.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.44.4

### Features

- [#5514](https://github.com/gradio-app/gradio/pull/5514) [`52f783175`](https://github.com/gradio-app/gradio/commit/52f7831751b432411e109bd41add4ab286023a8e) - refactor: Use package.json for version management.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!
- [#5535](https://github.com/gradio-app/gradio/pull/5535) [`d29b1ab74`](https://github.com/gradio-app/gradio/commit/d29b1ab740784d8c70f9ab7bc38bbbf7dd3ff737) - Makes sliders consistent across all browsers.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Fixes

- [#5587](https://github.com/gradio-app/gradio/pull/5587) [`e0d61b8ba`](https://github.com/gradio-app/gradio/commit/e0d61b8baa0f6293f53b9bdb1647d42f9ae2583a) - Fix `.clear()` events for audio and image.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5534](https://github.com/gradio-app/gradio/pull/5534) [`d9e9ae43f`](https://github.com/gradio-app/gradio/commit/d9e9ae43f5c52c1f729af5a20e5d4f754689d429) - Guide fixes, esp. streaming audio.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5588](https://github.com/gradio-app/gradio/pull/5588) [`acdeff57e`](https://github.com/gradio-app/gradio/commit/acdeff57ece4672f943c374d537eaf47d3ec034f) - Allow multiple instances of Gradio with authentication to run on different ports.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.44.3

### Fixes

- [#5562](https://github.com/gradio-app/gradio/pull/5562) [`50d9747d0`](https://github.com/gradio-app/gradio/commit/50d9747d061962cff7f60a8da648bb3781794102) - chore(deps): update dependency iframe-resizer to v4.3.7.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#5550](https://github.com/gradio-app/gradio/pull/5550) [`4ed5902e7`](https://github.com/gradio-app/gradio/commit/4ed5902e7dda2d95cd43e4ccaaef520ddd8eba57) - Adding basque language.  Thanks [@EkhiAzur](https://github.com/EkhiAzur)!
- [#5547](https://github.com/gradio-app/gradio/pull/5547) [`290f51871`](https://github.com/gradio-app/gradio/commit/290f5187160cdbd7a786494fe3c19b0e70abe167) - typo in UploadButton's docstring.  Thanks [@chaeheum3](https://github.com/chaeheum3)!
- [#5553](https://github.com/gradio-app/gradio/pull/5553) [`d1bf23cd2`](https://github.com/gradio-app/gradio/commit/d1bf23cd2c6da3692d7753856bfe7564d84778e0) - Modify Image examples docstring.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5563](https://github.com/gradio-app/gradio/pull/5563) [`ba64082ed`](https://github.com/gradio-app/gradio/commit/ba64082ed80c1ed9113497ae089e63f032dbcc75) - preprocess for components when type='index'.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.44.2

### Fixes

- [#5537](https://github.com/gradio-app/gradio/pull/5537) [`301c7878`](https://github.com/gradio-app/gradio/commit/301c7878217f9fc531c0f28330b394f02955811b) - allow gr.Image() examples to take urls.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5544](https://github.com/gradio-app/gradio/pull/5544) [`a0cc9ac9`](https://github.com/gradio-app/gradio/commit/a0cc9ac931554e06dcb091158c9b9ac0cc580b6c) - Fixes dropdown breaking if a user types in invalid value and presses enter.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.44.1

### Fixes

- [#5516](https://github.com/gradio-app/gradio/pull/5516) [`c5fe8eba`](https://github.com/gradio-app/gradio/commit/c5fe8ebadbf206e2f4199ccde4606e331a22148a) - Fix docstring of dropdown.  Thanks [@hysts](https://github.com/hysts)!
- [#5529](https://github.com/gradio-app/gradio/pull/5529) [`81c9ca9a`](https://github.com/gradio-app/gradio/commit/81c9ca9a2e00d19334f632fec32081d36ad54c7f) - Fix `.update()` method in `gr.Dropdown()` to handle `choices`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5528](https://github.com/gradio-app/gradio/pull/5528) [`dc86e4a7`](https://github.com/gradio-app/gradio/commit/dc86e4a7e1c40b910c74558e6f88fddf9b3292bc) - Lazy load all images.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5525](https://github.com/gradio-app/gradio/pull/5525) [`21f1db40`](https://github.com/gradio-app/gradio/commit/21f1db40de6d1717eba97a550e11422a457ba7e9) - Ensure input value saves on dropdown blur.  Thanks [@hannahblair](https://github.com/hannahblair)!

## 3.44.0

### Features

- [#5505](https://github.com/gradio-app/gradio/pull/5505) [`9ee20f49`](https://github.com/gradio-app/gradio/commit/9ee20f499f62c1fe5af6b8f84918b3a334eb1c8d) - Validate i18n file names with ISO-639x.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5475](https://github.com/gradio-app/gradio/pull/5475) [`c60b89b0`](https://github.com/gradio-app/gradio/commit/c60b89b0a54758a27277f0a6aa20d0653647c7c8) - Adding Central Kurdish.  Thanks [@Hrazhan](https://github.com/Hrazhan)!
- [#5400](https://github.com/gradio-app/gradio/pull/5400) [`d112e261`](https://github.com/gradio-app/gradio/commit/d112e2611b0fc79ecedfaed367571f3157211387) - Allow interactive input in `gr.HighlightedText`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5488](https://github.com/gradio-app/gradio/pull/5488) [`8909e42a`](https://github.com/gradio-app/gradio/commit/8909e42a7c6272358ad413588d27a5124d151205) - Adds `autoscroll` param to `gr.Textbox()`.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5384](https://github.com/gradio-app/gradio/pull/5384) [`ddc02268`](https://github.com/gradio-app/gradio/commit/ddc02268f731bd2ed04b7a5854accf3383f9a0da) - Allows the `gr.Dropdown` to have separate names and values, as well as enables `allow_custom_value` for multiselect dropdown.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5473](https://github.com/gradio-app/gradio/pull/5473) [`b271e738`](https://github.com/gradio-app/gradio/commit/b271e738860ca238ecdee2991f49b505c7559016) - Remove except asyncio.CancelledError which is no longer necessary due to 53d7025.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5474](https://github.com/gradio-app/gradio/pull/5474) [`041560f9`](https://github.com/gradio-app/gradio/commit/041560f9f11ca2560005b467bb412ee1becfc2b2) - Fix queueing.call_prediction to retrieve the default response class in the same manner as FastAPI's implementation.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5510](https://github.com/gradio-app/gradio/pull/5510) [`afcf3c48`](https://github.com/gradio-app/gradio/commit/afcf3c48e82712067d6d00a0caedb1562eb986f8) - Do not expose existence of files outside of working directory.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5459](https://github.com/gradio-app/gradio/pull/5459) [`bd2fda77`](https://github.com/gradio-app/gradio/commit/bd2fda77fc98d815f4fb670f535af453ebee9b80) - Dispatch `stop_recording` event in Audio.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5508](https://github.com/gradio-app/gradio/pull/5508) [`05715f55`](https://github.com/gradio-app/gradio/commit/05715f5599ae3e928d3183c7b0a7f5291f843a96) - Adds a `filterable` parameter to `gr.Dropdown` that controls whether user can type to filter choices.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5470](https://github.com/gradio-app/gradio/pull/5470) [`a4e010a9`](https://github.com/gradio-app/gradio/commit/a4e010a96f1d8a52b3ac645e03fe472b9c3cbbb1) - Fix share button position.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5496](https://github.com/gradio-app/gradio/pull/5496) [`82ec4d26`](https://github.com/gradio-app/gradio/commit/82ec4d2622a43c31b248b78e9410e2ac918f6035) - Allow interface with components to be run inside blocks.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 3.43.2

### Fixes

- [#5456](https://github.com/gradio-app/gradio/pull/5456) [`6e381c4f`](https://github.com/gradio-app/gradio/commit/6e381c4f146cc8177a4e2b8e39f914f09cd7ff0c) - ensure dataframe doesn't steal focus.  Thanks [@pngwn](https://github.com/pngwn)!

## 3.43.1

### Fixes

- [#5445](https://github.com/gradio-app/gradio/pull/5445) [`67bb7bcb`](https://github.com/gradio-app/gradio/commit/67bb7bcb6a95b7a00a8bdf612cf147850d919a44) - ensure dataframe doesn't scroll unless needed.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5447](https://github.com/gradio-app/gradio/pull/5447) [`7a4a89e5`](https://github.com/gradio-app/gradio/commit/7a4a89e5ca1dedb39e5366867501584b0c636bbb) - ensure iframe is correct size on spaces.  Thanks [@pngwn](https://github.com/pngwn)!

## 3.43.0

### Features

- [#5165](https://github.com/gradio-app/gradio/pull/5165) [`c77f05ab`](https://github.com/gradio-app/gradio/commit/c77f05abb65b2828c9c19af4ec0a0c09412f9f6a) - Fix the Queue to call API endpoints without internal HTTP routing.  Thanks [@whitphx](https://github.com/whitphx)!
- [#5427](https://github.com/gradio-app/gradio/pull/5427) [`aad7acd7`](https://github.com/gradio-app/gradio/commit/aad7acd7128dca05b227ecbba06db9f94d65b088) - Add sort to bar plot.  Thanks [@Chaitanya134](https://github.com/Chaitanya134)!
- [#5342](https://github.com/gradio-app/gradio/pull/5342) [`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912) - significantly improve the performance of `gr.Dataframe` for large datasets.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5417](https://github.com/gradio-app/gradio/pull/5417) [`d14d63e3`](https://github.com/gradio-app/gradio/commit/d14d63e30c4af3f9c2a664fd11b0a01943a8300c) - Auto scroll to bottom of textbox.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Fixes

- [#5412](https://github.com/gradio-app/gradio/pull/5412) [`26fef8c7`](https://github.com/gradio-app/gradio/commit/26fef8c7f85a006c7e25cdbed1792df19c512d02) - Skip view_api request in js client when auth enabled.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5436](https://github.com/gradio-app/gradio/pull/5436) [`7ab4b70f`](https://github.com/gradio-app/gradio/commit/7ab4b70f6821afb4e85cef225d1235c19df8ebbf) - api_open does not take precedence over show_api.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 3.42.0

### Highlights

#### Like/Dislike Button for Chatbot ([#5391](https://github.com/gradio-app/gradio/pull/5391) [`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db))

 Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

#### Added the ability to attach event listeners via decorators ([#5395](https://github.com/gradio-app/gradio/pull/5395) [`55fed04f`](https://github.com/gradio-app/gradio/commit/55fed04f559becb9c24f22cc6292dc572d709886))

e.g.

```python
with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")

    @greet_btn.click(inputs=name, outputs=output)
    def greet(name):
        return "Hello " + name + "!"
```

 Thanks [@aliabid94](https://github.com/aliabid94)!

### Features

- [#5334](https://github.com/gradio-app/gradio/pull/5334) [`c5bf9138`](https://github.com/gradio-app/gradio/commit/c5bf91385a632dc9f612499ee01166ac6ae509a9) - Add chat bubble width param.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5267](https://github.com/gradio-app/gradio/pull/5267) [`119c8343`](https://github.com/gradio-app/gradio/commit/119c834331bfae60d4742c8f20e9cdecdd67e8c2) - Faster reload mode.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5373](https://github.com/gradio-app/gradio/pull/5373) [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96) - Adds `height` and `zoom_speed` parameters to `Model3D` component, as well as a button to reset the camera position.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5370](https://github.com/gradio-app/gradio/pull/5370) [`61803c65`](https://github.com/gradio-app/gradio/commit/61803c6545e73fce47e8740bd46721ab9bb0ba5c) - chore(deps): update dependency extendable-media-recorder to v9.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#5266](https://github.com/gradio-app/gradio/pull/5266) [`4ccb9a86`](https://github.com/gradio-app/gradio/commit/4ccb9a86f194c6997f80a09880edc3c2b0554aab) - Makes it possible to set the initial camera position for the `Model3D` component as a tuple of (alpha, beta, radius).  Thanks [@mbahri](https://github.com/mbahri)!
- [#5271](https://github.com/gradio-app/gradio/pull/5271) [`97c3c7b1`](https://github.com/gradio-app/gradio/commit/97c3c7b1730407f9e80566af9ecb4ca7cccf62ff) - Move scripts from old website to CI.  Thanks [@aliabd](https://github.com/aliabd)!
- [#5369](https://github.com/gradio-app/gradio/pull/5369) [`b8968898`](https://github.com/gradio-app/gradio/commit/b89688984fa9c6be0db06e392e6935a544620764) - Fix typo in utils.py.  Thanks [@eltociear](https://github.com/eltociear)!

### Fixes

- [#5304](https://github.com/gradio-app/gradio/pull/5304) [`05892302`](https://github.com/gradio-app/gradio/commit/05892302fb8fe2557d57834970a2b65aea97355b) - Adds kwarg to disable html sanitization in `gr.Chatbot()`.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5366](https://github.com/gradio-app/gradio/pull/5366) [`0cc7e2dc`](https://github.com/gradio-app/gradio/commit/0cc7e2dcf60e216e0a30e2f85a9879ce3cb2a1bd) - Hide avatar when message none.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5393](https://github.com/gradio-app/gradio/pull/5393) [`e4e7a431`](https://github.com/gradio-app/gradio/commit/e4e7a4319924aaf51dcb18d07d0c9953d4011074) - Renders LaTeX that is added to the page in `gr.Markdown`, `gr.Chatbot`, and `gr.DataFrame`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5394](https://github.com/gradio-app/gradio/pull/5394) [`4d94ea0a`](https://github.com/gradio-app/gradio/commit/4d94ea0a0cf2103cda19f48398a5634f8341d04d) - Adds horizontal scrolling to content that overflows in gr.Markdown.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5368](https://github.com/gradio-app/gradio/pull/5368) [`b27f7583`](https://github.com/gradio-app/gradio/commit/b27f7583254165b135bf1496a7d8c489a62ba96f) - Change markdown rendering to set breaks to false.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5360](https://github.com/gradio-app/gradio/pull/5360) [`64666525`](https://github.com/gradio-app/gradio/commit/6466652583e3c620df995fb865ef3511a34cb676) - Cancel Dropdown Filter.  Thanks [@deckar01](https://github.com/deckar01)!

## 3.41.2

### Features

- [#5284](https://github.com/gradio-app/gradio/pull/5284) [`5f25eb68`](https://github.com/gradio-app/gradio/commit/5f25eb6836f6a78ce6208b53495a01e1fc1a1d2f) - Minor bug fix sweep.  Thanks [@aliabid94](https://github.com/aliabid94)!/n  - Our use of __exit__ was catching errors and corrupting the traceback of any component that failed to instantiate (try running blocks_kitchen_sink off main for an example). Now the __exit__ exits immediately if there's been an exception, so the original exception can be printed cleanly/n  - HighlightedText was rendering weird, cleaned it up

### Fixes

- [#5319](https://github.com/gradio-app/gradio/pull/5319) [`3341148c`](https://github.com/gradio-app/gradio/commit/3341148c109b5458cc88435d27eb154210efc472) - Fix: wrap avatar-image in a div to clip its shape.  Thanks [@Keldos-Li](https://github.com/Keldos-Li)!
- [#5340](https://github.com/gradio-app/gradio/pull/5340) [`df090e89`](https://github.com/gradio-app/gradio/commit/df090e89f74a16e4cb2b700a1e3263cabd2bdd91) - Fix Checkbox select dispatch.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 3.41.1

### Fixes

- [#5324](https://github.com/gradio-app/gradio/pull/5324) [`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19) - ensure login form has correct styles.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5323](https://github.com/gradio-app/gradio/pull/5323) [`e32b0928`](https://github.com/gradio-app/gradio/commit/e32b0928d2d00342ca917ebb10c379ffc2ec200d) - ensure dropdown stays open when identical data is passed in.  Thanks [@pngwn](https://github.com/pngwn)!

## 3.41.0

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

#### Enable streaming audio in python client ([#5248](https://github.com/gradio-app/gradio/pull/5248) [`390624d8`](https://github.com/gradio-app/gradio/commit/390624d8ad2b1308a5bf8384435fd0db98d8e29e))

The `gradio_client` now supports streaming file outputs 🌊

No new syntax! Connect to a gradio demo that supports streaming file outputs and call `predict` or `submit` as you normally would.

```python
import gradio_client as grc
client = grc.Client("gradio/stream_audio_out")

# Get the entire generated audio as a local file
client.predict("/Users/freddy/Pictures/bark_demo.mp4", api_name="/predict")

job = client.submit("/Users/freddy/Pictures/bark_demo.mp4", api_name="/predict")

# Get the entire generated audio as a local file
job.result()

# Each individual chunk
job.outputs()
```

 Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

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

- [#5268](https://github.com/gradio-app/gradio/pull/5268) [`f49028cf`](https://github.com/gradio-app/gradio/commit/f49028cfe3e21097001ddbda71c560b3d8b42e1c) - Move markdown & latex processing to the frontend for the gr.Markdown and gr.DataFrame components.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5216](https://github.com/gradio-app/gradio/pull/5216) [`4b58ea6d`](https://github.com/gradio-app/gradio/commit/4b58ea6d98e7a43b3f30d8a4cb6f379bc2eca6a8) - Update i18n tokens and locale files.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5283](https://github.com/gradio-app/gradio/pull/5283) [`a7460557`](https://github.com/gradio-app/gradio/commit/a74605572dd0d6bb41df6b38b120d656370dd67d) - Add height parameter and scrolling to `gr.Dataframe`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5232](https://github.com/gradio-app/gradio/pull/5232) [`c57d4c23`](https://github.com/gradio-app/gradio/commit/c57d4c232a97e03b4671f9e9edc3af456438fe89) - `gr.Radio` and `gr.CheckboxGroup` can now accept different names and values.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5219](https://github.com/gradio-app/gradio/pull/5219) [`e8fd4e4e`](https://github.com/gradio-app/gradio/commit/e8fd4e4ec68a6c974bc8c84b61f4a0ec50a85bc6) - Add `api_name` parameter to `gr.Interface`. Additionally, completely hide api page if show_api=False.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5280](https://github.com/gradio-app/gradio/pull/5280) [`a2f42e28`](https://github.com/gradio-app/gradio/commit/a2f42e28bd793bce4bed6d54164bb2a327a46fd5) - Allow updating the label of `gr.UpdateButton`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5112](https://github.com/gradio-app/gradio/pull/5112) [`1cefee7f`](https://github.com/gradio-app/gradio/commit/1cefee7fc05175aca23ba04b3a3fda7b97f49bf0) - chore(deps): update dependency marked to v7.  Thanks [@renovate](https://github.com/apps/renovate)!
- [#5260](https://github.com/gradio-app/gradio/pull/5260) [`a773eaf7`](https://github.com/gradio-app/gradio/commit/a773eaf7504abb53b99885b3454dc1e027adbb42) - Stop passing inputs and preprocessing on iterators.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#4943](https://github.com/gradio-app/gradio/pull/4943) [`947d615d`](https://github.com/gradio-app/gradio/commit/947d615db6f76519d0e8bc0d1a0d7edf89df267b) - Sign in with Hugging Face (OAuth support).  Thanks [@Wauplin](https://github.com/Wauplin)!
- [#5298](https://github.com/gradio-app/gradio/pull/5298) [`cf167cd1`](https://github.com/gradio-app/gradio/commit/cf167cd1dd4acd9aee225ff1cb6fac0e849806ba) - Create event listener table for components on docs.  Thanks [@aliabd](https://github.com/aliabd)!
- [#5173](https://github.com/gradio-app/gradio/pull/5173) [`730f0c1d`](https://github.com/gradio-app/gradio/commit/730f0c1d54792eb11359e40c9f2326e8a6e39203) - Ensure gradio client works as expected for functions that return nothing.  Thanks [@raymondtri](https://github.com/raymondtri)!
- [#5188](https://github.com/gradio-app/gradio/pull/5188) [`b22e1888`](https://github.com/gradio-app/gradio/commit/b22e1888fcf0843520525c1e4b7e1fe73fdeb948) - Fix the images in the theme builder to use permanent URI.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5221](https://github.com/gradio-app/gradio/pull/5221) [`f344592a`](https://github.com/gradio-app/gradio/commit/f344592aeb1658013235ded154107f72d86f24e7) - Allows setting a height to `gr.File` and improves the UI of the component.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5265](https://github.com/gradio-app/gradio/pull/5265) [`06982212`](https://github.com/gradio-app/gradio/commit/06982212dfbd613853133d5d0eebd75577967027) - Removes scrollbar from File preview when not needed.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5305](https://github.com/gradio-app/gradio/pull/5305) [`15075241`](https://github.com/gradio-app/gradio/commit/15075241fa7ad3f7fd9ae2a91e54faf8f19a46f9) - Rotate axes labels on LinePlot, BarPlot, and ScatterPlot.  Thanks [@Faiga91](https://github.com/Faiga91)!
- [#5258](https://github.com/gradio-app/gradio/pull/5258) [`92282cea`](https://github.com/gradio-app/gradio/commit/92282cea6afdf7e9930ece1046d8a63be34b3cea) - Chatbot Avatar Images.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5244](https://github.com/gradio-app/gradio/pull/5244) [`b3e50db9`](https://github.com/gradio-app/gradio/commit/b3e50db92f452f376aa2cc081326d40bb69d6dd7) - Remove aiohttp dependency.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5264](https://github.com/gradio-app/gradio/pull/5264) [`46a2b600`](https://github.com/gradio-app/gradio/commit/46a2b600a7ff030a9ea1560b882b3bf3ad266bbc) - ensure translations for audio work correctly.  Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5256](https://github.com/gradio-app/gradio/pull/5256) [`933db53e`](https://github.com/gradio-app/gradio/commit/933db53e93a1229fdf149556d61da5c4c7e1a331) - Better handling of empty dataframe in `gr.DataFrame`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5242](https://github.com/gradio-app/gradio/pull/5242) [`2b397791`](https://github.com/gradio-app/gradio/commit/2b397791fe2059e4beb72937ff0436f2d4d28b4b) - Fix message text overflow onto copy button in `gr.Chatbot`.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5253](https://github.com/gradio-app/gradio/pull/5253) [`ddac7e4d`](https://github.com/gradio-app/gradio/commit/ddac7e4d0f55c3bdc6c3e9a9e24588b2563e4049) - Ensure File component uploads files to the server.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5179](https://github.com/gradio-app/gradio/pull/5179) [`6fb92b48`](https://github.com/gradio-app/gradio/commit/6fb92b48a916104db573602011a448b904d42e5e) - Fixes audio streaming issues.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5295](https://github.com/gradio-app/gradio/pull/5295) [`7b8fa8aa`](https://github.com/gradio-app/gradio/commit/7b8fa8aa58f95f5046b9add64b40368bd3f1b700) - Allow caching examples with streamed output.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#5285](https://github.com/gradio-app/gradio/pull/5285) [`cdfd4217`](https://github.com/gradio-app/gradio/commit/cdfd42174a9c777eaee9c1209bf8e90d8c7791f2) - Tweaks to `icon` parameter in `gr.Button()`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5122](https://github.com/gradio-app/gradio/pull/5122) [`3b805346`](https://github.com/gradio-app/gradio/commit/3b8053469aca6c7a86a6731e641e4400fc34d7d3) - Allows code block in chatbot to scroll horizontally.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5312](https://github.com/gradio-app/gradio/pull/5312) [`f769cb67`](https://github.com/gradio-app/gradio/commit/f769cb67149d8e209091508f06d87014acaed965) - only start listening for events after the components are mounted.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5254](https://github.com/gradio-app/gradio/pull/5254) [`c39f06e1`](https://github.com/gradio-app/gradio/commit/c39f06e16b9feea97984e4822df35a99c807461c) - Fix `.update()` for `gr.Radio()` and `gr.CheckboxGroup()`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5231](https://github.com/gradio-app/gradio/pull/5231) [`87f1c2b4`](https://github.com/gradio-app/gradio/commit/87f1c2b4ac7c685c43477215fa5b96b6cbeffa05) - Allow `gr.Interface.from_pipeline()` and `gr.load()` to work within `gr.Blocks()`.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5238](https://github.com/gradio-app/gradio/pull/5238) [`de23e9f7`](https://github.com/gradio-app/gradio/commit/de23e9f7d67e685e791faf48a21f34121f6d094a) - Improve audio streaming.  Thanks [@aliabid94](https://github.com/aliabid94)!/n  - Proper audio streaming with WAV files. We now do the proper processing to stream out wav files as a single stream of audio without any cracks in the seams./n  - Audio streaming with bytes. Stream any audio type by yielding out bytes, and it should work flawlessly.
- [#5313](https://github.com/gradio-app/gradio/pull/5313) [`54bcb724`](https://github.com/gradio-app/gradio/commit/54bcb72417b2781ad9d7500ea0f89aa9d80f7d8f) - Restores missing part of bottom border on file component.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5235](https://github.com/gradio-app/gradio/pull/5235) [`1ecf88ac`](https://github.com/gradio-app/gradio/commit/1ecf88ac5f20bc5a1c91792d1a68559575e6afd7) - fix #5229.  Thanks [@breengles](https://github.com/breengles)!
- [#5276](https://github.com/gradio-app/gradio/pull/5276) [`502f1015`](https://github.com/gradio-app/gradio/commit/502f1015bf23b365bc32446dd2e549b0c5d0dc72) - Ensure `Blocks` translation copy renders correctly.  Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5296](https://github.com/gradio-app/gradio/pull/5296) [`a0f22626`](https://github.com/gradio-app/gradio/commit/a0f22626f2aff297754414bbc83d5c4cfe086ea0) - `make_waveform()` twitter video resolution fix.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 3.40.0

### Highlights

#### Client.predict will now return the final output for streaming endpoints ([#5057](https://github.com/gradio-app/gradio/pull/5057) [`35856f8b`](https://github.com/gradio-app/gradio/commit/35856f8b54548cae7bd3b8d6a4de69e1748283b2))

### This is a breaking change (for gradio_client only)!

Previously, `Client.predict` would only return the first output of an endpoint that streamed results. This was causing confusion for developers that wanted to call these streaming demos via the client.

We realize that developers using the client don't know the internals of whether a demo streams or not, so we're changing the behavior of predict to match developer expectations.

Using `Client.predict` will now return the final output of a streaming endpoint. This will make it even easier to use gradio apps via the client.

 Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

#### Gradio now supports streaming audio outputs

Allows users to use generators to stream audio out, yielding consecutive chunks of audio. Requires `streaming=True` to be set on the output audio.

```python
import gradio as gr
from pydub import AudioSegment

def stream_audio(audio_file):
    audio = AudioSegment.from_mp3(audio_file)
    i = 0
    chunk_size = 3000
    
    while chunk_size*i < len(audio):
        chunk = audio[chunk_size*i:chunk_size*(i+1)]
        i += 1
        if chunk:
            file = f"/tmp/{i}.mp3"
            chunk.export(file, format="mp3")            
            yield file
        
demo = gr.Interface(
    fn=stream_audio,
    inputs=gr.Audio(type="filepath", label="Audio file to stream"),
    outputs=gr.Audio(autoplay=True, streaming=True),
)

demo.queue().launch()
```

From the backend, streamed outputs are served from the `/stream/` endpoint instead of the `/file/` endpoint. Currently just used to serve audio streaming output.  The output JSON will have `is_stream`: `true`, instead of `is_file`: `true` in the file data object. Thanks [@aliabid94](https://github.com/aliabid94)!

### Features

- [#5081](https://github.com/gradio-app/gradio/pull/5081) [`d7f83823`](https://github.com/gradio-app/gradio/commit/d7f83823fbd7604456b0127d689a63eed759807d) - solve how can I config root_path dynamically? #4968. Thanks [@eastonsuo](https://github.com/eastonsuo)!
- [#5025](https://github.com/gradio-app/gradio/pull/5025) [`6693660a`](https://github.com/gradio-app/gradio/commit/6693660a790996f8f481feaf22a8c49130d52d89) - Add download button to selected images in `Gallery`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5133](https://github.com/gradio-app/gradio/pull/5133) [`61129052`](https://github.com/gradio-app/gradio/commit/61129052ed1391a75c825c891d57fa0ad6c09fc8) - Update dependency esbuild to ^0.19.0. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5125](https://github.com/gradio-app/gradio/pull/5125) [`80be7a1c`](https://github.com/gradio-app/gradio/commit/80be7a1ca44c0adef1668367b2cf36b65e52e576) - chatbot conversation nodes can contain a copy button. Thanks [@fazpu](https://github.com/fazpu)!
- [#5048](https://github.com/gradio-app/gradio/pull/5048) [`0b74a159`](https://github.com/gradio-app/gradio/commit/0b74a1595b30df744e32a2c358c07acb7fd1cfe5) - Use `importlib` in favor of deprecated `pkg_resources`. Thanks [@jayceslesar](https://github.com/jayceslesar)!
- [#5045](https://github.com/gradio-app/gradio/pull/5045) [`3b9494f5`](https://github.com/gradio-app/gradio/commit/3b9494f5c57e6b52e6a040ce8d6b5141f780e84d) - Lite: Fix the analytics module to use asyncio to work in the Wasm env. Thanks [@whitphx](https://github.com/whitphx)!
- [#5046](https://github.com/gradio-app/gradio/pull/5046) [`5244c587`](https://github.com/gradio-app/gradio/commit/5244c5873c355cf3e2f0acb7d67fda3177ef8b0b) - Allow new lines in `HighlightedText` with `/n` and preserve whitespace. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5076](https://github.com/gradio-app/gradio/pull/5076) [`2745075a`](https://github.com/gradio-app/gradio/commit/2745075a26f80e0e16863d483401ff1b6c5ada7a) - Add deploy_discord to docs. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5116](https://github.com/gradio-app/gradio/pull/5116) [`0dc49b4c`](https://github.com/gradio-app/gradio/commit/0dc49b4c517706f572240f285313a881089ced79) - Add support for async functions and async generators to `gr.ChatInterface`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5047](https://github.com/gradio-app/gradio/pull/5047) [`883ac364`](https://github.com/gradio-app/gradio/commit/883ac364f69d92128774ac446ce49bdf8415fd7b) - Add `step` param to `Number`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5137](https://github.com/gradio-app/gradio/pull/5137) [`22aa5eba`](https://github.com/gradio-app/gradio/commit/22aa5eba3fee3f14473e4b0fac29cf72fe31ef04) - Use font size `--text-md` for `<code>` in Chatbot messages. Thanks [@jaywonchung](https://github.com/jaywonchung)!
- [#5005](https://github.com/gradio-app/gradio/pull/5005) [`f5539c76`](https://github.com/gradio-app/gradio/commit/f5539c7618e31451420bd3228754774da14dc65f) - Enhancement: Add focus event to textbox and number component. Thanks [@JodyZ0203](https://github.com/JodyZ0203)!
- [#5104](https://github.com/gradio-app/gradio/pull/5104) [`34f6b22e`](https://github.com/gradio-app/gradio/commit/34f6b22efbfedfa569d452f3f99ed2e6593e3c21) - Strip leading and trailing spaces from username in login route. Thanks [@sweep-ai](https://github.com/apps/sweep-ai)!
- [#5149](https://github.com/gradio-app/gradio/pull/5149) [`144df459`](https://github.com/gradio-app/gradio/commit/144df459a3b7895e524defcfc4c03fbb8b083aca) - Add `show_edit_button` param to `gr.Audio`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5136](https://github.com/gradio-app/gradio/pull/5136) [`eaa1ce14`](https://github.com/gradio-app/gradio/commit/eaa1ce14ac41de1c23321e93f11f1b03a2f3c7f4) - Enhancing Tamil Translation: Language Refinement 🌟. Thanks [@sanjaiyan-dev](https://github.com/sanjaiyan-dev)!
- [#5035](https://github.com/gradio-app/gradio/pull/5035) [`8b4eb8ca`](https://github.com/gradio-app/gradio/commit/8b4eb8cac9ea07bde31b44e2006ca2b7b5f4de36) - JS Client: Fixes cannot read properties of null (reading 'is_file'). Thanks [@raymondtri](https://github.com/raymondtri)!
- [#5023](https://github.com/gradio-app/gradio/pull/5023) [`e6317d77`](https://github.com/gradio-app/gradio/commit/e6317d77f87d3dad638acca3dbc4a9228570e63c) - Update dependency extendable-media-recorder to v8. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5085](https://github.com/gradio-app/gradio/pull/5085) [`13e47835`](https://github.com/gradio-app/gradio/commit/13e478353532c4af18cfa50772f8b6fb3c6c9818) - chore(deps): update dependency extendable-media-recorder to v8. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5080](https://github.com/gradio-app/gradio/pull/5080) [`37caa2e0`](https://github.com/gradio-app/gradio/commit/37caa2e0fe95d6cab8beb174580fb557904f137f) - Add icon and link params to `gr.Button`. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5062](https://github.com/gradio-app/gradio/pull/5062) [`7d897165`](https://github.com/gradio-app/gradio/commit/7d89716519d0751072792c9bbda668ffeb597296) - `gr.Dropdown` now has correct behavior in static mode as well as when an option is selected. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5077](https://github.com/gradio-app/gradio/pull/5077) [`667875b2`](https://github.com/gradio-app/gradio/commit/667875b2441753e74d25bd9d3c8adedd8ede11cd) - Live audio streaming output
- [#5118](https://github.com/gradio-app/gradio/pull/5118) [`1b017e68`](https://github.com/gradio-app/gradio/commit/1b017e68f6a9623cc2ec085bd20e056229552028) - Add `interactive` args to `gr.ColorPicker`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5114](https://github.com/gradio-app/gradio/pull/5114) [`56d2609d`](https://github.com/gradio-app/gradio/commit/56d2609de93387a75dc82b1c06c1240c5b28c0b8) - Reset textbox value to empty string when value is None. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5075](https://github.com/gradio-app/gradio/pull/5075) [`67265a58`](https://github.com/gradio-app/gradio/commit/67265a58027ef1f9e4c0eb849a532f72eaebde48) - Allow supporting >1000 files in `gr.File()` and `gr.UploadButton()`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5135](https://github.com/gradio-app/gradio/pull/5135) [`80727bbe`](https://github.com/gradio-app/gradio/commit/80727bbe2c6d631022054edf01515017691b3bdd) - Fix dataset features and dataset preview for HuggingFaceDatasetSaver. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5039](https://github.com/gradio-app/gradio/pull/5039) [`620e4645`](https://github.com/gradio-app/gradio/commit/620e46452729d6d4877b3fab84a65daf2f2b7bc6) - `gr.Dropdown()` now supports values with arbitrary characters and doesn't clear value when re-focused. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5061](https://github.com/gradio-app/gradio/pull/5061) [`136adc9c`](https://github.com/gradio-app/gradio/commit/136adc9ccb23e5cb4d02d2e88f23f0b850041f98) - Ensure `gradio_client` is backwards compatible with `gradio==3.24.1`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5129](https://github.com/gradio-app/gradio/pull/5129) [`97d804c7`](https://github.com/gradio-app/gradio/commit/97d804c748be9acfe27b8369dd2d64d61f43c2e7) - [Spaces] ZeroGPU Queue fix. Thanks [@cbensimon](https://github.com/cbensimon)!
- [#5140](https://github.com/gradio-app/gradio/pull/5140) [`cd1353fa`](https://github.com/gradio-app/gradio/commit/cd1353fa3eb1b015f5860ca5d5a8e8d1aa4a831c) - Fixes the display of minutes in the video player. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5111](https://github.com/gradio-app/gradio/pull/5111) [`b84a35b7`](https://github.com/gradio-app/gradio/commit/b84a35b7b91eca947f787648ceb361b1d023427b) - Add icon and link to DuplicateButton. Thanks [@aliabd](https://github.com/aliabd)!
- [#5030](https://github.com/gradio-app/gradio/pull/5030) [`f6c491b0`](https://github.com/gradio-app/gradio/commit/f6c491b079d335af633dd854c68eb26f9e61c552) - highlightedtext throws an error basing on model. Thanks [@rajeunoia](https://github.com/rajeunoia)!

## 3.39.0

### Highlights

#### Create Discord Bots from Gradio Apps 🤖 ([#4960](https://github.com/gradio-app/gradio/pull/4960) [`46e4ef67`](https://github.com/gradio-app/gradio/commit/46e4ef67d287dd68a91473b73172b29cbad064bc))

We're excited to announce that Gradio can now automatically create a discord bot from any `gr.ChatInterface` app.

It's as easy as importing `gradio_client`, connecting to the app, and calling `deploy_discord`!

_🦙 Turning Llama 2 70b into a discord bot 🦙_

```python
import gradio_client as grc
grc.Client("ysharma/Explore_llamav2_with_TGI").deploy_discord(to_id="llama2-70b-discord-bot")
```

<img src="https://gradio-builds.s3.amazonaws.com/demo-files/discordbots/guide/llama_chat.gif">

#### Getting started with template spaces

To help get you started, we have created an organization on Hugging Face called [gradio-discord-bots](https://huggingface.co/gradio-discord-bots) with template spaces you can use to turn state of the art LLMs powered by Gradio to discord bots.

Currently we have template spaces for:

- [Llama-2-70b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-70b-chat-hf) powered by a FREE Hugging Face Inference Endpoint!
- [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-13b-chat-hf) powered by Hugging Face Inference Endpoints.
- [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/llama-2-13b-chat-transformers) powered by Hugging Face transformers.
- [falcon-7b-instruct](https://huggingface.co/spaces/gradio-discord-bots/falcon-7b-instruct) powered by Hugging Face Inference Endpoints.
- [gpt-3.5-turbo](https://huggingface.co/spaces/gradio-discord-bots/gpt-35-turbo), powered by openai. Requires an OpenAI key.

But once again, you can deploy ANY `gr.ChatInterface` app exposed on the internet! So don't hesitate to try it on your own Chatbots.

❗️ Additional Note ❗️: Technically, any gradio app that exposes an api route that takes in a single string and outputs a single string can be deployed to discord. But `gr.ChatInterface` apps naturally lend themselves to discord's chat functionality so we suggest you start with those.

Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Features

- [#4995](https://github.com/gradio-app/gradio/pull/4995) [`3f8c210b`](https://github.com/gradio-app/gradio/commit/3f8c210b01ef1ceaaf8ee73be4bf246b5b745bbf) - Implement left and right click in `Gallery` component and show implicit images in `Gallery` grid. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#4993](https://github.com/gradio-app/gradio/pull/4993) [`dc07a9f9`](https://github.com/gradio-app/gradio/commit/dc07a9f947de44b419d8384987a02dcf94977851) - Bringing back the "Add download button for audio" PR by [@leuryr](https://github.com/leuryr). Thanks [@abidlabs](https://github.com/abidlabs)!
- [#4979](https://github.com/gradio-app/gradio/pull/4979) [`44ac8ad0`](https://github.com/gradio-app/gradio/commit/44ac8ad08d82ea12c503dde5c78f999eb0452de2) - Allow setting sketch color default. Thanks [@aliabid94](https://github.com/aliabid94)!
- [#4985](https://github.com/gradio-app/gradio/pull/4985) [`b74f8453`](https://github.com/gradio-app/gradio/commit/b74f8453034328f0e42da8e41785f5eb039b45d7) - Adds `additional_inputs` to `gr.ChatInterface`. Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#4997](https://github.com/gradio-app/gradio/pull/4997) [`41c83070`](https://github.com/gradio-app/gradio/commit/41c83070b01632084e7d29123048a96c1e261407) - Add CSS resets and specifiers to play nice with HF blog. Thanks [@aliabid94](https://github.com/aliabid94)!

## 3.38

### New Features:

- Provide a parameter `animate` (`False` by default) in `gr.make_waveform()` which animates the overlayed waveform by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4918](https://github.com/gradio-app/gradio/pull/4918)
- Add `show_download_button` param to allow the download button in static Image components to be hidden by [@hannahblair](https://github.com/hannahblair) in [PR 4959](https://github.com/gradio-app/gradio/pull/4959)
- Added autofocus argument to Textbox by [@aliabid94](https://github.com/aliabid94) in [PR 4978](https://github.com/gradio-app/gradio/pull/4978)
- The `gr.ChatInterface` UI now converts the "Submit" button to a "Stop" button in ChatInterface while streaming, which can be used to pause generation. By [@abidlabs](https://github.com/abidlabs) in [PR 4971](https://github.com/gradio-app/gradio/pull/4971).
- Add a `border_color_accent_subdued` theme variable to add a subdued border color to accented items. This is used by chatbot user messages. Set the value of this variable in `Default` theme to `*primary_200`. By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4989](https://github.com/gradio-app/gradio/pull/4989)
- Add default sketch color argument `brush_color`. Also, masks drawn on images are now slightly translucent (and mask color can also be set via brush_color). By [@aliabid94](https://github.com/aliabid94) in [PR 4979](https://github.com/gradio-app/gradio/pull/4979)

### Bug Fixes:

- Fixes `cancels` for generators so that if a generator is canceled before it is complete, subsequent runs of the event do not continue from the previous iteration, but rather start from the beginning. By [@abidlabs](https://github.com/abidlabs) in [PR 4969](https://github.com/gradio-app/gradio/pull/4969).
- Use `gr.State` in `gr.ChatInterface` to reduce latency by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4976](https://github.com/gradio-app/gradio/pull/4976)
- Fix bug with `gr.Interface` where component labels inferred from handler parameters were including special args like `gr.Request` or `gr.EventData`. By [@cbensimon](https://github.com/cbensimon) in [PR 4956](https://github.com/gradio-app/gradio/pull/4956)

### Breaking Changes:

No changes to highlight.

### Other Changes:

- Apply pyright to the `components` directory by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4948](https://github.com/gradio-app/gradio/pull/4948)
- Improved look of ChatInterface by [@aliabid94](https://github.com/aliabid94) in [PR 4978](https://github.com/gradio-app/gradio/pull/4978)

## 3.37

### New Features:

Introducing a new `gr.ChatInterface` abstraction, which allows Gradio users to build fully functioning Chat interfaces very easily. The only required parameter is a chat function `fn`, which accepts a (string) user input `message` and a (list of lists) chat `history` and returns a (string) response. Here's a toy example:

```py
import gradio as gr

def echo(message, history):
    return message

demo = gr.ChatInterface(fn=echo, examples=["hello", "hola", "merhaba"], title="Echo Bot")
demo.launch()
```

Which produces:

<img width="1291" alt="image" src="https://github.com/gradio-app/gradio/assets/1778297/ae94fd72-c2bb-406e-9e8d-7b9c12e80119">

And a corresponding easy-to-use API at `/chat`:

<img width="1164" alt="image" src="https://github.com/gradio-app/gradio/assets/1778297/7b10d6db-6476-4e2e-bebd-ecda802c3b8f">

The `gr.ChatInterface` abstraction works nicely with various LLM libraries, such as `langchain`. See the [dedicated guide](https://gradio.app/guides/creating-a-chatbot-fast) for more examples using `gr.ChatInterface`. Collective team effort in [PR 4869](https://github.com/gradio-app/gradio/pull/4869)

- Chatbot messages now show hyperlinks to download files uploaded to `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4848](https://github.com/gradio-app/gradio/pull/4848)
- Cached examples now work with generators and async generators by [@abidlabs](https://github.com/abidlabs) in [PR 4927](https://github.com/gradio-app/gradio/pull/4927)
- Add RTL support to `gr.Markdown`, `gr.Chatbot`, `gr.Textbox` (via the `rtl` boolean parameter) and text-alignment to `gr.Textbox`(via the string `text_align` parameter) by [@abidlabs](https://github.com/abidlabs) in [PR 4933](https://github.com/gradio-app/gradio/pull/4933)

Examples of usage:

```py
with gr.Blocks() as demo:
    gr.Textbox(interactive=True, text_align="right")
demo.launch()
```

```py
with gr.Blocks() as demo:
    gr.Markdown("سلام", rtl=True)
demo.launch()
```

- The `get_api_info` method of `Blocks` now supports layout output components [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4871](https://github.com/gradio-app/gradio/pull/4871)

- Added the support for the new command `gradio environment`to make it easier for people to file bug reports if we shipped an easy command to list the OS, gradio version, and versions of gradio/gradio-client dependencies. bu [@varshneydevansh](https://github.com/varshneydevansh) in [PR 4915](https://github.com/gradio-app/gradio/pull/4915).

### Bug Fixes:

- The `.change()` event is fixed in `Video` and `Image` so that it only fires once by [@abidlabs](https://github.com/abidlabs) in [PR 4793](https://github.com/gradio-app/gradio/pull/4793)
- The `.change()` event is fixed in `Audio` so that fires when the component value is programmatically updated by [@abidlabs](https://github.com/abidlabs) in [PR 4793](https://github.com/gradio-app/gradio/pull/4793)

* Add missing `display: flex` property to `Row` so that flex styling is applied to children by [@hannahblair] in [PR 4896](https://github.com/gradio-app/gradio/pull/4896)
* Fixed bug where `gr.Video` could not preprocess urls by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4904](https://github.com/gradio-app/gradio/pull/4904)
* Fixed copy button rendering in API page on Safari by [@aliabid94](https://github.com/aliabid94) in [PR 4924](https://github.com/gradio-app/gradio/pull/4924)
* Fixed `gr.Group` and `container=False`. `container` parameter only available for `Textbox`, `Number`, and `Dropdown`, the only elements where it makes sense. By [@aliabid94](https://github.com/aliabid94) in [PR 4916](https://github.com/gradio-app/gradio/pull/4916)
* Fixed broken image link in auto-generated `app.py` from `ThemeClass.push_to_hub` by [@deepkyu](https://github.com/deepkyu) in [PR 4944](https://github.com/gradio-app/gradio/pull/4944)

### Other Changes:

- Warning on mobile that if a user leaves the tab, websocket connection may break. On broken connection, tries to rejoin queue and displays error conveying connection broke. By [@aliabid94](https://github.com/aliabid94) in [PR 4742](https://github.com/gradio-app/gradio/pull/4742)
- Remove blocking network calls made before the local URL gets printed - these slow down the display of the local URL, especially when no internet is available. [@aliabid94](https://github.com/aliabid94) in [PR 4905](https://github.com/gradio-app/gradio/pull/4905).
- Pinned dependencies to major versions to reduce the likelihood of a broken `gradio` due to changes in downstream dependencies by [@abidlabs](https://github.com/abidlabs) in [PR 4885](https://github.com/gradio-app/gradio/pull/4885)
- Queue `max_size` defaults to parent Blocks `max_thread` when running on Spaces with ZeroGPU hardware. By [@cbensimon](https://github.com/cbensimon) in [PR 4937](https://github.com/gradio-app/gradio/pull/4937)

### Breaking Changes:

Motivated by the release of `pydantic==2.0`, which included breaking changes that broke a large number of Gradio apps, we've pinned many gradio dependencies. Note that pinned dependencies can cause downstream conflicts, so this may be a breaking change. That being said, we've kept the pins pretty loose, and we're expecting change to be better for the long-term stability of Gradio apps.

## 3.36.1

### New Features:

- Hotfix to support pydantic v1 and v2 by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4835](https://github.com/gradio-app/gradio/pull/4835)

### Bug Fixes:

- Fix bug where `gr.File` change event was not triggered when the value was changed by another event by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4811](https://github.com/gradio-app/gradio/pull/4811)

### Other Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

## 3.36.0

### New Features:

- The `gr.Video`, `gr.Audio`, `gr.Image`, `gr.Chatbot`, and `gr.Gallery` components now include a share icon when deployed on Spaces. This behavior can be modified by setting the `show_share_button` parameter in the component classes. by [@aliabid94](https://github.com/aliabid94) in [PR 4651](https://github.com/gradio-app/gradio/pull/4651)
- Allow the web component `space`, `src`, and `host` attributes to be updated dynamically by [@pngwn](https://github.com/pngwn) in [PR 4461](https://github.com/gradio-app/gradio/pull/4461)
- Suggestion for Spaces Duplication built into Gradio, by [@aliabid94](https://github.com/aliabid94) in [PR 4458](https://github.com/gradio-app/gradio/pull/4458)
- The `api_name` parameter now accepts `False` as a value, which means it does not show up in named or unnamed endpoints. By [@abidlabs](https://github.com/aliabid94) in [PR 4683](https://github.com/gradio-app/gradio/pull/4683)
- Added support for `pathlib.Path` in `gr.Video`, `gr.Gallery`, and `gr.Chatbot` by [sunilkumardash9](https://github.com/sunilkumardash9) in [PR 4581](https://github.com/gradio-app/gradio/pull/4581).

### Bug Fixes:

- Updated components with `info` attribute to update when `update()` is called on them. by [@jebarpg](https://github.com/jebarpg) in [PR 4715](https://github.com/gradio-app/gradio/pull/4715).
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
- Fixed bug where `AnnotatedImage` css styling was causing the annotation masks to not be displayed correctly by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4628](https://github.com/gradio-app/gradio/pull/4628)
- Ensure that Gradio does not silently fail when running on a port that is occupied by [@abidlabs](https://github.com/abidlabs) in [PR 4624](https://github.com/gradio-app/gradio/pull/4624).
- Fix double upload bug that caused lag in file uploads by [@aliabid94](https://github.com/aliabid94) in [PR 4661](https://github.com/gradio-app/gradio/pull/4661)
- `Progress` component now appears even when no `iterable` is specified in `tqdm` constructor by [@itrushkin](https://github.com/itrushkin) in [PR 4475](https://github.com/gradio-app/gradio/pull/4475)
- Deprecation warnings now point at the user code using those deprecated features, instead of Gradio internals, by (https://github.com/akx) in [PR 4694](https://github.com/gradio-app/gradio/pull/4694)
- Adapt column widths in gr.Examples based on content by [@pngwn](https://github.com/pngwn) & [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4700](https://github.com/gradio-app/gradio/pull/4700)
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

### Other Changes:

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

### Breaking Changes:

[PR 4683](https://github.com/gradio-app/gradio/pull/4683) removes the explict named endpoint "load_examples" from gr.Interface that was introduced in [PR 4456](https://github.com/gradio-app/gradio/pull/4456).

## 3.35.2

### New Features:

No changes to highlight.

### Bug Fixes:

- Fix chatbot streaming by [@aliabid94](https://github.com/aliabid94) in [PR 4537](https://github.com/gradio-app/gradio/pull/4537)
- Fix chatbot height and scrolling by [@aliabid94](https://github.com/aliabid94) in [PR 4540](https://github.com/gradio-app/gradio/pull/4540)

### Other Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

## 3.35.1

### New Features:

No changes to highlight.

### Bug Fixes:

- Fix chatbot streaming by [@aliabid94](https://github.com/aliabid94) in [PR 4537](https://github.com/gradio-app/gradio/pull/4537)
- Fix error modal position and text size by [@pngwn](https://github.com/pngwn) in [PR 4538](https://github.com/gradio-app/gradio/pull/4538).

### Other Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

## 3.35.0

### New Features:

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

### Bug Fixes:

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

### Other Changes:

- Change styling of status and toast error components by [@hannahblair](https://github.com/hannahblair) in [PR 4454](https://github.com/gradio-app/gradio/pull/4454).
- Clean up unnecessary `new Promise()`s by [@akx](https://github.com/akx) in [PR 4442](https://github.com/gradio-app/gradio/pull/4442).
- Minor UI cleanup for Examples and Dataframe components [@aliabid94](https://github.com/aliabid94) in [PR 4455](https://github.com/gradio-app/gradio/pull/4455).
- Minor UI cleanup for Examples and Dataframe components [@aliabid94](https://github.com/aliabid94) in [PR 4455](https://github.com/gradio-app/gradio/pull/4455).
- Add Catalan translation [@jordimas](https://github.com/jordimas) in [PR 4483](https://github.com/gradio-app/gradio/pull/4483).
- The API endpoint that loads examples upon click has been given an explicit name ("/load_examples") by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456).
- Allows configuration of FastAPI app when calling `mount_gradio_app`, by [@charlesfrye](https://github.com/charlesfrye) in [PR4519](https://github.com/gradio-app/gradio/pull/4519).

### Breaking Changes:

- The behavior of the `Clear` button has been changed for `Slider`, `CheckboxGroup`, `Radio`, `Dropdown` components by [@abidlabs](https://github.com/abidlabs) in [PR 4456](https://github.com/gradio-app/gradio/pull/4456). The Clear button now sets the value of these components to be empty as opposed to the original default set by the developer. This is to make them in line with the rest of the Gradio components.
- Python 3.7 end of life is June 27 2023. Gradio will no longer support python 3.7 by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4484](https://github.com/gradio-app/gradio/pull/4484)
- Removed `$` as a default LaTeX delimiter for the `Chatbot` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4516](https://github.com/gradio-app/gradio/pull/4516). The specific LaTeX delimeters can be set using the new `latex_delimiters` parameter in `Chatbot`.

## 3.34.0

### New Features:

- The `gr.UploadButton` component now supports the `variant` and `interactive` parameters by [@abidlabs](https://github.com/abidlabs) in [PR 4436](https://github.com/gradio-app/gradio/pull/4436).

### Bug Fixes:

- Remove target="\_blank" override on anchor tags with internal targets by [@hannahblair](https://github.com/hannahblair) in [PR 4405](https://github.com/gradio-app/gradio/pull/4405)
- Fixed bug where `gr.File(file_count='multiple')` could not be cached as output by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4421](https://github.com/gradio-app/gradio/pull/4421)
- Restricts the domains that can be proxied via `/proxy` route by [@abidlabs](https://github.com/abidlabs) in [PR 4406](https://github.com/gradio-app/gradio/pull/4406).
- Fixes issue where `gr.UploadButton` could not be used to upload the same file twice by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4437](https://github.com/gradio-app/gradio/pull/4437)
- Fixes bug where `/proxy` route was being incorrectly constructed by the frontend by [@abidlabs](https://github.com/abidlabs) in [PR 4430](https://github.com/gradio-app/gradio/pull/4430).
- Fix z-index of status component by [@hannahblair](https://github.com/hannahblair) in [PR 4429](https://github.com/gradio-app/gradio/pull/4429)
- Fix video rendering in Safari by [@aliabid94](https://github.com/aliabid94) in [PR 4433](https://github.com/gradio-app/gradio/pull/4433).
- The output directory for files downloaded when calling Blocks as a function is now set to a temporary directory by default (instead of the working directory in some cases) by [@abidlabs](https://github.com/abidlabs) in [PR 4501](https://github.com/gradio-app/gradio/pull/4501)

### Other Changes:

- When running on Spaces, handler functions will be transformed by the [PySpaces](https://pypi.org/project/spaces/) library in order to make them work with specific hardware. It will have no effect on standalone Gradio apps or regular Gradio Spaces and can be globally deactivated as follows : `import spaces; spaces.disable_gradio_auto_wrap()` by [@cbensimon](https://github.com/cbensimon) in [PR 4389](https://github.com/gradio-app/gradio/pull/4389).
- Deprecated `.style` parameter and moved arguments to constructor. Added support for `.update()` to all arguments initially in style. Added `scale` and `min_width` support to every Component. By [@aliabid94](https://github.com/aliabid94) in [PR 4374](https://github.com/gradio-app/gradio/pull/4374)

### Breaking Changes:

No changes to highlight.

## 3.33.1

### New Features:

No changes to highlight.

### Bug Fixes:

- Allow `every` to work with generators by [@dkjshk](https://github.com/dkjshk) in [PR 4434](https://github.com/gradio-app/gradio/pull/4434)
- Fix z-index of status component by [@hannahblair](https://github.com/hannahblair) in [PR 4429](https://github.com/gradio-app/gradio/pull/4429)
- Allow gradio to work offline, by [@aliabid94](https://github.com/aliabid94) in [PR 4398](https://github.com/gradio-app/gradio/pull/4398).
- Fixed `validate_url` to check for 403 errors and use a GET request in place of a HEAD by [@alvindaiyan](https://github.com/alvindaiyan) in [PR 4388](https://github.com/gradio-app/gradio/pull/4388).

### Other Changes:

- More explicit error message when share link binary is blocked by antivirus by [@abidlabs](https://github.com/abidlabs) in [PR 4380](https://github.com/gradio-app/gradio/pull/4380).

### Breaking Changes:

No changes to highlight.

## 3.33.0

### New Features:

- Introduced `gradio deploy` to launch a Gradio app to Spaces directly from your terminal. By [@aliabid94](https://github.com/aliabid94) in [PR 4033](https://github.com/gradio-app/gradio/pull/4033).
- Introduce `show_progress='corner'` argument to event listeners, which will not cover the output components with the progress animation, but instead show it in the corner of the components. By [@aliabid94](https://github.com/aliabid94) in [PR 4396](https://github.com/gradio-app/gradio/pull/4396).

### Bug Fixes:

- Fix bug where Label change event was triggering itself by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4371](https://github.com/gradio-app/gradio/pull/4371)
- Make `Blocks.load` behave like other event listeners (allows chaining `then` off of it) [@anentropic](https://github.com/anentropic/) in [PR 4304](https://github.com/gradio-app/gradio/pull/4304)
- Respect `interactive=True` in output components of a `gr.Interface` by [@abidlabs](https://github.com/abidlabs) in [PR 4356](https://github.com/gradio-app/gradio/pull/4356).
- Remove unused frontend code by [@akx](https://github.com/akx) in [PR 4275](https://github.com/gradio-app/gradio/pull/4275)
- Fixes favicon path on Windows by [@abidlabs](https://github.com/abidlabs) in [PR 4369](https://github.com/gradio-app/gradio/pull/4369).
- Prevent path traversal in `/file` routes by [@abidlabs](https://github.com/abidlabs) in [PR 4370](https://github.com/gradio-app/gradio/pull/4370).
- Do not send HF token to other domains via `/proxy` route by [@abidlabs](https://github.com/abidlabs) in [PR 4368](https://github.com/gradio-app/gradio/pull/4368).
- Replace default `markedjs` sanitize function with DOMPurify sanitizer for `gr.Chatbot()` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4360](https://github.com/gradio-app/gradio/pull/4360)
- Prevent the creation of duplicate copy buttons in the chatbot and ensure copy buttons work in non-secure contexts by [@binary-husky](https://github.com/binary-husky) in [PR 4350](https://github.com/gradio-app/gradio/pull/4350).

### Other Changes:

- Remove flicker of loading bar by adding opacity transition, by [@aliabid94](https://github.com/aliabid94) in [PR 4349](https://github.com/gradio-app/gradio/pull/4349).
- Performance optimization in the frontend's Blocks code by [@akx](https://github.com/akx) in [PR 4334](https://github.com/gradio-app/gradio/pull/4334)
- Upgrade the pnpm lock file format version from v6.0 to v6.1 by [@whitphx](https://github.com/whitphx) in [PR 4393](https://github.com/gradio-app/gradio/pull/4393)

### Breaking Changes:

- The `/file=` route no longer allows accessing dotfiles or files in "dot directories" by [@akx](https://github.com/akx) in [PR 4303](https://github.com/gradio-app/gradio/pull/4303)

## 3.32.0

### New Features:

- `Interface.launch()` and `Blocks.launch()` now accept an `app_kwargs` argument to allow customizing the configuration of the underlying FastAPI app, by [@akx](https://github.com/akx) in [PR 4282](https://github.com/gradio-app/gradio/pull/4282)

### Bug Fixes:

- Fixed Gallery/AnnotatedImage components not respecting GRADIO_DEFAULT_DIR variable by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed Gallery/AnnotatedImage components resaving identical images by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed Audio/Video/File components creating empty tempfiles on each run by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4256](https://github.com/gradio-app/gradio/pull/4256)
- Fixed the behavior of the `run_on_click` parameter in `gr.Examples` by [@abidlabs](https://github.com/abidlabs) in [PR 4258](https://github.com/gradio-app/gradio/pull/4258).
- Ensure error modal displays when the queue is enabled by [@pngwn](https://github.com/pngwn) in [PR 4273](https://github.com/gradio-app/gradio/pull/4273)
- Ensure js client respcts the full root when making requests to the server by [@pngwn](https://github.com/pngwn) in [PR 4271](https://github.com/gradio-app/gradio/pull/4271)

### Other Changes:

- Refactor web component `initial_height` attribute by [@whitphx](https://github.com/whitphx) in [PR 4223](https://github.com/gradio-app/gradio/pull/4223)
- Relocate `mount_css` fn to remove circular dependency [@whitphx](https://github.com/whitphx) in [PR 4222](https://github.com/gradio-app/gradio/pull/4222)
- Upgrade Black to 23.3 by [@akx](https://github.com/akx) in [PR 4259](https://github.com/gradio-app/gradio/pull/4259)
- Add frontend LaTeX support in `gr.Chatbot()` using `KaTeX` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4285](https://github.com/gradio-app/gradio/pull/4285).

### Breaking Changes:

No changes to highlight.

## 3.31.0

### New Features:

- The reloader command (`gradio app.py`) can now accept command line arguments by [@micky2be](https://github.com/micky2be) in [PR 4119](https://github.com/gradio-app/gradio/pull/4119)
- Added `format` argument to `Audio` component by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4178](https://github.com/gradio-app/gradio/pull/4178)
- Add JS client code snippets to use via api page by [@aliabd](https://github.com/aliabd) in [PR 3927](https://github.com/gradio-app/gradio/pull/3927).
- Update to the JS client by [@pngwn](https://github.com/pngwn) in [PR 4202](https://github.com/gradio-app/gradio/pull/4202)

### Bug Fixes:

- Fix "TypeError: issubclass() arg 1 must be a class" When use Optional[Types] by [@lingfengchencn](https://github.com/lingfengchencn) in [PR 4200](https://github.com/gradio-app/gradio/pull/4200).
- Gradio will no longer send any analytics or call home if analytics are disabled with the GRADIO_ANALYTICS_ENABLED environment variable. By [@akx](https://github.com/akx) in [PR 4194](https://github.com/gradio-app/gradio/pull/4194) and [PR 4236](https://github.com/gradio-app/gradio/pull/4236)
- The deprecation warnings for kwargs now show the actual stack level for the invocation, by [@akx](https://github.com/akx) in [PR 4203](https://github.com/gradio-app/gradio/pull/4203).
- Fix "TypeError: issubclass() arg 1 must be a class" When use Optional[Types] by [@lingfengchencn](https://github.com/lingfengchencn) in [PR 4200](https://github.com/gradio-app/gradio/pull/4200).
- Ensure cancelling functions work correctly by [@pngwn](https://github.com/pngwn) in [PR 4225](https://github.com/gradio-app/gradio/pull/4225)
- Fixes a bug with typing.get_type_hints() on Python 3.9 by [@abidlabs](https://github.com/abidlabs) in [PR 4228](https://github.com/gradio-app/gradio/pull/4228).
- Fixes JSONDecodeError by [@davidai](https://github.com/davidai) in [PR 4241](https://github.com/gradio-app/gradio/pull/4241)
- Fix `chatbot_dialogpt` demo by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4238](https://github.com/gradio-app/gradio/pull/4238).

### Other Changes:

- Change `gr.Chatbot()` markdown parsing to frontend using `marked` library and `prism` by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4150](https://github.com/gradio-app/gradio/pull/4150)
- Update the js client by [@pngwn](https://github.com/pngwn) in [PR 3899](https://github.com/gradio-app/gradio/pull/3899)
- Fix documentation for the shape of the numpy array produced by the `Image` component by [@der3318](https://github.com/der3318) in [PR 4204](https://github.com/gradio-app/gradio/pull/4204).
- Updates the timeout for websocket messaging from 1 second to 5 seconds by [@abidlabs](https://github.com/abidlabs) in [PR 4235](https://github.com/gradio-app/gradio/pull/4235)

### Breaking Changes:

No changes to highlight.

## 3.30.0

### New Features:

- Adds a `root_path` parameter to `launch()` that allows running Gradio applications on subpaths (e.g. www.example.com/app) behind a proxy, by [@abidlabs](https://github.com/abidlabs) in [PR 4133](https://github.com/gradio-app/gradio/pull/4133)
- Fix dropdown change listener to trigger on change when updated as an output by [@aliabid94](https://github.com/aliabid94) in [PR 4128](https://github.com/gradio-app/gradio/pull/4128).
- Add `.input` event listener, which is only triggered when a user changes the component value (as compared to `.change`, which is also triggered when a component updates as the result of a function trigger), by [@aliabid94](https://github.com/aliabid94) in [PR 4157](https://github.com/gradio-app/gradio/pull/4157).

### Bug Fixes:

- Records username when flagging by [@abidlabs](https://github.com/abidlabs) in [PR 4135](https://github.com/gradio-app/gradio/pull/4135)
- Fix website build issue by [@aliabd](https://github.com/aliabd) in [PR 4142](https://github.com/gradio-app/gradio/pull/4142)
- Fix lang agnostic type info for `gr.File(file_count='multiple')` output components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4153](https://github.com/gradio-app/gradio/pull/4153)

### Other Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

## 3.29.0

### New Features:

- Returning language agnostic types in the `/info` route by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4039](https://github.com/gradio-app/gradio/pull/4039)

### Bug Fixes:

- Allow users to upload audio files in Audio component on iOS by by [@aliabid94](https://github.com/aliabid94) in [PR 4071](https://github.com/gradio-app/gradio/pull/4071).
- Fixes the gradio theme builder error that appeared on launch by [@aliabid94](https://github.com/aliabid94) and [@abidlabs](https://github.com/abidlabs) in [PR 4080](https://github.com/gradio-app/gradio/pull/4080)
- Keep Accordion content in DOM by [@aliabid94](https://github.com/aliabid94) in [PR 4070](https://github.com/gradio-app/gradio/pull/4073)
- Fixed bug where type hints in functions caused the event handler to crash by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4068](https://github.com/gradio-app/gradio/pull/4068)
- Fix dropdown default value not appearing by [@aliabid94](https://github.com/aliabid94) in [PR 4072](https://github.com/gradio-app/gradio/pull/4072).
- Soft theme label color fix by [@aliabid94](https://github.com/aliabid94) in [PR 4070](https://github.com/gradio-app/gradio/pull/4070)
- Fix `gr.Slider` `release` event not triggering on mobile by [@space-nuko](https://github.com/space-nuko) in [PR 4098](https://github.com/gradio-app/gradio/pull/4098)
- Removes extraneous `State` component info from the `/info` route by [@abidlabs](https://github.com/freddyaboulton) in [PR 4107](https://github.com/gradio-app/gradio/pull/4107)
- Make .then() work even if first event fails by [@aliabid94](https://github.com/aliabid94) in [PR 4115](https://github.com/gradio-app/gradio/pull/4115).

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Allow users to submit with enter in Interfaces with textbox / number inputs [@aliabid94](https://github.com/aliabid94) in [PR 4090](https://github.com/gradio-app/gradio/pull/4090).
- Updates gradio's requirements.txt to requires uvicorn>=0.14.0 by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)
- Updates some error messaging by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)
- Renames simplified Chinese translation file from `zh-cn.json` to `zh-CN.json` by [@abidlabs](https://github.com/abidlabs) in [PR 4086](https://github.com/gradio-app/gradio/pull/4086)

### Contributors Shoutout:

No changes to highlight.

## 3.28.3

### New Features:

No changes to highlight.

### Bug Fixes:

- Fixes issue with indentation in `gr.Code()` component with streaming by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4043](https://github.com/gradio-app/gradio/pull/4043)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.28.2

### Bug Fixes

- Code component visual updates by [@pngwn](https://github.com/pngwn) in [PR 4051](https://github.com/gradio-app/gradio/pull/4051)

### New Features:

- Add support for `visual-question-answering`, `document-question-answering`, and `image-to-text` using `gr.Interface.load("models/...")` and `gr.Interface.from_pipeline` by [@osanseviero](https://github.com/osanseviero) in [PR 3887](https://github.com/gradio-app/gradio/pull/3887)
- Add code block support in `gr.Chatbot()`, by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 4048](https://github.com/gradio-app/gradio/pull/4048)
- Adds the ability to blocklist filepaths (and also improves the allowlist mechanism) by [@abidlabs](https://github.com/abidlabs) in [PR 4047](https://github.com/gradio-app/gradio/pull/4047).
- Adds the ability to specify the upload directory via an environment variable by [@abidlabs](https://github.com/abidlabs) in [PR 4047](https://github.com/gradio-app/gradio/pull/4047).

### Bug Fixes:

- Fixes issue with `matplotlib` not rendering correctly if the backend was not set to `Agg` by [@abidlabs](https://github.com/abidlabs) in [PR 4029](https://github.com/gradio-app/gradio/pull/4029)
- Fixes bug where rendering the same `gr.State` across different Interfaces/Blocks within larger Blocks would not work by [@abidlabs](https://github.com/abidlabs) in [PR 4030](https://github.com/gradio-app/gradio/pull/4030)
- Code component visual updates by [@pngwn](https://github.com/pngwn) in [PR 4051](https://github.com/gradio-app/gradio/pull/4051)

### Documentation Changes:

- Adds a Guide on how to use the Python Client within a FastAPI app, by [@abidlabs](https://github.com/abidlabs) in [PR 3892](https://github.com/gradio-app/gradio/pull/3892)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

- `gr.HuggingFaceDatasetSaver` behavior changed internally. The `flagging/` folder is not a `.git/` folder anymore when using it. `organization` parameter is now ignored in favor of passing a full dataset id as `dataset_name` (e.g. `"username/my-dataset"`).
- New lines (`\n`) are not automatically converted to `<br>` in `gr.Markdown()` or `gr.Chatbot()`. For multiple new lines, a developer must add multiple `<br>` tags.

### Full Changelog:

- Safer version of `gr.HuggingFaceDatasetSaver` using HTTP methods instead of git pull/push by [@Wauplin](https://github.com/Wauplin) in [PR 3973](https://github.com/gradio-app/gradio/pull/3973)

### Contributors Shoutout:

No changes to highlight.

## 3.28.1

### New Features:

- Add a "clear mask" button to `gr.Image` sketch modes, by [@space-nuko](https://github.com/space-nuko) in [PR 3615](https://github.com/gradio-app/gradio/pull/3615)

### Bug Fixes:

- Fix dropdown default value not appearing by [@aliabid94](https://github.com/aliabid94) in [PR 3996](https://github.com/gradio-app/gradio/pull/3996).
- Fix faded coloring of output textboxes in iOS / Safari by [@aliabid94](https://github.com/aliabid94) in [PR 3993](https://github.com/gradio-app/gradio/pull/3993)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

- CI: Simplified Python CI workflow by [@akx](https://github.com/akx) in [PR 3982](https://github.com/gradio-app/gradio/pull/3982)
- Upgrade pyright to 1.1.305 by [@akx](https://github.com/akx) in [PR 4042](https://github.com/gradio-app/gradio/pull/4042)
- More Ruff rules are enabled and lint errors fixed by [@akx](https://github.com/akx) in [PR 4038](https://github.com/gradio-app/gradio/pull/4038)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.28.0

### Bug Fixes:

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

### Documentation Changes:

- Make use of `gr` consistent across the docs by [@duerrsimon](https://github.com/duerrsimon) in [PR 3901](https://github.com/gradio-app/gradio/pull/3901)
- Fixed typo in theming-guide.md by [@eltociear](https://github.com/eltociear) in [PR 3952](https://github.com/gradio-app/gradio/pull/3952)

### Testing and Infrastructure Changes:

- CI: Python backend lint is only run once, by [@akx](https://github.com/akx) in [PR 3960](https://github.com/gradio-app/gradio/pull/3960)
- Format invocations and concatenations were replaced by f-strings where possible by [@akx](https://github.com/akx) in [PR 3984](https://github.com/gradio-app/gradio/pull/3984)
- Linting rules were made more strict and issues fixed by [@akx](https://github.com/akx) in [PR 3979](https://github.com/gradio-app/gradio/pull/3979).

### Breaking Changes:

- Some re-exports in `gradio.themes` utilities (introduced in 3.24.0) have been eradicated.
  By [@akx](https://github.com/akx) in [PR 3958](https://github.com/gradio-app/gradio/pull/3958)

### Full Changelog:

- Add DESCRIPTION.md to image_segmentation demo by [@aliabd](https://github.com/aliabd) in [PR 3866](https://github.com/gradio-app/gradio/pull/3866)
- Fix error in running `gr.themes.builder()` by [@deepkyu](https://github.com/deepkyu) in [PR 3869](https://github.com/gradio-app/gradio/pull/3869)
- Fixed a JavaScript TypeError when loading custom JS with `_js` and setting `outputs` to `None` in `gradio.Blocks()` by [@DavG25](https://github.com/DavG25) in [PR 3883](https://github.com/gradio-app/gradio/pull/3883)
- Fixed bg_background_fill theme property to expand to whole background, block_radius to affect form elements as well, and added block_label_shadow theme property by [@aliabid94](https://github.com/aliabid94) in [PR 3590](https://github.com/gradio-app/gradio/pull/3590)

### Contributors Shoutout:

No changes to highlight.

## 3.27.0

### New Features:

###### AnnotatedImage Component

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

### Bug Fixes:

No changes to highlight.

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.26.0

### New Features:

###### `Video` component supports subtitles

- Allow the video component to accept subtitles as input, by [@tomchang25](https://github.com/tomchang25) in [PR 3673](https://github.com/gradio-app/gradio/pull/3673). To provide subtitles, simply return a tuple consisting of `(path_to_video, path_to_subtitles)` from your function. Both `.srt` and `.vtt` formats are supported:

```py
with gr.Blocks() as demo:
    gr.Video(("video.mp4", "captions.srt"))
```

### Bug Fixes:

- Fix code markdown support in `gr.Chatbot()` component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3816](https://github.com/gradio-app/gradio/pull/3816)

### Documentation Changes:

- Updates the "view API" page in Gradio apps to use the `gradio_client` library by [@aliabd](https://github.com/aliabd) in [PR 3765](https://github.com/gradio-app/gradio/pull/3765)

- Read more about how to use the `gradio_client` library here: https://gradio.app/getting-started-with-the-python-client/

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.25.0

### New Features:

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

### Bug Fixes:

- Increase timeout for sending analytics data by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3647](https://github.com/gradio-app/gradio/pull/3647)
- Fix bug where http token was not accessed over websocket connections by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3735](https://github.com/gradio-app/gradio/pull/3735)
- Add ability to specify `rows`, `columns` and `object-fit` in `style()` for `gr.Gallery()` component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3586](https://github.com/gradio-app/gradio/pull/3586)
- Fix bug where recording an audio file through the microphone resulted in a corrupted file name by [@abidlabs](https://github.com/abidlabs) in [PR 3770](https://github.com/gradio-app/gradio/pull/3770)
- Added "ssl_verify" to blocks.launch method to allow for use of self-signed certs by [@garrettsutula](https://github.com/garrettsutula) in [PR 3873](https://github.com/gradio-app/gradio/pull/3873)
- Fix bug where iterators where not being reset for processes that terminated early by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3777](https://github.com/gradio-app/gradio/pull/3777)
- Fix bug where the upload button was not properly handling the `file_count='multiple'` case by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3782](https://github.com/gradio-app/gradio/pull/3782)
- Fix bug where use Via API button was giving error by [@Devang-C](https://github.com/Devang-C) in [PR 3783](https://github.com/gradio-app/gradio/pull/3783)

### Documentation Changes:

- Fix invalid argument docstrings, by [@akx](https://github.com/akx) in [PR 3740](https://github.com/gradio-app/gradio/pull/3740)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Fixed IPv6 listening to work with bracket [::1] notation, by [@dsully](https://github.com/dsully) in [PR 3695](https://github.com/gradio-app/gradio/pull/3695)

### Contributors Shoutout:

No changes to highlight.

## 3.24.1

### New Features:

- No changes to highlight.

### Bug Fixes:

- Fixes Chatbot issue where new lines were being created every time a message was sent back and forth by [@aliabid94](https://github.com/aliabid94) in [PR 3717](https://github.com/gradio-app/gradio/pull/3717).
- Fixes data updating in DataFrame invoking a `select` event once the dataframe has been selected. By [@yiyuezhuo](https://github.com/yiyuezhuo) in [PR 3861](https://github.com/gradio-app/gradio/pull/3861)
- Fixes false positive warning which is due to too strict type checking by [@yiyuezhuo](https://github.com/yiyuezhuo) in [PR 3837](https://github.com/gradio-app/gradio/pull/3837).

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.24.0

### New Features:

- Trigger the release event when Slider number input is released or unfocused by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3589](https://github.com/gradio-app/gradio/pull/3589)
- Created Theme Builder, which allows users to create themes without writing any code, by [@aliabid94](https://github.com/aliabid94) in [PR 3664](https://github.com/gradio-app/gradio/pull/3664). Launch by:

  ```python
  import gradio as gr
  gr.themes.builder()
  ```

  ![Theme Builder](https://user-images.githubusercontent.com/7870876/228204929-d71cbba5-69c2-45b3-bd20-e3a201d98b12.png)

- The `Dropdown` component now has a `allow_custom_value` parameter that lets users type in custom values not in the original list of choices.
- The `Colorpicker` component now has a `.blur()` event

###### Added a download button for videos! 📥

![download_video](https://user-images.githubusercontent.com/41651716/227009612-9bc5fb72-2a44-4c55-9b7b-a0fa098e7f25.gif)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3581](https://github.com/gradio-app/gradio/pull/3581).

- Trigger the release event when Slider number input is released or unfocused by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3589](https://github.com/gradio-app/gradio/pull/3589)

### Bug Fixes:

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

### Documentation Changes:

- Makes some fixes to the Theme Guide related to naming of variables, by [@abidlabs](https://github.com/abidlabs) in [PR 3561](https://github.com/gradio-app/gradio/pull/3561)
- Documented `HuggingFaceDatasetJSONSaver` by [@osanseviero](https://github.com/osanseviero) in [PR 3604](https://github.com/gradio-app/gradio/pull/3604)
- Makes some additions to documentation of `Audio` and `State` components, and fixes the `pictionary` demo by [@abidlabs](https://github.com/abidlabs) in [PR 3611](https://github.com/gradio-app/gradio/pull/3611)
- Fix outdated sharing your app guide by [@aliabd](https://github.com/aliabd) in [PR 3699](https://github.com/gradio-app/gradio/pull/3699)

### Testing and Infrastructure Changes:

- Removed heavily-mocked tests related to comet_ml, wandb, and mlflow as they added a significant amount of test dependencies that prevented installation of test dependencies on Windows environments. By [@abidlabs](https://github.com/abidlabs) in [PR 3608](https://github.com/gradio-app/gradio/pull/3608)
- Added Windows continuous integration, by [@space-nuko](https://github.com/space-nuko) in [PR 3628](https://github.com/gradio-app/gradio/pull/3628)
- Switched linting from flake8 + isort to `ruff`, by [@akx](https://github.com/akx) in [PR 3710](https://github.com/gradio-app/gradio/pull/3710)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Mobile responsive iframes in themes guide by [@aliabd](https://github.com/aliabd) in [PR 3562](https://github.com/gradio-app/gradio/pull/3562)
- Remove extra $demo from theme guide by [@aliabd](https://github.com/aliabd) in [PR 3563](https://github.com/gradio-app/gradio/pull/3563)
- Set the theme name to be the upstream repo name when loading from the hub by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3595](https://github.com/gradio-app/gradio/pull/3595)
- Copy everything in website Dockerfile, fix build issues by [@aliabd](https://github.com/aliabd) in [PR 3659](https://github.com/gradio-app/gradio/pull/3659)
- Raise error when an event is queued but the queue is not configured by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3640](https://github.com/gradio-app/gradio/pull/3640)
- Allows users to apss in a string name for a built-in theme, by [@abidlabs](https://github.com/abidlabs) in [PR 3641](https://github.com/gradio-app/gradio/pull/3641)
- Added `orig_name` to Video output in the backend so that the front end can set the right name for downloaded video files by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3700](https://github.com/gradio-app/gradio/pull/3700)

### Contributors Shoutout:

No changes to highlight.

## 3.23.0

### New Features:

###### Theme Sharing!

Once you have created a theme, you can upload it to the HuggingFace Hub to let others view it, use it, and build off of it! You can also download, reuse, and remix other peoples' themes. See https://gradio.app/theming-guide/ for more details.

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3428](https://github.com/gradio-app/gradio/pull/3428)

### Bug Fixes:

- Removes leading spaces from all lines of code uniformly in the `gr.Code()` component. By [@abidlabs](https://github.com/abidlabs) in [PR 3556](https://github.com/gradio-app/gradio/pull/3556)
- Fixed broken login page, by [@aliabid94](https://github.com/aliabid94) in [PR 3529](https://github.com/gradio-app/gradio/pull/3529)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Fix rendering of dropdowns to take more space, and related bugs, by [@aliabid94](https://github.com/aliabid94) in [PR 3549](https://github.com/gradio-app/gradio/pull/3549)

### Contributors Shoutout:

No changes to highlight.

## 3.22.1

### New Features:

No changes to highlight.

### Bug Fixes:

- Restore label bars by [@aliabid94](https://github.com/aliabid94) in [PR 3507](https://github.com/gradio-app/gradio/pull/3507)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.22.0

### New Features:

###### Official Theme release

Gradio now supports a new theme system, which allows you to customize the look and feel of your app. You can now use the `theme=` kwarg to pass in a prebuilt theme, or customize your own! See https://gradio.app/theming-guide/ for more details. By [@aliabid94](https://github.com/aliabid94) in [PR 3470](https://github.com/gradio-app/gradio/pull/3470) and [PR 3497](https://github.com/gradio-app/gradio/pull/3497)

###### `elem_classes`

Add keyword argument `elem_classes` to Components to control class names of components, in the same manner as existing `elem_id`.
By [@aliabid94](https://github.com/aliabid94) in [PR 3466](https://github.com/gradio-app/gradio/pull/3466)

### Bug Fixes:

- Fixes the File.upload() event trigger which broke as part of the change in how we uploaded files by [@abidlabs](https://github.com/abidlabs) in [PR 3462](https://github.com/gradio-app/gradio/pull/3462)
- Fixed issue with `gr.Request` object failing to handle dictionaries when nested keys couldn't be converted to variable names [#3454](https://github.com/gradio-app/gradio/issues/3454) by [@radames](https://github.com/radames) in [PR 3459](https://github.com/gradio-app/gradio/pull/3459)
- Fixed bug where css and client api was not working properly when mounted in a subpath by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3482](https://github.com/gradio-app/gradio/pull/3482)

### Documentation Changes:

- Document gr.Error in the docs by [@aliabd](https://github.com/aliabd) in [PR 3465](https://github.com/gradio-app/gradio/pull/3465)

### Testing and Infrastructure Changes:

- Pinned `pyright==1.1.298` for stability by [@abidlabs](https://github.com/abidlabs) in [PR 3475](https://github.com/gradio-app/gradio/pull/3475)
- Removed `IOComponent.add_interactive_to_config()` by [@space-nuko](https://github.com/space-nuko) in [PR 3476](https://github.com/gradio-app/gradio/pull/3476)
- Removed `IOComponent.generate_sample()` by [@space-nuko](https://github.com/space-nuko) in [PR 3475](https://github.com/gradio-app/gradio/pull/3483)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Revert primary button background color in dark mode by [@aliabid94](https://github.com/aliabid94) in [PR 3468](https://github.com/gradio-app/gradio/pull/3468)

### Contributors Shoutout:

No changes to highlight.

## 3.21.0

### New Features:

###### Theme Sharing 🎨 🤝

You can now share your gradio themes with the world!

After creating a theme, you can upload it to the HuggingFace Hub to let others view it, use it, and build off of it!

###### Uploading

There are two ways to upload a theme, via the theme class instance or the command line.

1. Via the class instance

```python
my_theme.push_to_hub(repo_name="my_theme",
                     version="0.2.0",
                     hf_token="...")
```

2. Via the command line

First save the theme to disk

```python
my_theme.dump(filename="my_theme.json")
```

Then use the `upload_theme` command:

```bash
upload_theme\
"my_theme.json"\
"my_theme"\
"0.2.0"\
"<hf-token>"
```

The `version` must be a valid [semantic version](https://www.geeksforgeeks.org/introduction-semantic-versioning/) string.

This creates a space on the huggingface hub to host the theme files and show potential users a preview of your theme.

An example theme space is here: https://huggingface.co/spaces/freddyaboulton/dracula_revamped

###### Downloading

To use a theme from the hub, use the `from_hub` method on the `ThemeClass` and pass it to your app:

```python
my_theme = gr.Theme.from_hub("freddyaboulton/my_theme")

with gr.Blocks(theme=my_theme) as demo:
    ....
```

You can also pass the theme string directly to `Blocks` or `Interface` (`gr.Blocks(theme="freddyaboulton/my_theme")`)

You can pin your app to an upstream theme version by using semantic versioning expressions.

For example, the following would ensure the theme we load from the `my_theme` repo was between versions `0.1.0` and `0.2.0`:

```python
with gr.Blocks(theme="freddyaboulton/my_theme@>=0.1.0,<0.2.0") as demo:
    ....
```

by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3428](https://github.com/gradio-app/gradio/pull/3428)

###### Code component 🦾

New code component allows you to enter, edit and display code with full syntax highlighting by [@pngwn](https://github.com/pngwn) in [PR 3421](https://github.com/gradio-app/gradio/pull/3421)

###### The `Chatbot` component now supports audio, video, and images

The `Chatbot` component now supports audio, video, and images with a simple syntax: simply
pass in a tuple with the URL or filepath (the second optional element of the tuple is alt text), and the image/audio/video will be displayed:

```python
gr.Chatbot([
    (("driving.mp4",), "cool video"),
    (("cantina.wav",), "cool audio"),
    (("lion.jpg", "A lion"), "cool pic"),
]).style(height=800)
```

<img width="1054" alt="image" src="https://user-images.githubusercontent.com/1778297/224116682-5908db47-f0fa-405c-82ab-9c7453e8c4f1.png">

Note: images were previously supported via Markdown syntax and that is still supported for backwards compatibility. By [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3413](https://github.com/gradio-app/gradio/pull/3413)

- Allow consecutive function triggers with `.then` and `.success` by [@aliabid94](https://github.com/aliabid94) in [PR 3430](https://github.com/gradio-app/gradio/pull/3430)

- New code component allows you to enter, edit and display code with full syntax highlighting by [@pngwn](https://github.com/pngwn) in [PR 3421](https://github.com/gradio-app/gradio/pull/3421)

![](https://user-images.githubusercontent.com/12937446/224116643-5cfb94b3-93ce-43ee-bb7b-c25c3b66e0a1.png)

- Added the `.select()` event listener, which also includes event data that can be passed as an argument to a function with type hint `gr.SelectData`. The following components support the `.select()` event listener: Chatbot, CheckboxGroup, Dataframe, Dropdown, File, Gallery, HighlightedText, Label, Radio, TabItem, Tab, Textbox. Example usage:

```python
import gradio as gr

with gr.Blocks() as demo:
    gallery = gr.Gallery(["images/1.jpg", "images/2.jpg", "images/3.jpg"])
    selected_index = gr.Textbox()

    def on_select(evt: gr.SelectData):
        return evt.index

    gallery.select(on_select, None, selected_index)
```

By [@aliabid94](https://github.com/aliabid94) in [PR 3399](https://github.com/gradio-app/gradio/pull/3399)

- The `Textbox` component now includes a copy button by [@abidlabs](https://github.com/abidlabs) in [PR 3452](https://github.com/gradio-app/gradio/pull/3452)

### Bug Fixes:

- Use `huggingface_hub` to send telemetry on `interface` and `blocks`; eventually to replace segment by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3342](https://github.com/gradio-app/gradio/pull/3342)
- Ensure load events created by components (randomize for slider, callable values) are never queued unless every is passed by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3391](https://github.com/gradio-app/gradio/pull/3391)
- Prevent in-place updates of `generic_update` by shallow copying by [@gitgithan](https://github.com/gitgithan) in [PR 3405](https://github.com/gradio-app/gradio/pull/3405) to fix [#3282](https://github.com/gradio-app/gradio/issues/3282)
- Fix bug caused by not importing `BlockContext` in `utils.py` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3424](https://github.com/gradio-app/gradio/pull/3424)
- Ensure dropdown does not highlight partial matches by [@pngwn](https://github.com/pngwn) in [PR 3421](https://github.com/gradio-app/gradio/pull/3421)
- Fix mic button display by [@aliabid94](https://github.com/aliabid94) in [PR 3456](https://github.com/gradio-app/gradio/pull/3456)

### Documentation Changes:

- Added a section on security and access when sharing Gradio apps by [@abidlabs](https://github.com/abidlabs) in [PR 3408](https://github.com/gradio-app/gradio/pull/3408)
- Add Chinese README by [@uanu2002](https://github.com/uanu2002) in [PR 3394](https://github.com/gradio-app/gradio/pull/3394)
- Adds documentation for web components by [@abidlabs](https://github.com/abidlabs) in [PR 3407](https://github.com/gradio-app/gradio/pull/3407)
- Fixed link in Chinese readme by [@eltociear](https://github.com/eltociear) in [PR 3417](https://github.com/gradio-app/gradio/pull/3417)
- Document Blocks methods by [@aliabd](https://github.com/aliabd) in [PR 3427](https://github.com/gradio-app/gradio/pull/3427)
- Fixed bug where event handlers were not showing up in documentation by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3434](https://github.com/gradio-app/gradio/pull/3434)

### Testing and Infrastructure Changes:

- Fixes tests that were failing locally but passing on CI by [@abidlabs](https://github.com/abidlabs) in [PR 3411](https://github.com/gradio-app/gradio/pull/3411)
- Remove codecov from the repo by [@aliabd](https://github.com/aliabd) in [PR 3415](https://github.com/gradio-app/gradio/pull/3415)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Prevent in-place updates of `generic_update` by shallow copying by [@gitgithan](https://github.com/gitgithan) in [PR 3405](https://github.com/gradio-app/gradio/pull/3405) to fix [#3282](https://github.com/gradio-app/gradio/issues/3282)
- Persist file names of files uploaded through any Gradio component by [@abidlabs](https://github.com/abidlabs) in [PR 3412](https://github.com/gradio-app/gradio/pull/3412)
- Fix markdown embedded component in docs by [@aliabd](https://github.com/aliabd) in [PR 3410](https://github.com/gradio-app/gradio/pull/3410)
- Clean up event listeners code by [@aliabid94](https://github.com/aliabid94) in [PR 3420](https://github.com/gradio-app/gradio/pull/3420)
- Fix css issue with spaces logo by [@aliabd](https://github.com/aliabd) in [PR 3422](https://github.com/gradio-app/gradio/pull/3422)
- Makes a few fixes to the `JSON` component (show_label parameter, icons) in [@abidlabs](https://github.com/abidlabs) in [PR 3451](https://github.com/gradio-app/gradio/pull/3451)

### Contributors Shoutout:

No changes to highlight.

## 3.20.1

### New Features:

- Add `height` kwarg to style in `gr.Chatbot()` component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3369](https://github.com/gradio-app/gradio/pull/3369)

```python
chatbot = gr.Chatbot().style(height=500)
```

### Bug Fixes:

- Ensure uploaded images are always shown in the sketch tool by [@pngwn](https://github.com/pngwn) in [PR 3386](https://github.com/gradio-app/gradio/pull/3386)
- Fixes bug where when if fn is a non-static class member, then self should be ignored as the first param of the fn by [@or25](https://github.com/or25) in [PR #3227](https://github.com/gradio-app/gradio/pull/3227)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.20.0

### New Features:

###### Release event for Slider

Now you can trigger your python function to run when the slider is released as opposed to every slider change value!

Simply use the `release` method on the slider

```python
slider.release(function, inputs=[...], outputs=[...], api_name="predict")
```

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3353](https://github.com/gradio-app/gradio/pull/3353)

###### Dropdown Component Updates

The standard dropdown component now supports searching for choices. Also when `multiselect` is `True`, you can specify `max_choices` to set the maximum number of choices you want the user to be able to select from the dropdown component.

```python
gr.Dropdown(label="Choose your favorite colors", choices=["red", "blue", "green", "yellow", "orange"], multiselect=True, max_choices=2)
```

by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3211](https://github.com/gradio-app/gradio/pull/3211)

###### Download button for images 🖼️

Output images will now automatically have a download button displayed to make it easier to save and share
the results of Machine Learning art models.

![download_sketch](https://user-images.githubusercontent.com/41651716/221025113-e693bf41-eabd-42b3-a4f2-26f2708d98fe.gif)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3297](https://github.com/gradio-app/gradio/pull/3297)

- Updated image upload component to accept all image formats, including lossless formats like .webp by [@fienestar](https://github.com/fienestar) in [PR 3225](https://github.com/gradio-app/gradio/pull/3225)
- Adds a disabled mode to the `gr.Button` component by setting `interactive=False` by [@abidlabs](https://github.com/abidlabs) in [PR 3266](https://github.com/gradio-app/gradio/pull/3266) and [PR 3288](https://github.com/gradio-app/gradio/pull/3288)
- Adds visual feedback to the when the Flag button is clicked, by [@abidlabs](https://github.com/abidlabs) in [PR 3289](https://github.com/gradio-app/gradio/pull/3289)
- Adds ability to set `flagging_options` display text and saved flag separately by [@abidlabs](https://github.com/abidlabs) in [PR 3289](https://github.com/gradio-app/gradio/pull/3289)
- Allow the setting of `brush_radius` for the `Image` component both as a default and via `Image.update()` by [@pngwn](https://github.com/pngwn) in [PR 3277](https://github.com/gradio-app/gradio/pull/3277)
- Added `info=` argument to form components to enable extra context provided to users, by [@aliabid94](https://github.com/aliabid94) in [PR 3291](https://github.com/gradio-app/gradio/pull/3291)
- Allow developers to access the username of a logged-in user from the `gr.Request()` object using the `.username` attribute by [@abidlabs](https://github.com/abidlabs) in [PR 3296](https://github.com/gradio-app/gradio/pull/3296)
- Add `preview` option to `Gallery.style` that launches the gallery in preview mode when first loaded by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3345](https://github.com/gradio-app/gradio/pull/3345)

### Bug Fixes:

- Ensure `mirror_webcam` is always respected by [@pngwn](https://github.com/pngwn) in [PR 3245](https://github.com/gradio-app/gradio/pull/3245)
- Fix issue where updated markdown links were not being opened in a new tab by [@gante](https://github.com/gante) in [PR 3236](https://github.com/gradio-app/gradio/pull/3236)
- API Docs Fixes by [@aliabd](https://github.com/aliabd) in [PR 3287](https://github.com/gradio-app/gradio/pull/3287)
- Added a timeout to queue messages as some demos were experiencing infinitely growing queues from active jobs waiting forever for clients to respond by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3196](https://github.com/gradio-app/gradio/pull/3196)
- Fixes the height of rendered LaTeX images so that they match the height of surrounding text by [@abidlabs](https://github.com/abidlabs) in [PR 3258](https://github.com/gradio-app/gradio/pull/3258) and in [PR 3276](https://github.com/gradio-app/gradio/pull/3276)
- Fix bug where matplotlib images where always too small on the front end by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3274](https://github.com/gradio-app/gradio/pull/3274)
- Remove embed's `initial_height` when loading is complete so the embed finds its natural height once it is loaded [@pngwn](https://github.com/pngwn) in [PR 3292](https://github.com/gradio-app/gradio/pull/3292)
- Prevent Sketch from crashing when a default image is provided by [@pngwn](https://github.com/pngwn) in [PR 3277](https://github.com/gradio-app/gradio/pull/3277)
- Respect the `shape` argument on the front end when creating Image Sketches by [@pngwn](https://github.com/pngwn) in [PR 3277](https://github.com/gradio-app/gradio/pull/3277)
- Fix infinite loop caused by setting `Dropdown's` value to be `[]` and adding a change event on the dropdown by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3295](https://github.com/gradio-app/gradio/pull/3295)
- Fix change event listed twice in image docs by [@aliabd](https://github.com/aliabd) in [PR 3318](https://github.com/gradio-app/gradio/pull/3318)
- Fix bug that cause UI to be vertically centered at all times by [@pngwn](https://github.com/pngwn) in [PR 3336](https://github.com/gradio-app/gradio/pull/3336)
- Fix bug where `height` set in `Gallery.style` was not respected by the front-end by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3343](https://github.com/gradio-app/gradio/pull/3343)
- Ensure markdown lists are rendered correctly by [@pngwn](https://github.com/pngwn) in [PR 3341](https://github.com/gradio-app/gradio/pull/3341)
- Ensure that the initial empty value for `gr.Dropdown(Multiselect=True)` is an empty list and the initial value for `gr.Dropdown(Multiselect=False)` is an empty string by [@pngwn](https://github.com/pngwn) in [PR 3338](https://github.com/gradio-app/gradio/pull/3338)
- Ensure uploaded images respect the shape property when the canvas is also enabled by [@pngwn](https://github.com/pngwn) in [PR 3351](https://github.com/gradio-app/gradio/pull/3351)
- Ensure that Google Analytics works correctly when gradio apps are created with `analytics_enabled=True` by [@abidlabs](https://github.com/abidlabs) in [PR 3349](https://github.com/gradio-app/gradio/pull/3349)
- Fix bug where files were being re-uploaded after updates by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3375](https://github.com/gradio-app/gradio/pull/3375)
- Fix error when using backen_fn and custom js at the same time by [@jialeicui](https://github.com/jialeicui) in [PR 3358](https://github.com/gradio-app/gradio/pull/3358)
- Support new embeds for huggingface spaces subdomains by [@pngwn](https://github.com/pngwn) in [PR 3367](https://github.com/gradio-app/gradio/pull/3367)

### Documentation Changes:

- Added the `types` field to the dependency field in the config by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3315](https://github.com/gradio-app/gradio/pull/3315)
- Gradio Status Page by [@aliabd](https://github.com/aliabd) in [PR 3331](https://github.com/gradio-app/gradio/pull/3331)
- Adds a Guide on setting up a dashboard from Supabase data using the `gr.BarPlot`
  component by [@abidlabs](https://github.com/abidlabs) in [PR 3275](https://github.com/gradio-app/gradio/pull/3275)

### Testing and Infrastructure Changes:

- Adds a script to benchmark the performance of the queue and adds some instructions on how to use it. By [@freddyaboulton](https://github.com/freddyaboulton) and [@abidlabs](https://github.com/abidlabs) in [PR 3272](https://github.com/gradio-app/gradio/pull/3272)
- Flaky python tests no longer cancel non-flaky tests by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3344](https://github.com/gradio-app/gradio/pull/3344)

### Breaking Changes:

- Chatbot bubble colors can no longer be set by `chatbot.style(color_map=)` by [@aliabid94] in [PR 3370](https://github.com/gradio-app/gradio/pull/3370)

### Full Changelog:

- Fixed comment typo in components.py by [@eltociear](https://github.com/eltociear) in [PR 3235](https://github.com/gradio-app/gradio/pull/3235)
- Cleaned up chatbot ui look and feel by [@aliabid94] in [PR 3370](https://github.com/gradio-app/gradio/pull/3370)

### Contributors Shoutout:

No changes to highlight.

## 3.19.1

### New Features:

No changes to highlight.

### Bug Fixes:

- UI fixes including footer and API docs by [@aliabid94](https://github.com/aliabid94) in [PR 3242](https://github.com/gradio-app/gradio/pull/3242)
- Updated image upload component to accept all image formats, including lossless formats like .webp by [@fienestar](https://github.com/fienestar) in [PR 3225](https://github.com/gradio-app/gradio/pull/3225)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Added backend support for themes by [@aliabid94](https://github.com/aliabid94) in [PR 2931](https://github.com/gradio-app/gradio/pull/2931)
- Added support for button sizes "lg" (default) and "sm".

### Contributors Shoutout:

No changes to highlight.

## 3.19.0

### New Features:

###### Improved embedding experience

When embedding a spaces-hosted gradio app as a web component, you now get an improved UI linking back to the original space, better error handling and more intelligent load performance. No changes are required to your code to benefit from this enhanced experience; simply upgrade your gradio SDK to the latest version.

![](https://user-images.githubusercontent.com/12937446/219653294-86937632-72c1-4e93-a77c-af705d49382a.png)

This behaviour is configurable. You can disable the info panel at the bottom by passing `info="false"`. You can disable the container entirely by passing `container="false"`.

Error statuses are reported in the UI with an easy way for end-users to report problems to the original space author via the community tab of that Hugginface space:

![](https://user-images.githubusercontent.com/12937446/219655499-88019443-d694-44e7-9e6d-242e19d10a5c.png)

By default, gradio apps are lazy loaded, vastly improving performance when there are several demos on the page. Metadata is loaded ahead of time, but the space will only be loaded and rendered when it is in view.

This behaviour is configurable. You can pass `eager="true"` to load and render the space regardless of whether or not it is currently on the screen.

by [@pngwn](https://github.com/pngwn) in [PR 3205](https://github.com/gradio-app/gradio/pull/3205)

###### New `gr.BarPlot` component! 📊

Create interactive bar plots from a high-level interface with `gr.BarPlot`.
No need to remember matplotlib syntax anymore!

Example usage:

```python
import gradio as gr
import pandas as pd

simple = pd.DataFrame({
    'a': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    'b': [28, 55, 43, 91, 81, 53, 19, 87, 52]
})

with gr.Blocks() as demo:
    gr.BarPlot(
        simple,
        x="a",
        y="b",
        title="Simple Bar Plot with made up data",
        tooltip=['a', 'b'],
    )

demo.launch()
```

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3157](https://github.com/gradio-app/gradio/pull/3157)

###### Bokeh plots are back! 🌠

Fixed a bug that prevented bokeh plots from being displayed on the front end and extended support for both 2.x and 3.x versions of bokeh!

![image](https://user-images.githubusercontent.com/41651716/219468324-0d82e07f-8fb4-4ff9-b40c-8250b29e45f7.png)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3212](https://github.com/gradio-app/gradio/pull/3212)

### Bug Fixes:

- Adds ability to add a single message from the bot or user side. Ex: specify `None` as the second value in the tuple, to add a single message in the chatbot from the "bot" side.

```python
gr.Chatbot([("Hi, I'm DialoGPT. Try asking me a question.", None)])
```

By [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3165](https://github.com/gradio-app/gradio/pull/3165)

- Fixes `gr.utils.delete_none` to only remove props whose values are `None` from the config by [@abidlabs](https://github.com/abidlabs) in [PR 3188](https://github.com/gradio-app/gradio/pull/3188)
- Fix bug where embedded demos were not loading files properly by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3177](https://github.com/gradio-app/gradio/pull/3177)
- The `change` event is now triggered when users click the 'Clear All' button of the multiselect DropDown component by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3195](https://github.com/gradio-app/gradio/pull/3195)
- Stops File component from freezing when a large file is uploaded by [@aliabid94](https://github.com/aliabid94) in [PR 3191](https://github.com/gradio-app/gradio/pull/3191)
- Support Chinese pinyin in Dataframe by [@aliabid94](https://github.com/aliabid94) in [PR 3206](https://github.com/gradio-app/gradio/pull/3206)
- The `clear` event is now triggered when images are cleared by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3218](https://github.com/gradio-app/gradio/pull/3218)
- Fix bug where auth cookies where not sent when connecting to an app via http by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3223](https://github.com/gradio-app/gradio/pull/3223)
- Ensure latext CSS is always applied in light and dark mode by [@pngwn](https://github.com/pngwn) in [PR 3233](https://github.com/gradio-app/gradio/pull/3233)

### Documentation Changes:

- Sort components in docs by alphabetic order by [@aliabd](https://github.com/aliabd) in [PR 3152](https://github.com/gradio-app/gradio/pull/3152)
- Changes to W&B guide by [@scottire](https://github.com/scottire) in [PR 3153](https://github.com/gradio-app/gradio/pull/3153)
- Keep pnginfo metadata for gallery by [@wfng92](https://github.com/wfng92) in [PR 3150](https://github.com/gradio-app/gradio/pull/3150)
- Add a section on how to run a Gradio app locally [@osanseviero](https://github.com/osanseviero) in [PR 3170](https://github.com/gradio-app/gradio/pull/3170)
- Fixed typos in gradio events function documentation by [@vidalmaxime](https://github.com/vidalmaxime) in [PR 3168](https://github.com/gradio-app/gradio/pull/3168)
- Added an example using Gradio's batch mode with the diffusers library by [@abidlabs](https://github.com/abidlabs) in [PR 3224](https://github.com/gradio-app/gradio/pull/3224)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Fix demos page css and add close demos button by [@aliabd](https://github.com/aliabd) in [PR 3151](https://github.com/gradio-app/gradio/pull/3151)
- Caches temp files from base64 input data by giving them a deterministic path based on the contents of data by [@abidlabs](https://github.com/abidlabs) in [PR 3197](https://github.com/gradio-app/gradio/pull/3197)
- Better warnings (when there is a mismatch between the number of output components and values returned by a function, or when the `File` component or `UploadButton` component includes a `file_types` parameter along with `file_count=="dir"`) by [@abidlabs](https://github.com/abidlabs) in [PR 3194](https://github.com/gradio-app/gradio/pull/3194)
- Raises a `gr.Error` instead of a regular Python error when you use `gr.Interface.load()` to load a model and there's an error querying the HF API by [@abidlabs](https://github.com/abidlabs) in [PR 3194](https://github.com/gradio-app/gradio/pull/3194)
- Fixed gradio share links so that they are persistent and do not reset if network
  connection is disrupted by by [XciD](https://github.com/XciD), [Wauplin](https://github.com/Wauplin), and [@abidlabs](https://github.com/abidlabs) in [PR 3149](https://github.com/gradio-app/gradio/pull/3149) and a follow-up to allow it to work for users upgrading from a previous Gradio version in [PR 3221](https://github.com/gradio-app/gradio/pull/3221)

### Contributors Shoutout:

No changes to highlight.

## 3.18.0

### New Features:

###### Revamped Stop Button for Interfaces 🛑

If your Interface function is a generator, there used to be a separate `Stop` button displayed next
to the `Submit` button.

We've revamed the `Submit` button so that it turns into a `Stop` button during the generation process.
Clicking on the `Stop` button will cancel the generation and turn it back to a `Submit` button.
The `Stop` button will automatically turn back to a `Submit` button at the end of the generation if you don't use it!

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3124](https://github.com/gradio-app/gradio/pull/3124)

###### Queue now works with reload mode!

You can now call `queue` on your `demo` outside of the `if __name__ == "__main__"` block and
run the script in reload mode with the `gradio` command.

Any changes to the `app.py` file will be reflected in the webpage automatically and the queue will work
properly!

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3089](https://github.com/gradio-app/gradio/pull/3089)

###### Allow serving files from additional directories

```python
demo = gr.Interface(...)
demo.launch(
  file_directories=["/var/lib/demo/path/to/resources"]
)
```

By [@maxaudron](https://github.com/maxaudron) in [PR 3075](https://github.com/gradio-app/gradio/pull/3075)

### Bug Fixes:

- Fixes URL resolution on Windows by [@abidlabs](https://github.com/abidlabs) in [PR 3108](https://github.com/gradio-app/gradio/pull/3108)
- Example caching now works with components without a label attribute (e.g. `Column`) by [@abidlabs](https://github.com/abidlabs) in [PR 3123](https://github.com/gradio-app/gradio/pull/3123)
- Ensure the Video component correctly resets the UI state when a new video source is loaded and reduce choppiness of UI by [@pngwn](https://github.com/abidlabs) in [PR 3117](https://github.com/gradio-app/gradio/pull/3117)
- Fixes loading private Spaces by [@abidlabs](https://github.com/abidlabs) in [PR 3068](https://github.com/gradio-app/gradio/pull/3068)
- Added a warning when attempting to launch an `Interface` via the `%%blocks` jupyter notebook magic command by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3126](https://github.com/gradio-app/gradio/pull/3126)
- Fixes bug where interactive output image cannot be set when in edit mode by [@dawoodkhan82](https://github.com/@dawoodkhan82) in [PR 3135](https://github.com/gradio-app/gradio/pull/3135)
- A share link will automatically be created when running on Sagemaker notebooks so that the front-end is properly displayed by [@abidlabs](https://github.com/abidlabs) in [PR 3137](https://github.com/gradio-app/gradio/pull/3137)
- Fixes a few dropdown component issues; hide checkmark next to options as expected, and keyboard hover is visible by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3145]https://github.com/gradio-app/gradio/pull/3145)
- Fixed bug where example pagination buttons were not visible in dark mode or displayed under the examples table. By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3144](https://github.com/gradio-app/gradio/pull/3144)
- Fixed bug where the font color of axis labels and titles for native plots did not respond to dark mode preferences. By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3146](https://github.com/gradio-app/gradio/pull/3146)

### Documentation Changes:

- Added a guide on the 4 kinds of Gradio Interfaces by [@yvrjsharma](https://github.com/yvrjsharma) and [@abidlabs](https://github.com/abidlabs) in [PR 3003](https://github.com/gradio-app/gradio/pull/3003)
- Explained that the parameters in `launch` will not be respected when using reload mode, e.g. `gradio` command by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3089](https://github.com/gradio-app/gradio/pull/3089)
- Added a demo to show how to set up variable numbers of outputs in Gradio by [@abidlabs](https://github.com/abidlabs) in [PR 3127](https://github.com/gradio-app/gradio/pull/3127)
- Updated docs to reflect that the `equal_height` parameter should be passed to the `.style()` method of `gr.Row()` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3125](https://github.com/gradio-app/gradio/pull/3125)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Changed URL of final image for `fake_diffusion` demos by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3120](https://github.com/gradio-app/gradio/pull/3120)

### Contributors Shoutout:

No changes to highlight.

## 3.17.1

### New Features:

###### iOS image rotation fixed 🔄

Previously photos uploaded via iOS would be rotated after processing. This has been fixed by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3089](https://github.com/gradio-app/gradio/pull/3091)

######### Before

![image](https://user-images.githubusercontent.com/41651716/215846507-a36e9d05-1ac2-4867-8ab3-ce045a9415d9.png)

######### After

![image](https://user-images.githubusercontent.com/41651716/215846554-e41773ed-70f0-491a-9952-6a18babf91ef.png)

###### Run on Kaggle kernels 🧪

A share link will automatically be created when running on Kaggle kernels (notebooks) so that the front-end is properly displayed.

![image](https://user-images.githubusercontent.com/41651716/216104254-2cf55599-449c-436c-b57e-40f6a83f9eee.png)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3101](https://github.com/gradio-app/gradio/pull/3101)

### Bug Fixes:

- Fix bug where examples were not rendered correctly for demos created with Blocks api that had multiple input compinents by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3090](https://github.com/gradio-app/gradio/pull/3090)
- Fix change event listener for JSON, HighlightedText, Chatbot by [@aliabid94](https://github.com/aliabid94) in [PR 3095](https://github.com/gradio-app/gradio/pull/3095)
- Fixes bug where video and file change event not working [@tomchang25](https://github.com/tomchang25) in [PR 3098](https://github.com/gradio-app/gradio/pull/3098)
- Fixes bug where static_video play and pause event not working [@tomchang25](https://github.com/tomchang25) in [PR 3098](https://github.com/gradio-app/gradio/pull/3098)
- Fixed `Gallery.style(grid=...)` by by [@aliabd](https://github.com/aliabd) in [PR 3107](https://github.com/gradio-app/gradio/pull/3107)

### Documentation Changes:

- Update chatbot guide to include blocks demo and markdown support section by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3023](https://github.com/gradio-app/gradio/pull/3023)

* Fix a broken link in the Quick Start guide, by [@cakiki](https://github.com/cakiki) in [PR 3109](https://github.com/gradio-app/gradio/pull/3109)
* Better docs navigation on mobile by [@aliabd](https://github.com/aliabd) in [PR 3112](https://github.com/gradio-app/gradio/pull/3112)
* Add a guide on using Gradio with [Comet](https://comet.com/), by [@DN6](https://github.com/DN6/) in [PR 3058](https://github.com/gradio-app/gradio/pull/3058)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Set minimum `markdown-it-py` version to `2.0.0` so that the dollar math plugin is compatible by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3102](https://github.com/gradio-app/gradio/pull/3102)

### Contributors Shoutout:

No changes to highlight.

## 3.17.0

### New Features:

###### Extended support for Interface.load! 🏗️

You can now load `image-to-text` and `conversational` pipelines from the hub!

###### Image-to-text Demo

```python
io = gr.Interface.load("models/nlpconnect/vit-gpt2-image-captioning",
                       api_key="<optional-api-key>")
io.launch()
```

<img width="1087" alt="image" src="https://user-images.githubusercontent.com/41651716/213260197-dc5d80b4-6e50-4b3a-a764-94980930ac38.png">

###### conversational Demo

```python
chatbot = gr.Interface.load("models/microsoft/DialoGPT-medium",
                           api_key="<optional-api-key>")
chatbot.launch()
```

![chatbot_load](https://user-images.githubusercontent.com/41651716/213260220-3eaa25b7-a38b-48c6-adeb-2718bdf297a2.gif)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3011](https://github.com/gradio-app/gradio/pull/3011)

###### Download Button added to Model3D Output Component 📥

No need for an additional file output component to enable model3d file downloads anymore. We now added a download button to the model3d component itself.

<img width="739" alt="Screenshot 2023-01-18 at 3 52 45 PM" src="https://user-images.githubusercontent.com/12725292/213294198-5f4fda35-bde7-450c-864f-d5683e7fa29a.png">

By [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3014](https://github.com/gradio-app/gradio/pull/3014)

###### Fixing Auth on Spaces 🔑

Authentication on spaces works now! Third party cookies must be enabled on your browser to be able
to log in. Some browsers disable third party cookies by default (Safari, Chrome Incognito).

![auth_spaces](https://user-images.githubusercontent.com/41651716/215528417-09538933-0576-4d1d-b3b9-1e877ab01905.gif)

### Bug Fixes:

- Fixes bug where interpretation event was not configured correctly by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2993](https://github.com/gradio-app/gradio/pull/2993)
- Fix relative import bug in reload mode by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2992](https://github.com/gradio-app/gradio/pull/2992)
- Fixes bug where png files were not being recognized when uploading images by [@abidlabs](https://github.com/abidlabs) in [PR 3002](https://github.com/gradio-app/gradio/pull/3002)
- Fixes bug where external Spaces could not be loaded and used as functions if they returned files by [@abidlabs](https://github.com/abidlabs) in [PR 3004](https://github.com/gradio-app/gradio/pull/3004)
- Fix bug where file serialization output was not JSON serializable by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2999](https://github.com/gradio-app/gradio/pull/2999)
- Fixes bug where png files were not being recognized when uploading images by [@abidlabs](https://github.com/abidlabs) in [PR 3002](https://github.com/gradio-app/gradio/pull/3002)
- Fixes bug where temporary uploaded files were not being added to temp sets by [@abidlabs](https://github.com/abidlabs) in [PR 3005](https://github.com/gradio-app/gradio/pull/3005)
- Fixes issue where markdown support in chatbot breaks older demos [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3006](https://github.com/gradio-app/gradio/pull/3006)
- Fixes the `/file/` route that was broken in a recent change in [PR 3010](https://github.com/gradio-app/gradio/pull/3010)
- Fix bug where the Image component could not serialize image urls by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2957](https://github.com/gradio-app/gradio/pull/2957)
- Fix forwarding for guides after SEO renaming by [@aliabd](https://github.com/aliabd) in [PR 3017](https://github.com/gradio-app/gradio/pull/3017)
- Switch all pages on the website to use latest stable gradio by [@aliabd](https://github.com/aliabd) in [PR 3016](https://github.com/gradio-app/gradio/pull/3016)
- Fix bug related to deprecated parameters in `huggingface_hub` for the HuggingFaceDatasetSaver in [PR 3025](https://github.com/gradio-app/gradio/pull/3025)
- Added better support for symlinks in the way absolute paths are resolved by [@abidlabs](https://github.com/abidlabs) in [PR 3037](https://github.com/gradio-app/gradio/pull/3037)
- Fix several minor frontend bugs (loading animation, examples as gallery) frontend [@aliabid94](https://github.com/3026) in [PR 2961](https://github.com/gradio-app/gradio/pull/3026).
- Fixes bug that the chatbot sample code does not work with certain input value by [@petrov826](https://github.com/petrov826) in [PR 3039](https://github.com/gradio-app/gradio/pull/3039).
- Fix shadows for form element and ensure focus styles more visible in dark mode [@pngwn](https://github.com/pngwn) in [PR 3042](https://github.com/gradio-app/gradio/pull/3042).
- Fixed bug where the Checkbox and Dropdown change events were not triggered in response to other component changes by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3045](https://github.com/gradio-app/gradio/pull/3045)
- Fix bug where the queue was not properly restarted after launching a `closed` app by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3022](https://github.com/gradio-app/gradio/pull/3022)
- Adding missing embedded components on docs by [@aliabd](https://github.com/aliabd) in [PR 3027](https://github.com/gradio-app/gradio/pull/3027)
- Fixes bug where app would crash if the `file_types` parameter of `gr.File` or `gr.UploadButton` was not a list by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3048](https://github.com/gradio-app/gradio/pull/3048)
- Ensure CSS mounts correctly regardless of how many Gradio instances are on the page [@pngwn](https://github.com/pngwn) in [PR 3059](https://github.com/gradio-app/gradio/pull/3059).
- Fix bug where input component was not hidden in the frontend for `UploadButton` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3053](https://github.com/gradio-app/gradio/pull/3053)
- Fixes issue where after clicking submit or undo, the sketch output wouldn't clear. [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 3047](https://github.com/gradio-app/gradio/pull/3047)
- Ensure spaces embedded via the web component always use the correct URLs for server requests and change ports for testing to avoid strange collisions when users are working with embedded apps locally by [@pngwn](https://github.com/pngwn) in [PR 3065](https://github.com/gradio-app/gradio/pull/3065)
- Preserve selected image of Gallery through updated by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3061](https://github.com/gradio-app/gradio/pull/3061)
- Fix bug where auth was not respected on HF spaces by [@freddyaboulton](https://github.com/freddyaboulton) and [@aliabid94](https://github.com/aliabid94) in [PR 3049](https://github.com/gradio-app/gradio/pull/3049)
- Fixes bug where tabs selected attribute not working if manually change tab by [@tomchang25](https://github.com/tomchang25) in [3055](https://github.com/gradio-app/gradio/pull/3055)
- Change chatbot to show dots on progress, and fix bug where chatbot would not stick to bottom in the case of images by [@aliabid94](https://github.com/aliabid94) in [PR 3067](https://github.com/gradio-app/gradio/pull/3079)

### Documentation Changes:

- SEO improvements to guides by[@aliabd](https://github.com/aliabd) in [PR 2915](https://github.com/gradio-app/gradio/pull/2915)
- Use `gr.LinePlot` for the `blocks_kinematics` demo by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2998](https://github.com/gradio-app/gradio/pull/2998)
- Updated the `interface_series_load` to include some inline markdown code by [@abidlabs](https://github.com/abidlabs) in [PR 3051](https://github.com/gradio-app/gradio/pull/3051)

### Testing and Infrastructure Changes:

- Adds a GitHub action to test if any large files (> 5MB) are present by [@abidlabs](https://github.com/abidlabs) in [PR 3013](https://github.com/gradio-app/gradio/pull/3013)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Rewrote frontend using CSS variables for themes by [@pngwn](https://github.com/pngwn) in [PR 2840](https://github.com/gradio-app/gradio/pull/2840)
- Moved telemetry requests to run on background threads by [@abidlabs](https://github.com/abidlabs) in [PR 3054](https://github.com/gradio-app/gradio/pull/3054)

### Contributors Shoutout:

No changes to highlight.

## 3.16.2

### New Features:

No changes to highlight.

### Bug Fixes:

- Fixed file upload fails for files with zero size by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2923](https://github.com/gradio-app/gradio/pull/2923)
- Fixed bug where `mount_gradio_app` would not launch if the queue was enabled in a gradio app by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2939](https://github.com/gradio-app/gradio/pull/2939)
- Fix custom long CSS handling in Blocks by [@anton-l](https://github.com/anton-l) in [PR 2953](https://github.com/gradio-app/gradio/pull/2953)
- Recovers the dropdown change event by [@abidlabs](https://github.com/abidlabs) in [PR 2954](https://github.com/gradio-app/gradio/pull/2954).
- Fix audio file output by [@aliabid94](https://github.com/aliabid94) in [PR 2961](https://github.com/gradio-app/gradio/pull/2961).
- Fixed bug where file extensions of really long files were not kept after download by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2929](https://github.com/gradio-app/gradio/pull/2929)
- Fix bug where outputs for examples where not being returned by the backend by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2955](https://github.com/gradio-app/gradio/pull/2955)
- Fix bug in `blocks_plug` demo that prevented switching tabs programmatically with python [@TashaSkyUp](https://github.com/https://github.com/TashaSkyUp) in [PR 2971](https://github.com/gradio-app/gradio/pull/2971).

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.16.1

### New Features:

No changes to highlight.

### Bug Fixes:

- Fix audio file output by [@aliabid94](https://github.com/aliabid94) in [PR 2950](https://github.com/gradio-app/gradio/pull/2950).

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.16.0

### New Features:

###### Send custom progress updates by adding a `gr.Progress` argument after the input arguments to any function. Example:

```python
def reverse(word, progress=gr.Progress()):
    progress(0, desc="Starting")
    time.sleep(1)
    new_string = ""
    for letter in progress.tqdm(word, desc="Reversing"):
        time.sleep(0.25)
        new_string = letter + new_string
    return new_string

demo = gr.Interface(reverse, gr.Text(), gr.Text())
```

Progress indicator bar by [@aliabid94](https://github.com/aliabid94) in [PR 2750](https://github.com/gradio-app/gradio/pull/2750).

- Added `title` argument to `TabbedInterface` by @MohamedAliRashad in [#2888](https://github.com/gradio-app/gradio/pull/2888)
- Add support for specifying file extensions for `gr.File` and `gr.UploadButton`, using `file_types` parameter (e.g `gr.File(file_count="multiple", file_types=["text", ".json", ".csv"])`) by @dawoodkhan82 in [#2901](https://github.com/gradio-app/gradio/pull/2901)
- Added `multiselect` option to `Dropdown` by @dawoodkhan82 in [#2871](https://github.com/gradio-app/gradio/pull/2871)

###### With `multiselect` set to `true` a user can now select multiple options from the `gr.Dropdown` component.

```python
gr.Dropdown(["angola", "pakistan", "canada"], multiselect=True, value=["angola"])
```

<img width="610" alt="Screenshot 2023-01-03 at 4 14 36 PM" src="https://user-images.githubusercontent.com/12725292/210442547-c86975c9-4b4f-4b8e-8803-9d96e6a8583a.png">

### Bug Fixes:

- Fixed bug where an error opening an audio file led to a crash by [@FelixDombek](https://github.com/FelixDombek) in [PR 2898](https://github.com/gradio-app/gradio/pull/2898)
- Fixed bug where setting `default_enabled=False` made it so that the entire queue did not start by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2876](https://github.com/gradio-app/gradio/pull/2876)
- Fixed bug where csv preview for DataFrame examples would show filename instead of file contents by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2877](https://github.com/gradio-app/gradio/pull/2877)
- Fixed bug where an error raised after yielding iterative output would not be displayed in the browser by
  [@JaySmithWpg](https://github.com/JaySmithWpg) in [PR 2889](https://github.com/gradio-app/gradio/pull/2889)
- Fixed bug in `blocks_style` demo that was preventing it from launching by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2890](https://github.com/gradio-app/gradio/pull/2890)
- Fixed bug where files could not be downloaded by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2926](https://github.com/gradio-app/gradio/pull/2926)
- Fixed bug where cached examples were not displaying properly by [@a-rogalska](https://github.com/a-rogalska) in [PR 2974](https://github.com/gradio-app/gradio/pull/2974)

### Documentation Changes:

- Added a Guide on using Google Sheets to create a real-time dashboard with Gradio's `DataFrame` and `LinePlot` component, by [@abidlabs](https://github.com/abidlabs) in [PR 2816](https://github.com/gradio-app/gradio/pull/2816)
- Add a components - events matrix on the docs by [@aliabd](https://github.com/aliabd) in [PR 2921](https://github.com/gradio-app/gradio/pull/2921)

### Testing and Infrastructure Changes:

- Deployed PRs from forks to spaces by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2895](https://github.com/gradio-app/gradio/pull/2895)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- The `default_enabled` parameter of the `Blocks.queue` method has no effect by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2876](https://github.com/gradio-app/gradio/pull/2876)
- Added typing to several Python files in codebase by [@abidlabs](https://github.com/abidlabs) in [PR 2887](https://github.com/gradio-app/gradio/pull/2887)
- Excluding untracked files from demo notebook check action by [@aliabd](https://github.com/aliabd) in [PR 2897](https://github.com/gradio-app/gradio/pull/2897)
- Optimize images and gifs by [@aliabd](https://github.com/aliabd) in [PR 2922](https://github.com/gradio-app/gradio/pull/2922)
- Updated typing by [@1nF0rmed](https://github.com/1nF0rmed) in [PR 2904](https://github.com/gradio-app/gradio/pull/2904)

### Contributors Shoutout:

- @JaySmithWpg for making their first contribution to gradio!
- @MohamedAliRashad for making their first contribution to gradio!

## 3.15.0

### New Features:

Gradio's newest plotting component `gr.LinePlot`! 📈

With this component you can easily create time series visualizations with customizable
appearance for your demos and dashboards ... all without having to know an external plotting library.

For an example of the api see below:

```python
gr.LinePlot(stocks,
            x="date",
            y="price",
            color="symbol",
            color_legend_position="bottom",
            width=600, height=400, title="Stock Prices")
```

![image](https://user-images.githubusercontent.com/41651716/208711646-81ae3745-149b-46a3-babd-0569aecdd409.png)

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2807](https://github.com/gradio-app/gradio/pull/2807)

### Bug Fixes:

- Fixed bug where the `examples_per_page` parameter of the `Examples` component was not passed to the internal `Dataset` component by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2861](https://github.com/gradio-app/gradio/pull/2861)
- Fixes loading Spaces that have components with default values by [@abidlabs](https://github.com/abidlabs) in [PR 2855](https://github.com/gradio-app/gradio/pull/2855)
- Fixes flagging when `allow_flagging="auto"` in `gr.Interface()` by [@abidlabs](https://github.com/abidlabs) in [PR 2695](https://github.com/gradio-app/gradio/pull/2695)
- Fixed bug where passing a non-list value to `gr.CheckboxGroup` would crash the entire app by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2866](https://github.com/gradio-app/gradio/pull/2866)

### Documentation Changes:

- Added a Guide on using BigQuery with Gradio's `DataFrame` and `ScatterPlot` component,
  by [@abidlabs](https://github.com/abidlabs) in [PR 2794](https://github.com/gradio-app/gradio/pull/2794)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Fixed importing gradio can cause PIL.Image.registered_extensions() to break by `[@aliencaocao](https://github.com/aliencaocao)` in `[PR 2846](https://github.com/gradio-app/gradio/pull/2846)`
- Fix css glitch and navigation in docs by [@aliabd](https://github.com/aliabd) in [PR 2856](https://github.com/gradio-app/gradio/pull/2856)
- Added the ability to set `x_lim`, `y_lim` and legend positions for `gr.ScatterPlot` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2807](https://github.com/gradio-app/gradio/pull/2807)
- Remove footers and min-height the correct way by [@aliabd](https://github.com/aliabd) in [PR 2860](https://github.com/gradio-app/gradio/pull/2860)

### Contributors Shoutout:

No changes to highlight.

## 3.14.0

### New Features:

###### Add Waveform Visual Support to Audio

Adds a `gr.make_waveform()` function that creates a waveform video by combining an audio and an optional background image by [@dawoodkhan82](http://github.com/dawoodkhan82) and [@aliabid94](http://github.com/aliabid94) in [PR 2706](https://github.com/gradio-app/gradio/pull/2706. Helpful for making audio outputs much more shareable.

![waveform screenrecording](https://user-images.githubusercontent.com/7870876/206062396-164a5e71-451a-4fe0-94a7-cbe9269d57e6.gif)

###### Allows Every Component to Accept an `every` Parameter

When a component's initial value is a function, the `every` parameter re-runs the function every `every` seconds. By [@abidlabs](https://github.com/abidlabs) in [PR 2806](https://github.com/gradio-app/gradio/pull/2806). Here's a code example:

```py
import gradio as gr

with gr.Blocks() as demo:
    df = gr.DataFrame(run_query, every=60*60)

demo.queue().launch()
```

### Bug Fixes:

- Fixed issue where too many temporary files were created, all with randomly generated
  filepaths. Now fewer temporary files are created and are assigned a path that is a
  hash based on the file contents by [@abidlabs](https://github.com/abidlabs) in [PR 2758](https://github.com/gradio-app/gradio/pull/2758)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.13.2

### New Features:

No changes to highlight.

### Bug Fixes:

\*No changes to highlight.

-

### Documentation Changes:

- Improves documentation of several queuing-related parameters by [@abidlabs](https://github.com/abidlabs) in [PR 2825](https://github.com/gradio-app/gradio/pull/2825)

### Testing and Infrastructure Changes:

- Remove h11 pinning by [@ecederstrand](https://github.com/ecederstrand) in [PR 2820](https://github.com/gradio-app/gradio/pull/2820)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

## 3.13.1

### New Features:

###### New Shareable Links

Replaces tunneling logic based on ssh port-forwarding to that based on `frp` by [XciD](https://github.com/XciD) and [Wauplin](https://github.com/Wauplin) in [PR 2509](https://github.com/gradio-app/gradio/pull/2509)

You don't need to do anything differently, but when you set `share=True` in `launch()`,
you'll get this message and a public link that look a little bit different:

```bash
Setting up a public link... we have recently upgraded the way public links are generated. If you encounter any problems, please downgrade to gradio version 3.13.0
.
Running on public URL: https://bec81a83-5b5c-471e.gradio.live
```

These links are a more secure and scalable way to create shareable demos!

### Bug Fixes:

- Allows `gr.Dataframe()` to take a `pandas.DataFrame` that includes numpy array and other types as its initial value, by [@abidlabs](https://github.com/abidlabs) in [PR 2804](https://github.com/gradio-app/gradio/pull/2804)
- Add `altair` to requirements.txt by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2811](https://github.com/gradio-app/gradio/pull/2811)
- Added aria-labels to icon buttons that are built into UI components by [@emilyuhde](http://github.com/emilyuhde) in [PR 2791](https://github.com/gradio-app/gradio/pull/2791)

### Documentation Changes:

- Fixed some typos in the "Plot Component for Maps" guide by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2811](https://github.com/gradio-app/gradio/pull/2811)

### Testing and Infrastructure Changes:

- Fixed test for IP address by [@abidlabs](https://github.com/abidlabs) in [PR 2808](https://github.com/gradio-app/gradio/pull/2808)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Fixed typo in parameter `visible` in classes in `templates.py` by [@abidlabs](https://github.com/abidlabs) in [PR 2805](https://github.com/gradio-app/gradio/pull/2805)
- Switched external service for getting IP address from `https://api.ipify.org` to `https://checkip.amazonaws.com/` by [@abidlabs](https://github.com/abidlabs) in [PR 2810](https://github.com/gradio-app/gradio/pull/2810)

### Contributors Shoutout:

No changes to highlight.

- Fixed typo in parameter `visible` in classes in `templates.py` by [@abidlabs](https://github.com/abidlabs) in [PR 2805](https://github.com/gradio-app/gradio/pull/2805)
- Switched external service for getting IP address from `https://api.ipify.org` to `https://checkip.amazonaws.com/` by [@abidlabs](https://github.com/abidlabs) in [PR 2810](https://github.com/gradio-app/gradio/pull/2810)

## 3.13.0

### New Features:

###### Scatter plot component

It is now possible to create a scatter plot natively in Gradio!

The `gr.ScatterPlot` component accepts a pandas dataframe and some optional configuration parameters
and will automatically create a plot for you!

This is the first of many native plotting components in Gradio!

For an example of how to use `gr.ScatterPlot` see below:

```python
import gradio as gr
from vega_datasets import data

cars = data.cars()

with gr.Blocks() as demo:
    gr.ScatterPlot(show_label=False,
                   value=cars,
                   x="Horsepower",
                   y="Miles_per_Gallon",
                   color="Origin",
                   tooltip="Name",
                   title="Car Data",
                   y_title="Miles per Gallon",
                   color_legend_title="Origin of Car").style(container=False)

demo.launch()
```

<img width="404" alt="image" src="https://user-images.githubusercontent.com/41651716/206737726-4c4da5f0-dee8-4f0a-b1e1-e2b75c4638e9.png">

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2764](https://github.com/gradio-app/gradio/pull/2764)

###### Support for altair plots

The `Plot` component can now accept altair plots as values!
Simply return an altair plot from your event listener and gradio will display it in the front-end.
See the example below:

```python
import gradio as gr
import altair as alt
from vega_datasets import data

cars = data.cars()
chart = (
    alt.Chart(cars)
    .mark_point()
    .encode(
        x="Horsepower",
        y="Miles_per_Gallon",
        color="Origin",
    )
)

with gr.Blocks() as demo:
    gr.Plot(value=chart)
demo.launch()
```

<img width="1366" alt="image" src="https://user-images.githubusercontent.com/41651716/204660697-f994316f-5ca7-4e8a-93bc-eb5e0d556c91.png">

By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2741](https://github.com/gradio-app/gradio/pull/2741)

###### Set the background color of a Label component

The `Label` component now accepts a `color` argument by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2736](https://github.com/gradio-app/gradio/pull/2736).
The `color` argument should either be a valid css color name or hexadecimal string.
You can update the color with `gr.Label.update`!

This lets you create Alert and Warning boxes with the `Label` component. See below:

```python
import gradio as gr
import random

def update_color(value):
    if value < 0:
        # This is bad so use red
        return "#FF0000"
    elif 0 <= value <= 20:
        # Ok but pay attention (use orange)
        return "#ff9966"
    else:
        # Nothing to worry about
        return None

def update_value():
    choice = random.choice(['good', 'bad', 'so-so'])
    color = update_color(choice)
    return gr.Label.update(value=choice, color=color)


with gr.Blocks() as demo:
    label = gr.Label(value=-10)
    demo.load(lambda: update_value(), inputs=None, outputs=[label], every=1)
demo.queue().launch()
```

![label_bg_color_update](https://user-images.githubusercontent.com/41651716/204400372-80e53857-f26f-4a38-a1ae-1acadff75e89.gif)

###### Add Brazilian Portuguese translation

Add Brazilian Portuguese translation (pt-BR.json) by [@pstwh](http://github.com/pstwh) in [PR 2753](https://github.com/gradio-app/gradio/pull/2753):

<img width="951" alt="image" src="https://user-images.githubusercontent.com/1778297/206615305-4c52031e-3f7d-4df2-8805-a79894206911.png">

### Bug Fixes:

- Fixed issue where image thumbnails were not showing when an example directory was provided
  by [@abidlabs](https://github.com/abidlabs) in [PR 2745](https://github.com/gradio-app/gradio/pull/2745)
- Fixed bug loading audio input models from the hub by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2779](https://github.com/gradio-app/gradio/pull/2779).
- Fixed issue where entities were not merged when highlighted text was generated from the
  dictionary inputs [@payoto](https://github.com/payoto) in [PR 2767](https://github.com/gradio-app/gradio/pull/2767)
- Fixed bug where generating events did not finish running even if the websocket connection was closed by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2783](https://github.com/gradio-app/gradio/pull/2783).

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Images in the chatbot component are now resized if they exceed a max width by [@abidlabs](https://github.com/abidlabs) in [PR 2748](https://github.com/gradio-app/gradio/pull/2748)
- Missing parameters have been added to `gr.Blocks().load()` by [@abidlabs](https://github.com/abidlabs) in [PR 2755](https://github.com/gradio-app/gradio/pull/2755)
- Deindex share URLs from search by [@aliabd](https://github.com/aliabd) in [PR 2772](https://github.com/gradio-app/gradio/pull/2772)
- Redirect old links and fix broken ones by [@aliabd](https://github.com/aliabd) in [PR 2774](https://github.com/gradio-app/gradio/pull/2774)

### Contributors Shoutout:

No changes to highlight.

## 3.12.0

### New Features:

###### The `Chatbot` component now supports a subset of Markdown (including bold, italics, code, images)

You can now pass in some Markdown to the Chatbot component and it will show up,
meaning that you can pass in images as well! by [@abidlabs](https://github.com/abidlabs) in [PR 2731](https://github.com/gradio-app/gradio/pull/2731)

Here's a simple example that references a local image `lion.jpg` that is in the same
folder as the Python script:

```py
import gradio as gr

with gr.Blocks() as demo:
    gr.Chatbot([("hi", "hello **abubakar**"), ("![](/file=lion.jpg)", "cool pic")])

demo.launch()
```

![Alt text](https://user-images.githubusercontent.com/1778297/204357455-5c1a4002-eee7-479d-9a1e-ba2c12522723.png)

To see a more realistic example, see the new demo `/demo/chatbot_multimodal/run.py`.

###### Latex support

Added mathtext (a subset of latex) support to gr.Markdown. Added by [@kashif](https://github.com/kashif) and [@aliabid94](https://github.com/aliabid94) in [PR 2696](https://github.com/gradio-app/gradio/pull/2696).

Example of how it can be used:

```python
gr.Markdown(
    r"""
    # Hello World! $\frac{\sqrt{x + y}}{4}$ is today's lesson.
    """)
```

###### Update Accordion properties from the backend

You can now update the Accordion `label` and `open` status with `gr.Accordion.update` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2690](https://github.com/gradio-app/gradio/pull/2690)

```python
import gradio as gr

with gr.Blocks() as demo:
    with gr.Accordion(label="Open for greeting", open=False) as accordion:
        gr.Textbox("Hello!")
    open_btn = gr.Button(value="Open Accordion")
    close_btn = gr.Button(value="Close Accordion")
    open_btn.click(
        lambda: gr.Accordion.update(open=True, label="Open Accordion"),
        inputs=None,
        outputs=[accordion],
    )
    close_btn.click(
        lambda: gr.Accordion.update(open=False, label="Closed Accordion"),
        inputs=None,
        outputs=[accordion],
    )
demo.launch()
```

![update_accordion](https://user-images.githubusercontent.com/41651716/203164176-b102eae3-babe-4986-ae30-3ab4f400cedc.gif)

### Bug Fixes:

- Fixed bug where requests timeout is missing from utils.version_check() by [@yujiehecs](https://github.com/yujiehecs) in [PR 2729](https://github.com/gradio-app/gradio/pull/2729)
- Fixed bug where so that the `File` component can properly preprocess files to "binary" byte-string format by [CoffeeVampir3](https://github.com/CoffeeVampir3) in [PR 2727](https://github.com/gradio-app/gradio/pull/2727)
- Fixed bug to ensure that filenames are less than 200 characters even for non-English languages by [@SkyTNT](https://github.com/SkyTNT) in [PR 2685](https://github.com/gradio-app/gradio/pull/2685)

### Documentation Changes:

- Performance improvements to docs on mobile by [@aliabd](https://github.com/aliabd) in [PR 2730](https://github.com/gradio-app/gradio/pull/2730)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Make try examples button more prominent by [@aliabd](https://github.com/aliabd) in [PR 2705](https://github.com/gradio-app/gradio/pull/2705)
- Fix id clashes in docs by [@aliabd](https://github.com/aliabd) in [PR 2713](https://github.com/gradio-app/gradio/pull/2713)
- Fix typos in guide docs by [@andridns](https://github.com/andridns) in [PR 2722](https://github.com/gradio-app/gradio/pull/2722)
- Add option to `include_audio` in Video component. When `True`, for `source="webcam"` this will record audio and video, for `source="upload"` this will retain the audio in an uploaded video by [@mandargogate](https://github.com/MandarGogate) in [PR 2721](https://github.com/gradio-app/gradio/pull/2721)

### Contributors Shoutout:

- [@andridns](https://github.com/andridns) made their first contribution in [PR 2722](https://github.com/gradio-app/gradio/pull/2722)!

## 3.11.0

### New Features:

###### Upload Button

There is now a new component called the `UploadButton` which is a file upload component but in button form! You can also specify what file types it should accept in the form of a list (ex: `image`, `video`, `audio`, `text`, or generic `file`). Added by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2591](https://github.com/gradio-app/gradio/pull/2591).

Example of how it can be used:

```python
import gradio as gr

def upload_file(files):
    file_paths = [file.name for file in files]
    return file_paths

with gr.Blocks() as demo:
    file_output = gr.File()
    upload_button = gr.UploadButton("Click to Upload a File", file_types=["image", "video"], file_count="multiple")
    upload_button.upload(upload_file, upload_button, file_output)

demo.launch()
```

###### Revamped API documentation page

New API Docs page with in-browser playground and updated aesthetics. [@gary149](https://github.com/gary149) in [PR 2652](https://github.com/gradio-app/gradio/pull/2652)

###### Revamped Login page

Previously our login page had its own CSS, had no dark mode, and had an ugly json message on the wrong credentials. Made the page more aesthetically consistent, added dark mode support, and a nicer error message. [@aliabid94](https://github.com/aliabid94) in [PR 2684](https://github.com/gradio-app/gradio/pull/2684)

###### Accessing the Requests Object Directly

You can now access the Request object directly in your Python function by [@abidlabs](https://github.com/abidlabs) in [PR 2641](https://github.com/gradio-app/gradio/pull/2641). This means that you can access request headers, the client IP address, and so on. In order to use it, add a parameter to your function and set its type hint to be `gr.Request`. Here's a simple example:

```py
import gradio as gr

def echo(name, request: gr.Request):
    if request:
        print("Request headers dictionary:", request.headers)
        print("IP address:", request.client.host)
    return name

io = gr.Interface(echo, "textbox", "textbox").launch()
```

### Bug Fixes:

- Fixed bug that limited files from being sent over websockets to 16MB. The new limit
  is now 1GB by [@abidlabs](https://github.com/abidlabs) in [PR 2709](https://github.com/gradio-app/gradio/pull/2709)

### Documentation Changes:

- Updated documentation for embedding Gradio demos on Spaces as web components by
  [@julien-c](https://github.com/julien-c) in [PR 2698](https://github.com/gradio-app/gradio/pull/2698)
- Updated IFrames in Guides to use the host URL instead of the Space name to be consistent with the new method for embedding Spaces, by
  [@julien-c](https://github.com/julien-c) in [PR 2692](https://github.com/gradio-app/gradio/pull/2692)
- Colab buttons on every demo in the website! Just click open in colab, and run the demo there.

https://user-images.githubusercontent.com/9021060/202878400-cb16ed47-f4dd-4cb0-b2f0-102a9ff64135.mov

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Better warnings and error messages for `gr.Interface.load()` by [@abidlabs](https://github.com/abidlabs) in [PR 2694](https://github.com/gradio-app/gradio/pull/2694)
- Add open in colab buttons to demos in docs and /demos by [@aliabd](https://github.com/aliabd) in [PR 2608](https://github.com/gradio-app/gradio/pull/2608)
- Apply different formatting for the types in component docstrings by [@aliabd](https://github.com/aliabd) in [PR 2707](https://github.com/gradio-app/gradio/pull/2707)

### Contributors Shoutout:

No changes to highlight.

## 3.10.1

### New Features:

No changes to highlight.

### Bug Fixes:

- Passes kwargs into `gr.Interface.load()` by [@abidlabs](https://github.com/abidlabs) in [PR 2669](https://github.com/gradio-app/gradio/pull/2669)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Clean up printed statements in Embedded Colab Mode by [@aliabid94](https://github.com/aliabid94) in [PR 2612](https://github.com/gradio-app/gradio/pull/2612)

### Contributors Shoutout:

No changes to highlight.

## 3.10.0

- Add support for `'password'` and `'email'` types to `Textbox`. [@pngwn](https://github.com/pngwn) in [PR 2653](https://github.com/gradio-app/gradio/pull/2653)
- `gr.Textbox` component will now raise an exception if `type` is not "text", "email", or "password" [@pngwn](https://github.com/pngwn) in [PR 2653](https://github.com/gradio-app/gradio/pull/2653). This will cause demos using the deprecated `gr.Textbox(type="number")` to raise an exception.

### Bug Fixes:

- Updated the minimum FastApi used in tests to version 0.87 by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2647](https://github.com/gradio-app/gradio/pull/2647)
- Fixed bug where interfaces with examples could not be loaded with `gr.Interface.load` by [@freddyaboulton](https://github.com/freddyaboulton) [PR 2640](https://github.com/gradio-app/gradio/pull/2640)
- Fixed bug where the `interactive` property of a component could not be updated by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2639](https://github.com/gradio-app/gradio/pull/2639)
- Fixed bug where some URLs were not being recognized as valid URLs and thus were not
  loading correctly in various components by [@abidlabs](https://github.com/abidlabs) in [PR 2659](https://github.com/gradio-app/gradio/pull/2659)

### Documentation Changes:

- Fix some typos in the embedded demo names in "05_using_blocks_like_functions.md" by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2656](https://github.com/gradio-app/gradio/pull/2656)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Add support for `'password'` and `'email'` types to `Textbox`. [@pngwn](https://github.com/pngwn) in [PR 2653](https://github.com/gradio-app/gradio/pull/2653)

### Contributors Shoutout:

No changes to highlight.

## 3.9.1

### New Features:

No changes to highlight.

### Bug Fixes:

- Only set a min height on md and html when loading by [@pngwn](https://github.com/pngwn) in [PR 2623](https://github.com/gradio-app/gradio/pull/2623)

### Documentation Changes:

- See docs for the latest gradio commit to main as well the latest pip release:

![main-vs-pip](https://user-images.githubusercontent.com/9021060/199607887-aab1ae4e-a070-4527-966d-024397abe15b.gif)

- Modified the "Connecting To a Database Guide" to use `pd.read_sql` as opposed to low-level postgres connector by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2604](https://github.com/gradio-app/gradio/pull/2604)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Dropdown for seeing docs as latest or main by [@aliabd](https://github.com/aliabd) in [PR 2544](https://github.com/gradio-app/gradio/pull/2544)
- Allow `gr.Templates` to accept parameters to override the defaults by [@abidlabs](https://github.com/abidlabs) in [PR 2600](https://github.com/gradio-app/gradio/pull/2600)
- Components now throw a `ValueError()` if constructed with invalid parameters for `type` or `source` (for components that take those parameters) in [PR 2610](https://github.com/gradio-app/gradio/pull/2610)
- Allow auth with using queue by [@GLGDLY](https://github.com/GLGDLY) in [PR 2611](https://github.com/gradio-app/gradio/pull/2611)

### Contributors Shoutout:

No changes to highlight.

## 3.9

### New Features:

- Gradio is now embedded directly in colab without requiring the share link by [@aliabid94](https://github.com/aliabid94) in [PR 2455](https://github.com/gradio-app/gradio/pull/2455)

###### Calling functions by api_name in loaded apps

When you load an upstream app with `gr.Blocks.load`, you can now specify which fn
to call with the `api_name` parameter.

```python
import gradio as gr
english_translator = gr.Blocks.load(name="spaces/gradio/english-translator")
german = english_translator("My name is Freddy", api_name='translate-to-german')
```

The `api_name` parameter will take precedence over the `fn_index` parameter.

### Bug Fixes:

- Fixed bug where None could not be used for File,Model3D, and Audio examples by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2588](https://github.com/gradio-app/gradio/pull/2588)
- Fixed links in Plotly map guide + demo by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2578](https://github.com/gradio-app/gradio/pull/2578)
- `gr.Blocks.load()` now correctly loads example files from Spaces [@abidlabs](https://github.com/abidlabs) in [PR 2594](https://github.com/gradio-app/gradio/pull/2594)
- Fixed bug when image clear started upload dialog [@mezotaken](https://github.com/mezotaken) in [PR 2577](https://github.com/gradio-app/gradio/pull/2577)

### Documentation Changes:

- Added a Guide on how to configure the queue for maximum performance by [@abidlabs](https://github.com/abidlabs) in [PR 2558](https://github.com/gradio-app/gradio/pull/2558)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Add `api_name` to `Blocks.__call__` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2593](https://github.com/gradio-app/gradio/pull/2593)
- Update queue with using deque & update requirements by [@GLGDLY](https://github.com/GLGDLY) in [PR 2428](https://github.com/gradio-app/gradio/pull/2428)

### Contributors Shoutout:

No changes to highlight.

## 3.8.2

### Bug Fixes:

- Ensure gradio apps embedded via spaces use the correct endpoint for predictions. [@pngwn](https://github.com/pngwn) in [PR 2567](https://github.com/gradio-app/gradio/pull/2567)
- Ensure gradio apps embedded via spaces use the correct websocket protocol. [@pngwn](https://github.com/pngwn) in [PR 2571](https://github.com/gradio-app/gradio/pull/2571)

### New Features:

###### Running Events Continuously

Gradio now supports the ability to run an event continuously on a fixed schedule. To use this feature,
pass `every=# of seconds` to the event definition. This will run the event every given number of seconds!

This can be used to:

- Create live visualizations that show the most up to date data
- Refresh the state of the frontend automatically in response to changes in the backend

Here is an example of a live plot that refreshes every half second:

```python
import math
import gradio as gr
import plotly.express as px
import numpy as np


plot_end = 2 * math.pi


def get_plot(period=1):
    global plot_end
    x = np.arange(plot_end - 2 * math.pi, plot_end, 0.02)
    y = np.sin(2*math.pi*period * x)
    fig = px.line(x=x, y=y)
    plot_end += 2 * math.pi
    return fig


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            gr.Markdown("Change the value of the slider to automatically update the plot")
            period = gr.Slider(label="Period of plot", value=1, minimum=0, maximum=10, step=1)
            plot = gr.Plot(label="Plot (updates every half second)")

    dep = demo.load(get_plot, None, plot, every=0.5)
    period.change(get_plot, period, plot, every=0.5, cancels=[dep])

demo.queue().launch()
```

![live_demo](https://user-images.githubusercontent.com/41651716/198357377-633ce460-4e31-47bd-8202-1440cdd6fe19.gif)

### Bug Fixes:

No changes to highlight.

### Documentation Changes:

- Explained how to set up `queue` and `auth` when working with reload mode by by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3089](https://github.com/gradio-app/gradio/pull/3089)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Allows loading private Spaces by passing an an `api_key` to `gr.Interface.load()`
  by [@abidlabs](https://github.com/abidlabs) in [PR 2568](https://github.com/gradio-app/gradio/pull/2568)

### Contributors Shoutout:

No changes to highlight.

## 3.8

### New Features:

- Allows event listeners to accept a single dictionary as its argument, where the keys are the components and the values are the component values. This is set by passing the input components in the event listener as a set instead of a list. [@aliabid94](https://github.com/aliabid94) in [PR 2550](https://github.com/gradio-app/gradio/pull/2550)

### Bug Fixes:

- Fix whitespace issue when using plotly. [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2548](https://github.com/gradio-app/gradio/pull/2548)
- Apply appropriate alt text to all gallery images. [@camenduru](https://github.com/camenduru) in [PR 2358](https://github.com/gradio-app/gradio/pull/2538)
- Removed erroneous tkinter import in gradio.blocks by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2555](https://github.com/gradio-app/gradio/pull/2555)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Added the `every` keyword to event listeners that runs events on a fixed schedule by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2512](https://github.com/gradio-app/gradio/pull/2512)
- Fix whitespace issue when using plotly. [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2548](https://github.com/gradio-app/gradio/pull/2548)
- Apply appropriate alt text to all gallery images. [@camenduru](https://github.com/camenduru) in [PR 2358](https://github.com/gradio-app/gradio/pull/2538)

### Contributors Shoutout:

No changes to highlight.

## 3.7

### New Features:

###### Batched Functions

Gradio now supports the ability to pass _batched_ functions. Batched functions are just
functions which take in a list of inputs and return a list of predictions.

For example, here is a batched function that takes in two lists of inputs (a list of
words and a list of ints), and returns a list of trimmed words as output:

```py
import time

def trim_words(words, lens):
    trimmed_words = []
    time.sleep(5)
    for w, l in zip(words, lens):
        trimmed_words.append(w[:l])
    return [trimmed_words]
```

The advantage of using batched functions is that if you enable queuing, the Gradio
server can automatically _batch_ incoming requests and process them in parallel,
potentially speeding up your demo. Here's what the Gradio code looks like (notice
the `batch=True` and `max_batch_size=16` -- both of these parameters can be passed
into event triggers or into the `Interface` class)

```py
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        word = gr.Textbox(label="word", value="abc")
        leng = gr.Number(label="leng", precision=0, value=1)
        output = gr.Textbox(label="Output")
    with gr.Row():
        run = gr.Button()

    event = run.click(trim_words, [word, leng], output, batch=True, max_batch_size=16)

demo.queue()
demo.launch()
```

In the example above, 16 requests could be processed in parallel (for a total inference
time of 5 seconds), instead of each request being processed separately (for a total
inference time of 80 seconds).

###### Upload Event

`Video`, `Audio`, `Image`, and `File` components now support a `upload()` event that is triggered when a user uploads a file into any of these components.

Example usage:

```py
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        input_video = gr.Video()
        output_video = gr.Video()

     # Clears the output video when an input video is uploaded
    input_video.upload(lambda : None, None, output_video)
```

### Bug Fixes:

- Fixes issue where plotly animations, interactivity, titles, legends, were not working properly. [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2486](https://github.com/gradio-app/gradio/pull/2486)
- Prevent requests to the `/api` endpoint from skipping the queue if the queue is enabled for that event by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2493](https://github.com/gradio-app/gradio/pull/2493)
- Fixes a bug with `cancels` in event triggers so that it works properly if multiple
  Blocks are rendered by [@abidlabs](https://github.com/abidlabs) in [PR 2530](https://github.com/gradio-app/gradio/pull/2530)
- Prevent invalid targets of events from crashing the whole application. [@pngwn](https://github.com/pngwn) in [PR 2534](https://github.com/gradio-app/gradio/pull/2534)
- Properly dequeue cancelled events when multiple apps are rendered by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2540](https://github.com/gradio-app/gradio/pull/2540)
- Fixes videos being cropped due to height/width params not being used [@hannahblair](https://github.com/hannahblair) in [PR 4946](https://github.com/gradio-app/gradio/pull/4946)

### Documentation Changes:

- Added an example interactive dashboard to the "Tabular & Plots" section of the Demos page by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2508](https://github.com/gradio-app/gradio/pull/2508)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Fixes the error message if a user builds Gradio locally and tries to use `share=True` by [@abidlabs](https://github.com/abidlabs) in [PR 2502](https://github.com/gradio-app/gradio/pull/2502)
- Allows the render() function to return self by [@Raul9595](https://github.com/Raul9595) in [PR 2514](https://github.com/gradio-app/gradio/pull/2514)
- Fixes issue where plotly animations, interactivity, titles, legends, were not working properly. [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2486](https://github.com/gradio-app/gradio/pull/2486)
- Gradio now supports batched functions by [@abidlabs](https://github.com/abidlabs) in [PR 2218](https://github.com/gradio-app/gradio/pull/2218)
- Add `upload` event for `Video`, `Audio`, `Image`, and `File` components [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2448](https://github.com/gradio-app/gradio/pull/2456)
- Changes websocket path for Spaces as it is no longer necessary to have a different URL for websocket connections on Spaces by [@abidlabs](https://github.com/abidlabs) in [PR 2528](https://github.com/gradio-app/gradio/pull/2528)
- Clearer error message when events are defined outside of a Blocks scope, and a warning if you
  try to use `Series` or `Parallel` with `Blocks` by [@abidlabs](https://github.com/abidlabs) in [PR 2543](https://github.com/gradio-app/gradio/pull/2543)
- Adds support for audio samples that are in `float64`, `float16`, or `uint16` formats by [@abidlabs](https://github.com/abidlabs) in [PR 2545](https://github.com/gradio-app/gradio/pull/2545)

### Contributors Shoutout:

No changes to highlight.

## 3.6

### New Features:

###### Cancelling Running Events

Running events can be cancelled when other events are triggered! To test this feature, pass the `cancels` parameter to the event listener.
For this feature to work, the queue must be enabled.

![cancel_on_change_rl](https://user-images.githubusercontent.com/41651716/195952623-61a606bd-e82b-4e1a-802e-223154cb8727.gif)

Code:

```python
import time
import gradio as gr

def fake_diffusion(steps):
    for i in range(steps):
        time.sleep(1)
        yield str(i)

def long_prediction(*args, **kwargs):
    time.sleep(10)
    return 42


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            n = gr.Slider(1, 10, value=9, step=1, label="Number Steps")
            run = gr.Button()
            output = gr.Textbox(label="Iterative Output")
            stop = gr.Button(value="Stop Iterating")
        with gr.Column():
            prediction = gr.Number(label="Expensive Calculation")
            run_pred = gr.Button(value="Run Expensive Calculation")
        with gr.Column():
            cancel_on_change = gr.Textbox(label="Cancel Iteration and Expensive Calculation on Change")

    click_event = run.click(fake_diffusion, n, output)
    stop.click(fn=None, inputs=None, outputs=None, cancels=[click_event])
    pred_event = run_pred.click(fn=long_prediction, inputs=None, outputs=prediction)

    cancel_on_change.change(None, None, None, cancels=[click_event, pred_event])


demo.queue(concurrency_count=1, max_size=20).launch()
```

For interfaces, a stop button will be added automatically if the function uses a `yield` statement.

```python
import gradio as gr
import time

def iteration(steps):
    for i in range(steps):
       time.sleep(0.5)
       yield i

gr.Interface(iteration,
             inputs=gr.Slider(minimum=1, maximum=10, step=1, value=5),
             outputs=gr.Number()).queue().launch()
```

![stop_interface_rl](https://user-images.githubusercontent.com/41651716/195952883-e7ca4235-aae3-4852-8f28-96d01d0c5822.gif)

### Bug Fixes:

- Add loading status tracker UI to HTML and Markdown components. [@pngwn](https://github.com/pngwn) in [PR 2474](https://github.com/gradio-app/gradio/pull/2474)
- Fixed videos being mirrored in the front-end if source is not webcam by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2475](https://github.com/gradio-app/gradio/pull/2475)
- Add clear button for timeseries component [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2487](https://github.com/gradio-app/gradio/pull/2487)
- Removes special characters from temporary filenames so that the files can be served by components [@abidlabs](https://github.com/abidlabs) in [PR 2480](https://github.com/gradio-app/gradio/pull/2480)
- Fixed infinite reload loop when mounting gradio as a sub application by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2477](https://github.com/gradio-app/gradio/pull/2477)

### Documentation Changes:

- Adds a demo to show how a sound alert can be played upon completion of a prediction by [@abidlabs](https://github.com/abidlabs) in [PR 2478](https://github.com/gradio-app/gradio/pull/2478)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Enable running events to be cancelled from other events by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2433](https://github.com/gradio-app/gradio/pull/2433)
- Small fix for version check before reuploading demos by [@aliabd](https://github.com/aliabd) in [PR 2469](https://github.com/gradio-app/gradio/pull/2469)
- Add loading status tracker UI to HTML and Markdown components. [@pngwn](https://github.com/pngwn) in [PR 2400](https://github.com/gradio-app/gradio/pull/2474)
- Add clear button for timeseries component [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2487](https://github.com/gradio-app/gradio/pull/2487)

### Contributors Shoutout:

No changes to highlight.

## 3.5

### Bug Fixes:

- Ensure that Gradio does not take control of the HTML page title when embedding a gradio app as a web component, this behaviour flipped by adding `control_page_title="true"` to the webcomponent. [@pngwn](https://github.com/pngwn) in [PR 2400](https://github.com/gradio-app/gradio/pull/2400)
- Decreased latency in iterative-output demos by making the iteration asynchronous [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2409](https://github.com/gradio-app/gradio/pull/2409)
- Fixed queue getting stuck under very high load by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2374](https://github.com/gradio-app/gradio/pull/2374)
- Ensure that components always behave as if `interactive=True` were set when the following conditions are true:

  - no default value is provided,
  - they are not set as the input or output of an event,
  - `interactive` kwarg is not set.

  [@pngwn](https://github.com/pngwn) in [PR 2459](https://github.com/gradio-app/gradio/pull/2459)

### New Features:

- When an `Image` component is set to `source="upload"`, it is now possible to drag and drop and image to replace a previously uploaded image by [@pngwn](https://github.com/pngwn) in [PR 1711](https://github.com/gradio-app/gradio/issues/1711)
- The `gr.Dataset` component now accepts `HTML` and `Markdown` components by [@abidlabs](https://github.com/abidlabs) in [PR 2437](https://github.com/gradio-app/gradio/pull/2437)

### Documentation Changes:

- Improved documentation for the `gr.Dataset` component by [@abidlabs](https://github.com/abidlabs) in [PR 2437](https://github.com/gradio-app/gradio/pull/2437)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

- The `Carousel` component is officially deprecated. Since gradio 3.0, code containing the `Carousel` component would throw warnings. As of the next release, the `Carousel` component will raise an exception.

### Full Changelog:

- Speeds up Gallery component by using temporary files instead of base64 representation in the front-end by [@proxyphi](https://github.com/proxyphi), [@pngwn](https://github.com/pngwn), and [@abidlabs](https://github.com/abidlabs) in [PR 2265](https://github.com/gradio-app/gradio/pull/2265)
- Fixed some embedded demos in the guides by not loading the gradio web component in some guides by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2403](https://github.com/gradio-app/gradio/pull/2403)
- When an `Image` component is set to `source="upload"`, it is now possible to drag and drop and image to replace a previously uploaded image by [@pngwn](https://github.com/pngwn) in [PR 2400](https://github.com/gradio-app/gradio/pull/2410)
- Improve documentation of the `Blocks.load()` event by [@abidlabs](https://github.com/abidlabs) in [PR 2413](https://github.com/gradio-app/gradio/pull/2413)
- Decreased latency in iterative-output demos by making the iteration asynchronous [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2409](https://github.com/gradio-app/gradio/pull/2409)
- Updated share link message to reference new Spaces Hardware [@abidlabs](https://github.com/abidlabs) in [PR 2423](https://github.com/gradio-app/gradio/pull/2423)
- Automatically restart spaces if they're down by [@aliabd](https://github.com/aliabd) in [PR 2405](https://github.com/gradio-app/gradio/pull/2405)
- Carousel component is now deprecated by [@abidlabs](https://github.com/abidlabs) in [PR 2434](https://github.com/gradio-app/gradio/pull/2434)
- Build Gradio from source in ui tests by by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2440](https://github.com/gradio-app/gradio/pull/2440)
- Change "return ValueError" to "raise ValueError" by [@vzakharov](https://github.com/vzakharov) in [PR 2445](https://github.com/gradio-app/gradio/pull/2445)
- Add guide on creating a map demo using the `gr.Plot()` component [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2402](https://github.com/gradio-app/gradio/pull/2402)
- Add blur event for `Textbox` and `Number` components [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2448](https://github.com/gradio-app/gradio/pull/2448)
- Stops a gradio launch from hogging a port even after it's been killed [@aliabid94](https://github.com/aliabid94) in [PR 2453](https://github.com/gradio-app/gradio/pull/2453)
- Fix embedded interfaces on touch screen devices by [@aliabd](https://github.com/aliabd) in [PR 2457](https://github.com/gradio-app/gradio/pull/2457)
- Upload all demos to spaces by [@aliabd](https://github.com/aliabd) in [PR 2281](https://github.com/gradio-app/gradio/pull/2281)

### Contributors Shoutout:

No changes to highlight.

## 3.4.1

### New Features:

###### 1. See Past and Upcoming Changes in the Release History 👀

You can now see gradio's release history directly on the website, and also keep track of upcoming changes. Just go [here](https://gradio.app/changelog/).

![release-history](https://user-images.githubusercontent.com/9021060/193145458-3de699f7-7620-45de-aa73-a1c1b9b96257.gif)

### Bug Fixes:

1. Fix typo in guide image path by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2357](https://github.com/gradio-app/gradio/pull/2357)
2. Raise error if Blocks has duplicate component with same IDs by [@abidlabs](https://github.com/abidlabs) in [PR 2359](https://github.com/gradio-app/gradio/pull/2359)
3. Catch the permission exception on the audio component by [@Ian-GL](https://github.com/Ian-GL) in [PR 2330](https://github.com/gradio-app/gradio/pull/2330)
4. Fix image_classifier_interface_load demo by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2365](https://github.com/gradio-app/gradio/pull/2365)
5. Fix combining adjacent components without gaps by introducing `gr.Row(variant="compact")` by [@aliabid94](https://github.com/aliabid94) in [PR 2291](https://github.com/gradio-app/gradio/pull/2291) This comes with deprecation of the following arguments for `Component.style`: `round`, `margin`, `border`.
6. Fix audio streaming, which was previously choppy in [PR 2351](https://github.com/gradio-app/gradio/pull/2351). Big thanks to [@yannickfunk](https://github.com/yannickfunk) for the proposed solution.
7. Fix bug where new typeable slider doesn't respect the minimum and maximum values [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2380](https://github.com/gradio-app/gradio/pull/2380)

### Documentation Changes:

1. New Guide: Connecting to a Database 🗄️

   A new guide by [@freddyaboulton](https://github.com/freddyaboulton) that explains how you can use Gradio to connect your app to a database. Read more [here](https://gradio.app/connecting_to_a_database/).

2. New Guide: Running Background Tasks 🥷

   A new guide by [@freddyaboulton](https://github.com/freddyaboulton) that explains how you can run background tasks from your gradio app. Read more [here](https://gradio.app/running_background_tasks/).

3. Small fixes to docs for `Image` component by [@abidlabs](https://github.com/abidlabs) in [PR 2372](https://github.com/gradio-app/gradio/pull/2372)

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Create a guide on how to connect an app to a database hosted on the cloud by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2341](https://github.com/gradio-app/gradio/pull/2341)
- Removes `analytics` dependency by [@abidlabs](https://github.com/abidlabs) in [PR 2347](https://github.com/gradio-app/gradio/pull/2347)
- Add guide on launching background tasks from your app by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2350](https://github.com/gradio-app/gradio/pull/2350)
- Fix typo in guide image path by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2357](https://github.com/gradio-app/gradio/pull/2357)
- Raise error if Blocks has duplicate component with same IDs by [@abidlabs](https://github.com/abidlabs) in [PR 2359](https://github.com/gradio-app/gradio/pull/2359)
- Hotfix: fix version back to 3.4 by [@abidlabs](https://github.com/abidlabs) in [PR 2361](https://github.com/gradio-app/gradio/pull/2361)
- Change version.txt to 3.4 instead of 3.4.0 by [@aliabd](https://github.com/aliabd) in [PR 2363](https://github.com/gradio-app/gradio/pull/2363)
- Catch the permission exception on the audio component by [@Ian-GL](https://github.com/Ian-GL) in [PR 2330](https://github.com/gradio-app/gradio/pull/2330)
- Fix image_classifier_interface_load demo by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2365](https://github.com/gradio-app/gradio/pull/2365)
- Small fixes to docs for `Image` component by [@abidlabs](https://github.com/abidlabs) in [PR 2372](https://github.com/gradio-app/gradio/pull/2372)
- Automated Release Notes by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2306](https://github.com/gradio-app/gradio/pull/2306)
- Fixed small typos in the docs [@julien-c](https://github.com/julien-c) in [PR 2373](https://github.com/gradio-app/gradio/pull/2373)
- Adds ability to disable pre/post-processing for examples [@abidlabs](https://github.com/abidlabs) in [PR 2383](https://github.com/gradio-app/gradio/pull/2383)
- Copy changelog file in website docker by [@aliabd](https://github.com/aliabd) in [PR 2384](https://github.com/gradio-app/gradio/pull/2384)
- Lets users provide a `gr.update()` dictionary even if post-processing is disabled [@abidlabs](https://github.com/abidlabs) in [PR 2385](https://github.com/gradio-app/gradio/pull/2385)
- Fix bug where errors would cause apps run in reload mode to hang forever by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2394](https://github.com/gradio-app/gradio/pull/2394)
- Fix bug where new typeable slider doesn't respect the minimum and maximum values [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2380](https://github.com/gradio-app/gradio/pull/2380)

### Contributors Shoutout:

No changes to highlight.

## 3.4

### New Features:

###### 1. Gallery Captions 🖼️

You can now pass captions to images in the Gallery component. To do so you need to pass a {List} of (image, {str} caption) tuples. This is optional and the component also accepts just a list of the images.

Here's an example:

```python
import gradio as gr

images_with_captions = [
    ("https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6", "Cheetah by David Groves"),
    ("https://images.unsplash.com/photo-1546182990-dffeafbe841d", "Lion by Francesco"),
    ("https://images.unsplash.com/photo-1561731216-c3a4d99437d5", "Tiger by Mike Marrah")
    ]

with gr.Blocks() as demo:
    gr.Gallery(value=images_with_captions)

demo.launch()
```

<img src="https://user-images.githubusercontent.com/9021060/192399521-7360b1a9-7ce0-443e-8e94-863a230a7dbe.gif" alt="gallery_captions" width="1000"/>

###### 2. Type Values into the Slider 🔢

You can now type values directly on the Slider component! Here's what it looks like:

![type-slider](https://user-images.githubusercontent.com/9021060/192399877-76b662a1-fede-4417-a932-fc15f0da7360.gif)

###### 3. Better Sketching and Inpainting 🎨

We've made a lot of changes to our Image component so that it can support better sketching and inpainting.

Now supports:

- A standalone black-and-white sketch

```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Sketchpad(), gr.Image())
demo.launch()
```

![bw](https://user-images.githubusercontent.com/9021060/192410264-b08632b5-7b2a-4f86-afb0-5760e7b474cf.gif)

- A standalone color sketch

```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Paint(), gr.Image())
demo.launch()
```

![color-sketch](https://user-images.githubusercontent.com/9021060/192410500-3c8c3e64-a5fd-4df2-a991-f0a5cef93728.gif)

- An uploadable image with black-and-white or color sketching

```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Image(source='upload', tool='color-sketch'), gr.Image()) # for black and white, tool = 'sketch'
demo.launch()
```

![sketch-new](https://user-images.githubusercontent.com/9021060/192402422-e53cb7b6-024e-448c-87eb-d6a35a63c476.gif)

- Webcam with black-and-white or color sketching

```python
import gradio as gr
demo = gr.Interface(lambda x: x, gr.Image(source='webcam', tool='color-sketch'), gr.Image()) # for black and white, tool = 'sketch'
demo.launch()
```

![webcam-sketch](https://user-images.githubusercontent.com/9021060/192410820-0ffaf324-776e-4e1f-9de6-0fdbbf4940fa.gif)

As well as other fixes

### Bug Fixes:

1. Fix bug where max concurrency count is not respected in queue by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2286](https://github.com/gradio-app/gradio/pull/2286)
2. fix : queue could be blocked by [@SkyTNT](https://github.com/SkyTNT) in [PR 2288](https://github.com/gradio-app/gradio/pull/2288)
3. Supports `gr.update()` in example caching by [@abidlabs](https://github.com/abidlabs) in [PR 2309](https://github.com/gradio-app/gradio/pull/2309)
4. Clipboard fix for iframes by [@abidlabs](https://github.com/abidlabs) in [PR 2321](https://github.com/gradio-app/gradio/pull/2321)
5. Fix: Dataframe column headers are reset when you add a new column by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2318](https://github.com/gradio-app/gradio/pull/2318)
6. Added support for URLs for Video, Audio, and Image by [@abidlabs](https://github.com/abidlabs) in [PR 2256](https://github.com/gradio-app/gradio/pull/2256)
7. Add documentation about how to create and use the Gradio FastAPI app by [@abidlabs](https://github.com/abidlabs) in [PR 2263](https://github.com/gradio-app/gradio/pull/2263)

### Documentation Changes:

1. Adding a Playground Tab to the Website by [@aliabd](https://github.com/aliabd) in [PR 1860](https://github.com/gradio-app/gradio/pull/1860)
2. Gradio for Tabular Data Science Workflows Guide by [@merveenoyan](https://github.com/merveenoyan) in [PR 2199](https://github.com/gradio-app/gradio/pull/2199)
3. Promotes `postprocess` and `preprocess` to documented parameters by [@abidlabs](https://github.com/abidlabs) in [PR 2293](https://github.com/gradio-app/gradio/pull/2293)
4. Update 2)key_features.md by [@voidxd](https://github.com/voidxd) in [PR 2326](https://github.com/gradio-app/gradio/pull/2326)
5. Add docs to blocks context postprocessing function by [@Ian-GL](https://github.com/Ian-GL) in [PR 2332](https://github.com/gradio-app/gradio/pull/2332)

### Testing and Infrastructure Changes

1. Website fixes and refactoring by [@aliabd](https://github.com/aliabd) in [PR 2280](https://github.com/gradio-app/gradio/pull/2280)
2. Don't deploy to spaces on release by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2313](https://github.com/gradio-app/gradio/pull/2313)

### Full Changelog:

- Website fixes and refactoring by [@aliabd](https://github.com/aliabd) in [PR 2280](https://github.com/gradio-app/gradio/pull/2280)
- Fix bug where max concurrency count is not respected in queue by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2286](https://github.com/gradio-app/gradio/pull/2286)
- Promotes `postprocess` and `preprocess` to documented parameters by [@abidlabs](https://github.com/abidlabs) in [PR 2293](https://github.com/gradio-app/gradio/pull/2293)
- Raise warning when trying to cache examples but not all inputs have examples by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2279](https://github.com/gradio-app/gradio/pull/2279)
- fix : queue could be blocked by [@SkyTNT](https://github.com/SkyTNT) in [PR 2288](https://github.com/gradio-app/gradio/pull/2288)
- Don't deploy to spaces on release by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2313](https://github.com/gradio-app/gradio/pull/2313)
- Supports `gr.update()` in example caching by [@abidlabs](https://github.com/abidlabs) in [PR 2309](https://github.com/gradio-app/gradio/pull/2309)
- Respect Upstream Queue when loading interfaces/blocks from Spaces by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2294](https://github.com/gradio-app/gradio/pull/2294)
- Clipboard fix for iframes by [@abidlabs](https://github.com/abidlabs) in [PR 2321](https://github.com/gradio-app/gradio/pull/2321)
- Sketching + Inpainting Capabilities to Gradio by [@abidlabs](https://github.com/abidlabs) in [PR 2144](https://github.com/gradio-app/gradio/pull/2144)
- Update 2)key_features.md by [@voidxd](https://github.com/voidxd) in [PR 2326](https://github.com/gradio-app/gradio/pull/2326)
- release 3.4b3 by [@abidlabs](https://github.com/abidlabs) in [PR 2328](https://github.com/gradio-app/gradio/pull/2328)
- Fix: Dataframe column headers are reset when you add a new column by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2318](https://github.com/gradio-app/gradio/pull/2318)
- Start queue when gradio is a sub application by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2319](https://github.com/gradio-app/gradio/pull/2319)
- Fix Web Tracker Script by [@aliabd](https://github.com/aliabd) in [PR 2308](https://github.com/gradio-app/gradio/pull/2308)
- Add docs to blocks context postprocessing function by [@Ian-GL](https://github.com/Ian-GL) in [PR 2332](https://github.com/gradio-app/gradio/pull/2332)
- Fix typo in iterator variable name in run_predict function by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2340](https://github.com/gradio-app/gradio/pull/2340)
- Add captions to galleries by [@aliabid94](https://github.com/aliabid94) in [PR 2284](https://github.com/gradio-app/gradio/pull/2284)
- Typeable value on gradio.Slider by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2329](https://github.com/gradio-app/gradio/pull/2329)

### Contributors Shoutout:

- [@SkyTNT](https://github.com/SkyTNT) made their first contribution in [PR 2288](https://github.com/gradio-app/gradio/pull/2288)
- [@voidxd](https://github.com/voidxd) made their first contribution in [PR 2326](https://github.com/gradio-app/gradio/pull/2326)

## 3.3

### New Features:

###### 1. Iterative Outputs ⏳

You can now create an iterative output simply by having your function return a generator!

Here's (part of) an example that was used to generate the interface below it. [See full code](https://colab.research.google.com/drive/1m9bWS6B82CT7bw-m4L6AJR8za7fEK7Ov?usp=sharing).

```python
def predict(steps, seed):
    generator = torch.manual_seed(seed)
    for i in range(1,steps):
        yield pipeline(generator=generator, num_inference_steps=i)["sample"][0]
```

![example](https://user-images.githubusercontent.com/9021060/189086273-f5e7087d-71fa-4158-90a9-08e84da0421c.mp4)

###### 2. Accordion Layout 🆕

This version of Gradio introduces a new layout component to Blocks: the Accordion. Wrap your elements in a neat, expandable layout that allows users to toggle them as needed.

Usage: ([Read the docs](https://gradio.app/docs/#accordion))

```python
with gr.Accordion("open up"):
# components here
```

![accordion](https://user-images.githubusercontent.com/9021060/189088465-f0ffd7f0-fc6a-42dc-9249-11c5e1e0529b.gif)

###### 3. Skops Integration 📈

Our new integration with [skops](https://huggingface.co/blog/skops) allows you to load tabular classification and regression models directly from the [hub](https://huggingface.co/models).

Here's a classification example showing how quick it is to set up an interface for a [model](https://huggingface.co/scikit-learn/tabular-playground).

```python
import gradio as gr
gr.Interface.load("models/scikit-learn/tabular-playground").launch()
```

![187936493-5c90c01d-a6dd-400f-aa42-833a096156a1](https://user-images.githubusercontent.com/9021060/189090519-328fbcb4-120b-43c8-aa54-d6fccfa6b7e8.png)

### Bug Fixes:

No changes to highlight.

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- safari fixes by [@pngwn](https://github.com/pngwn) in [PR 2138](https://github.com/gradio-app/gradio/pull/2138)
- Fix roundedness and form borders by [@aliabid94](https://github.com/aliabid94) in [PR 2147](https://github.com/gradio-app/gradio/pull/2147)
- Better processing of example data prior to creating dataset component by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2147](https://github.com/gradio-app/gradio/pull/2147)
- Show error on Connection drops by [@aliabid94](https://github.com/aliabid94) in [PR 2147](https://github.com/gradio-app/gradio/pull/2147)
- 3.2 release! by [@abidlabs](https://github.com/abidlabs) in [PR 2139](https://github.com/gradio-app/gradio/pull/2139)
- Fixed Named API Requests by [@abidlabs](https://github.com/abidlabs) in [PR 2151](https://github.com/gradio-app/gradio/pull/2151)
- Quick Fix: Cannot upload Model3D image after clearing it by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2168](https://github.com/gradio-app/gradio/pull/2168)
- Fixed misleading log when server_name is '0.0.0.0' by [@lamhoangtung](https://github.com/lamhoangtung) in [PR 2176](https://github.com/gradio-app/gradio/pull/2176)
- Keep embedded PngInfo metadata by [@cobryan05](https://github.com/cobryan05) in [PR 2170](https://github.com/gradio-app/gradio/pull/2170)
- Skops integration: Load tabular classification and regression models from the hub by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2126](https://github.com/gradio-app/gradio/pull/2126)
- Respect original filename when cached example files are downloaded by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2145](https://github.com/gradio-app/gradio/pull/2145)
- Add manual trigger to deploy to pypi by [@abidlabs](https://github.com/abidlabs) in [PR 2192](https://github.com/gradio-app/gradio/pull/2192)
- Fix bugs with gr.update by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2157](https://github.com/gradio-app/gradio/pull/2157)
- Make queue per app by [@aliabid94](https://github.com/aliabid94) in [PR 2193](https://github.com/gradio-app/gradio/pull/2193)
- Preserve Labels In Interpretation Components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2166](https://github.com/gradio-app/gradio/pull/2166)
- Quick Fix: Multiple file download not working by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2169](https://github.com/gradio-app/gradio/pull/2169)
- use correct MIME type for js-script file by [@daspartho](https://github.com/daspartho) in [PR 2200](https://github.com/gradio-app/gradio/pull/2200)
- Add accordion component by [@aliabid94](https://github.com/aliabid94) in [PR 2208](https://github.com/gradio-app/gradio/pull/2208)

### Contributors Shoutout:

- [@lamhoangtung](https://github.com/lamhoangtung) made their first contribution in [PR 2176](https://github.com/gradio-app/gradio/pull/2176)
- [@cobryan05](https://github.com/cobryan05) made their first contribution in [PR 2170](https://github.com/gradio-app/gradio/pull/2170)
- [@daspartho](https://github.com/daspartho) made their first contribution in [PR 2200](https://github.com/gradio-app/gradio/pull/2200)

## 3.2

### New Features:

###### 1. Improvements to Queuing 🥇

We've implemented a brand new queuing system based on **web sockets** instead of HTTP long polling. Among other things, this allows us to manage queue sizes better on Hugging Face Spaces. There are also additional queue-related parameters you can add:

- Now supports concurrent workers (parallelization)

```python
demo = gr.Interface(...)
demo.queue(concurrency_count=3)
demo.launch()
```

- Configure a maximum queue size

```python
demo = gr.Interface(...)
demo.queue(max_size=100)
demo.launch()
```

- If a user closes their tab / browser, they leave the queue, which means the demo will run faster for everyone else

###### 2. Fixes to Examples

- Dataframe examples will render properly, and look much clearer in the UI: (thanks to PR #2125)

![Screen Shot 2022-08-30 at 8 29 58 PM](https://user-images.githubusercontent.com/9021060/187586561-d915bafb-f968-4966-b9a2-ef41119692b2.png)

- Image and Video thumbnails are cropped to look neater and more uniform: (thanks to PR #2109)

![Screen Shot 2022-08-30 at 8 32 15 PM](https://user-images.githubusercontent.com/9021060/187586890-56e1e4f0-1b84-42d9-a82f-911772c41030.png)

- Other fixes in PR #2131 and #2064 make it easier to design and use Examples

###### 3. Component Fixes 🧱

- Specify the width and height of an image in its style tag (thanks to PR #2133)

```python
components.Image().style(height=260, width=300)
```

- Automatic conversion of videos so they are playable in the browser (thanks to PR #2003). Gradio will check if a video's format is playable in the browser and, if it isn't, will automatically convert it to a format that is (mp4).
- Pass in a json filepath to the Label component (thanks to PR #2083)
- Randomize the default value of a Slider (thanks to PR #1935)

![slider-random](https://user-images.githubusercontent.com/9021060/187596230-3db9697f-9f4d-42f5-9387-d77573513448.gif)

- Improvements to State in PR #2100

###### 4. Ability to Randomize Input Sliders and Reload Data whenever the Page Loads

- In some cases, you want to be able to show a different set of input data to every user as they load the page app. For example, you might want to randomize the value of a "seed" `Slider` input. Or you might want to show a `Textbox` with the current date. We now supporting passing _functions_ as the default value in input components. When you pass in a function, it gets **re-evaluated** every time someone loads the demo, allowing you to reload / change data for different users.

Here's an example loading the current date time into an input Textbox:

```python
import gradio as gr
import datetime

with gr.Blocks() as demo:
    gr.Textbox(datetime.datetime.now)

demo.launch()
```

Note that we don't evaluate the function -- `datetime.datetime.now()` -- we pass in the function itself to get this behavior -- `datetime.datetime.now`

Because randomizing the initial value of `Slider` is a common use case, we've added a `randomize` keyword argument you can use to randomize its initial value:

```python
import gradio as gr
demo = gr.Interface(lambda x:x, gr.Slider(0, 10, randomize=True), "number")
demo.launch()
```

###### 5. New Guide 🖊️

- [Gradio and W&B Integration](https://gradio.app/Gradio_and_Wandb_Integration/)

### Full Changelog:

- Reset components to original state by setting value to None by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2044](https://github.com/gradio-app/gradio/pull/2044)
- Cleaning up the way data is processed for components by [@abidlabs](https://github.com/abidlabs) in [PR 1967](https://github.com/gradio-app/gradio/pull/1967)
- version 3.1.8b by [@abidlabs](https://github.com/abidlabs) in [PR 2063](https://github.com/gradio-app/gradio/pull/2063)
- Wandb guide by [@AK391](https://github.com/AK391) in [PR 1898](https://github.com/gradio-app/gradio/pull/1898)
- Add a flagging callback to save json files to a hugging face dataset by [@chrisemezue](https://github.com/chrisemezue) in [PR 1821](https://github.com/gradio-app/gradio/pull/1821)
- Add data science demos to landing page by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2067](https://github.com/gradio-app/gradio/pull/2067)
- Hide time series + xgboost demos by default by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2079](https://github.com/gradio-app/gradio/pull/2079)
- Encourage people to keep trying when queue full by [@apolinario](https://github.com/apolinario) in [PR 2076](https://github.com/gradio-app/gradio/pull/2076)
- Updated our analytics on creation of Blocks/Interface by [@abidlabs](https://github.com/abidlabs) in [PR 2082](https://github.com/gradio-app/gradio/pull/2082)
- `Label` component now accepts file paths to `.json` files by [@abidlabs](https://github.com/abidlabs) in [PR 2083](https://github.com/gradio-app/gradio/pull/2083)
- Fix issues related to demos in Spaces by [@abidlabs](https://github.com/abidlabs) in [PR 2086](https://github.com/gradio-app/gradio/pull/2086)
- Fix TimeSeries examples not properly displayed in UI by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2064](https://github.com/gradio-app/gradio/pull/2064)
- Fix infinite requests when doing tab item select by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2070](https://github.com/gradio-app/gradio/pull/2070)
- Accept deprecated `file` route as well by [@abidlabs](https://github.com/abidlabs) in [PR 2099](https://github.com/gradio-app/gradio/pull/2099)
- Allow frontend method execution on Block.load event by [@codedealer](https://github.com/codedealer) in [PR 2108](https://github.com/gradio-app/gradio/pull/2108)
- Improvements to `State` by [@abidlabs](https://github.com/abidlabs) in [PR 2100](https://github.com/gradio-app/gradio/pull/2100)
- Catch IndexError, KeyError in video_is_playable by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 2113](https://github.com/gradio-app/gradio/pull/2113)
- Fix: Download button does not respect the filepath returned by the function by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 2073](https://github.com/gradio-app/gradio/pull/2073)
- Refactoring Layout: Adding column widths, forms, and more. by [@aliabid94](https://github.com/aliabid94) in [PR 2097](https://github.com/gradio-app/gradio/pull/2097)
- Update CONTRIBUTING.md by [@abidlabs](https://github.com/abidlabs) in [PR 2118](https://github.com/gradio-app/gradio/pull/2118)
- 2092 df ex by [@pngwn](https://github.com/pngwn) in [PR 2125](https://github.com/gradio-app/gradio/pull/2125)
- feat(samples table/gallery): Crop thumbs to square by [@ronvoluted](https://github.com/ronvoluted) in [PR 2109](https://github.com/gradio-app/gradio/pull/2109)
- Some enhancements to `gr.Examples` by [@abidlabs](https://github.com/abidlabs) in [PR 2131](https://github.com/gradio-app/gradio/pull/2131)
- Image size fix by [@aliabid94](https://github.com/aliabid94) in [PR 2133](https://github.com/gradio-app/gradio/pull/2133)

### Contributors Shoutout:

- [@chrisemezue](https://github.com/chrisemezue) made their first contribution in [PR 1821](https://github.com/gradio-app/gradio/pull/1821)
- [@apolinario](https://github.com/apolinario) made their first contribution in [PR 2076](https://github.com/gradio-app/gradio/pull/2076)
- [@codedealer](https://github.com/codedealer) made their first contribution in [PR 2108](https://github.com/gradio-app/gradio/pull/2108)

## 3.1

### New Features:

###### 1. Embedding Demos on Any Website 💻

With PR #1444, Gradio is now distributed as a web component. This means demos can be natively embedded on websites. You'll just need to add two lines: one to load the gradio javascript, and one to link to the demos backend.

Here's a simple example that embeds the demo from a Hugging Face space:

```html
<script
	type="module"
	src="https://gradio.s3-us-west-2.amazonaws.com/3.0.18/gradio.js"
></script>
<gradio-app space="abidlabs/pytorch-image-classifier"></gradio-app>
```

But you can also embed demos that are running anywhere, you just need to link the demo to `src` instead of `space`. In fact, all the demos on the gradio website are embedded this way:

<img width="1268" alt="Screen Shot 2022-07-14 at 2 41 44 PM" src="https://user-images.githubusercontent.com/9021060/178997124-b2f05af2-c18f-4716-bf1b-cb971d012636.png">

Read more in the [Embedding Gradio Demos](https://gradio.app/embedding_gradio_demos) guide.

###### 2. Reload Mode 👨‍💻

Reload mode helps developers create gradio demos faster by automatically reloading the demo whenever the code changes. It can support development on Python IDEs (VS Code, PyCharm, etc), the terminal, as well as Jupyter notebooks.

If your demo code is in a script named `app.py`, instead of running `python app.py` you can now run `gradio app.py` and that will launch the demo in reload mode:

```bash
Launching in reload mode on: http://127.0.0.1:7860 (Press CTRL+C to quit)
Watching...
WARNING: The --reload flag should not be used in production on Windows.
```

If you're working from a Jupyter or Colab Notebook, use these magic commands instead: `%load_ext gradio` when you import gradio, and `%%blocks` in the top of the cell with the demo code. Here's an example that shows how much faster the development becomes:

![Blocks](https://user-images.githubusercontent.com/9021060/178986488-ed378cc8-5141-4330-ba41-672b676863d0.gif)

###### 3. Inpainting Support on `gr.Image()` 🎨

We updated the Image component to add support for inpainting demos. It works by adding `tool="sketch"` as a parameter, that passes both an image and a sketchable mask to your prediction function.

Here's an example from the [LAMA space](https://huggingface.co/spaces/akhaliq/lama):

![FXApVlFVsAALSD-](https://user-images.githubusercontent.com/9021060/178989479-549867c8-7fb0-436a-a97d-1e91c9f5e611.jpeg)

###### 4. Markdown and HTML support in Dataframes 🔢

We upgraded the Dataframe component in PR #1684 to support rendering Markdown and HTML inside the cells.

This means you can build Dataframes that look like the following:

![image (8)](https://user-images.githubusercontent.com/9021060/178991233-41cb07a5-e7a3-433e-89b8-319bc78eb9c2.png)

###### 5. `gr.Examples()` for Blocks 🧱

We've added the `gr.Examples` component helper to allow you to add examples to any Blocks demo. This class is a wrapper over the `gr.Dataset` component.

<img width="1271" alt="Screen Shot 2022-07-14 at 2 23 50 PM" src="https://user-images.githubusercontent.com/9021060/178992715-c8bc7550-bc3d-4ddc-9fcb-548c159cd153.png">

gr.Examples takes two required parameters:

- `examples` which takes in a nested list
- `inputs` which takes in a component or list of components

You can read more in the [Examples docs](https://gradio.app/docs/#examples) or the [Adding Examples to your Demos guide](https://gradio.app/adding_examples_to_your_app/).

###### 6. Fixes to Audio Streaming

With [PR 1828](https://github.com/gradio-app/gradio/pull/1828) we now hide the status loading animation, as well as remove the echo in streaming. Check out the [stream_audio](https://github.com/gradio-app/gradio/blob/main/demo/stream_audio/run.py) demo for more or read through our [Real Time Speech Recognition](https://gradio.app/real_time_speech_recognition/) guide.

<img width="785" alt="Screen Shot 2022-07-19 at 6 02 35 PM" src="https://user-images.githubusercontent.com/9021060/179808136-9e84502c-f9ee-4f30-b5e9-1086f678fe91.png">

### Full Changelog:

- File component: list multiple files and allow for download #1446 by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1681](https://github.com/gradio-app/gradio/pull/1681)
- Add ColorPicker to docs by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1768](https://github.com/gradio-app/gradio/pull/1768)
- Mock out requests in TestRequest unit tests by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1794](https://github.com/gradio-app/gradio/pull/1794)
- Add requirements.txt and test_files to source dist by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1817](https://github.com/gradio-app/gradio/pull/1817)
- refactor: f-string for tunneling.py by [@nhankiet](https://github.com/nhankiet) in [PR 1819](https://github.com/gradio-app/gradio/pull/1819)
- Miscellaneous formatting improvements to website by [@aliabd](https://github.com/aliabd) in [PR 1754](https://github.com/gradio-app/gradio/pull/1754)
- `integrate()` method moved to `Blocks` by [@abidlabs](https://github.com/abidlabs) in [PR 1776](https://github.com/gradio-app/gradio/pull/1776)
- Add python-3.7 tests by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1818](https://github.com/gradio-app/gradio/pull/1818)
- Copy test dir in website dockers by [@aliabd](https://github.com/aliabd) in [PR 1827](https://github.com/gradio-app/gradio/pull/1827)
- Add info to docs on how to set default values for components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1788](https://github.com/gradio-app/gradio/pull/1788)
- Embedding Components on Docs by [@aliabd](https://github.com/aliabd) in [PR 1726](https://github.com/gradio-app/gradio/pull/1726)
- Remove usage of deprecated gr.inputs and gr.outputs from website by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1796](https://github.com/gradio-app/gradio/pull/1796)
- Some cleanups to the docs page by [@abidlabs](https://github.com/abidlabs) in [PR 1822](https://github.com/gradio-app/gradio/pull/1822)

### Contributors Shoutout:

- [@nhankiet](https://github.com/nhankiet) made their first contribution in [PR 1819](https://github.com/gradio-app/gradio/pull/1819)

## 3.0

###### 🔥 Gradio 3.0 is the biggest update to the library, ever.

### New Features:

###### 1. Blocks 🧱

Blocks is a new, low-level API that allows you to have full control over the data flows and layout of your application. It allows you to build very complex, multi-step applications. For example, you might want to:

- Group together related demos as multiple tabs in one web app
- Change the layout of your demo instead of just having all of the inputs on the left and outputs on the right
- Have multi-step interfaces, in which the output of one model becomes the input to the next model, or have more flexible data flows in general
- Change a component's properties (for example, the choices in a Dropdown) or its visibility based on user input

Here's a simple example that creates the demo below it:

```python
import gradio as gr

def update(name):
    return f"Welcome to Gradio, {name}!"

demo = gr.Blocks()

with demo:
    gr.Markdown(
    """
    # Hello World!
    Start typing below to see the output.
    """)
    inp = gr.Textbox(placeholder="What is your name?")
    out = gr.Textbox()

    inp.change(fn=update,
               inputs=inp,
               outputs=out)

demo.launch()
```

![hello-blocks](https://user-images.githubusercontent.com/9021060/168684108-78cbd24b-e6bd-4a04-a8d9-20d535203434.gif)

Read our [Introduction to Blocks](http://gradio.app/introduction_to_blocks/) guide for more, and join the 🎈 [Gradio Blocks Party](https://huggingface.co/spaces/Gradio-Blocks/README)!

###### 2. Our Revamped Design 🎨

We've upgraded our design across the entire library: from components, and layouts all the way to dark mode.

![kitchen_sink](https://user-images.githubusercontent.com/9021060/168686333-7a6e3096-3e23-4309-abf2-5cd7736e0463.gif)

###### 3. A New Website 💻

We've upgraded [gradio.app](https://gradio.app) to make it cleaner, faster and easier to use. Our docs now come with components and demos embedded directly on the page. So you can quickly get up to speed with what you're looking for.

![website](https://user-images.githubusercontent.com/9021060/168687191-10d6a3bd-101f-423a-8193-48f47a5e077d.gif)

###### 4. New Components: Model3D, Dataset, and More..

We've introduced a lot of new components in `3.0`, including `Model3D`, `Dataset`, `Markdown`, `Button` and `Gallery`. You can find all the components and play around with them [here](https://gradio.app/docs/#components).

![Model3d](https://user-images.githubusercontent.com/9021060/168689062-6ad77151-8cc5-467d-916c-f7c78e52ec0c.gif)

### Full Changelog:

- Gradio dash fe by [@pngwn](https://github.com/pngwn) in [PR 807](https://github.com/gradio-app/gradio/pull/807)
- Blocks components by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 765](https://github.com/gradio-app/gradio/pull/765)
- Blocks components V2 by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 843](https://github.com/gradio-app/gradio/pull/843)
- Blocks-Backend-Events by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 844](https://github.com/gradio-app/gradio/pull/844)
- Interfaces from Blocks by [@aliabid94](https://github.com/aliabid94) in [PR 849](https://github.com/gradio-app/gradio/pull/849)
- Blocks dev by [@aliabid94](https://github.com/aliabid94) in [PR 853](https://github.com/gradio-app/gradio/pull/853)
- Started updating demos to use the new `gradio.components` syntax by [@abidlabs](https://github.com/abidlabs) in [PR 848](https://github.com/gradio-app/gradio/pull/848)
- add test infra + add browser tests to CI by [@pngwn](https://github.com/pngwn) in [PR 852](https://github.com/gradio-app/gradio/pull/852)
- 854 textbox by [@pngwn](https://github.com/pngwn) in [PR 859](https://github.com/gradio-app/gradio/pull/859)
- Getting old Python unit tests to pass on `blocks-dev` by [@abidlabs](https://github.com/abidlabs) in [PR 861](https://github.com/gradio-app/gradio/pull/861)
- initialise chatbot with empty array of messages by [@pngwn](https://github.com/pngwn) in [PR 867](https://github.com/gradio-app/gradio/pull/867)
- add test for output to input by [@pngwn](https://github.com/pngwn) in [PR 866](https://github.com/gradio-app/gradio/pull/866)
- More Interface -> Blocks features by [@aliabid94](https://github.com/aliabid94) in [PR 864](https://github.com/gradio-app/gradio/pull/864)
- Fixing external.py in blocks-dev to reflect the new HF Spaces paths by [@abidlabs](https://github.com/abidlabs) in [PR 879](https://github.com/gradio-app/gradio/pull/879)
- backend_default_value_refactoring by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 871](https://github.com/gradio-app/gradio/pull/871)
- fix default_value by [@pngwn](https://github.com/pngwn) in [PR 869](https://github.com/gradio-app/gradio/pull/869)
- fix buttons by [@aliabid94](https://github.com/aliabid94) in [PR 883](https://github.com/gradio-app/gradio/pull/883)
- Checking and updating more demos to use 3.0 syntax by [@abidlabs](https://github.com/abidlabs) in [PR 892](https://github.com/gradio-app/gradio/pull/892)
- Blocks Tests by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 902](https://github.com/gradio-app/gradio/pull/902)
- Interface fix by [@pngwn](https://github.com/pngwn) in [PR 901](https://github.com/gradio-app/gradio/pull/901)
- Quick fix: Issue 893 by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 907](https://github.com/gradio-app/gradio/pull/907)
- 3d Image Component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 775](https://github.com/gradio-app/gradio/pull/775)
- fix endpoint url in prod by [@pngwn](https://github.com/pngwn) in [PR 911](https://github.com/gradio-app/gradio/pull/911)
- rename Model3d to Image3D by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 912](https://github.com/gradio-app/gradio/pull/912)
- update pypi to 2.9.1 by [@abidlabs](https://github.com/abidlabs) in [PR 916](https://github.com/gradio-app/gradio/pull/916)
- blocks-with-fix by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 917](https://github.com/gradio-app/gradio/pull/917)
- Restore Interpretation, Live, Auth, Queueing by [@aliabid94](https://github.com/aliabid94) in [PR 915](https://github.com/gradio-app/gradio/pull/915)
- Allow `Blocks` instances to be used like a `Block` in other `Blocks` by [@abidlabs](https://github.com/abidlabs) in [PR 919](https://github.com/gradio-app/gradio/pull/919)
- Redesign 1 by [@pngwn](https://github.com/pngwn) in [PR 918](https://github.com/gradio-app/gradio/pull/918)
- blocks-components-tests by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 904](https://github.com/gradio-app/gradio/pull/904)
- fix unit + browser tests by [@pngwn](https://github.com/pngwn) in [PR 926](https://github.com/gradio-app/gradio/pull/926)
- blocks-move-test-data by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 927](https://github.com/gradio-app/gradio/pull/927)
- remove debounce from form inputs by [@pngwn](https://github.com/pngwn) in [PR 932](https://github.com/gradio-app/gradio/pull/932)
- reimplement webcam video by [@pngwn](https://github.com/pngwn) in [PR 928](https://github.com/gradio-app/gradio/pull/928)
- blocks-move-test-data by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 941](https://github.com/gradio-app/gradio/pull/941)
- allow audio components to take a string value by [@pngwn](https://github.com/pngwn) in [PR 930](https://github.com/gradio-app/gradio/pull/930)
- static mode for textbox by [@pngwn](https://github.com/pngwn) in [PR 929](https://github.com/gradio-app/gradio/pull/929)
- fix file upload text by [@pngwn](https://github.com/pngwn) in [PR 931](https://github.com/gradio-app/gradio/pull/931)
- tabbed-interface-rewritten by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 958](https://github.com/gradio-app/gradio/pull/958)
- Gan demo fix by [@abidlabs](https://github.com/abidlabs) in [PR 965](https://github.com/gradio-app/gradio/pull/965)
- Blocks analytics by [@abidlabs](https://github.com/abidlabs) in [PR 947](https://github.com/gradio-app/gradio/pull/947)
- Blocks page load by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 963](https://github.com/gradio-app/gradio/pull/963)
- add frontend for page load events by [@pngwn](https://github.com/pngwn) in [PR 967](https://github.com/gradio-app/gradio/pull/967)
- fix i18n and some tweaks by [@pngwn](https://github.com/pngwn) in [PR 966](https://github.com/gradio-app/gradio/pull/966)
- add jinja2 to reqs by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 969](https://github.com/gradio-app/gradio/pull/969)
- Cleaning up `Launchable()` by [@abidlabs](https://github.com/abidlabs) in [PR 968](https://github.com/gradio-app/gradio/pull/968)
- Fix #944 by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 971](https://github.com/gradio-app/gradio/pull/971)
- New Blocks Demo: neural instrument cloning by [@abidlabs](https://github.com/abidlabs) in [PR 975](https://github.com/gradio-app/gradio/pull/975)
- Add huggingface_hub client library by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 973](https://github.com/gradio-app/gradio/pull/973)
- State and variables by [@aliabid94](https://github.com/aliabid94) in [PR 977](https://github.com/gradio-app/gradio/pull/977)
- update-components by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 986](https://github.com/gradio-app/gradio/pull/986)
- ensure dataframe updates as expected by [@pngwn](https://github.com/pngwn) in [PR 981](https://github.com/gradio-app/gradio/pull/981)
- test-guideline by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 990](https://github.com/gradio-app/gradio/pull/990)
- Issue #785: add footer by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 972](https://github.com/gradio-app/gradio/pull/972)
- indentation fix by [@abidlabs](https://github.com/abidlabs) in [PR 993](https://github.com/gradio-app/gradio/pull/993)
- missing quote by [@aliabd](https://github.com/aliabd) in [PR 996](https://github.com/gradio-app/gradio/pull/996)
- added interactive parameter to components by [@abidlabs](https://github.com/abidlabs) in [PR 992](https://github.com/gradio-app/gradio/pull/992)
- custom-components by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 985](https://github.com/gradio-app/gradio/pull/985)
- Refactor component shortcuts by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 995](https://github.com/gradio-app/gradio/pull/995)
- Plot Component by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 805](https://github.com/gradio-app/gradio/pull/805)
- updated PyPi version to 2.9.2 by [@abidlabs](https://github.com/abidlabs) in [PR 1002](https://github.com/gradio-app/gradio/pull/1002)
- Release 2.9.3 by [@abidlabs](https://github.com/abidlabs) in [PR 1003](https://github.com/gradio-app/gradio/pull/1003)
- Image3D Examples Fix by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1001](https://github.com/gradio-app/gradio/pull/1001)
- release 2.9.4 by [@abidlabs](https://github.com/abidlabs) in [PR 1006](https://github.com/gradio-app/gradio/pull/1006)
- templates import hotfix by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1008](https://github.com/gradio-app/gradio/pull/1008)
- Progress indicator bar by [@aliabid94](https://github.com/aliabid94) in [PR 997](https://github.com/gradio-app/gradio/pull/997)
- Fixed image input for absolute path by [@JefferyChiang](https://github.com/JefferyChiang) in [PR 1004](https://github.com/gradio-app/gradio/pull/1004)
- Model3D + Plot Components by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1010](https://github.com/gradio-app/gradio/pull/1010)
- Gradio Guides: Creating CryptoPunks with GANs by [@NimaBoscarino](https://github.com/NimaBoscarino) in [PR 1000](https://github.com/gradio-app/gradio/pull/1000)
- [BIG PR] Gradio blocks & redesigned components by [@abidlabs](https://github.com/abidlabs) in [PR 880](https://github.com/gradio-app/gradio/pull/880)
- fixed failing test on main by [@abidlabs](https://github.com/abidlabs) in [PR 1023](https://github.com/gradio-app/gradio/pull/1023)
- Use smaller ASR model in external test by [@abidlabs](https://github.com/abidlabs) in [PR 1024](https://github.com/gradio-app/gradio/pull/1024)
- updated PyPi version to 2.9.0b by [@abidlabs](https://github.com/abidlabs) in [PR 1026](https://github.com/gradio-app/gradio/pull/1026)
- Fixing import issues so that the package successfully installs on colab notebooks by [@abidlabs](https://github.com/abidlabs) in [PR 1027](https://github.com/gradio-app/gradio/pull/1027)
- Update website tracker slackbot by [@aliabd](https://github.com/aliabd) in [PR 1037](https://github.com/gradio-app/gradio/pull/1037)
- textbox-autoheight by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1009](https://github.com/gradio-app/gradio/pull/1009)
- Model3D Examples fixes by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1035](https://github.com/gradio-app/gradio/pull/1035)
- GAN Gradio Guide: Adjustments to iframe heights by [@NimaBoscarino](https://github.com/NimaBoscarino) in [PR 1042](https://github.com/gradio-app/gradio/pull/1042)
- added better default labels to form components by [@abidlabs](https://github.com/abidlabs) in [PR 1040](https://github.com/gradio-app/gradio/pull/1040)
- Slackbot web tracker fix by [@aliabd](https://github.com/aliabd) in [PR 1043](https://github.com/gradio-app/gradio/pull/1043)
- Plot fixes by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1044](https://github.com/gradio-app/gradio/pull/1044)
- Small fixes to the demos by [@abidlabs](https://github.com/abidlabs) in [PR 1030](https://github.com/gradio-app/gradio/pull/1030)
- fixing demo issue with website by [@aliabd](https://github.com/aliabd) in [PR 1047](https://github.com/gradio-app/gradio/pull/1047)
- [hotfix] HighlightedText by [@aliabid94](https://github.com/aliabid94) in [PR 1046](https://github.com/gradio-app/gradio/pull/1046)
- Update text by [@ronvoluted](https://github.com/ronvoluted) in [PR 1050](https://github.com/gradio-app/gradio/pull/1050)
- Update CONTRIBUTING.md by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1052](https://github.com/gradio-app/gradio/pull/1052)
- fix(ui): Increase contrast for footer by [@ronvoluted](https://github.com/ronvoluted) in [PR 1048](https://github.com/gradio-app/gradio/pull/1048)
- UI design update by [@gary149](https://github.com/gary149) in [PR 1041](https://github.com/gradio-app/gradio/pull/1041)
- updated PyPi version to 2.9.0b8 by [@abidlabs](https://github.com/abidlabs) in [PR 1059](https://github.com/gradio-app/gradio/pull/1059)
- Running, testing, and fixing demos by [@abidlabs](https://github.com/abidlabs) in [PR 1060](https://github.com/gradio-app/gradio/pull/1060)
- Form layout by [@pngwn](https://github.com/pngwn) in [PR 1054](https://github.com/gradio-app/gradio/pull/1054)
- inputless-interfaces by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1038](https://github.com/gradio-app/gradio/pull/1038)
- Update PULL_REQUEST_TEMPLATE.md by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1068](https://github.com/gradio-app/gradio/pull/1068)
- Upgrading node memory to 4gb in website Docker by [@aliabd](https://github.com/aliabd) in [PR 1069](https://github.com/gradio-app/gradio/pull/1069)
- Website reload error by [@aliabd](https://github.com/aliabd) in [PR 1079](https://github.com/gradio-app/gradio/pull/1079)
- fixed favicon issue by [@abidlabs](https://github.com/abidlabs) in [PR 1064](https://github.com/gradio-app/gradio/pull/1064)
- remove-queue-from-events by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1056](https://github.com/gradio-app/gradio/pull/1056)
- Enable vertex colors for OBJs files by [@radames](https://github.com/radames) in [PR 1074](https://github.com/gradio-app/gradio/pull/1074)
- Dark text by [@ronvoluted](https://github.com/ronvoluted) in [PR 1049](https://github.com/gradio-app/gradio/pull/1049)
- Scroll to output by [@pngwn](https://github.com/pngwn) in [PR 1077](https://github.com/gradio-app/gradio/pull/1077)
- Explicitly list pnpm version 6 in contributing guide by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1085](https://github.com/gradio-app/gradio/pull/1085)
- hotfix for encrypt issue by [@abidlabs](https://github.com/abidlabs) in [PR 1096](https://github.com/gradio-app/gradio/pull/1096)
- Release 2.9b9 by [@abidlabs](https://github.com/abidlabs) in [PR 1098](https://github.com/gradio-app/gradio/pull/1098)
- tweak node circleci settings by [@pngwn](https://github.com/pngwn) in [PR 1091](https://github.com/gradio-app/gradio/pull/1091)
- Website Reload Error by [@aliabd](https://github.com/aliabd) in [PR 1099](https://github.com/gradio-app/gradio/pull/1099)
- Website Reload: README in demos docker by [@aliabd](https://github.com/aliabd) in [PR 1100](https://github.com/gradio-app/gradio/pull/1100)
- Flagging fixes by [@abidlabs](https://github.com/abidlabs) in [PR 1081](https://github.com/gradio-app/gradio/pull/1081)
- Backend for optional labels by [@abidlabs](https://github.com/abidlabs) in [PR 1080](https://github.com/gradio-app/gradio/pull/1080)
- Optional labels fe by [@pngwn](https://github.com/pngwn) in [PR 1105](https://github.com/gradio-app/gradio/pull/1105)
- clean-deprecated-parameters by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1090](https://github.com/gradio-app/gradio/pull/1090)
- Blocks rendering fix by [@abidlabs](https://github.com/abidlabs) in [PR 1102](https://github.com/gradio-app/gradio/pull/1102)
- Redos #1106 by [@abidlabs](https://github.com/abidlabs) in [PR 1112](https://github.com/gradio-app/gradio/pull/1112)
- Interface types: handle input-only, output-only, and unified interfaces by [@abidlabs](https://github.com/abidlabs) in [PR 1108](https://github.com/gradio-app/gradio/pull/1108)
- Hotfix + New pypi release 2.9b11 by [@abidlabs](https://github.com/abidlabs) in [PR 1118](https://github.com/gradio-app/gradio/pull/1118)
- issue-checkbox by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1122](https://github.com/gradio-app/gradio/pull/1122)
- issue-checkbox-hotfix by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1127](https://github.com/gradio-app/gradio/pull/1127)
- Fix demos in website by [@aliabd](https://github.com/aliabd) in [PR 1130](https://github.com/gradio-app/gradio/pull/1130)
- Guide for Gradio ONNX model zoo on Huggingface by [@AK391](https://github.com/AK391) in [PR 1073](https://github.com/gradio-app/gradio/pull/1073)
- ONNX guide fixes by [@aliabd](https://github.com/aliabd) in [PR 1131](https://github.com/gradio-app/gradio/pull/1131)
- Stacked form inputs css by [@gary149](https://github.com/gary149) in [PR 1134](https://github.com/gradio-app/gradio/pull/1134)
- made default value in textbox empty string by [@abidlabs](https://github.com/abidlabs) in [PR 1135](https://github.com/gradio-app/gradio/pull/1135)
- Examples UI by [@gary149](https://github.com/gary149) in [PR 1121](https://github.com/gradio-app/gradio/pull/1121)
- Chatbot custom color support by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1092](https://github.com/gradio-app/gradio/pull/1092)
- highlighted text colors by [@pngwn](https://github.com/pngwn) in [PR 1119](https://github.com/gradio-app/gradio/pull/1119)
- pin to pnpm 6 for now by [@pngwn](https://github.com/pngwn) in [PR 1147](https://github.com/gradio-app/gradio/pull/1147)
- Restore queue in Blocks by [@aliabid94](https://github.com/aliabid94) in [PR 1137](https://github.com/gradio-app/gradio/pull/1137)
- add select event for tabitems by [@pngwn](https://github.com/pngwn) in [PR 1154](https://github.com/gradio-app/gradio/pull/1154)
- max_lines + autoheight for textbox by [@pngwn](https://github.com/pngwn) in [PR 1153](https://github.com/gradio-app/gradio/pull/1153)
- use color palette for chatbot by [@pngwn](https://github.com/pngwn) in [PR 1152](https://github.com/gradio-app/gradio/pull/1152)
- Timeseries improvements by [@pngwn](https://github.com/pngwn) in [PR 1149](https://github.com/gradio-app/gradio/pull/1149)
- move styling for interface panels to frontend by [@pngwn](https://github.com/pngwn) in [PR 1146](https://github.com/gradio-app/gradio/pull/1146)
- html tweaks by [@pngwn](https://github.com/pngwn) in [PR 1145](https://github.com/gradio-app/gradio/pull/1145)
- Issue #768: Support passing none to resize and crop image by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1144](https://github.com/gradio-app/gradio/pull/1144)
- image gallery component + img css by [@aliabid94](https://github.com/aliabid94) in [PR 1140](https://github.com/gradio-app/gradio/pull/1140)
- networking tweak by [@abidlabs](https://github.com/abidlabs) in [PR 1143](https://github.com/gradio-app/gradio/pull/1143)
- Allow enabling queue per event listener by [@aliabid94](https://github.com/aliabid94) in [PR 1155](https://github.com/gradio-app/gradio/pull/1155)
- config hotfix and v. 2.9b23 by [@abidlabs](https://github.com/abidlabs) in [PR 1158](https://github.com/gradio-app/gradio/pull/1158)
- Custom JS calls by [@aliabid94](https://github.com/aliabid94) in [PR 1082](https://github.com/gradio-app/gradio/pull/1082)
- Small fixes: queue default fix, ffmpeg installation message by [@abidlabs](https://github.com/abidlabs) in [PR 1159](https://github.com/gradio-app/gradio/pull/1159)
- formatting by [@abidlabs](https://github.com/abidlabs) in [PR 1161](https://github.com/gradio-app/gradio/pull/1161)
- enable flex grow for gr-box by [@radames](https://github.com/radames) in [PR 1165](https://github.com/gradio-app/gradio/pull/1165)
- 1148 loading by [@pngwn](https://github.com/pngwn) in [PR 1164](https://github.com/gradio-app/gradio/pull/1164)
- Put enable_queue kwarg back in launch() by [@aliabid94](https://github.com/aliabid94) in [PR 1167](https://github.com/gradio-app/gradio/pull/1167)
- A few small fixes by [@abidlabs](https://github.com/abidlabs) in [PR 1171](https://github.com/gradio-app/gradio/pull/1171)
- Hotfix for dropdown component by [@abidlabs](https://github.com/abidlabs) in [PR 1172](https://github.com/gradio-app/gradio/pull/1172)
- use secondary buttons in interface by [@pngwn](https://github.com/pngwn) in [PR 1173](https://github.com/gradio-app/gradio/pull/1173)
- 1183 component height by [@pngwn](https://github.com/pngwn) in [PR 1185](https://github.com/gradio-app/gradio/pull/1185)
- 962 dataframe by [@pngwn](https://github.com/pngwn) in [PR 1186](https://github.com/gradio-app/gradio/pull/1186)
- update-contributing by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1188](https://github.com/gradio-app/gradio/pull/1188)
- Table tweaks by [@pngwn](https://github.com/pngwn) in [PR 1195](https://github.com/gradio-app/gradio/pull/1195)
- wrap tab content in column by [@pngwn](https://github.com/pngwn) in [PR 1200](https://github.com/gradio-app/gradio/pull/1200)
- WIP: Add dark mode support by [@gary149](https://github.com/gary149) in [PR 1187](https://github.com/gradio-app/gradio/pull/1187)
- Restored /api/predict/ endpoint for Interfaces by [@abidlabs](https://github.com/abidlabs) in [PR 1199](https://github.com/gradio-app/gradio/pull/1199)
- hltext-label by [@pngwn](https://github.com/pngwn) in [PR 1204](https://github.com/gradio-app/gradio/pull/1204)
- add copy functionality to json by [@pngwn](https://github.com/pngwn) in [PR 1205](https://github.com/gradio-app/gradio/pull/1205)
- Update component config by [@aliabid94](https://github.com/aliabid94) in [PR 1089](https://github.com/gradio-app/gradio/pull/1089)
- fix placeholder prompt by [@pngwn](https://github.com/pngwn) in [PR 1215](https://github.com/gradio-app/gradio/pull/1215)
- ensure webcam video value is propagated correctly by [@pngwn](https://github.com/pngwn) in [PR 1218](https://github.com/gradio-app/gradio/pull/1218)
- Automatic word-break in highlighted text, combine_adjacent support by [@aliabid94](https://github.com/aliabid94) in [PR 1209](https://github.com/gradio-app/gradio/pull/1209)
- async-function-support by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1190](https://github.com/gradio-app/gradio/pull/1190)
- Sharing fix for assets by [@aliabid94](https://github.com/aliabid94) in [PR 1208](https://github.com/gradio-app/gradio/pull/1208)
- Hotfixes for course demos by [@abidlabs](https://github.com/abidlabs) in [PR 1222](https://github.com/gradio-app/gradio/pull/1222)
- Allow Custom CSS by [@aliabid94](https://github.com/aliabid94) in [PR 1170](https://github.com/gradio-app/gradio/pull/1170)
- share-hotfix by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1226](https://github.com/gradio-app/gradio/pull/1226)
- tweaks by [@pngwn](https://github.com/pngwn) in [PR 1229](https://github.com/gradio-app/gradio/pull/1229)
- white space for class concatenation by [@radames](https://github.com/radames) in [PR 1228](https://github.com/gradio-app/gradio/pull/1228)
- Tweaks by [@pngwn](https://github.com/pngwn) in [PR 1230](https://github.com/gradio-app/gradio/pull/1230)
- css tweaks by [@pngwn](https://github.com/pngwn) in [PR 1235](https://github.com/gradio-app/gradio/pull/1235)
- ensure defaults height match for media inputs by [@pngwn](https://github.com/pngwn) in [PR 1236](https://github.com/gradio-app/gradio/pull/1236)
- Default Label label value by [@radames](https://github.com/radames) in [PR 1239](https://github.com/gradio-app/gradio/pull/1239)
- update-shortcut-syntax by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1234](https://github.com/gradio-app/gradio/pull/1234)
- Update version.txt by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1244](https://github.com/gradio-app/gradio/pull/1244)
- Layout bugs by [@pngwn](https://github.com/pngwn) in [PR 1246](https://github.com/gradio-app/gradio/pull/1246)
- Update demo by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1253](https://github.com/gradio-app/gradio/pull/1253)
- Button default name by [@FarukOzderim](https://github.com/FarukOzderim) in [PR 1243](https://github.com/gradio-app/gradio/pull/1243)
- Labels spacing by [@gary149](https://github.com/gary149) in [PR 1254](https://github.com/gradio-app/gradio/pull/1254)
- add global loader for gradio app by [@pngwn](https://github.com/pngwn) in [PR 1251](https://github.com/gradio-app/gradio/pull/1251)
- ui apis for dalle-mini by [@pngwn](https://github.com/pngwn) in [PR 1258](https://github.com/gradio-app/gradio/pull/1258)
- Add precision to Number, backend only by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 1125](https://github.com/gradio-app/gradio/pull/1125)
- Website Design Changes by [@abidlabs](https://github.com/abidlabs) in [PR 1015](https://github.com/gradio-app/gradio/pull/1015)
- Small fixes for multiple demos compatible with 3.0 by [@radames](https://github.com/radames) in [PR 1257](https://github.com/gradio-app/gradio/pull/1257)
- Issue #1160: Model 3D component not destroyed correctly by [@dawoodkhan82](https://github.com/dawoodkhan82) in [PR 1219](https://github.com/gradio-app/gradio/pull/1219)
- Fixes to components by [@abidlabs](https://github.com/abidlabs) in [PR 1260](https://github.com/gradio-app/gradio/pull/1260)
- layout docs by [@abidlabs](https://github.com/abidlabs) in [PR 1263](https://github.com/gradio-app/gradio/pull/1263)
- Static forms by [@pngwn](https://github.com/pngwn) in [PR 1264](https://github.com/gradio-app/gradio/pull/1264)
- Cdn assets by [@pngwn](https://github.com/pngwn) in [PR 1265](https://github.com/gradio-app/gradio/pull/1265)
- update logo by [@gary149](https://github.com/gary149) in [PR 1266](https://github.com/gradio-app/gradio/pull/1266)
- fix slider by [@aliabid94](https://github.com/aliabid94) in [PR 1268](https://github.com/gradio-app/gradio/pull/1268)
- maybe fix auth in iframes by [@pngwn](https://github.com/pngwn) in [PR 1261](https://github.com/gradio-app/gradio/pull/1261)
- Improves "Getting Started" guide by [@abidlabs](https://github.com/abidlabs) in [PR 1269](https://github.com/gradio-app/gradio/pull/1269)
- Add embedded demos to website by [@aliabid94](https://github.com/aliabid94) in [PR 1270](https://github.com/gradio-app/gradio/pull/1270)
- Label hotfixes by [@abidlabs](https://github.com/abidlabs) in [PR 1281](https://github.com/gradio-app/gradio/pull/1281)
- General tweaks by [@pngwn](https://github.com/pngwn) in [PR 1276](https://github.com/gradio-app/gradio/pull/1276)
- only affect links within the document by [@pngwn](https://github.com/pngwn) in [PR 1282](https://github.com/gradio-app/gradio/pull/1282)
- release 3.0b9 by [@abidlabs](https://github.com/abidlabs) in [PR 1283](https://github.com/gradio-app/gradio/pull/1283)
- Dm by [@pngwn](https://github.com/pngwn) in [PR 1284](https://github.com/gradio-app/gradio/pull/1284)
- Website fixes by [@aliabd](https://github.com/aliabd) in [PR 1286](https://github.com/gradio-app/gradio/pull/1286)
- Create Streamables by [@aliabid94](https://github.com/aliabid94) in [PR 1279](https://github.com/gradio-app/gradio/pull/1279)
- ensure table works on mobile by [@pngwn](https://github.com/pngwn) in [PR 1277](https://github.com/gradio-app/gradio/pull/1277)
- changes by [@aliabid94](https://github.com/aliabid94) in [PR 1287](https://github.com/gradio-app/gradio/pull/1287)
- demo alignment on landing page by [@aliabd](https://github.com/aliabd) in [PR 1288](https://github.com/gradio-app/gradio/pull/1288)
- New meta img by [@aliabd](https://github.com/aliabd) in [PR 1289](https://github.com/gradio-app/gradio/pull/1289)
- updated PyPi version to 3.0 by [@abidlabs](https://github.com/abidlabs) in [PR 1290](https://github.com/gradio-app/gradio/pull/1290)
- Fix site by [@aliabid94](https://github.com/aliabid94) in [PR 1291](https://github.com/gradio-app/gradio/pull/1291)
- Mobile responsive guides by [@aliabd](https://github.com/aliabd) in [PR 1293](https://github.com/gradio-app/gradio/pull/1293)
- Update readme by [@abidlabs](https://github.com/abidlabs) in [PR 1292](https://github.com/gradio-app/gradio/pull/1292)
- gif by [@abidlabs](https://github.com/abidlabs) in [PR 1296](https://github.com/gradio-app/gradio/pull/1296)
- Allow decoding headerless b64 string [@1lint](https://github.com/1lint) in [PR 4031](https://github.com/gradio-app/gradio/pull/4031)

### Contributors Shoutout:

- [@JefferyChiang](https://github.com/JefferyChiang) made their first contribution in [PR 1004](https://github.com/gradio-app/gradio/pull/1004)
- [@NimaBoscarino](https://github.com/NimaBoscarino) made their first contribution in [PR 1000](https://github.com/gradio-app/gradio/pull/1000)
- [@ronvoluted](https://github.com/ronvoluted) made their first contribution in [PR 1050](https://github.com/gradio-app/gradio/pull/1050)
- [@radames](https://github.com/radames) made their first contribution in [PR 1074](https://github.com/gradio-app/gradio/pull/1074)
- [@freddyaboulton](https://github.com/freddyaboulton) made their first contribution in [PR 1085](https://github.com/gradio-app/gradio/pull/1085)
- [@liteli1987gmail](https://github.com/liteli1987gmail) & [@chenglu](https://github.com/chenglu) made their first contribution in [PR 4767](https://github.com/gradio-app/gradio/pull/4767)