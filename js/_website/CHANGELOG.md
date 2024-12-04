# website

## 0.43.0

### Features

- [#10096](https://github.com/gradio-app/gradio/pull/10096) [`ec10aa3`](https://github.com/gradio-app/gradio/commit/ec10aa3b9b42d8c3fe930aff9465c469626992d4) - Fix paramviewer descriptions to only render markdown links.  Thanks @aliabd!
- [#10071](https://github.com/gradio-app/gradio/pull/10071) [`01b919f`](https://github.com/gradio-app/gradio/commit/01b919f04b69732fd8adb52f6d156e5683589221) - Support `additional_outputs` in `gr.ChatInterface`.  Thanks @abidlabs!
- [#10073](https://github.com/gradio-app/gradio/pull/10073) [`873dab5`](https://github.com/gradio-app/gradio/commit/873dab5bce32de472523b851d443588106223e21) - Fix the Playground to ignore comments in the requirements text.  Thanks @whitphx!
- [#9998](https://github.com/gradio-app/gradio/pull/9998) [`6cc13f5`](https://github.com/gradio-app/gradio/commit/6cc13f55e00ff29e833fd55493a53b654f23fbcc) - Playground exclude unavailable packages.  Thanks @whitphx!

### Dependency updates

- @gradio/paramviewer@0.6.0

## 0.42.3

### Fixes

- [#10025](https://github.com/gradio-app/gradio/pull/10025) [`368ba73`](https://github.com/gradio-app/gradio/commit/368ba731069583b22fcf7ddc9501db349f6a2953) - Update Chat Interface examples and add more LLM libraries and API providers.  Thanks @abidlabs!

## 0.42.2

### Dependency updates

- @gradio/code@0.10.9
- @gradio/paramviewer@0.5.8
- @gradio/tabitem@0.3.5
- @gradio/tabs@0.3.5

## 0.42.1

### Dependency updates

- @gradio/code@0.10.8
- @gradio/paramviewer@0.5.7
- @gradio/tabitem@0.3.4
- @gradio/tabs@0.3.4

## 0.42.0

### Features

- [#9726](https://github.com/gradio-app/gradio/pull/9726) [`b6725cf`](https://github.com/gradio-app/gradio/commit/b6725cf6c1fe9667dc10e1988976ed36d84d73d3) - Lite auto-load imported modules with `pyodide.loadPackagesFromImports`.  Thanks @whitphx!

### Dependency updates

- @gradio/code@0.10.7
- @gradio/paramviewer@0.5.6

## 0.41.0

### Features

- [#9811](https://github.com/gradio-app/gradio/pull/9811) [`7b6bd31`](https://github.com/gradio-app/gradio/commit/7b6bd3188199af1eac8f8d6d21b15a0bdc3d5619) - Fix the tab names in the playground.  Thanks @whitphx!
- [#9647](https://github.com/gradio-app/gradio/pull/9647) [`7cce63e`](https://github.com/gradio-app/gradio/commit/7cce63e29f274b9fbd6c779914adeaab08ea60f7) - Ask LLM to generate the requirements.txt in the playground.  Thanks @whitphx!

### Dependency updates

- @gradio/tabs@0.3.3
- @gradio/tabitem@0.3.3
- @gradio/code@0.10.6
- @gradio/paramviewer@0.5.5

## 0.40.3

### Fixes

- [#9653](https://github.com/gradio-app/gradio/pull/9653) [`61cd768`](https://github.com/gradio-app/gradio/commit/61cd768490a12f5d63101d5434092bcd1cfc43a8) - Ensures tabs with visible set to false are not visible.  Thanks @hannahblair!
- [#9738](https://github.com/gradio-app/gradio/pull/9738) [`2ade59b`](https://github.com/gradio-app/gradio/commit/2ade59b95d4c3610a1a461cc95f020fbf9627305) - Export `Tabs` type from `@gradio/tabs` and fix the Playground to be compatible with the new Tabs API.  Thanks @whitphx!

### Dependency updates

- @gradio/tabs@0.3.2
- @gradio/tabitem@0.3.2
- @gradio/code@0.10.5
- @gradio/paramviewer@0.5.4

## 0.40.2

### Dependency updates

- @gradio/code@0.10.4
- @gradio/paramviewer@0.5.3

## 0.40.1

### Dependency updates

- @gradio/tabs@0.3.1
- @gradio/code@0.10.3
- @gradio/paramviewer@0.5.2
- @gradio/tabitem@0.3.1

## 0.40.0

### Features

- [#9635](https://github.com/gradio-app/gradio/pull/9635) [`67e4044`](https://github.com/gradio-app/gradio/commit/67e4044c9ca8358eceeb1fa72fa415df03397d20) - Add website banner for gradio 5.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.10.2

## 0.39.1

### Features

- [#9615](https://github.com/gradio-app/gradio/pull/9615) [`204f3e1`](https://github.com/gradio-app/gradio/commit/204f3e13e110fc0528032a102c9521057e18919d) - fixes to website.  Thanks @pngwn!

### Dependency updates

- @gradio/code@0.10.1
- @gradio/paramviewer@0.5.1

## 0.39.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Start/stop recoding from the backend. Add guide on conversational chatbots
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Playground requirements tab
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Deprecate type='tuples for chatbot and focus chatbot docs on 'messages' type
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Expanding AI Playground Prompt for Qwen
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Remove grey background behind all components
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fixes website build in 5.0-dev
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - 🔡 Update default core Gradio font
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix. Triggered dataframe change event for header change
- [#9606](https://github.com/gradio-app/gradio/pull/9606) [`9031324`](https://github.com/gradio-app/gradio/commit/90313243648883abf64a05361110e14e23616813) - Fixes website build
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fixes annoying height bug in playground
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Refactoring playground
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix gradio.js aws path
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - 5.0 merge take 2
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Improve UI on the Playground
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - File access security guide
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Add info about Powershell client
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Adds LLM to the Playground

### Dependencies

- @gradio/code@0.10.0
- @gradio/tabs@0.3.0
- @gradio/tabitem@0.3.0

## 0.39.0-beta.9

### Dependency updates

- @gradio/code@0.10.0-beta.8
- @gradio/paramviewer@0.4.22-beta.5
- @gradio/tabitem@0.3.0-beta.4
- @gradio/tabs@0.3.0-beta.3

## 0.39.0-beta.8

### Dependency updates

- @gradio/tabitem@0.3.0-beta.4
- @gradio/code@0.10.0-beta.7
- @gradio/paramviewer@0.4.22-beta.4

## 0.39.0-beta.7

### Dependency updates

- @gradio/code@0.10.0-beta.6

## 0.39.0-beta.6

### Features

- [#9460](https://github.com/gradio-app/gradio/pull/9460) [`7352a89`](https://github.com/gradio-app/gradio/commit/7352a89722da91461c32fd33588531f3edce9c48) - Playground requirements tab.  Thanks @whitphx!
- [#9452](https://github.com/gradio-app/gradio/pull/9452) [`3ec8e63`](https://github.com/gradio-app/gradio/commit/3ec8e636766cc629444bc3cbc6b53deaf65f5ab1) - Expanding AI Playground Prompt for Qwen.  Thanks @aliabd!

### Dependency updates

- @gradio/tabs@0.3.0-beta.3
- @gradio/tabitem@0.3.0-beta.3
- @gradio/code@0.10.0-beta.5
- @gradio/paramviewer@0.4.22-beta.3

## 0.39.0-beta.5

### Dependency updates

- @gradio/code@0.10.0-beta.4
- @gradio/paramviewer@0.4.22-beta.2

## 0.39.0-beta.4

### Features

- [#9419](https://github.com/gradio-app/gradio/pull/9419) [`018c140`](https://github.com/gradio-app/gradio/commit/018c140ef86cacc8211df05b57b26924dab7fa08) - Start/stop recoding from the backend. Add guide on conversational chatbots.  Thanks @freddyaboulton!
- [#9469](https://github.com/gradio-app/gradio/pull/9469) [`f7c3396`](https://github.com/gradio-app/gradio/commit/f7c3396f55a5b8364d3880a29d766bd092d7f840) - Fix. Triggered dataframe change event for header change.  Thanks @Joodith!
- [#9426](https://github.com/gradio-app/gradio/pull/9426) [`4e54105`](https://github.com/gradio-app/gradio/commit/4e5410574002ea24067cf4e82b99a6a39f67632c) - Refactoring playground.  Thanks @whitphx!
- [#9462](https://github.com/gradio-app/gradio/pull/9462) [`b622b1f`](https://github.com/gradio-app/gradio/commit/b622b1fcce888427e87aa1f70c9c2e60aa240e37) - Improve UI on the Playground.  Thanks @aliabd!

## 0.39.0-beta.3

### Dependency updates

- @gradio/code@0.10.0-beta.3

## 0.39.0-beta.2

### Features

- [#9326](https://github.com/gradio-app/gradio/pull/9326) [`7afb9a1`](https://github.com/gradio-app/gradio/commit/7afb9a14fa64310eb8b70f43a3bad373e46e36c1) - 5.0 merge take 2.  Thanks @pngwn!
- [#9382](https://github.com/gradio-app/gradio/pull/9382) [`9e70832`](https://github.com/gradio-app/gradio/commit/9e7083286d5681b5fc623304a97d5a24fe6d6080) - Fixes website build in 5.0-dev.  Thanks @aliabd!
- [#9379](https://github.com/gradio-app/gradio/pull/9379) [`0cad5f3`](https://github.com/gradio-app/gradio/commit/0cad5f348a846024b95b92fb48f88137ccfcd589) - Testing CI.  Thanks @aliabd!
- [#9402](https://github.com/gradio-app/gradio/pull/9402) [`060acb3`](https://github.com/gradio-app/gradio/commit/060acb3b469530a3ea14275970b7028598052ef1) - Fixes annoying height bug in playground.  Thanks @aliabd!
- [#9397](https://github.com/gradio-app/gradio/pull/9397) [`4be0933`](https://github.com/gradio-app/gradio/commit/4be0933d3a39099fd573d7db42416d7acef7f40f) - Fix gradio.js aws path.  Thanks @aliabd!
- [#9343](https://github.com/gradio-app/gradio/pull/9343) [`322ac54`](https://github.com/gradio-app/gradio/commit/322ac5499ec5a8541039bf329e2525e9d24ed2cc) - Add info about Powershell client.  Thanks @abidlabs!
- [#9233](https://github.com/gradio-app/gradio/pull/9233) [`9a85ccc`](https://github.com/gradio-app/gradio/commit/9a85cccf160118fccfb78dc1edcc7c51ff88de6c) - Adds LLM to the Playground.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.10.0-beta.2
- @gradio/paramviewer@0.4.22-beta.2

## 0.39.0-beta.1

### Features

- [#9204](https://github.com/gradio-app/gradio/pull/9204) [`3c73f00`](https://github.com/gradio-app/gradio/commit/3c73f00e3016b16917ebfe0bad390f2dff683457) - 🔡 Update default core Gradio font.  Thanks @hannahblair!

### Dependency updates

- @gradio/code@0.9.1-beta.1
- @gradio/paramviewer@0.4.22-beta.1

## 0.39.0-beta.0

### Features

- [#9194](https://github.com/gradio-app/gradio/pull/9194) [`20c0836`](https://github.com/gradio-app/gradio/commit/20c0836ed0e0698dbc81d2a4bda04363fd857334) - Deprecate type='tuples for chatbot and focus chatbot docs on 'messages' type.  Thanks @freddyaboulton!
- [#9213](https://github.com/gradio-app/gradio/pull/9213) [`ab4580b`](https://github.com/gradio-app/gradio/commit/ab4580bd5f755a07c9a9bd2a775220a9a2085f8c) - Remove grey background behind all components.  Thanks @hannahblair!
- [#9206](https://github.com/gradio-app/gradio/pull/9206) [`bdbcf7b`](https://github.com/gradio-app/gradio/commit/bdbcf7b0e374c0769178767a1502cd310312278b) - Cloudflare migration.  Thanks @aliabd!
- [#9156](https://github.com/gradio-app/gradio/pull/9156) [`8deeeb6`](https://github.com/gradio-app/gradio/commit/8deeeb6d1b83296e5174c2891b80fb317991289e) - File access security guide.  Thanks @freddyaboulton!

## 0.39.1

### Features

- [#9379](https://github.com/gradio-app/gradio/pull/9379) [`0cad5f3`](https://github.com/gradio-app/gradio/commit/0cad5f348a846024b95b92fb48f88137ccfcd589) - Testing CI.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.9.1
- @gradio/paramviewer@0.4.22

## 0.39.0

### Features

- [#9291](https://github.com/gradio-app/gradio/pull/9291) [`bcb3a2b`](https://github.com/gradio-app/gradio/commit/bcb3a2b9a0e4f1a0195aed92f3ecfd1eda324464) - chore: update error.svx.  Thanks @eltociear!

## 0.38.1

### Features

- [#9206](https://github.com/gradio-app/gradio/pull/9206) [`bdbcf7b`](https://github.com/gradio-app/gradio/commit/bdbcf7b0e374c0769178767a1502cd310312278b) - Cloudflare migration.  Thanks @aliabd!

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/paramviewer@0.4.22-beta.0
- @gradio/code@0.9.1-beta.0

## 0.38.0

### Features

- [#9102](https://github.com/gradio-app/gradio/pull/9102) [`efdc323`](https://github.com/gradio-app/gradio/commit/efdc3231a7bde38cfe45d10086d0d36a24c1b9b4) - Initial SSR refactor.  Thanks @pngwn!
- [#9104](https://github.com/gradio-app/gradio/pull/9104) [`cf02f7d`](https://github.com/gradio-app/gradio/commit/cf02f7d7854b8ead864533581f7379a3fe61840f) - Fix chatinterface e2e test.  Thanks @freddyaboulton!
- [#9075](https://github.com/gradio-app/gradio/pull/9075) [`3258968`](https://github.com/gradio-app/gradio/commit/325896837113d1c45de0dcff1972a8686730f695) - Add warning to guides and change styling of tip.  Thanks @aliabd!
- [#9108](https://github.com/gradio-app/gradio/pull/9108) [`474102a`](https://github.com/gradio-app/gradio/commit/474102a8b404c23ffcfa7e1396a78bed621a9585) - Better text styling on docs.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.9.0
- @gradio/paramviewer@0.4.21

## 0.37.0

### Features

- [#8965](https://github.com/gradio-app/gradio/pull/8965) [`d30432e`](https://github.com/gradio-app/gradio/commit/d30432e9c6d4cc1e5cfd989a1a3ae4aba7e21290) - harden CI.  Thanks @pngwn!
- [#9043](https://github.com/gradio-app/gradio/pull/9043) [`890bae3`](https://github.com/gradio-app/gradio/commit/890bae3942cc19f2b9040cfb6792adaa3cd478b0) - Filter out type ignore comments from demos on website.  Thanks @aliabd!
- [#8857](https://github.com/gradio-app/gradio/pull/8857) [`6584aac`](https://github.com/gradio-app/gradio/commit/6584aace9866df582a6a3ff64dd045f1747aba42) - Website fixes for mobile.  Thanks @aliabd!
- [#9067](https://github.com/gradio-app/gradio/pull/9067) [`f29aef4`](https://github.com/gradio-app/gradio/commit/f29aef4528ad93ab2cb1cf25bd5e3362bb562839) - Fix trailing slash link on docs.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.8.2
- @gradio/paramviewer@0.4.20

## 0.36.0

### Features

- [#8907](https://github.com/gradio-app/gradio/pull/8907) [`9b42ba8`](https://github.com/gradio-app/gradio/commit/9b42ba8f1006c05d60a62450d3036ce0d6784f86) - Update guides esp plots.  Thanks @aliabid94!
- [#8871](https://github.com/gradio-app/gradio/pull/8871) [`7f1a78c`](https://github.com/gradio-app/gradio/commit/7f1a78c49ed69688ef1d39ef731c64ba934df645) - Add confirmation dialogue if leaving playground.  Thanks @aliabd!
- [#8908](https://github.com/gradio-app/gradio/pull/8908) [`7c9fc9e`](https://github.com/gradio-app/gradio/commit/7c9fc9ebccf227fa54e3f28ee3abd1bd4f5cf412) - Add docs for Rust client to website.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.8.1
- @gradio/paramviewer@0.4.19

## 0.35.0

### Features

- [#8842](https://github.com/gradio-app/gradio/pull/8842) [`38c2ad4`](https://github.com/gradio-app/gradio/commit/38c2ad425a905431b1eb17b9498669f9e49f0dd5) - Add website to contributing readme.  Thanks @aliabd!
- [#8784](https://github.com/gradio-app/gradio/pull/8784) [`2cc813a`](https://github.com/gradio-app/gradio/commit/2cc813a287ce326957f8b10106e574750b1db9be) - Fix OS detection for cross-browser compatibility.  Thanks @lappemic!
- [#8825](https://github.com/gradio-app/gradio/pull/8825) [`b45d37f`](https://github.com/gradio-app/gradio/commit/b45d37f366ed4ef5dd77b2b4af90aa8174357298) - Fix param table rendering.  Thanks @aliabd!
- [#8773](https://github.com/gradio-app/gradio/pull/8773) [`0b9e870`](https://github.com/gradio-app/gradio/commit/0b9e870f9cc45c2251806b3ac1654f6608ef27ed) - Hide embedded components while loading.  Thanks @aliabd!
- [#8832](https://github.com/gradio-app/gradio/pull/8832) [`e75f2ca`](https://github.com/gradio-app/gradio/commit/e75f2ca2da4f41f25459b98bedaa940c887e6a93) - Fix build for pre-release.  Thanks @pngwn!
- [#8618](https://github.com/gradio-app/gradio/pull/8618) [`aa4b7a7`](https://github.com/gradio-app/gradio/commit/aa4b7a71921fd5b7ad7e3c0cce7687a8f6d284da) - Improve styling of parameter tables in the docs.  Thanks @abidlabs!
- [#8745](https://github.com/gradio-app/gradio/pull/8745) [`4030f28`](https://github.com/gradio-app/gradio/commit/4030f28af6ae9f3eb94bb4e9cae83fb7016cdaad) - Allows updating the dataset of a `gr.Examples`.  Thanks @abidlabs!
- [#8757](https://github.com/gradio-app/gradio/pull/8757) [`6073736`](https://github.com/gradio-app/gradio/commit/60737366517f48d1a37ffce15425783a2887f305) - Document `FileData` class in docs.  Thanks @hannahblair!

### Fixes

- [#8823](https://github.com/gradio-app/gradio/pull/8823) [`7b049e0`](https://github.com/gradio-app/gradio/commit/7b049e03577aac9853cd2cc1683d9e0b1e2f8d36) - Fix DateTime docs.  Thanks @aliabd!
- [#8854](https://github.com/gradio-app/gradio/pull/8854) [`d1f0441`](https://github.com/gradio-app/gradio/commit/d1f044145ae93e5838042d9fb25f4f17def9c774) - Use covariant container types across the codebase and add typing to our demos.  Thanks @abidlabs!

### Dependency updates

- @gradio/code@0.8.0
- @gradio/paramviewer@0.4.18

## 0.34.0

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

- [#8733](https://github.com/gradio-app/gradio/pull/8733) [`fb0daf3`](https://github.com/gradio-app/gradio/commit/fb0daf3730ffbe6aab5ebe4210eae150729a40b1) - Improvements to `gr.Examples`: adds events as attributes and documents, them, adds `sample_labels`, and `visible` properties.  Thanks @abidlabs!
- [#8686](https://github.com/gradio-app/gradio/pull/8686) [`64ac05b`](https://github.com/gradio-app/gradio/commit/64ac05b1114e08c21909d21653c02d1c45f05aee) - Better spacing for codeblocks on docs.  Thanks @aliabd!
- [#8656](https://github.com/gradio-app/gradio/pull/8656) [`740364e`](https://github.com/gradio-app/gradio/commit/740364e5cee5f96625fe0da3ac8257d97e5f0815) - Add guide on best practices for ZeroGPU limits with the python client.  Thanks @freddyaboulton!
- [#8689](https://github.com/gradio-app/gradio/pull/8689) [`edcd574`](https://github.com/gradio-app/gradio/commit/edcd5748f6c0faf2028a8e6a330aad5eccf103d5) - Fix playground to display errors.  Thanks @whitphx!
- [#8624](https://github.com/gradio-app/gradio/pull/8624) [`ba59bb8`](https://github.com/gradio-app/gradio/commit/ba59bb824f77dd3cb57019c59d3c3b0755c68b85) - Add search to website.  Thanks @aliabd!

### Fixes

- [#8505](https://github.com/gradio-app/gradio/pull/8505) [`2943d6d`](https://github.com/gradio-app/gradio/commit/2943d6d68847314885dc6c5c0247083116017ca0) - Add Timer component.  Thanks @aliabid94!
- [#8677](https://github.com/gradio-app/gradio/pull/8677) [`c946c6f`](https://github.com/gradio-app/gradio/commit/c946c6f31a34bfd888a6a16c3fb479fe34710206) - Allow supplying custom `gr.Chatbot` with events to `gr.ChatInterface`.  Thanks @abidlabs!

### Dependency updates

- @gradio/code@0.7.0

## 0.33.0

### Features

- [#8604](https://github.com/gradio-app/gradio/pull/8604) [`b6fa6b5`](https://github.com/gradio-app/gradio/commit/b6fa6b543f226540247cd50748019cde59b93005) - Add docs for `.on()`, `.then()`, and `.success()`, as well as the subclasses of `gr.EventData`.  Thanks @abidlabs!
- [#8623](https://github.com/gradio-app/gradio/pull/8623) [`4c6e4e0`](https://github.com/gradio-app/gradio/commit/4c6e4e0ba9a6dc29f256d00d97f3062a516f5aac) - Fix CORS issues with Lite Component Demos.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.6.13

## 0.32.0

### Features

- [#8489](https://github.com/gradio-app/gradio/pull/8489) [`c2a0d05`](https://github.com/gradio-app/gradio/commit/c2a0d056d679d90631d9ccd944dadd67e7e03b7f) - Control Display of Error, Info, Warning.  Thanks @freddyaboulton!
- [#8593](https://github.com/gradio-app/gradio/pull/8593) [`d35c290`](https://github.com/gradio-app/gradio/commit/d35c290aadcb85113ee7ceea96a7ed7dc894b1d2) - Adding more docs for using components in chatbot.  Thanks @abidlabs!
- [#8516](https://github.com/gradio-app/gradio/pull/8516) [`de6aa2b`](https://github.com/gradio-app/gradio/commit/de6aa2b67668605b65ad92842b2c798afa2c6d8a) - Add helper classes to docs.  Thanks @aliabd!
- [#8605](https://github.com/gradio-app/gradio/pull/8605) [`fe83e64`](https://github.com/gradio-app/gradio/commit/fe83e6445a53c9376d92a7af9fd9a5ccf9376d7d) - Small fix to guide styling.  Thanks @aliabd!
- [#8557](https://github.com/gradio-app/gradio/pull/8557) [`ed82a62`](https://github.com/gradio-app/gradio/commit/ed82a6237ec7873e2554c2ad0be438650cfebe8c) - Bring back embedded demos on component docs.  Thanks @aliabd!

### Fixes

- [#8589](https://github.com/gradio-app/gradio/pull/8589) [`34430b9`](https://github.com/gradio-app/gradio/commit/34430b934dbab3bc525f56b390dbc054f76cf56c) - Handle GIFs correct in `gr.Image` preprocessing.  Thanks @abidlabs!
- [#8581](https://github.com/gradio-app/gradio/pull/8581) [`a1c21cb`](https://github.com/gradio-app/gradio/commit/a1c21cb69a688bd38139153fe9c85a50c6ae86f2) - fix dataset update.  Thanks @abidlabs!
- [#8537](https://github.com/gradio-app/gradio/pull/8537) [`81ae766`](https://github.com/gradio-app/gradio/commit/81ae7663b303ac7738bc216d9bf916f0515dd22e) - Many small fixes to website and docs.  Thanks @aliabd!
- [#8559](https://github.com/gradio-app/gradio/pull/8559) [`483ecaa`](https://github.com/gradio-app/gradio/commit/483ecaae627145470ed68ed6872d42f2ac3a1980) - fix website build.  Thanks @pngwn!

### Dependency updates

- @gradio/code@0.6.12

## 0.31.5

### Features

- [#8491](https://github.com/gradio-app/gradio/pull/8491) [`ffd53fa`](https://github.com/gradio-app/gradio/commit/ffd53fa2dcb13d564fd07aa441d4016df8d2f155) - Remove broken guide redirect.  Thanks @aliabd!
- [#8487](https://github.com/gradio-app/gradio/pull/8487) [`3a5d56e`](https://github.com/gradio-app/gradio/commit/3a5d56ea7bdbfc24357eaf8174f9275cb15fcf97) - Add Client Release Notes to Docs.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/code@0.6.11

## 0.31.4

### Dependency updates

- @gradio/code@0.6.10

## 0.31.3

### Features

- [#8471](https://github.com/gradio-app/gradio/pull/8471) [`a9e6595`](https://github.com/gradio-app/gradio/commit/a9e6595817b741c3dcf1eaedf58ee4f901784e57) - Tweak meta titles and descriptions for clients.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.6.9

## 0.31.2

### Features

- [#8456](https://github.com/gradio-app/gradio/pull/8456) [`881f11c`](https://github.com/gradio-app/gradio/commit/881f11c862c769c21710735604c0733e0cfefe66) - Add website banner for clients launch.  Thanks @aliabd!

## 0.31.1

### Dependency updates

- @gradio/code@0.6.8

## 0.31.0

### Features

- [#8403](https://github.com/gradio-app/gradio/pull/8403) [`5efd35c`](https://github.com/gradio-app/gradio/commit/5efd35c7a06d894fdcb68898bdaaf9b457e608f1) - Editable Docs.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.6.7

## 0.30.4

### Dependency updates

- @gradio/code@0.6.6

## 0.30.3

### Features

- [#8319](https://github.com/gradio-app/gradio/pull/8319) [`1f9a5f0`](https://github.com/gradio-app/gradio/commit/1f9a5f0aa395ab51731f7d2a6ef0268a319cdc1b) - Fix bad redirect breaking website build.  Thanks @aliabd!

## 0.30.2

### Dependency updates

- @gradio/code@0.6.5

## 0.30.1

### Dependency updates

- @gradio/code@0.6.4

## 0.30.0

### Features

- [#8278](https://github.com/gradio-app/gradio/pull/8278) [`4ae17a4`](https://github.com/gradio-app/gradio/commit/4ae17a4653fcf60de7b646e6243f1b77d7f8cd27) - Embedded Lite example apps in the docs.  Thanks @whitphx!
- [#8262](https://github.com/gradio-app/gradio/pull/8262) [`d708ca8`](https://github.com/gradio-app/gradio/commit/d708ca8fca8c39bf878c70117c2910730a1bb76c) - Reorganize Guides in a more logical order.  Thanks @abidlabs!

### Dependency updates

- @gradio/code@0.6.3

## 0.29.0

### Features

- [#8224](https://github.com/gradio-app/gradio/pull/8224) [`6ee1f1f`](https://github.com/gradio-app/gradio/commit/6ee1f1f7215bc557c138e1f43d5a835775deacfc) - Display all custom components in the gallery.  Thanks @freddyaboulton!

### Fixes

- [#8220](https://github.com/gradio-app/gradio/pull/8220) [`f176e1b`](https://github.com/gradio-app/gradio/commit/f176e1b509b7687b02c9173db1cd1ce25c3cd8f6) - Convert all demos on docs to lite.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.6.2

## 0.28.0

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!
- [#8189](https://github.com/gradio-app/gradio/pull/8189) [`68dcae5`](https://github.com/gradio-app/gradio/commit/68dcae512c0fb699304446c3b1ae2afaba1a63d2) - Use workspace version for code in _website.  Thanks @aliabd!
- [#8152](https://github.com/gradio-app/gradio/pull/8152) [`989fe25`](https://github.com/gradio-app/gradio/commit/989fe2566fc93e4f67dc86a869dc30e83404c7ab) - Make guide for tailwind more verbose.  Thanks @duerrsimon!

### Dependency updates

- @gradio/code@0.6.1

## 0.27.0

### Features

- [#8061](https://github.com/gradio-app/gradio/pull/8061) [`17e83c9`](https://github.com/gradio-app/gradio/commit/17e83c958ebb35b3e122ca486067d1bd5ce33a22) - Docs Reorg and Intro Page.  Thanks @aliabd!
- [#8122](https://github.com/gradio-app/gradio/pull/8122) [`e089e4c`](https://github.com/gradio-app/gradio/commit/e089e4cb4a285e0d15593fc5b13b8f254b86c090) - update dependencies.  Thanks @pngwn!
- [#8119](https://github.com/gradio-app/gradio/pull/8119) [`38a5482`](https://github.com/gradio-app/gradio/commit/38a5482df4d175d81e2aea319c2ffc525a76c538) - Be able to link to a custom component in the gallery directly.  Thanks @freddyaboulton!

## 0.26.1

### Dependency updates

- @gradio/code@0.5.12

## 0.26.0

### Features

- [#7945](https://github.com/gradio-app/gradio/pull/7945) [`328325a`](https://github.com/gradio-app/gradio/commit/328325a7ad812e7e152fe57a5a91a54b67adf728) - style changes for gradio website docs navbar.  Thanks @shafiqihtsham!

### Fixes

- [#7935](https://github.com/gradio-app/gradio/pull/7935) [`919afff`](https://github.com/gradio-app/gradio/commit/919afffcee87bee25a6905c488484936df92189d) - Adds a Guide on deploying Gradio apps with Docker.  Thanks @abidlabs!

### Dependency updates

- @gradio/code@0.5.11

## 0.25.2

### Dependency updates

- @gradio/code@0.5.10

## 0.25.1

### Dependency updates

- @gradio/code@0.5.9

## 0.25.0

### Features

- [#7684](https://github.com/gradio-app/gradio/pull/7684) [`755157f`](https://github.com/gradio-app/gradio/commit/755157f99c2961f2e5caeaa9b76d248b4225ea8f) - Do not reload code inside gr.NO_RELOAD context.  Thanks @freddyaboulton!
- [#7661](https://github.com/gradio-app/gradio/pull/7661) [`c62a57e`](https://github.com/gradio-app/gradio/commit/c62a57e7f8f2f6dad0110d06e915c48e7f628073) - Convert Docs Demos to Lite.  Thanks @aliabd!

### Dependency updates

- @gradio/code@0.5.8

## 0.24.3

### Dependency updates

- @gradio/code@0.5.7

## 0.24.2

### Dependency updates

- @gradio/code@0.5.6

## 0.24.1

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.5.5

## 0.24.0

### Features

- [#7451](https://github.com/gradio-app/gradio/pull/7451) [`65f114a`](https://github.com/gradio-app/gradio/commit/65f114a117b351f5935424fa78c830a58bafc44f) - Add error handling for missing `js/_website/version.json`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.23.4

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.5.3

## 0.23.3

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.5.2

## 0.23.2

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.5.1

## 0.23.1

### Patch Changes

- Updated dependencies [[`c1a7ea7`](https://github.com/gradio-app/gradio/commit/c1a7ea7c0c294aa970624f02225717c12bcf9b58)]:
  - @gradio/code@0.5.0

## 0.23.0

### Features

- [#7116](https://github.com/gradio-app/gradio/pull/7116) [`3c8c4ac`](https://github.com/gradio-app/gradio/commit/3c8c4ac2db284e1cb503c397205a79a6dcc27e23) - Document the `gr.ParamViewer` component, and fix component preprocessing/postprocessing docstrings. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.22.0

### Features

- [#6970](https://github.com/gradio-app/gradio/pull/6970) [`dfe1f08`](https://github.com/gradio-app/gradio/commit/dfe1f08ae216dca8bac8e2d992ebde1f8746c795) - Style changes to custom components gallery. Thanks [@aliabd](https://github.com/aliabd)!
- [#7080](https://github.com/gradio-app/gradio/pull/7080) [`6654a32`](https://github.com/gradio-app/gradio/commit/6654a32ebad3c5b9f762d8e9e531f29152625819) - start cc docs guide. Thanks [@pngwn](https://github.com/pngwn)!

## 0.21.3

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.3.7

## 0.21.2

### Features

- [#6997](https://github.com/gradio-app/gradio/pull/6997) [`523c08f`](https://github.com/gradio-app/gradio/commit/523c08fe3036f9d72416f7599fe0c64c1a4af823) - Design changes to Playground. Thanks [@aliabd](https://github.com/aliabd)!

## 0.21.1

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.3.6

## 0.21.0

### Features

- [#6913](https://github.com/gradio-app/gradio/pull/6913) [`a5f3d2b`](https://github.com/gradio-app/gradio/commit/a5f3d2bef2d53b367ebf78d86e61f227cda5effa) - Fix broken redirects and guides in website. Thanks [@aliabd](https://github.com/aliabd)!

## 0.20.4

### Fixes

- [#6767](https://github.com/gradio-app/gradio/pull/6767) [`7bb561a`](https://github.com/gradio-app/gradio/commit/7bb561a294ca41d1044927cb34d8645c4175cae0) - Rewriting parts of the README and getting started guides for 4.0. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.20.3

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.3.3

## 0.20.2

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.3.2

## 0.20.1

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.3.1

## 0.20.0

### Features

- [#6679](https://github.com/gradio-app/gradio/pull/6679) [`abe9785`](https://github.com/gradio-app/gradio/commit/abe9785c50cf3d1098605326c92a1825ae89df14) - Remove Discourse Forum Link from Website. Thanks [@aliabd](https://github.com/aliabd)!
- [#6477](https://github.com/gradio-app/gradio/pull/6477) [`21ce721`](https://github.com/gradio-app/gradio/commit/21ce721bbddaf4f5768f59eef5fefc74c8f0cf27) - Custom component gallery. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.19.0

### Features

- [#5885](https://github.com/gradio-app/gradio/pull/5885) [`9919b8a`](https://github.com/gradio-app/gradio/commit/9919b8ab43bee3d1d7cc65fd641fc8bc9725e102) - Fix the docstring decoration. Thanks [@whitphx](https://github.com/whitphx)!
- [#6650](https://github.com/gradio-app/gradio/pull/6650) [`d59ceec`](https://github.com/gradio-app/gradio/commit/d59ceec99d16f52e71d165448d959ba6b5624425) - Removes smooth scrolling from website. Thanks [@aliabd](https://github.com/aliabd)!

## 0.18.0

### Features

- [#6549](https://github.com/gradio-app/gradio/pull/6549) [`3e60c13b9`](https://github.com/gradio-app/gradio/commit/3e60c13b9192fac04c5386135ede906d0e6a2025) - Add 3.x docs to the website!. Thanks [@aliabd](https://github.com/aliabd)!

## 0.17.0

### Features

- [#6533](https://github.com/gradio-app/gradio/pull/6533) [`e2810fcfc`](https://github.com/gradio-app/gradio/commit/e2810fcfc84e2d66797736d8002c6a16f5b330d6) - Fix redirected paths on website. Thanks [@aliabd](https://github.com/aliabd)!
- [#6532](https://github.com/gradio-app/gradio/pull/6532) [`96290d304`](https://github.com/gradio-app/gradio/commit/96290d304a61064b52c10a54b2feeb09ca007542) - tweak deps. Thanks [@pngwn](https://github.com/pngwn)!

## 0.16.1

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.2.7

## 0.16.0

### Features

- [#6460](https://github.com/gradio-app/gradio/pull/6460) [`e01b67f96`](https://github.com/gradio-app/gradio/commit/e01b67f96f054b4d96cd72ce9b713bab9992c6cc) - Custom Component Guide Redirects. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.15.0

### Features

- [#6436](https://github.com/gradio-app/gradio/pull/6436) [`58e3ca826`](https://github.com/gradio-app/gradio/commit/58e3ca8260a6635e10e7a7f141221c4f746e9386) - Custom Component CLI Improvements. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6427](https://github.com/gradio-app/gradio/pull/6427) [`e0fc14659`](https://github.com/gradio-app/gradio/commit/e0fc146598ba9b081bc5fa9616d0a41c2aba2427) - Allow google analytics to work on Spaces (and other iframe situations). Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.14.0

### Features

- [#6387](https://github.com/gradio-app/gradio/pull/6387) [`9d6d72f44`](https://github.com/gradio-app/gradio/commit/9d6d72f44370c45d9e213421a5586c25c5789278) - Tiny fix to indent on landing page demo. Thanks [@aliabd](https://github.com/aliabd)!
- [#6344](https://github.com/gradio-app/gradio/pull/6344) [`747197089`](https://github.com/gradio-app/gradio/commit/7471970894e999f335126766549552184231e8ea) - PDF component custom component guide. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.13.0

### Features

- [#6351](https://github.com/gradio-app/gradio/pull/6351) [`294414d9f`](https://github.com/gradio-app/gradio/commit/294414d9f7b53da1a870d2d96e62a75242b40849) - Add sharing to playground. Thanks [@aliabd](https://github.com/aliabd)!

## 0.12.1

### Patch Changes

- Updated dependencies []:
  - @gradio/code@0.2.3

## 0.12.0

### Features

- [#6268](https://github.com/gradio-app/gradio/pull/6268) [`de36820ef`](https://github.com/gradio-app/gradio/commit/de36820ef51097b47937b41fb76e4038aaa369cb) - Fix various issues with demos on website. Thanks [@aliabd](https://github.com/aliabd)!
- [#6193](https://github.com/gradio-app/gradio/pull/6193) [`fdedc5949`](https://github.com/gradio-app/gradio/commit/fdedc59491bf55e3a24936e97da48bf0144de816) - 4.0 Website Changes. Thanks [@aliabd](https://github.com/aliabd)!
- [#6243](https://github.com/gradio-app/gradio/pull/6243) [`2c9fd437f`](https://github.com/gradio-app/gradio/commit/2c9fd437f8249b238f2b1904fb5acfe3413ff950) - Some tweaks to the Custom Components Guide. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.11.1

### Features

- [#6189](https://github.com/gradio-app/gradio/pull/6189) [`345ddd888`](https://github.com/gradio-app/gradio/commit/345ddd888e9f55cb04e5c6601d95d2a25e4ef39f) - Custom Component Guides. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.11.0

### Patch Changes

- Updated dependencies [[`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7), [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7)]:
  - @gradio/code@0.2.0

## 0.11.0-beta.1

### Features

- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6142](https://github.com/gradio-app/gradio/pull/6142) [`103416d17`](https://github.com/gradio-app/gradio/commit/103416d17f021c82f5ff0583dcc2d80906ad279e) - JS READMEs and Storybook on Docs. Thanks [@aliabd](https://github.com/aliabd)!
- [#6121](https://github.com/gradio-app/gradio/pull/6121) [`93d28bc08`](https://github.com/gradio-app/gradio/commit/93d28bc088f7154ecc00f79eb98119f6d4858fe3) - Small fix to website header. Thanks [@aliabd](https://github.com/aliabd)!
- [#6151](https://github.com/gradio-app/gradio/pull/6151) [`e67e3f813`](https://github.com/gradio-app/gradio/commit/e67e3f813ea461d3245b4b575f3b2c44fca6a39c) - Fix issues with website deploy. Thanks [@aliabd](https://github.com/aliabd)!

## 0.11.0-beta.0

### Features

- [#6082](https://github.com/gradio-app/gradio/pull/6082) [`037e5af33`](https://github.com/gradio-app/gradio/commit/037e5af3363c5b321b95efc955ee8d6ec0f4504e) - WIP: Fix docs. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6089](https://github.com/gradio-app/gradio/pull/6089) [`cd8146ba0`](https://github.com/gradio-app/gradio/commit/cd8146ba053fbcb56cf5052e658e4570d457fb8a) - Update logos for v4. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6097](https://github.com/gradio-app/gradio/pull/6097) [`439efa39d`](https://github.com/gradio-app/gradio/commit/439efa39dd47bd0c5235f74244aae539d0629492) - Add banner for 4.0 livestream to website. Thanks [@aliabd](https://github.com/aliabd)!
- [#6040](https://github.com/gradio-app/gradio/pull/6040) [`5524e5905`](https://github.com/gradio-app/gradio/commit/5524e590577769b0444a5332b8d444aafb0c5c12) - playground proposal. Thanks [@pngwn](https://github.com/pngwn)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!
- [#6052](https://github.com/gradio-app/gradio/pull/6052) [`8241f9a7b`](https://github.com/gradio-app/gradio/commit/8241f9a7bd034256aabb9efa9acb9e36216557ac) - Updated the twitter logo to its latest logo (X). Thanks [@niranjan-kurhade](https://github.com/niranjan-kurhade)!

## 0.10.0

### Features

- [#6021](https://github.com/gradio-app/gradio/pull/6021) [`86cff0c29`](https://github.com/gradio-app/gradio/commit/86cff0c293db776c08c1ab372d69aac7c594cfb3) - Playground: Better spacing on navbar. Thanks [@aliabd](https://github.com/aliabd)!

## 0.9.0

### Features

- [#5386](https://github.com/gradio-app/gradio/pull/5386) [`0312c990f`](https://github.com/gradio-app/gradio/commit/0312c990fbe63fdf3bfa9a8f13bbc042295d49bf) - Playground v1. Thanks [@aliabd](https://github.com/aliabd)!

## 0.8.0

### Features

- [#5936](https://github.com/gradio-app/gradio/pull/5936) [`b8b9f6d27`](https://github.com/gradio-app/gradio/commit/b8b9f6d27e258256584b7662d03110cc2eeb883b) - Adds a Guide on how to stylize the DataFrame component. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.7.1

### Features

- [#5721](https://github.com/gradio-app/gradio/pull/5721) [`84e03fe50`](https://github.com/gradio-app/gradio/commit/84e03fe506e08f1f81bac6d504c9fba7924f2d93) - Adds copy buttons to website, and better descriptions to API Docs. Thanks [@aliabd](https://github.com/aliabd)!

## 0.7.0

### Features

- [#5643](https://github.com/gradio-app/gradio/pull/5643) [`f661c0733`](https://github.com/gradio-app/gradio/commit/f661c0733b501f1a54a0c62af2567909c7202944) - Add the brand assets page to the website. Thanks [@whitphx](https://github.com/whitphx)!
- [#5675](https://github.com/gradio-app/gradio/pull/5675) [`b619e6f6e`](https://github.com/gradio-app/gradio/commit/b619e6f6e4ca55334fb86da53790e45a8f978566) - Reorganize Docs Navbar and Fill in Gaps. Thanks [@aliabd](https://github.com/aliabd)!
- [#5669](https://github.com/gradio-app/gradio/pull/5669) [`c5e969559`](https://github.com/gradio-app/gradio/commit/c5e969559612f956afcdb0c6f7b22ab8275bc49a) - Fix small issues in docs and guides. Thanks [@aliabd](https://github.com/aliabd)!

### Fixes

- [#5608](https://github.com/gradio-app/gradio/pull/5608) [`eebf9d71f`](https://github.com/gradio-app/gradio/commit/eebf9d71f90a83bd84b62c855fdcd13b086f7ad5) - Styling fixes to guides. Thanks [@aliabd](https://github.com/aliabd)!

## 0.6.0

### Features

- [#5565](https://github.com/gradio-app/gradio/pull/5565) [`f0514fc49`](https://github.com/gradio-app/gradio/commit/f0514fc49ea04ba01dce748238e1fd16f9cb5d8b) - Route docs and guide urls correctly. Thanks [@aliabd](https://github.com/aliabd)!

## 0.5.0

### Features

- [#5481](https://github.com/gradio-app/gradio/pull/5481) [`df623e74`](https://github.com/gradio-app/gradio/commit/df623e743aad4b21a7eda9bae4c03eb17f01c90d) - Toggle main vs versioned demos on website and show install snippet. Thanks [@aliabd](https://github.com/aliabd)!

## 0.4.0

### Features

- [#5423](https://github.com/gradio-app/gradio/pull/5423) [`bb31cd7d`](https://github.com/gradio-app/gradio/commit/bb31cd7dd0dc60c18b2b21269512775f3784ef01) - Remove stable diffusion demo from landing page. Thanks [@aliabd](https://github.com/aliabd)!

## 0.3.0

### Features

- [#5271](https://github.com/gradio-app/gradio/pull/5271) [`97c3c7b1`](https://github.com/gradio-app/gradio/commit/97c3c7b1730407f9e80566af9ecb4ca7cccf62ff) - Move scripts from old website to CI. Thanks [@aliabd](https://github.com/aliabd)!
- [#5381](https://github.com/gradio-app/gradio/pull/5381) [`3d66e61d`](https://github.com/gradio-app/gradio/commit/3d66e61d641da8ca2a7d10c545c7dc0139697f00) - chore(deps): update dependency hast-util-to-string to v3. Thanks [@renovate](https://github.com/apps/renovate)!

### Fixes

- [#5304](https://github.com/gradio-app/gradio/pull/5304) [`05892302`](https://github.com/gradio-app/gradio/commit/05892302fb8fe2557d57834970a2b65aea97355b) - Adds kwarg to disable html sanitization in `gr.Chatbot()`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.2

### Features

- [#5284](https://github.com/gradio-app/gradio/pull/5284) [`5f25eb68`](https://github.com/gradio-app/gradio/commit/5f25eb6836f6a78ce6208b53495a01e1fc1a1d2f) - Minor bug fix sweep. Thanks [@aliabid94](https://github.com/aliabid94)!/n - Our use of **exit** was catching errors and corrupting the traceback of any component that failed to instantiate (try running blocks_kitchen_sink off main for an example). Now the **exit** exits immediately if there's been an exception, so the original exception can be printed cleanly/n - HighlightedText was rendering weird, cleaned it up

## 0.2.1

### Fixes

- [#5324](https://github.com/gradio-app/gradio/pull/5324) [`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19) - ensure login form has correct styles. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0

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

### Features

- [#5298](https://github.com/gradio-app/gradio/pull/5298) [`cf167cd1`](https://github.com/gradio-app/gradio/commit/cf167cd1dd4acd9aee225ff1cb6fac0e849806ba) - Create event listener table for components on docs. Thanks [@aliabd](https://github.com/aliabd)!
- [#5092](https://github.com/gradio-app/gradio/pull/5092) [`643442e1`](https://github.com/gradio-app/gradio/commit/643442e1a5e25fc0c89a15a38b6279b8955643ac) - generate docs json in ci, reimplement main vs release. Thanks [@pngwn](https://github.com/pngwn)!
- [#5186](https://github.com/gradio-app/gradio/pull/5186) [`24b66e1c`](https://github.com/gradio-app/gradio/commit/24b66e1cff0452bce71c71cea1b818913aeb8d51) - homepage demo update. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.0

### Features

- [#5076](https://github.com/gradio-app/gradio/pull/5076) [`2745075a`](https://github.com/gradio-app/gradio/commit/2745075a26f80e0e16863d483401ff1b6c5ada7a) - Add deploy_discord to docs. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#5111](https://github.com/gradio-app/gradio/pull/5111) [`b84a35b7`](https://github.com/gradio-app/gradio/commit/b84a35b7b91eca947f787648ceb361b1d023427b) - Add icon and link to DuplicateButton. Thanks [@aliabd](https://github.com/aliabd)!
- [#5037](https://github.com/gradio-app/gradio/pull/5037) [`42488c07`](https://github.com/gradio-app/gradio/commit/42488c076aaf3ac2302b27760773a87f5b6ecc41) - Correct gradio version on website. Thanks [@aliabd](https://github.com/aliabd)!

## 0.0.2

### Features

- [#5009](https://github.com/gradio-app/gradio/pull/5009) [`3e70fc81`](https://github.com/gradio-app/gradio/commit/3e70fc81fc12dcb07f40a280b972a61348c9d263) - Correctly render changelog on website after new formatting. Thanks [@aliabd](https://github.com/aliabd)!

### Fixes

- [#5007](https://github.com/gradio-app/gradio/pull/5007) [`71c90394`](https://github.com/gradio-app/gradio/commit/71c90394012a9cfe10eae312b437a6deff52da3a) - Make sure tags aren't rendered inside a guide. Thanks [@aliabd](https://github.com/aliabd)!