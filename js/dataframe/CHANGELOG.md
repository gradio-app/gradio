# @gradio/dataframe

## 0.17.2

### Dependency updates

- @gradio/atoms@0.14.1
- @gradio/statustracker@0.10.6
- @gradio/client@1.14.0
- @gradio/markdown-code@0.4.2
- @gradio/upload@0.15.6
- @gradio/button@0.4.11

## 0.17.1

### Fixes

- [#10819](https://github.com/gradio-app/gradio/pull/10819) [`ac075ad`](https://github.com/gradio-app/gradio/commit/ac075ad6aaea855bfd4839cef7140719a584498e) - Fix cell menu not showing in non-editable dataframes.  Thanks @hannahblair!

## 0.17.0

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

### Fixes

- [#10757](https://github.com/gradio-app/gradio/pull/10757) [`b4342d2`](https://github.com/gradio-app/gradio/commit/b4342d24a88acaa4ed4028c8fdd44eea0d1b8b57) - Fix dataframe search and filter functionality.  Thanks @hannahblair!
- [#10786](https://github.com/gradio-app/gradio/pull/10786) [`88941b6`](https://github.com/gradio-app/gradio/commit/88941b655e708ab14611341ed3fe57452fbbfc58) - Remove fixed layouts from dataframe.  Thanks @hannahblair!
- [#10631](https://github.com/gradio-app/gradio/pull/10631) [`b5ca1dc`](https://github.com/gradio-app/gradio/commit/b5ca1dcfdf496292eade31347ae1974d3a0976c4) - Refactor `gr.Dataframe`.  Thanks @hannahblair!

### Dependency updates

- @gradio/upload@0.15.5
- @gradio/statustracker@0.10.5
- @gradio/button@0.4.10
- @gradio/atoms@0.14.0
- @gradio/markdown-code@0.4.1

## 0.16.5

### Dependency updates

- @gradio/client@1.13.1
- @gradio/upload@0.15.4
- @gradio/button@0.4.9

## 0.16.4

### Dependency updates

- @gradio/upload@0.15.3
- @gradio/client@1.13.0
- @gradio/button@0.4.8

## 0.16.3

### Features

- [#10646](https://github.com/gradio-app/gradio/pull/10646) [`b01ce47`](https://github.com/gradio-app/gradio/commit/b01ce47056f5752fbf03e44600bf0f7dab69b64c) - Fixes cell-selection logic in `Table.svelte`.  Thanks @abidlabs!

## 0.16.2

### Fixes

- [#10597](https://github.com/gradio-app/gradio/pull/10597) [`8c87eb8`](https://github.com/gradio-app/gradio/commit/8c87eb83066278b0e28267a6648d4729d6f39aa9) - Fix issue where styling changes were overridden when value was updated simultaneously.  Thanks @abidlabs!

### Dependency updates

- @gradio/upload@0.15.2
- @gradio/statustracker@0.10.4
- @gradio/atoms@0.13.3
- @gradio/button@0.4.7

## 0.16.1

### Fixes

- [#10607](https://github.com/gradio-app/gradio/pull/10607) [`c354f5f`](https://github.com/gradio-app/gradio/commit/c354f5ff16c787d722f4e53d5a97f729abba955e) - Add empty dataframe functionality.  Thanks @hannahblair!
- [#10596](https://github.com/gradio-app/gradio/pull/10596) [`a8bde76`](https://github.com/gradio-app/gradio/commit/a8bde76e2b0f65b3565019beb03ac8b1fd152963) - Fix margin above `gr.Dataframe` when no header is provided.  Thanks @abidlabs!

## 0.16.0

### Features

- [#10561](https://github.com/gradio-app/gradio/pull/10561) [`26494ce`](https://github.com/gradio-app/gradio/commit/26494cea570ffe0ead1f8b7a7135ab5a89c6bcbd) - Allow freezing columns in `gr.Dataframe`.  Thanks @hannahblair!
- [#10554](https://github.com/gradio-app/gradio/pull/10554) [`b8ff5d6`](https://github.com/gradio-app/gradio/commit/b8ff5d6bfe1a9f3379580754b1e23857e2f0c96b) - Add optional search bar to `gr.Dataframe`'s toolbar.  Thanks @hannahblair!
- [#10529](https://github.com/gradio-app/gradio/pull/10529) [`196b600`](https://github.com/gradio-app/gradio/commit/196b600b3962b85781b53c512e17708644b86f6f) - Select entire row or column in dataframe.  Thanks @hannahblair!
- [#10558](https://github.com/gradio-app/gradio/pull/10558) [`1113002`](https://github.com/gradio-app/gradio/commit/111300242fdf135724a304920a93fc34a8037f7d) - Fix spacing issue with `gr.Dataframe` in Safari.  Thanks @hannahblair!
- [#10553](https://github.com/gradio-app/gradio/pull/10553) [`4c08b9f`](https://github.com/gradio-app/gradio/commit/4c08b9f3c0bcafb0edc56330d8d81e78a6e3763b) - Prevent scrolling when the dataframe cell menu is open.  Thanks @hannahblair!
- [#10541](https://github.com/gradio-app/gradio/pull/10541) [`e505fab`](https://github.com/gradio-app/gradio/commit/e505fabecb17c50e073483ed7d6aab2e04c9fcf2) - Add copy button feedback to `gr.Dataframe`.  Thanks @hannahblair!
- [#10540](https://github.com/gradio-app/gradio/pull/10540) [`deeebfb`](https://github.com/gradio-app/gradio/commit/deeebfba46f15bb3641b86e25156215d2d727087) - Revert editable text changes.  Thanks @hannahblair!

### Fixes

- [#10490](https://github.com/gradio-app/gradio/pull/10490) [`178311b`](https://github.com/gradio-app/gradio/commit/178311b72d72a3c5f4a67bee5e0098be4232e68c) - Ensure row numbers functionality in dataframe works as expected.  Thanks @hannahblair!
- [#10535](https://github.com/gradio-app/gradio/pull/10535) [`d909868`](https://github.com/gradio-app/gradio/commit/d9098681f8883686a617c8f98b22c77057febed1) - Ensure `max_height` is applied in `gr.Dataframe`.  Thanks @hannahblair!
- [#10521](https://github.com/gradio-app/gradio/pull/10521) [`79937fd`](https://github.com/gradio-app/gradio/commit/79937fd76021b31abdbc3f8f2c32ef123fd676aa) - Change word-break prop in dataframe headers.  Thanks @hannahblair!
- [#10520](https://github.com/gradio-app/gradio/pull/10520) [`2a1fc2a`](https://github.com/gradio-app/gradio/commit/2a1fc2a92888f622579e4b2daf86be487c73004d) - Ensure links work as expected in dataframe.  Thanks @hannahblair!

### Dependency updates

- @gradio/statustracker@0.10.3
- @gradio/atoms@0.13.2
- @gradio/utils@0.10.1
- @gradio/client@1.12.0
- @gradio/markdown-code@0.4.0
- @gradio/upload@0.15.1
- @gradio/button@0.4.6

## 0.15.0

### Features

- [#10456](https://github.com/gradio-app/gradio/pull/10456) [`8e40c15`](https://github.com/gradio-app/gradio/commit/8e40c15669ed1244d6f2288e55c2223279bd37a4) - Implement multiple cell selection.  Thanks @hannahblair!
- [#10463](https://github.com/gradio-app/gradio/pull/10463) [`ed7a091`](https://github.com/gradio-app/gradio/commit/ed7a0919ab6b31184dc4d686b722dbeb013e9ce9) - Expand and collapse dataframe cells.  Thanks @hannahblair!
- [#10478](https://github.com/gradio-app/gradio/pull/10478) [`afb96c6`](https://github.com/gradio-app/gradio/commit/afb96c64451e5a282bfee89445d831d1c87f9746) - Improve dataframe's upload accessibility.  Thanks @hannahblair!
- [#10491](https://github.com/gradio-app/gradio/pull/10491) [`ff5f976`](https://github.com/gradio-app/gradio/commit/ff5f976bbb685fdd4f7c1faeda79e094f55a9f56) - Allow multiline headers in gr.Dataframe.  Thanks @hannahblair!
- [#10494](https://github.com/gradio-app/gradio/pull/10494) [`10932a2`](https://github.com/gradio-app/gradio/commit/10932a291ac7f591bb1d56e4e353b51f10ecc6e3) - Ensure dataframe is not editable when `interactive` is False.  Thanks @hannahblair!

### Dependency updates

- @gradio/client@1.11.0
- @gradio/upload@0.15.0
- @gradio/button@0.4.5

## 0.14.0

### Features

- [#10461](https://github.com/gradio-app/gradio/pull/10461) [`ca7c47e`](https://github.com/gradio-app/gradio/commit/ca7c47e5e50a309cd637c4f928ab90af6355b01d) - Add copy button to dataframe toolbar.  Thanks @hannahblair!
- [#10420](https://github.com/gradio-app/gradio/pull/10420) [`a69b8e8`](https://github.com/gradio-app/gradio/commit/a69b8e83ad7c89c627db2bdd5d25b0142731aaac) - Support column/row deletion in `gr.DataFrame`.  Thanks @abidlabs!

### Dependency updates

- @gradio/upload@0.14.8
- @gradio/button@0.4.4

## 0.13.1

### Features

- [#10452](https://github.com/gradio-app/gradio/pull/10452) [`dd178f3`](https://github.com/gradio-app/gradio/commit/dd178f3dd5968df445b43f5e3b8cb86b11374913) - Tiny tweak to example dataframes.  Thanks @hannahblair!

### Dependency updates

- @gradio/upload@0.14.7
- @gradio/button@0.4.3

## 0.13.0

### Features

- [#10377](https://github.com/gradio-app/gradio/pull/10377) [`feb1e81`](https://github.com/gradio-app/gradio/commit/feb1e81ecabf34fd3f9ec228dcf3bdaa4b0bd75e) - Add toolbar with fullscreen button to `gr.Dataframe`.  Thanks @hannahblair!
- [#10376](https://github.com/gradio-app/gradio/pull/10376) [`2b7ba48`](https://github.com/gradio-app/gradio/commit/2b7ba4801398b6dd6b72496ea50245a0cd6852d6) - Add `show_row_numbers` param to gr.Dataframe.  Thanks @hannahblair!
- [#10410](https://github.com/gradio-app/gradio/pull/10410) [`48809c7`](https://github.com/gradio-app/gradio/commit/48809c722bcbb3aaed72edfdb6c59de5413fdbc4) - Fix bug where dataframe `value` prop was not updating when an input value was changed manually.  Thanks @abidlabs!

### Fixes

- [#10365](https://github.com/gradio-app/gradio/pull/10365) [`40e0c48`](https://github.com/gradio-app/gradio/commit/40e0c4832060cef457406896b2ad94639888897a) - Ensure clicking on a cell once enables editing mode.  Thanks @hannahblair!
- [#10348](https://github.com/gradio-app/gradio/pull/10348) [`62cd4ef`](https://github.com/gradio-app/gradio/commit/62cd4ef302cd7529d1f8842b416f9d8fcf6b5750) - Handle `row_count=0` in gr.Dataframe.  Thanks @hannahblair!
- [#10403](https://github.com/gradio-app/gradio/pull/10403) [`3219382`](https://github.com/gradio-app/gradio/commit/3219382eeea0a0047c74e0cdd2bf333e69f8f806) - Fix event triggers and recent regressions related to `gr.DataFrame`.  Thanks @abidlabs!
- [#10360](https://github.com/gradio-app/gradio/pull/10360) [`31cccc3`](https://github.com/gradio-app/gradio/commit/31cccc3e79a3d1b4a840610d9becb235f8829b13) - Fix logic for detecting changes in `gr.Dataframe` table value.  Thanks @abidlabs!

### Dependency updates

- @gradio/upload@0.14.6
- @gradio/button@0.4.2
- @gradio/statustracker@0.10.2

## 0.12.7

### Dependency updates

- @gradio/atoms@0.13.1
- @gradio/statustracker@0.10.1
- @gradio/client@1.10.0
- @gradio/upload@0.14.5
- @gradio/button@0.4.1

## 0.12.6

### Dependency updates

- @gradio/atoms@0.13.0
- @gradio/utils@0.10.0
- @gradio/markdown-code@0.3.0
- @gradio/upload@0.14.4
- @gradio/client@1.9.0
- @gradio/statustracker@0.10.0
- @gradio/button@0.4.0

## 0.12.5

### Dependency updates

- @gradio/statustracker@0.9.7
- @gradio/upload@0.14.3
- @gradio/button@0.3.9
- @gradio/atoms@0.12.0

## 0.12.4

### Fixes

- [#9945](https://github.com/gradio-app/gradio/pull/9945) [`e9f0d03`](https://github.com/gradio-app/gradio/commit/e9f0d0315d27325f55a8b1c5c763d07e3d78fd06) - Ensure Enter is correctly handled in Safari and Firefox.  Thanks @hannahblair!

### Dependency updates

- @gradio/atoms@0.11.2
- @gradio/utils@0.9.0
- @gradio/button@0.3.8
- @gradio/statustracker@0.9.6
- @gradio/upload@0.14.2

## 0.12.3

### Fixes

- [#9949](https://github.com/gradio-app/gradio/pull/9949) [`cfb62bf`](https://github.com/gradio-app/gradio/commit/cfb62bfdb52d88295f27287f788fca977e37ae6d) - Allow dataframe column content to wrap.  Thanks @hannahblair!

### Dependency updates

- @gradio/atoms@0.11.1
- @gradio/client@1.8.0
- @gradio/utils@0.8.0
- @gradio/button@0.3.7
- @gradio/upload@0.14.1
- @gradio/statustracker@0.9.5

## 0.12.2

### Fixes

- [#9892](https://github.com/gradio-app/gradio/pull/9892) [`7d77024`](https://github.com/gradio-app/gradio/commit/7d77024cb8f9cfd39a6468de9534e58dcfa69f49) - Fix dataframe height increasing on scroll.  Thanks @abidlabs!

### Dependency updates

- @gradio/statustracker@0.9.4
- @gradio/button@0.3.6
- @gradio/atoms@0.11.0
- @gradio/upload@0.14.0

## 0.12.1

### Features

- [#9649](https://github.com/gradio-app/gradio/pull/9649) [`b1b81c9`](https://github.com/gradio-app/gradio/commit/b1b81c9e1c10c2c14a5cb0661d2503259ece1a1b) - Hide option to add row/col when count is fixed in dataframe.  Thanks @hannahblair!

### Dependency updates

- @gradio/markdown-code@0.2.1
- @gradio/statustracker@0.9.3
- @gradio/atoms@0.10.1
- @gradio/client@1.7.1
- @gradio/upload@0.13.5
- @gradio/button@0.3.5

## 0.12.0

### Features

- [#9756](https://github.com/gradio-app/gradio/pull/9756) [`92f337c`](https://github.com/gradio-app/gradio/commit/92f337cc85d545060ea343f1cee85c22b85f6444) - Fix website build issue.  Thanks @aliabd!

### Fixes

- [#9654](https://github.com/gradio-app/gradio/pull/9654) [`cd7dab7`](https://github.com/gradio-app/gradio/commit/cd7dab7ba5c81983f133dfa9e90ac6f92ac4fa1f) - Improve select event behaviour in gr.Dataframe.  Thanks @hannahblair!

### Dependency updates

- @gradio/button@0.3.4
- @gradio/statustracker@0.9.2
- @gradio/atoms@0.10.0
- @gradio/markdown-code@0.2.0
- @gradio/upload@0.13.4

## 0.11.4

### Dependency updates

- @gradio/markdown@0.10.3
- @gradio/statustracker@0.9.1
- @gradio/upload@0.13.3
- @gradio/button@0.3.3
- @gradio/atoms@0.9.2

## 0.11.3

### Fixes

- [#9709](https://github.com/gradio-app/gradio/pull/9709) [`31418ef`](https://github.com/gradio-app/gradio/commit/31418ef388a2dc524069ee230c2735a4beaf55f1) - fix table type check.  Thanks @hannahblair!

### Dependency updates

- @gradio/markdown@0.10.2
- @gradio/atoms@0.9.1
- @gradio/statustracker@0.9.0
- @gradio/client@1.7.0
- @gradio/upload@0.13.2
- @gradio/button@0.3.2

## 0.11.2

### Dependency updates

- @gradio/upload@0.13.1
- @gradio/button@0.3.1

## 0.11.1

### Features

- [#9614](https://github.com/gradio-app/gradio/pull/9614) [`5d98550`](https://github.com/gradio-app/gradio/commit/5d985509b4b71aa4aa6b28acc38fe83c278dbbfa) - Fix `retry` and `undo` reactivity in gr.Chatbot.  Thanks @hannahblair!

### Dependency updates

- @gradio/statustracker@0.8.1
- @gradio/markdown@0.10.1

## 0.11.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - UI theme fixes
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Tweak gr.Dataframe menu UX
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Update gr.Dataframe UI with action popover
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix. Triggered dataframe change event for header change
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Standardize `height` across components and add `max_height` and `min_height` parameters where appropriate
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ssr part 2

### Dependencies

- @gradio/atoms@0.9.0
- @gradio/button@0.3.0
- @gradio/client@1.6.0
- @gradio/markdown@0.10.0
- @gradio/statustracker@0.8.0
- @gradio/upload@0.13.0
- @gradio/utils@0.7.0

## 0.11.0-beta.8

### Features

- [#9601](https://github.com/gradio-app/gradio/pull/9601) [`c078892`](https://github.com/gradio-app/gradio/commit/c07889223cb64661b17560b707b977248809470a) - Tweak gr.Dataframe menu UX.  Thanks @hannahblair!
- [#9575](https://github.com/gradio-app/gradio/pull/9575) [`4ec2feb`](https://github.com/gradio-app/gradio/commit/4ec2feb04e452d2c77482c09543c59948567be67) - Update gr.Dataframe UI with action popover.  Thanks @hannahblair!

### Dependency updates

- @gradio/upload@0.13.0-beta.7
- @gradio/statustracker@0.8.0-beta.5
- @gradio/atoms@0.9.0-beta.5
- @gradio/button@0.3.0-beta.7
- @gradio/markdown@0.10.0-beta.5

## 0.11.0-beta.7

### Dependency updates

- @gradio/statustracker@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.4
- @gradio/client@1.6.0-beta.4
- @gradio/upload@0.13.0-beta.6
- @gradio/markdown@0.10.0-beta.4
- @gradio/button@0.3.0-beta.6

## 0.11.0-beta.6

### Features

- [#9496](https://github.com/gradio-app/gradio/pull/9496) [`1647ebd`](https://github.com/gradio-app/gradio/commit/1647ebddc3e2ed6fc143a62629409e32afcc5801) - UI theme fixes.  Thanks @aliabid94!

### Dependency updates

- @gradio/upload@0.13.0-beta.5
- @gradio/statustracker@0.8.0-beta.3
- @gradio/atoms@0.9.0-beta.3
- @gradio/button@0.3.0-beta.5
- @gradio/markdown@0.10.0-beta.3

## 0.11.0-beta.5

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2
- @gradio/upload@0.13.0-beta.4
- @gradio/button@0.3.0-beta.4
- @gradio/markdown@0.10.0-beta.2

## 0.11.0-beta.4

### Features

- [#9469](https://github.com/gradio-app/gradio/pull/9469) [`f7c3396`](https://github.com/gradio-app/gradio/commit/f7c3396f55a5b8364d3880a29d766bd092d7f840) - Fix. Triggered dataframe change event for header change.  Thanks @Joodith!

## 0.11.0-beta.3

### Dependency updates

- @gradio/upload@0.13.0-beta.3
- @gradio/client@1.6.0-beta.3
- @gradio/button@0.3.0-beta.3

## 0.11.0-beta.2

### Features

- [#9313](https://github.com/gradio-app/gradio/pull/9313) [`1fef9d9`](https://github.com/gradio-app/gradio/commit/1fef9d9a26f0ebce4de18c486702661f6539b1c6) - Standardize `height` across components and add `max_height` and `min_height` parameters where appropriate.  Thanks @abidlabs!
- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.9.0-beta.2
- @gradio/upload@0.13.0-beta.2
- @gradio/markdown@0.10.0-beta.2
- @gradio/client@1.6.0-beta.2
- @gradio/statustracker@0.8.0-beta.2
- @gradio/utils@0.7.0-beta.2
- @gradio/button@0.3.0-beta.2

## 0.10.1-beta.1

### Features

- [#9187](https://github.com/gradio-app/gradio/pull/9187) [`5bf00b7`](https://github.com/gradio-app/gradio/commit/5bf00b7524ebf399b48719120a49d15bb21bd65c) - make all component SSR compatible.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.8.1-beta.1
- @gradio/statustracker@0.8.0-beta.1
- @gradio/utils@0.7.0-beta.1
- @gradio/client@1.6.0-beta.1
- @gradio/upload@0.12.4-beta.1
- @gradio/markdown@0.9.4-beta.1
- @gradio/button@0.3.0-beta.1

## 0.10.1-beta.0

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.1
- @gradio/statustracker@0.7.6
- @gradio/atoms@0.8.1
- @gradio/client@1.5.2
- @gradio/upload@0.12.4
- @gradio/button@0.2.51
- @gradio/markdown@0.9.4

## 0.10.0

### Features

- [#9128](https://github.com/gradio-app/gradio/pull/9128) [`747013b`](https://github.com/gradio-app/gradio/commit/747013bbacebae6bfdda554b45e541e80b2894e0) - Allow accessing the entire row of selected values in `gr.DataFrame`.  Thanks @abidlabs!
- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!
- [#9102](https://github.com/gradio-app/gradio/pull/9102) [`efdc323`](https://github.com/gradio-app/gradio/commit/efdc3231a7bde38cfe45d10086d0d36a24c1b9b4) - Initial SSR refactor.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.0
- @gradio/upload@0.12.3
- @gradio/atoms@0.8.0
- @gradio/button@0.2.50
- @gradio/client@1.5.1
- @gradio/markdown@0.9.3
- @gradio/statustracker@0.7.5

## 0.9.2

### Dependency updates

- @gradio/atoms@0.7.9
- @gradio/statustracker@0.7.4
- @gradio/client@1.5.0
- @gradio/upload@0.12.2
- @gradio/markdown@0.9.2
- @gradio/button@0.2.49

## 0.9.1

### Dependency updates

- @gradio/atoms@0.7.8
- @gradio/utils@0.5.2
- @gradio/statustracker@0.7.3
- @gradio/upload@0.12.1
- @gradio/markdown@0.9.1
- @gradio/button@0.2.48

## 0.9.0

### Features

- [#8745](https://github.com/gradio-app/gradio/pull/8745) [`4030f28`](https://github.com/gradio-app/gradio/commit/4030f28af6ae9f3eb94bb4e9cae83fb7016cdaad) - Allows updating the dataset of a `gr.Examples`.  Thanks @abidlabs!

### Dependency updates

- @gradio/markdown@0.9.0
- @gradio/client@1.4.0
- @gradio/statustracker@0.7.2
- @gradio/upload@0.12.0
- @gradio/atoms@0.7.7
- @gradio/button@0.2.47

## 0.8.13

### Fixes

- [#8763](https://github.com/gradio-app/gradio/pull/8763) [`c1ecfde`](https://github.com/gradio-app/gradio/commit/c1ecfde50e55902140aafc3551968e26c1bb4cd0) - 8394 df hidden items.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.6
- @gradio/utils@0.5.1
- @gradio/statustracker@0.7.1
- @gradio/client@1.3.0
- @gradio/markdown@0.8.1
- @gradio/upload@0.11.5
- @gradio/button@0.2.46

## 0.8.12

### Dependency updates

- @gradio/upload@0.11.4
- @gradio/client@1.2.1
- @gradio/button@0.2.45

## 0.8.11

### Dependency updates

- @gradio/atoms@0.7.5
- @gradio/utils@0.5.0
- @gradio/client@1.2.0
- @gradio/statustracker@0.7.0
- @gradio/markdown@0.8.0
- @gradio/button@0.2.44
- @gradio/upload@0.11.3

## 0.8.10

### Dependency updates

- @gradio/client@1.1.1
- @gradio/upload@0.11.2
- @gradio/button@0.2.43

## 0.8.9

### Dependency updates

- @gradio/upload@0.11.1
- @gradio/client@1.1.0
- @gradio/button@0.2.42

## 0.8.8

### Dependency updates

- @gradio/statustracker@0.6.0
- @gradio/client@1.0.0
- @gradio/upload@0.11.0
- @gradio/button@0.2.41
- @gradio/markdown@0.7.6

## 0.8.7

### Dependency updates

- @gradio/upload@0.10.7
- @gradio/client@0.20.1
- @gradio/button@0.2.40

## 0.8.6

### Dependency updates

- @gradio/client@0.20.0
- @gradio/statustracker@0.6.0
- @gradio/button@0.2.39
- @gradio/upload@0.10.6
- @gradio/markdown@0.7.6

## 0.8.5

### Dependency updates

- @gradio/utils@0.4.2
- @gradio/atoms@0.7.4
- @gradio/statustracker@0.5.5
- @gradio/upload@0.10.5
- @gradio/markdown@0.7.5
- @gradio/client@0.19.4
- @gradio/button@0.2.38

## 0.8.4

### Dependency updates

- @gradio/client@0.19.3
- @gradio/statustracker@0.5.4
- @gradio/button@0.2.37
- @gradio/upload@0.10.4
- @gradio/markdown@0.7.4

## 0.8.3

### Dependency updates

- @gradio/upload@0.10.3
- @gradio/client@0.19.2
- @gradio/button@0.2.36

## 0.8.2

### Dependency updates

- @gradio/statustracker@0.5.3
- @gradio/client@0.19.1
- @gradio/markdown@0.7.3
- @gradio/button@0.2.35
- @gradio/upload@0.10.2

## 0.8.1

### Fixes

- [#8252](https://github.com/gradio-app/gradio/pull/8252) [`22df61a`](https://github.com/gradio-app/gradio/commit/22df61a26adf8023f6dd49c051979990e8d3879a) - Client node fix.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.3
- @gradio/statustracker@0.5.2
- @gradio/markdown@0.7.2
- @gradio/client@0.19.0
- @gradio/upload@0.10.1
- @gradio/button@0.2.34

## 0.8.0

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!
- [#8209](https://github.com/gradio-app/gradio/pull/8209) [`b9afe93`](https://github.com/gradio-app/gradio/commit/b9afe93915401df5bd6737c89395c2477acfa585) - Rename `eventSource_Factory` and `fetch_implementation`.  Thanks @hannahblair!

### Fixes

- [#8179](https://github.com/gradio-app/gradio/pull/8179) [`6a218b4`](https://github.com/gradio-app/gradio/commit/6a218b4148095aaa0c58d8c20973ba01c8764fc2) - rework upload to be a class method + pass client into each component.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.2
- @gradio/client@0.18.0
- @gradio/upload@0.10.0
- @gradio/utils@0.4.1
- @gradio/statustracker@0.5.1
- @gradio/button@0.2.33
- @gradio/markdown@0.7.1

## 0.7.0

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

### Fixes

- [#8066](https://github.com/gradio-app/gradio/pull/8066) [`624f9b9`](https://github.com/gradio-app/gradio/commit/624f9b9477f74a581a6c14119234f9efdfcda398) - make gradio dev tools a local dependency rather than bundling.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.1
- @gradio/button@0.2.32
- @gradio/markdown@0.7.0
- @gradio/statustracker@0.5.0
- @gradio/upload@0.9.0
- @gradio/utils@0.4.0

## 0.6.13

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12
- @gradio/upload@0.8.5
- @gradio/atoms@0.7.0
- @gradio/markdown@0.6.10
- @gradio/button@0.2.31

## 0.6.12

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/atoms@0.6.2
- @gradio/statustracker@0.4.11
- @gradio/upload@0.8.4
- @gradio/markdown@0.6.9
- @gradio/button@0.2.30

## 0.6.11

### Dependency updates

- @gradio/button@0.2.29
- @gradio/upload@0.8.3

## 0.6.10

### Dependency updates

- @gradio/button@0.2.28
- @gradio/atoms@0.6.1
- @gradio/statustracker@0.4.10
- @gradio/upload@0.8.2
- @gradio/markdown@0.6.8

## 0.6.9

### Dependency updates

- @gradio/upload@0.8.1
- @gradio/button@0.2.27
- @gradio/statustracker@0.4.9
- @gradio/atoms@0.6.0
- @gradio/markdown@0.6.7

## 0.6.8

### Fixes

- [#7564](https://github.com/gradio-app/gradio/pull/7564) [`5d1e8da`](https://github.com/gradio-app/gradio/commit/5d1e8dae5ac23f605c3b5f41dbe18751dff380a0) - batch UI updates on a per frame basis.  Thanks @pngwn!

### Dependency updates

- @gradio/upload@0.8.0
- @gradio/markdown@0.6.6
- @gradio/button@0.2.26

## 0.6.7

### Dependency updates

- @gradio/button@0.2.25
- @gradio/upload@0.7.7

## 0.6.6

### Patch Changes

- Updated dependencies [[`8181695`](https://github.com/gradio-app/gradio/commit/8181695e70187e8bc2bf7518697098c8d1b9843d)]:
  - @gradio/upload@0.7.6
  - @gradio/button@0.2.24

## 0.6.5

### Features

- [#7528](https://github.com/gradio-app/gradio/pull/7528) [`eda33b3`](https://github.com/gradio-app/gradio/commit/eda33b3763897a542acf298e523fa493dc655aee) - Refactors `get_fetchable_url_or_file()` to remove it from the frontend. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.6.4

### Fixes

- [#7495](https://github.com/gradio-app/gradio/pull/7495) [`ddd4d3e`](https://github.com/gradio-app/gradio/commit/ddd4d3e4d3883fb7540d1df240fb08202fc77705) - ensure Dataframe headers are aligned with content when scrolling. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.6.3

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.5.3
  - @gradio/statustracker@0.4.7
  - @gradio/upload@0.7.4
  - @gradio/markdown@0.6.4
  - @gradio/button@0.2.22

## 0.6.2

### Patch Changes

- Updated dependencies [[`17fb116`](https://github.com/gradio-app/gradio/commit/17fb116492f951ab66e3a39b5fdfb598f5446b6f), [`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7)]:
  - @gradio/markdown@0.6.3
  - @gradio/utils@0.3.0
  - @gradio/atoms@0.5.2
  - @gradio/button@0.2.21
  - @gradio/statustracker@0.4.6
  - @gradio/upload@0.7.3

## 0.6.1

### Fixes

- [#7354](https://github.com/gradio-app/gradio/pull/7354) [`a7fa47a`](https://github.com/gradio-app/gradio/commit/a7fa47a175fbcf0fd6573ca19334a3a55b55bb24) - ensure Dataframes in background tabs are visible when the tab is selected. Thanks [@pngwn](https://github.com/pngwn)!

## 0.6.0

### Features

- [#7298](https://github.com/gradio-app/gradio/pull/7298) [`e5344ba`](https://github.com/gradio-app/gradio/commit/e5344ba0cd63d21dbb525330bbc07ca2eca57832) - chore(deps): update dependency marked to v12. Thanks [@renovate](https://github.com/apps/renovate)!
- [#7154](https://github.com/gradio-app/gradio/pull/7154) [`aab2a75`](https://github.com/gradio-app/gradio/commit/aab2a75f0610dd7ed0b481264c6b9f01cfe92094) - Allow selecting texts in dataframe cells. Thanks [@shubhamofbce](https://github.com/shubhamofbce)!

### Fixes

- [#7283](https://github.com/gradio-app/gradio/pull/7283) [`757dba6`](https://github.com/gradio-app/gradio/commit/757dba66baf624eae11ff076f0e8d6bfc2314630) - Add `show_label` check to `gr.Dataframe`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.5.1

### Patch Changes

- Updated dependencies [[`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b), [`ca8753b`](https://github.com/gradio-app/gradio/commit/ca8753bb3d829d0077f758ba8d0ddc866ff74d3d), [`bc2cdc1`](https://github.com/gradio-app/gradio/commit/bc2cdc1df95b38025486cf76df4a494b66d98585), [`c60ad4d`](https://github.com/gradio-app/gradio/commit/c60ad4d34ab5b56a89bf6796822977e51e7a4a32)]:
  - @gradio/button@0.2.18
  - @gradio/utils@0.2.1
  - @gradio/markdown@0.6.1
  - @gradio/upload@0.7.0
  - @gradio/atoms@0.5.0
  - @gradio/statustracker@0.4.4

## 0.5.0

### Features

- [#7018](https://github.com/gradio-app/gradio/pull/7018) [`ec28b4e`](https://github.com/gradio-app/gradio/commit/ec28b4e7c47a9233d9e3a725cc9fe8f9044dfa94) - Add `visible` and `interactive` params to `gr.Tab()`. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.4.6

### Patch Changes

- Updated dependencies [[`793bf8f`](https://github.com/gradio-app/gradio/commit/793bf8f7b1943f265c5d016c1a0c682ee549232a), [`5d00dd3`](https://github.com/gradio-app/gradio/commit/5d00dd37ca14bbfef2ceac550b29dbe05ba8cab0)]:
  - @gradio/upload@0.6.0
  - @gradio/button@0.2.16

## 0.4.5

### Patch Changes

- Updated dependencies [[`6c863af`](https://github.com/gradio-app/gradio/commit/6c863af92fa9ceb5c638857eb22cc5ddb718d549)]:
  - @gradio/upload@0.5.8
  - @gradio/button@0.2.15

## 0.4.4

### Patch Changes

- Updated dependencies []:
  - @gradio/button@0.2.14
  - @gradio/upload@0.5.7

## 0.4.3

### Patch Changes

- Updated dependencies [[`846d52d`](https://github.com/gradio-app/gradio/commit/846d52d1c92d429077382ce494eea27fd062d9f6), [`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d), [`f3abde8`](https://github.com/gradio-app/gradio/commit/f3abde80884d96ad69b825020c46486d9dd5cac5), [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144)]:
  - @gradio/markdown@0.6.0
  - @gradio/statustracker@0.4.3
  - @gradio/atoms@0.4.1
  - @gradio/upload@0.5.6
  - @gradio/button@0.2.13

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @gradio/button@0.2.12
  - @gradio/upload@0.5.5

## 0.4.1

### Patch Changes

- Updated dependencies [[`5d51fbc`](https://github.com/gradio-app/gradio/commit/5d51fbce7826da840a2fd4940feb5d9ad6f1bc5a)]:
  - @gradio/upload@0.5.4
  - @gradio/button@0.2.11

## 0.4.0

### Features

- [#6603](https://github.com/gradio-app/gradio/pull/6603) [`6b1401c`](https://github.com/gradio-app/gradio/commit/6b1401c514c2ec012b0a50c72a6ec81cb673bf1d) - chore(deps): update dependency marked to v11. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.3.11

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.3.1
  - @gradio/statustracker@0.4.1
  - @gradio/upload@0.5.2
  - @gradio/markdown@0.4.1
  - @gradio/button@0.2.9

## 0.3.10

### Patch Changes

- Updated dependencies [[`6d3fecfa4`](https://github.com/gradio-app/gradio/commit/6d3fecfa42dde1c70a60c397434c88db77289be6)]:
  - @gradio/markdown@0.4.0

## 0.3.9

### Patch Changes

- Updated dependencies [[`46f13f496`](https://github.com/gradio-app/gradio/commit/46f13f4968c8177e318c9d75f2eed1ed55c2c042)]:
  - @gradio/markdown@0.3.4
  - @gradio/button@0.2.8
  - @gradio/upload@0.5.1

## 0.3.8

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/atoms@0.3.0
  - @gradio/statustracker@0.4.0
  - @gradio/upload@0.5.0
  - @gradio/markdown@0.3.3
  - @gradio/button@0.2.7

## 0.3.7

### Patch Changes

- Updated dependencies [[`2f805a7dd`](https://github.com/gradio-app/gradio/commit/2f805a7dd3d2b64b098f659dadd5d01258290521), [`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a)]:
  - @gradio/upload@0.4.2
  - @gradio/atoms@0.2.2
  - @gradio/button@0.2.6
  - @gradio/markdown@0.3.2
  - @gradio/statustracker@0.3.2

## 0.3.6

### Patch Changes

- Updated dependencies []:
  - @gradio/button@0.2.5
  - @gradio/upload@0.4.1

## 0.3.5

### Patch Changes

- Updated dependencies [[`854b482f5`](https://github.com/gradio-app/gradio/commit/854b482f598e0dc47673846631643c079576da9c), [`f1409f95e`](https://github.com/gradio-app/gradio/commit/f1409f95ed39c5565bed6a601e41f94e30196a57)]:
  - @gradio/upload@0.4.0
  - @gradio/button@0.2.4

## 0.3.4

### Features

- [#6318](https://github.com/gradio-app/gradio/pull/6318) [`d3b53a457`](https://github.com/gradio-app/gradio/commit/d3b53a4577ea05cd27e37ce7fec952028c18ed45) - Fix for stylized DataFrame. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.3.3

### Fixes

- [#6290](https://github.com/gradio-app/gradio/pull/6290) [`e8216be94`](https://github.com/gradio-app/gradio/commit/e8216be948f76ce064595183d11e9148badf9421) - ensure `gr.Dataframe` updates as expected. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.2

### Patch Changes

- Updated dependencies [[`aaa55ce85`](https://github.com/gradio-app/gradio/commit/aaa55ce85e12f95aba9299445e9c5e59824da18e)]:
  - @gradio/upload@0.3.2
  - @gradio/button@0.2.2

## 0.3.1

### Patch Changes

- Updated dependencies []:
  - @gradio/button@0.2.1
  - @gradio/upload@0.3.1

## 0.3.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.0-beta.8

### Features

- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6149](https://github.com/gradio-app/gradio/pull/6149) [`90318b1dd`](https://github.com/gradio-app/gradio/commit/90318b1dd118ae08a695a50e7c556226234ab6dc) - swap `mode` on the frontned to `interactive` to match the backend. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.0-beta.7

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.3.0-beta.6

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5894](https://github.com/gradio-app/gradio/pull/5894) [`fee3d527e`](https://github.com/gradio-app/gradio/commit/fee3d527e83a615109cf937f6ca0a37662af2bb6) - Adds `column_widths` to `gr.Dataframe` and hide overflowing text when `wrap=False`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.4.0

### Features

- [#5877](https://github.com/gradio-app/gradio/pull/5877) [`a55b80942`](https://github.com/gradio-app/gradio/commit/a55b8094231ae462ac53f52bbdb460c1286ffabb) - Add styling (e.g. font colors and background colors) support to `gr.DataFrame` through the `pd.Styler` object. Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5930](https://github.com/gradio-app/gradio/pull/5930) [`361823896`](https://github.com/gradio-app/gradio/commit/3618238960d54df65c34895f4eb69d08acc3f9b6) - Fix dataframe `line_breaks`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.3.1

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/button@0.2.2
  - @gradio/markdown@0.3.1
  - @gradio/statustracker@0.2.2
  - @gradio/upload@0.3.2

## 0.3.0

### Features

- [#5569](https://github.com/gradio-app/gradio/pull/5569) [`2a5b9e03b`](https://github.com/gradio-app/gradio/commit/2a5b9e03b15ea324d641fe6982f26d81b1ca7210) - Added support for pandas `Styler` object to `gr.DataFrame` (initially just sets the `display_value`). Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5755](https://github.com/gradio-app/gradio/pull/5755) [`e842a561a`](https://github.com/gradio-app/gradio/commit/e842a561af4394f8109291ee5725bcf74743e816) - Fix new line issue in chatbot. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.5

### Fixes

- [#5713](https://github.com/gradio-app/gradio/pull/5713) [`c10dabd6b`](https://github.com/gradio-app/gradio/commit/c10dabd6b18b49259441eb5f956a19046f466339) - Fixes gr.select() Method Issues with Dataframe Cells. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.4

### Patch Changes

- Updated dependencies [[`ee8eec1e5`](https://github.com/gradio-app/gradio/commit/ee8eec1e5e544a0127e0aa68c2522a7085b8ada5)]:
  - @gradio/markdown@0.2.2

## 0.2.3

### Fixes

- [#5616](https://github.com/gradio-app/gradio/pull/5616) [`7c34b434a`](https://github.com/gradio-app/gradio/commit/7c34b434aae0eb85f112a1dc8d66cefc7e2296b2) - Fix width and height issues that would cut off content in `gr.DataFrame`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.2.2

### Fixes

- [#5456](https://github.com/gradio-app/gradio/pull/5456) [`6e381c4f`](https://github.com/gradio-app/gradio/commit/6e381c4f146cc8177a4e2b8e39f914f09cd7ff0c) - ensure dataframe doesn't steal focus. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.1

### Fixes

- [#5445](https://github.com/gradio-app/gradio/pull/5445) [`67bb7bcb`](https://github.com/gradio-app/gradio/commit/67bb7bcb6a95b7a00a8bdf612cf147850d919a44) - ensure dataframe doesn't scroll unless needed. Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.0

### Features

- [#5342](https://github.com/gradio-app/gradio/pull/5342) [`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912) - significantly improve the performance of `gr.Dataframe` for large datasets. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.2

### Patch Changes

- Updated dependencies [[`05892302`](https://github.com/gradio-app/gradio/commit/05892302fb8fe2557d57834970a2b65aea97355b), [`e4e7a431`](https://github.com/gradio-app/gradio/commit/e4e7a4319924aaf51dcb18d07d0c9953d4011074), [`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db), [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96), [`4d94ea0a`](https://github.com/gradio-app/gradio/commit/4d94ea0a0cf2103cda19f48398a5634f8341d04d), [`b27f7583`](https://github.com/gradio-app/gradio/commit/b27f7583254165b135bf1496a7d8c489a62ba96f)]:
  - @gradio/markdown@0.1.2
  - @gradio/utils@0.1.0
  - @gradio/upload@0.2.0
  - @gradio/atoms@0.1.1
  - @gradio/statustracker@0.1.1
  - @gradio/button@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19)]:
  - @gradio/markdown@0.1.1

## 0.1.0

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

- [#5268](https://github.com/gradio-app/gradio/pull/5268) [`f49028cf`](https://github.com/gradio-app/gradio/commit/f49028cfe3e21097001ddbda71c560b3d8b42e1c) - Move markdown & latex processing to the frontend for the gr.Markdown and gr.DataFrame components. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications. Thanks [@pngwn](https://github.com/pngwn)!
- [#5216](https://github.com/gradio-app/gradio/pull/5216) [`4b58ea6d`](https://github.com/gradio-app/gradio/commit/4b58ea6d98e7a43b3f30d8a4cb6f379bc2eca6a8) - Update i18n tokens and locale files. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5283](https://github.com/gradio-app/gradio/pull/5283) [`a7460557`](https://github.com/gradio-app/gradio/commit/a74605572dd0d6bb41df6b38b120d656370dd67d) - Add height parameter and scrolling to `gr.Dataframe`. Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#5256](https://github.com/gradio-app/gradio/pull/5256) [`933db53e`](https://github.com/gradio-app/gradio/commit/933db53e93a1229fdf149556d61da5c4c7e1a331) - Better handling of empty dataframe in `gr.DataFrame`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.0.2

### Patch Changes

- Updated dependencies [[`667875b2`](https://github.com/gradio-app/gradio/commit/667875b2441753e74d25bd9d3c8adedd8ede11cd), [`37caa2e0`](https://github.com/gradio-app/gradio/commit/37caa2e0fe95d6cab8beb174580fb557904f137f)]:
  - @gradio/upload@0.0.3
  - @gradio/button@0.1.0