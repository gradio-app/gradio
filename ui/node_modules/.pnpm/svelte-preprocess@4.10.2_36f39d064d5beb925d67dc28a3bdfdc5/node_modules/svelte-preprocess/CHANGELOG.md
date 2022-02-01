## [4.10.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.10.1...v4.10.2) (2022-01-17)


### Bug Fixes

* accept less v4 as peer dep ([#455](https://github.com/sveltejs/svelte-preprocess/issues/455)) ([fbc484a](https://github.com/sveltejs/svelte-preprocess/commit/fbc484a6d0394928c1318b70dfe007fed1d9fdac))
* better pug error message ([#448](https://github.com/sveltejs/svelte-preprocess/issues/448)) ([a239e82](https://github.com/sveltejs/svelte-preprocess/commit/a239e829295bde5f62383697266cefe7767dd0e2)), closes [#447](https://github.com/sveltejs/svelte-preprocess/issues/447)
* provide caller information to Babel ([#449](https://github.com/sveltejs/svelte-preprocess/issues/449)) ([51007ab](https://github.com/sveltejs/svelte-preprocess/commit/51007abf946ffdd1d407c6bcf86439d38e113626))
* ts preprocessor - consider store suffixed with number ([#461](https://github.com/sveltejs/svelte-preprocess/issues/461)) ([a7a94cf](https://github.com/sveltejs/svelte-preprocess/commit/a7a94cfb29f6ea85cfafd1afa2c61363f72cb4b3)), closes [sveltejs/svelte#7120](https://github.com/sveltejs/svelte/issues/7120)



## [4.10.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.10.0...v4.10.1) (2021-12-17)


### Bug Fixes

* adjust store regex ([#441](https://github.com/sveltejs/svelte-preprocess/issues/441)) ([85a86c8](https://github.com/sveltejs/svelte-preprocess/commit/85a86c86513f98c2b02f2d314a18b0e68378c8f6)), closes [#433](https://github.com/sveltejs/svelte-preprocess/issues/433)
* generate high resolution source map ([#443](https://github.com/sveltejs/svelte-preprocess/issues/443)) ([57012ba](https://github.com/sveltejs/svelte-preprocess/commit/57012ba9f87abfec99f061196fb955da4ccfa384))



# [4.10.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.8...v4.10.0) (2021-12-13)


### Features

* support preserveValueImports introduced in TS 4.5 ([#434](https://github.com/sveltejs/svelte-preprocess/issues/434)) ([4ea9982](https://github.com/sveltejs/svelte-preprocess/commit/4ea9982249df9858439bb3588224e804107f0986))



## [4.9.8](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.7...v4.9.8) (2021-10-02)


### Bug Fixes

* deprecate type attribute ([#417](https://github.com/sveltejs/svelte-preprocess/issues/417)) ([2632a88](https://github.com/sveltejs/svelte-preprocess/commit/2632a88d380a14843393d5246f471a8c6446a3b5))



## [4.9.7](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.6...v4.9.7) (2021-09-30)


### Bug Fixes

* don't overwrite target from tsconfig.json ([#408](https://github.com/sveltejs/svelte-preprocess/issues/408)) ([11cb508](https://github.com/sveltejs/svelte-preprocess/commit/11cb5083b1c9a946ea8c0f499ccbca753908e411))



## [4.9.6](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.5...v4.9.6) (2021-09-30)


### Bug Fixes

* coffeescript sourcemap ([#416](https://github.com/sveltejs/svelte-preprocess/issues/416)) ([6cc54b6](https://github.com/sveltejs/svelte-preprocess/commit/6cc54b63fd8eb42a5e2460b30bba4d7a85846958))



## [4.9.5](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.4...v4.9.5) (2021-09-20)


### Bug Fixes

* Clear outDir if set in tsconfig ([#406](https://github.com/sveltejs/svelte-preprocess/issues/406)) ([67f96ad](https://github.com/sveltejs/svelte-preprocess/commit/67f96ad9fcc4e0efb337d469533ff68d6189c024)), closes [#405](https://github.com/sveltejs/svelte-preprocess/issues/405)
* return default settings when no tsconfig found ([#407](https://github.com/sveltejs/svelte-preprocess/issues/407)) ([473408b](https://github.com/sveltejs/svelte-preprocess/commit/473408b8dcec6cd1540d3fb8e05ca0b4a82ec2f5))



## [4.9.4](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.3...v4.9.4) (2021-09-09)


### Bug Fixes

* handle $store imported in module script ([#404](https://github.com/sveltejs/svelte-preprocess/issues/404)) ([162faa4](https://github.com/sveltejs/svelte-preprocess/commit/162faa40949468eb07a73116740d3415775ddc9a)), closes [#401](https://github.com/sveltejs/svelte-preprocess/issues/401)


### Performance Improvements

* cache tsconfig ([#398](https://github.com/sveltejs/svelte-preprocess/issues/398)) ([5aa60cb](https://github.com/sveltejs/svelte-preprocess/commit/5aa60cb86c89c0649a548507f6d142937f76df7a)), closes [#383](https://github.com/sveltejs/svelte-preprocess/issues/383)



## [4.9.3](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.2...v4.9.3) (2021-09-08)


### Bug Fixes

* add quotes to ts store regex ([#403](https://github.com/sveltejs/svelte-preprocess/issues/403)) ([9f2d7a0](https://github.com/sveltejs/svelte-preprocess/commit/9f2d7a07053b8f010067bf7e55d99bccb2958567)), closes [#402](https://github.com/sveltejs/svelte-preprocess/issues/402)



## [4.9.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.1...v4.9.2) (2021-09-07)


### Bug Fixes

* relax TS peer dep requirement ([#400](https://github.com/sveltejs/svelte-preprocess/issues/400)) ([f8a0f49](https://github.com/sveltejs/svelte-preprocess/commit/f8a0f49fd02aea1fdb5c463496a5939186948cd2)), closes [#395](https://github.com/sveltejs/svelte-preprocess/issues/395)



## [4.9.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.9.0...v4.9.1) (2021-09-05)


### Bug Fixes

* fallback to empty string if there are no attributes ([#397](https://github.com/sveltejs/svelte-preprocess/issues/397)) ([b25838f](https://github.com/sveltejs/svelte-preprocess/commit/b25838f5b11afa8143aa59cfefa9b0881b4879cb)), closes [#396](https://github.com/sveltejs/svelte-preprocess/issues/396)



# [4.9.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.8.0...v4.9.0) (2021-09-04)


### Features

* better Typescript transpilation ([#392](https://github.com/sveltejs/svelte-preprocess/issues/392)) ([a1c54fc](https://github.com/sveltejs/svelte-preprocess/commit/a1c54fc7b0d0d21fd9adbee8aeeb8f3667b375c9))



# [4.8.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.7.4...v4.8.0) (2021-08-23)


### Bug Fixes

* add deprecation warning to defaults prop ([#393](https://github.com/sveltejs/svelte-preprocess/issues/393)) ([406d3a8](https://github.com/sveltejs/svelte-preprocess/commit/406d3a87c4779c16fca1264ce66fc491e5eec170))



## [4.7.4](https://github.com/sveltejs/svelte-preprocess/compare/v4.7.3...v4.7.4) (2021-07-09)


### Bug Fixes

* standalone preprocessors prepending data in other languages ([#380](https://github.com/sveltejs/svelte-preprocess/issues/380)) ([e6679e4](https://github.com/sveltejs/svelte-preprocess/commit/e6679e4b81cd145202b293aca1035cd2dc05ef71))



## [4.7.3](https://github.com/sveltejs/svelte-preprocess/compare/v4.7.2...v4.7.3) (2021-05-03)


### Bug Fixes

* typescript: importing component from pnpm monorepo p… ([#337](https://github.com/sveltejs/svelte-preprocess/issues/337)) ([bf72637](https://github.com/sveltejs/svelte-preprocess/commit/bf726371e43dd3bc617511690be6cf6a2845e389))



## [4.7.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.7.1...v4.7.2) (2021-04-19)


### Bug Fixes

* 🐛 prevent svelte file from being added to scss dep list ([519b0b6](https://github.com/sveltejs/svelte-preprocess/commit/519b0b6c49ba4a9e0f4adfcc47f03b19d2e28966)), closes [#346](https://github.com/sveltejs/svelte-preprocess/issues/346)
* support ts build with no tsconfig.json ([cf0e44c](https://github.com/sveltejs/svelte-preprocess/commit/cf0e44c26212b496cda8686d2780e7e8f1ac8f7a))



## [4.7.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.7.0...v4.7.1) (2021-04-18)


### Features

* export autopreprocess options type ([f5e1a63](https://github.com/sveltejs/svelte-preprocess/commit/f5e1a635f586a9780b0a71db979f6ffb30b31221))



# [4.7.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.9...v4.7.0) (2021-03-26)


### Features

* support tsconfig extends ([#328](https://github.com/sveltejs/svelte-preprocess/issues/328)) ([d0b4766](https://github.com/sveltejs/svelte-preprocess/commit/d0b476615d72deaa4eff5f2f164b245c0dd294d7)), closes [#300](https://github.com/sveltejs/svelte-preprocess/issues/300)



## [4.6.9](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.7...v4.6.9) (2021-02-13)


### Bug Fixes

* 🐛 make markup tag regexp less greedy ([384ba5c](https://github.com/sveltejs/svelte-preprocess/commit/384ba5cad0a2939a2717d9061dd928b4607e1431)), closes [#310](https://github.com/sveltejs/svelte-preprocess/issues/310)
* revert "refactor: use fs/promises" ([3f9572c](https://github.com/sveltejs/svelte-preprocess/commit/3f9572ca30e9a05439a6deddc327fa340dd1ef34))



## [4.6.8](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.7...v4.6.8) (2021-02-11)


### Bug Fixes

* 🐛 make markup tag regexp less greedy ([64f3362](https://github.com/sveltejs/svelte-preprocess/commit/64f3362d27d0defdcc0fd684022ebacb49c1aaf4)), closes [#310](https://github.com/sveltejs/svelte-preprocess/issues/310)



## [4.6.7](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.5...v4.6.7) (2021-02-10)


### Bug Fixes

* 🐛 language custom transformer overriding postcss ([2a188bc](https://github.com/sveltejs/svelte-preprocess/commit/2a188bc0886f9950ab3a23c9b24ac30a29dd81bb)), closes [#309](https://github.com/sveltejs/svelte-preprocess/issues/309)



## [4.6.6](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.5...v4.6.6) (2021-02-03)


### Bug Fixes

* accept postcss-load-config v2 or v3 ([#307](https://github.com/sveltejs/svelte-preprocess/issues/307)) ([a31e794](https://github.com/sveltejs/svelte-preprocess/commit/a31e79403f94cfd7db252a6152f120772acd4d6d))



## [4.6.5](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.4...v4.6.5) (2021-01-29)


### Bug Fixes

* [scss] remove sourceMappingURL from result.code ([#297](https://github.com/sveltejs/svelte-preprocess/issues/297)) ([2ff48f8](https://github.com/sveltejs/svelte-preprocess/commit/2ff48f8c4fa94ae5782f24b39889f8a6a893eed1))



## [4.6.4](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.3...v4.6.4) (2021-01-29)


### Bug Fixes

* 🐛 better missing postcss message ([cafb6c6](https://github.com/sveltejs/svelte-preprocess/commit/cafb6c6d7e369c11a7feda212a182f08c0f3a156)), closes [#301](https://github.com/sveltejs/svelte-preprocess/issues/301)



## [4.6.3](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.2...v4.6.3) (2021-01-21)


### Bug Fixes

* 🐛 make postcss config error explicit ([21e3086](https://github.com/sveltejs/svelte-preprocess/commit/21e30861ccc6d6c6b80cd9aad4a81b9e29a96c5e)), closes [#298](https://github.com/sveltejs/svelte-preprocess/issues/298)



## [4.6.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.1...v4.6.2) (2021-01-21)


### Bug Fixes

* translate options.sourceMap to options.compilerOptions.sourceMap for ts ([#286](https://github.com/sveltejs/svelte-preprocess/issues/286)) ([#299](https://github.com/sveltejs/svelte-preprocess/issues/299)) ([c8a3cd6](https://github.com/sveltejs/svelte-preprocess/commit/c8a3cd6736054510bc0eeccc242b8f5c4f0b7c5a))



## [4.6.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.6.0...v4.6.1) (2020-11-20)


### Bug Fixes

* 🐛 postcss sourcemap ([8fe6543](https://github.com/sveltejs/svelte-preprocess/commit/8fe6543a376be15a7a761a9bacdb66903b0388da)), closes [#251](https://github.com/sveltejs/svelte-preprocess/issues/251)



# [4.6.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.5.6...v4.6.0) (2020-11-17)


### Bug Fixes

* 🐛 replace separator for windows support ([b60a0a8](https://github.com/sveltejs/svelte-preprocess/commit/b60a0a830119eebd606245e71fdb6aadcee19135))
* 🐛 sass tilde importer ([934fc04](https://github.com/sveltejs/svelte-preprocess/commit/934fc04f197ada737b3b15780538bae3ab60bede))


### Features

* 🎸 add scss support for tilde (~) imports ([5b5c692](https://github.com/sveltejs/svelte-preprocess/commit/5b5c6924829910d363fe27ba4658cab7a0f06de0)), closes [#277](https://github.com/sveltejs/svelte-preprocess/issues/277)



## 4.5.2 (2020-10-23)


### Bug Fixes

* 🐛 inline :local without a scope not working ([2683fda](https://github.com/sveltejs/svelte-preprocess/commit/2683fda481d4d84bd37206f25c79a47787f6dc3f)), closes [#238](https://github.com/sveltejs/svelte-preprocess/issues/238)
* 🐛 warn when global attr is used without potcss ([1be483b](https://github.com/sveltejs/svelte-preprocess/commit/1be483b34f2731b7fcc189d4453c5103a241aa9f))



## [4.5.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.5.0...v4.5.1) (2020-10-07)


### Bug Fixes

* 🐛 add sugarss as optional dependency ([9ed25ee](https://github.com/sveltejs/svelte-preprocess/commit/9ed25ee88c72ae28c5621e7228cddf53b4e7d791))



# [4.5.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.4.3...v4.5.0) (2020-10-07)


### Bug Fixes

* 🐛 postcss config file support for sugarss ([4876426](https://github.com/sveltejs/svelte-preprocess/commit/48764269205c6617f790adad50b61f8614bff3d0))


### Features

* 🎸 add support for lang=sugarss & type=text/sugarss ([683715d](https://github.com/sveltejs/svelte-preprocess/commit/683715d214022e53f0653ee3e6872adf6bdf72be)), closes [#250](https://github.com/sveltejs/svelte-preprocess/issues/250)



## [4.4.3](https://github.com/sveltejs/svelte-preprocess/compare/v4.4.0...v4.4.3) (2020-10-07)

### Bug Fixes

- 🐛 types for postcss 8 ([9b3cd3b](https://github.com/sveltejs/svelte-preprocess/commit/9b3cd3b3b8b347a4c99efa189437c27f037ef6f5)), closes [#258](https://github.com/sveltejs/svelte-preprocess/issues/258)

## [4.4.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.4.0...v4.4.2) (2020-10-05)

### Bug Fixes

- 🐛 prefixed keyframes globalization ([903d95b](https://github.com/sveltejs/svelte-preprocess/commit/903d95b931da10cf861fc71c15e6ab43fcfef590)), closes [#264](https://github.com/sveltejs/svelte-preprocess/issues/264)

## [4.4.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.4.0...v4.4.1) (2020-10-05)

### Bug Fixes

- 🐛 prevent trying to resolve interpolated src values ([780b09a](https://github.com/sveltejs/svelte-preprocess/commit/780b09a43a0d7cf01067a0ffd378f65961de97c2)), closes [#226](https://github.com/sveltejs/svelte-preprocess/issues/226)

# [4.4.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.3.2...v4.4.0) (2020-10-05)

### Features

- add new syntax {key} for `pug` ([#259](https://github.com/sveltejs/svelte-preprocess/issues/259)) ([707206f](https://github.com/sveltejs/svelte-preprocess/commit/707206f7457cf5e066c95a18d3f99f48ea61481d))

## [4.3.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.3.0...v4.3.2) (2020-09-25)

### Bug Fixes

- 🐛 nth-child not being correctly globalified ([fa7249f](https://github.com/sveltejs/svelte-preprocess/commit/fa7249f6988931f73c82e18554dcdf702bda5146)), closes [#224](https://github.com/sveltejs/svelte-preprocess/issues/224)
- 🐛 prevent supressing generic errors on postcss transformer ([9a7dd49](https://github.com/sveltejs/svelte-preprocess/commit/9a7dd4991ecbb9443bffe1d69b0cc68f513f59a7)), closes [#216](https://github.com/sveltejs/svelte-preprocess/issues/216)

## [4.3.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.3.0...v4.3.1) (2020-09-25)

### Bug Fixes

- 🐛 nth-child not being correctly globalified ([c78b260](https://github.com/sveltejs/svelte-preprocess/commit/c78b26038f12cd698d65a09f53fb798c6abb7f03)), closes [#224](https://github.com/sveltejs/svelte-preprocess/issues/224)

# [4.3.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.2.2...v4.3.0) (2020-09-16)

### Features

- add +html mixin for pug ([#245](https://github.com/sveltejs/svelte-preprocess/issues/245)) ([d2d6d13](https://github.com/sveltejs/svelte-preprocess/commit/d2d6d13318668818682b5dda8ac318b98c499384))

## [4.2.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.2.0...v4.2.2) (2020-09-16)

### Bug Fixes

- allow typescript v4 ([c584bcf](https://github.com/sveltejs/svelte-preprocess/commit/c584bcff7fcb1021cd21b82b79c8b4608f2f8d5a))

## [4.2.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.2.0...v4.2.1) (2020-09-01)

### Bug Fixes

- 🐛 self-closing templates with external source ([217a09d](https://github.com/sveltejs/svelte-preprocess/commit/217a09dab1beae2d6f309760d425001ead74217f)), closes [#235](https://github.com/sveltejs/svelte-preprocess/issues/235)

# [4.2.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.1.3...v4.2.0) (2020-08-30)

### Features

- 🎸 enable sourceMap for dev environment automatically ([4df9031](https://github.com/sveltejs/svelte-preprocess/commit/4df9031d942dd4ecc0f47878c21c54cd15552285))

## [4.1.3](https://github.com/sveltejs/svelte-preprocess/compare/v4.1.1...v4.1.3) (2020-08-30)

### Bug Fixes

- 🐛 replacer preprocessor options types ([d3543da](https://github.com/sveltejs/svelte-preprocess/commit/d3543dabfa434622bd28061099acc4c863f62710)), closes [#228](https://github.com/sveltejs/svelte-preprocess/issues/228)

## [4.1.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.1.1...v4.1.2) (2020-08-28)

### Bug Fixes

- 🐛 language specific options not being set ([f3df8b0](https://github.com/sveltejs/svelte-preprocess/commit/f3df8b06d62d38c7c5f4a100a0e7b2049fd3fd86)), closes [#231](https://github.com/sveltejs/svelte-preprocess/issues/231)

## [4.1.1](https://github.com/sveltejs/svelte-preprocess/compare/v4.1.0...v4.1.1) (2020-08-18)

### Bug Fixes

- 🐛 guarantee lowercase markup tagname ([b277bb3](https://github.com/sveltejs/svelte-preprocess/commit/b277bb3a65c643e9a2e24f0aff05533655562e2c))

# [4.1.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.12...v4.1.0) (2020-08-18)

### Features

- 🎸 support template wrappers in separate markup processors ([dc52009](https://github.com/sveltejs/svelte-preprocess/commit/dc520096d4ae7d0a8f610f2e3cdc8ea7f2abfb1b)), closes [#211](https://github.com/sveltejs/svelte-preprocess/issues/211)

## [4.0.12](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.10...v4.0.12) (2020-08-13)

### Bug Fixes

- 🐛 remove accidental console.log ([09e9aa8](https://github.com/sveltejs/svelte-preprocess/commit/09e9aa8eca59c7fb9a946f17936e1156eada8113))

## [4.0.11](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.10...v4.0.11) (2020-08-12)

### Bug Fixes

- 🐛 babel inputSourceMap object ([3b6fc3e](https://github.com/sveltejs/svelte-preprocess/commit/3b6fc3e9c7b59a20d8a5ee7a643c9a1dac4a7cd9)), closes [#215](https://github.com/sveltejs/svelte-preprocess/issues/215)

## [4.0.10](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.7...v4.0.10) (2020-08-04)

### Bug Fixes

- 🐛 strip indent from indentation-sensitive languages only ([8d735bd](https://github.com/sveltejs/svelte-preprocess/commit/8d735bde959709fc204de12cc5543194a29e28a0))

## [4.0.9](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.8...v4.0.9) (2020-08-04)

### Bug Fixes

- 🐛 scss prepending twice ([bc34b44](https://github.com/sveltejs/svelte-preprocess/commit/bc34b44ddd23061df17cd0b8ae04c44c4b74d904)), closes [#200](https://github.com/sveltejs/svelte-preprocess/issues/200)
- default ts option object ([07ba62f](https://github.com/sveltejs/svelte-preprocess/commit/07ba62f1fc8e73b547648744c805617e651acc9f))

## [4.0.8](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.7...v4.0.8) (2020-07-14)

### Bug Fixes

- 🐛 scss prepending twice ([b734901](https://github.com/sveltejs/svelte-preprocess/commit/b7349012f2a2fdb3e0c1be5339cd581399fbcaa4)), closes [#200](https://github.com/sveltejs/svelte-preprocess/issues/200)

## [4.0.7](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.6...v4.0.7) (2020-07-11)

### Bug Fixes

- 🐛 add more meaningful log to importAny ([2f7053e](https://github.com/sveltejs/svelte-preprocess/commit/2f7053eeae6e1f779aca0868fb345e445d53bb90))

## [4.0.6](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.4...v4.0.6) (2020-07-08)

### Bug Fixes

- 🐛 even more type fixes ([34af056](https://github.com/sveltejs/svelte-preprocess/commit/34af05698823c1a679305214dad30598d9b514c0))
- 🐛 remove loose log ([e72650c](https://github.com/sveltejs/svelte-preprocess/commit/e72650c5abf04659fb9ac62d346251c431b0dad1))

## [4.0.5](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.4...v4.0.5) (2020-07-08)

### Bug Fixes

- 🐛 remove loose log ([e72650c](https://github.com/sveltejs/svelte-preprocess/commit/e72650c5abf04659fb9ac62d346251c431b0dad1))

## [4.0.4](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.3...v4.0.4) (2020-07-08)

### Bug Fixes

- 🐛 more type fixes ([06dff79](https://github.com/sveltejs/svelte-preprocess/commit/06dff79334a1c6a36aed9d6a30ac421ce09fb82e))

## [4.0.3](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.2...v4.0.3) (2020-07-08)

### Bug Fixes

- 🐛 another type error :shrug: ([c55ad93](https://github.com/sveltejs/svelte-preprocess/commit/c55ad935c0251579ef62d5e93b3abf7c4c672360))

## [4.0.2](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.1...v4.0.2) (2020-07-08)

### Bug Fixes

- 🐛 transformers type completion ([45ed796](https://github.com/sveltejs/svelte-preprocess/commit/45ed796492f28a974af7f821e8305e9905a4c1cf))

## [4.0.1](https://github.com/sveltejs/svelte-preprocess/compare/v3.9.12...v4.0.1) (2020-07-07)

### Bug Fixes

- 🐛 bump minimum node version to 9.11.2 ([b8e0568](https://github.com/sveltejs/svelte-preprocess/commit/b8e05688d8a2bcc390abd262cfe5e3338b06cc2b))
- 🐛 postcss installation check ([7df673a](https://github.com/sveltejs/svelte-preprocess/commit/7df673a73ae2b12b89c174046b833bace7d97297))
- 🐛 prevent globalify to wrongly split escaped selectors ([e9c4031](https://github.com/sveltejs/svelte-preprocess/commit/e9c4031835ac18d713b5b50d909995677d516959)), closes [#191](https://github.com/sveltejs/svelte-preprocess/issues/191)
- 🐛 rename scss prepend option from `data` to `prependData` ([bd1caca](https://github.com/sveltejs/svelte-preprocess/commit/bd1caca79d863cf08de353ed837de42b5ec063a1))
- 🐛 try to use sass before node-sass ([10af027](https://github.com/sveltejs/svelte-preprocess/commit/10af027bbff20ce5bb3a8e9829bba5cf9c461b98)), closes [#163](https://github.com/sveltejs/svelte-preprocess/issues/163)

### Code Refactoring

- 💡 remove deprecated autoProcess props ([7fbff08](https://github.com/sveltejs/svelte-preprocess/commit/7fbff088f08039cee25534385dfaebc590a0d813))

### Features

- 🎸 add sourceMap prop to configuration object ([9156efc](https://github.com/sveltejs/svelte-preprocess/commit/9156efc0d25e0a3642bf66e931b310eb62c4ec2f))
- 🎸 support defining default languages ([6483879](https://github.com/sveltejs/svelte-preprocess/commit/6483879e4a316d60a2e0655746a342c6debb90be)), closes [#189](https://github.com/sveltejs/svelte-preprocess/issues/189)
- 🎸 support markup preprocessing with no tags ([a1a3360](https://github.com/sveltejs/svelte-preprocess/commit/a1a33602bf1badd49e01188a9d63b8ef653a13a9))
- 🎸 support prependData for almost every preprocessor ([b80ca90](https://github.com/sveltejs/svelte-preprocess/commit/b80ca90802d2c17fa249b06fb17e678fff443656))

### BREAKING CHANGES

- 🧨 This is a general evolution of the specific `scss.data` property that
  was used to prepend data to components written in scss.
  `{preprocessorOptions}.prependData` is now the way to prepend some
  string to any preprocessor.
- 🧨 Node versions below 9.11.2 won't be supported anymore
- 🧨 Uses Lookbehind assertions, so Node 9.11.2+ is needed
- 🧨 Content passed through the `data` property won't be prepended anymore.
- 🧨 `onBefore` and `transformers` were removed

# [4.0.0](https://github.com/sveltejs/svelte-preprocess/compare/v4.0.0-alpha.2...v4.0.0) (2020-07-07)

### Bug Fixes

- 🐛 try to use sass before node-sass ([89aba0e](https://github.com/sveltejs/svelte-preprocess/commit/89aba0e6f03208787cdb7e212979634089405c15)), closes [#163](https://github.com/sveltejs/svelte-preprocess/issues/163)

* 🐛 bump minimum node version to 9.11.2 ([0befa7f](https://github.com/sveltejs/svelte-preprocess/commit/0befa7f4ff2aa3ba9f0129c3ed3994dd29fb991b))
* 🐛 prevent globalify to wrongly split escaped selectors ([f461320](https://github.com/sveltejs/svelte-preprocess/commit/f461320ec05a534021afbe20de0fe097d1016871)), closes [#191](https://github.com/sveltejs/svelte-preprocess/issues/191)
* 🐛 rename scss prepend option from `data` to `prependData` ([16b1325](https://github.com/sveltejs/svelte-preprocess/commit/16b13253bdf19073c084cb1590ed527695133836))

### Code Refactoring

- 💡 remove deprecated autoProcess props ([3dce7e4](https://github.com/sveltejs/svelte-preprocess/commit/3dce7e432fb15fc27914f5e1524b46929d84bd2c))

### Features

- 🎸 add sourceMap prop to configuration object ([a2505da](https://github.com/sveltejs/svelte-preprocess/commit/a2505da88ba025040d7069fd499c4d759a1fcb72))
- 🎸 support defining default languages ([d86122f](https://github.com/sveltejs/svelte-preprocess/commit/d86122f41a5616b7053dce26d7cf7c58ee025e1d)), closes [#189](https://github.com/sveltejs/svelte-preprocess/issues/189)
- 🎸 support markup preprocessing with no tags ([290ef98](https://github.com/sveltejs/svelte-preprocess/commit/290ef98aad8a218880f5c511d11ad562e1869b35))
- 🎸 support prependData for almost every preprocessor ([ef5272e](https://github.com/sveltejs/svelte-preprocess/commit/ef5272eceae1237af26d18aaf209ec68c6c43c6e))

### BREAKING CHANGES

- 🧨 This is a general evolution of the specific `scss.data` property that
  was used to prepend data to components written in scss.
  `{preprocessorOptions}.prependData` is now the way to prepend some
  string to any preprocessor.
- 🧨 Node versions below 9.11.2 won't be supported anymore
- 🧨 Uses Lookbehind assertions, so Node 9.11.2+ is needed
- 🧨 Content passed through the `data` property won't be prepended anymore.
- 🧨 `onBefore` and `transformers` were removed

## [3.9.12](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.11...v3.9.12) (2020-07-05)

### Bug Fixes

- 🐛 set bare option to true ([312bbb9](https://github.com/kaisermann/svelte-preprocess/commit/312bbb9bbf2668e1750296dbfc8b83bb39f291e8))

## [3.9.11](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.10...v3.9.11) (2020-07-01)

### Bug Fixes

- 🐛 log a warning if local external file is not found ([774aece](https://github.com/kaisermann/svelte-preprocess/commit/774aece08a5279a51707d3f428836169fc7735de)), closes [#174](https://github.com/kaisermann/svelte-preprocess/issues/174)

## [3.9.10](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.9...v3.9.10) (2020-06-22)

### Bug Fixes

- remove extra identation for sass content ([7d0f437](https://github.com/kaisermann/svelte-preprocess/commit/7d0f4376037d1ff6b426e2d6882adb6b08d95464))

## [3.9.9](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.7...v3.9.9) (2020-06-19)

### Bug Fixes

- 🐛 prevent including external file if content is not empty ([24e90d1](https://github.com/kaisermann/svelte-preprocess/commit/24e90d101103b043d4b9e9789d2d6582ecf31ae8)), closes [#183](https://github.com/kaisermann/svelte-preprocess/issues/183)
- 🐛 throw if type errors are found ([6545a5c](https://github.com/kaisermann/svelte-preprocess/commit/6545a5c13ff81a568714cbd83ae2d6127d4f61a4)), closes [#182](https://github.com/kaisermann/svelte-preprocess/issues/182)

## [3.9.8](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.7...v3.9.8) (2020-06-17)

### Bug Fixes

- 🐛 prevent including external file if content is not empty ([fd1b55a](https://github.com/kaisermann/svelte-preprocess/commit/fd1b55a557eb4db43adb4af3a3c8be63584f7288)), closes [#183](https://github.com/kaisermann/svelte-preprocess/issues/183)

## [3.9.7](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.6...v3.9.7) (2020-06-10)

### Bug Fixes

- 🐛 attributes not being passed to transformers ([840239d](https://github.com/kaisermann/svelte-preprocess/commit/840239d225f1ef0b7b642830093a8b6745d11ceb)), closes [#175](https://github.com/kaisermann/svelte-preprocess/issues/175)
- quotes in the release script ([#173](https://github.com/kaisermann/svelte-preprocess/issues/173)) ([5550b3e](https://github.com/kaisermann/svelte-preprocess/commit/5550b3eea390148e9e5683ec214bddae7531a405))

## [3.9.6](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.4...v3.9.6) (2020-06-06)

### Bug Fixes

- merge globalStyle and globalRule transformers ([a61ada6](https://github.com/kaisermann/svelte-preprocess/commit/a61ada6cf9b27452cebe8ac00cfa0ce873ce74bd))

## [3.9.5](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.2...v3.9.5) (2020-06-06)

### Bug Fixes

- add the comma into the list of combinators ([8386bf3](https://github.com/kaisermann/svelte-preprocess/commit/8386bf3adc0250bc3c3e5efaee7e21a1691cf336))
- teach the globalifySelector to determine combinators ([1783c55](https://github.com/kaisermann/svelte-preprocess/commit/1783c550db0a8736c8fe27036f0cd1a8be3fa77a))

## [3.9.4](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.2...v3.9.4) (2020-06-06)

### Bug Fixes

- do not break when :global is the only selector ([f011b74](https://github.com/kaisermann/svelte-preprocess/commit/f011b74be18493de575920cea6b81a7287fc3c3a))

## [3.9.3](https://github.com/kaisermann/svelte-preprocess/compare/v3.9.2...v3.9.3) (2020-06-06)

### Bug Fixes

- use the typescript transform to remove type imports ([3a15831](https://github.com/kaisermann/svelte-preprocess/commit/3a158318a77ca627bd1e365fb96dde1b6fefe1c0))

## [3.9.2](https://github.com/kaisermann/svelte-preprocess/compare/v3.7.4...v3.9.2) (2020-06-06)

### Bug Fixes

- 🐛 run globalRule only if postcss is installed ([3c22a20](https://github.com/kaisermann/svelte-preprocess/commit/3c22a203eb3fd565de783fdb6cb2e9faae270929))
- 🐛 scss with empty content ([12c3af3](https://github.com/kaisermann/svelte-preprocess/commit/12c3af38aa191b15497418fa3bab8b1a241f21bb)), closes [#166](https://github.com/kaisermann/svelte-preprocess/issues/166)

### Features

- 🎸 add globalStyle.sourceMap and globalRule.sourceMap opts ([2717c5b](https://github.com/kaisermann/svelte-preprocess/commit/2717c5b62eff78c512913adfb166439242715973))
- add implementation option for scss ([e4ca556](https://github.com/kaisermann/svelte-preprocess/commit/e4ca556821785e2b853f1668489912ebab21ee4b))
- add the [@global](https://github.com/global) {} rule support ([453c4be](https://github.com/kaisermann/svelte-preprocess/commit/453c4be2a2318d90cd86644d78e72404c72bd774))
- replace the [@global](https://github.com/global) for :global for CSS modules compliance ([cca29fb](https://github.com/kaisermann/svelte-preprocess/commit/cca29fba848d3f75b6ba354a9909c1de021c7971))

# [3.9.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.7.4...v3.9.0) (2020-06-05)

### Bug Fixes

- 🐛 run globalRule only if postcss is installed ([6294750](https://github.com/kaisermann/svelte-preprocess/commit/62947507064271d1cec796d3e0a7801633b875a8))

### Features

- add implementation option for scss ([e4ca556](https://github.com/kaisermann/svelte-preprocess/commit/e4ca556821785e2b853f1668489912ebab21ee4b))
- add the [@global](https://github.com/global) {} rule support ([46722ba](https://github.com/kaisermann/svelte-preprocess/commit/46722bac993308d8e4f1bb3d0b3086b802013d3d))
- replace the [@global](https://github.com/global) for :global for CSS modules compliance ([3c6a574](https://github.com/kaisermann/svelte-preprocess/commit/3c6a574ac25ea84aea2d1d60e025680d404c30ff))

# [3.8.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.7.4...v3.8.0) (2020-06-05)

### Features

- add implementation option for scss ([909e0c9](https://github.com/kaisermann/svelte-preprocess/commit/909e0c91be4a36fa3f9711d1ff4bc4f90fff64d3))

## [3.7.4](https://github.com/kaisermann/svelte-preprocess/compare/v3.7.3...v3.7.4) (2020-04-23)

## [3.7.3](https://github.com/kaisermann/svelte-preprocess/compare/v3.7.2...v3.7.3) (2020-04-22)

### Bug Fixes

- 🐛 add preprocessors as optional peerDeps ([7f434df](https://github.com/kaisermann/svelte-preprocess/commit/7f434dfc78c8118afbe7142d8061a2d3df1a330c)), closes [#137](https://github.com/kaisermann/svelte-preprocess/issues/137)

## [3.7.2](https://github.com/kaisermann/svelte-preprocess/compare/v3.7.1...v3.7.2) (2020-04-21)

### Bug Fixes

- 🐛 add `bare: true` to coffee compiler ([7d38bfd](https://github.com/kaisermann/svelte-preprocess/commit/7d38bfde34b6fafeca7e8df490348fd2004cdb1a)), closes [#134](https://github.com/kaisermann/svelte-preprocess/issues/134)

## [3.7.1](https://github.com/kaisermann/svelte-preprocess/compare/v3.7.0...v3.7.1) (2020-03-29)

### Bug Fixes

- 🐛 syntax and parser props from postcss config file ([74d4a89](https://github.com/kaisermann/svelte-preprocess/commit/74d4a8923faf619c3908dd63ba40626835303363)), closes [#127](https://github.com/kaisermann/svelte-preprocess/issues/127)

# [3.7.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.6.0...v3.7.0) (2020-03-29)

### Bug Fixes

- avoid reporting 'Cannot find name '{0}'. Did you mean '{1}'?' for reactive variables ([#126](https://github.com/kaisermann/svelte-preprocess/issues/126)) ([a267885](https://github.com/kaisermann/svelte-preprocess/commit/a267885e48a20c913368feafda153fa2389609e1))

### Features

- 🎸 add `replace` transformer ([06981f4](https://github.com/kaisermann/svelte-preprocess/commit/06981f410d0427bc75119cebebcb4b35c4b9a7dc))

# [3.6.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.4.0...v3.6.0) (2020-03-26)

### Features

- add an option to render scss synchronously via renderSync ([#123](https://github.com/kaisermann/svelte-preprocess/issues/123)) ([1c9285d](https://github.com/kaisermann/svelte-preprocess/commit/1c9285d508ec2fd0bea9b9f77a0940c6b3e00b89))

# [3.5.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.4.0...v3.5.0) (2020-03-13)

### Features

- 🎸 add babel transformer ([adc47a1](https://github.com/kaisermann/svelte-preprocess/commit/adc47a1752c30a7630cf2567418d8475bb545bdb)), closes [#108](https://github.com/kaisermann/svelte-preprocess/issues/108)

# [3.4.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.3.1...v3.4.0) (2020-02-02)

### Features

- 🎸 watch included pug files ([a8855fb](https://github.com/kaisermann/svelte-preprocess/commit/a8855fb7a92affe27490c14f14341403568132d5))

## [3.3.1](https://github.com/kaisermann/svelte-preprocess/compare/v3.2.6...v3.3.1) (2020-01-29)

### Bug Fixes

- 🐛 postinstall script breaking on yarn v2 ([2f7f62b](https://github.com/kaisermann/svelte-preprocess/commit/2f7f62b5e0137bd621f1bff930289d0d97631cb9))

### Features

- 🎸 support :local() pseudo-selector for global styles ([52277a8](https://github.com/kaisermann/svelte-preprocess/commit/52277a8af5492e1b0fc10cde16299a70da72cfdd))

# [3.3.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.2.6...v3.3.0) (2019-12-19)

### Features

- 🎸 support :local() pseudo-selector for global styles ([c9d98c2](https://github.com/kaisermann/svelte-preprocess/commit/c9d98c2da2bf62b628def6af2c2dd76027dd467c))

## [3.2.6](https://github.com/kaisermann/svelte-preprocess/compare/v3.2.5...v3.2.6) (2019-11-07)

### Bug Fixes

- 🐛 concat passed inclusion paths with default ones ([aac8cd4](https://github.com/kaisermann/svelte-preprocess/commit/aac8cd47a1b8b5d8895027dad7d26f2dabea4c14))

## [3.2.5](https://github.com/kaisermann/svelte-preprocess/compare/v3.2.4...v3.2.5) (2019-11-06)

### Bug Fixes

- 🐛 empty scss content throwing error ([b4a4139](https://github.com/kaisermann/svelte-preprocess/commit/b4a4139a72068db5d32d27c5209f9e24dbe313dc))

## [3.2.4](https://github.com/kaisermann/svelte-preprocess/compare/v3.2.3...v3.2.4) (2019-11-05)

### Bug Fixes

- 🐛 rollback last release ([b4461b4](https://github.com/kaisermann/svelte-preprocess/commit/b4461b4431ce8d87ecd386f2fe40bb34775c3d8f))

## [3.2.3](https://github.com/kaisermann/svelte-preprocess/compare/v3.2.2...v3.2.3) (2019-11-05)

### Bug Fixes

- 🐛 add svelte component typings to ts type scope ([434d0b4](https://github.com/kaisermann/svelte-preprocess/commit/434d0b47bb639af826af9a3add474cca07aedaa7))

## [3.2.2](https://github.com/kaisermann/svelte-preprocess/compare/v3.2.1...v3.2.2) (2019-10-31)

### Bug Fixes

- 🐛 support for self closing markup/template tag ([d109a89](https://github.com/kaisermann/svelte-preprocess/commit/d109a89656c050a28efdbc908d58958deb0ec08d))
- 🐛 use ts import transformer when transpileOnly:true ([752fbde](https://github.com/kaisermann/svelte-preprocess/commit/752fbdef99e9cc13ac75c95a7dcc1fa0928f72b3)), closes [#91](https://github.com/kaisermann/svelte-preprocess/issues/91)

## [3.2.1](https://github.com/kaisermann/svelte-preprocess/compare/v3.1.3...v3.2.1) (2019-10-31)

### Bug Fixes

- 🐛 prevent ts from removing unused imports ([cfe6dcb](https://github.com/kaisermann/svelte-preprocess/commit/cfe6dcbd23b7759f36bf7153222cab8e846cf8eb)), closes [#81](https://github.com/kaisermann/svelte-preprocess/issues/81)
- 🐛 stylus imports on windows ([5bee6e0](https://github.com/kaisermann/svelte-preprocess/commit/5bee6e0a73e3f11814e9002f4dafef3b762de95b))
- 🐛 transforming typescript without a tsconfig.json file ([7edb18a](https://github.com/kaisermann/svelte-preprocess/commit/7edb18aa27d44a216bdab72264116ca7cd5762ab))
- 🐛 typescript imports on windows ([f6d6195](https://github.com/kaisermann/svelte-preprocess/commit/f6d6195fc4d60d03c61a6c548066288967cf0d5f))
- don't try to include local files that doesn't exist ([52594eb](https://github.com/kaisermann/svelte-preprocess/commit/52594eb79e7533a442fd7063ef1e2e269269dbc3))

### Performance Improvements

- rewrite in typescript ([#80](https://github.com/kaisermann/svelte-preprocess/issues/80)) ([f71f29c](https://github.com/kaisermann/svelte-preprocess/commit/f71f29c2fd051b9548845cfc188c3a245be6eb27))

## [3.1.3](https://github.com/kaisermann/svelte-preprocess/compare/v3.1.2...v3.1.3) (2019-10-23)

### Bug Fixes

- 🐛 Try to only include files with local paths ([a167f6e](https://github.com/kaisermann/svelte-preprocess/commit/a167f6e4cc4802f86cc14fe38bbacf7e9db02729))

## [3.1.2](https://github.com/kaisermann/svelte-preprocess/compare/v3.1.1...v3.1.2) (2019-09-25)

### Bug Fixes

- 🐛 import less cjs instead of es6 ([bf8627f](https://github.com/kaisermann/svelte-preprocess/commit/bf8627f3f4bde0d598769a67de10194bbcf04701))

## [3.1.1](https://github.com/kaisermann/svelte-preprocess/compare/v3.1.0...v3.1.1) (2019-09-10)

### Bug Fixes

- 🐛 make [@keyframe](https://github.com/keyframe) at-rules global. ([#65](https://github.com/kaisermann/svelte-preprocess/issues/65)) ([40fb9be](https://github.com/kaisermann/svelte-preprocess/commit/40fb9be28e5737259754e9b1168efcaf25eef171))

# [3.1.0](https://github.com/kaisermann/svelte-preprocess/compare/v3.0.2...v3.1.0) (2019-09-03)

### Features

- 🎸 add "markupTagName" option ([746d2ab](https://github.com/kaisermann/svelte-preprocess/commit/746d2abbaaf072d3fac29cc2d2c0f61fa28d58e8))

## [3.0.2](https://github.com/kaisermann/svelte-preprocess/compare/v3.0.1...v3.0.2) (2019-08-29)

### Bug Fixes

- 🐛 inverted conditionals on typescript transformer ([a6937f0](https://github.com/kaisermann/svelte-preprocess/commit/a6937f0d9895ceca69bbb335d918bbe69d16c2a4))

## [3.0.1](https://github.com/kaisermann/svelte-preprocess/compare/v3.0.0...v3.0.1) (2019-08-29)

### Bug Fixes

- 🐛 wrong typescript diagnostic filtering ([2630a44](https://github.com/kaisermann/svelte-preprocess/commit/2630a44f4d6036a87f7120b5482b2c236cccd9a0)), closes [#49](https://github.com/kaisermann/svelte-preprocess/issues/49)

# [3.0.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.16.0...v3.0.0) (2019-08-28)

### Performance Improvements

- ⚡️ make postcss-load-config optional for better pkg size ([7ab9c72](https://github.com/kaisermann/svelte-preprocess/commit/7ab9c72797a3b702f2f3dd9280402b84057398be))

### BREAKING CHANGES

- To load PostCSS config automatically from a file, now it's needed to
  manually install "postcss-load-config".

# [2.16.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.15.2...v2.16.0) (2019-08-28)

### Features

- 🎸 add "transpileOnly" option to skip type check ([3e46741](https://github.com/kaisermann/svelte-preprocess/commit/3e46741d917b8be5dcd331f5672bcd0c7ff75090)), closes [#54](https://github.com/kaisermann/svelte-preprocess/issues/54)

## [2.15.2](https://github.com/kaisermann/svelte-preprocess/compare/v2.15.0...v2.15.2) (2019-08-28)

### Bug Fixes

- 🐛 make pug mixins work with space AND tabs ([81b0154](https://github.com/kaisermann/svelte-preprocess/commit/81b0154a2e90375a9f5793c8d7fd32698ef9f432))
- rename typescript configuration option to honor the readme docs ([67f2137](https://github.com/kaisermann/svelte-preprocess/commit/67f2137f9b6c11f3d2f4508d6dab2699e0d0b823))

# [2.15.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.14.4...v2.15.0) (2019-07-20)

### Features

- 🎸 add external src support for stand-alone processors ([974ab5a](https://github.com/kaisermann/svelte-preprocess/commit/974ab5a05c37e32da1abe0e59fb777d07efb0b3c))

## [2.14.4](https://github.com/kaisermann/svelte-preprocess/compare/v2.14.3...v2.14.4) (2019-07-03)

### Features

- 🎸 allow to watch stylus dependencies ([8aa3dfc](https://github.com/kaisermann/svelte-preprocess/commit/8aa3dfcd73730688c3a4d555ebf5a56cf36c669f))

## [2.14.3](https://github.com/kaisermann/svelte-preprocess/compare/v2.14.2...v2.14.3) (2019-07-01)

### Bug Fixes

- 🐛 pass less [@imports](https://github.com/imports) as dependencies to svelte ([55e9d28](https://github.com/kaisermann/svelte-preprocess/commit/55e9d28fd03a2a1bf07c4d1b9ec3517fe2ce0cb3))

## [2.14.2](https://github.com/kaisermann/svelte-preprocess/compare/v2.14.1...v2.14.2) (2019-06-29)

### Bug Fixes

- pug mixin elseif ([#45](https://github.com/kaisermann/svelte-preprocess/issues/45)) ([98ad9ca](https://github.com/kaisermann/svelte-preprocess/commit/98ad9ca996c70da25666e4f1e9286d4dfd15fb36))

## [2.14.1](https://github.com/kaisermann/svelte-preprocess/compare/v2.14.0...v2.14.1) (2019-06-28)

### Bug Fixes

- 🐛 transformer imported dependencies being overwritten ([423c17a](https://github.com/kaisermann/svelte-preprocess/commit/423c17a23283bca40ac0d8adf192ec1037196a12))

# [2.14.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.13.1...v2.14.0) (2019-06-22)

## [2.13.1](https://github.com/kaisermann/svelte-preprocess/compare/v2.13.0...v2.13.1) (2019-06-21)

# [2.13.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.12.0...v2.13.0) (2019-06-21)

# [2.12.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.7.1...v2.12.0) (2019-06-03)

### Bug Fixes

- 🐛 template preprocessing running on the whole file ([e37da9d](https://github.com/kaisermann/svelte-preprocess/commit/e37da9d5f8f5fde5077e02add17be039db729e32))

### Features

- 🎸 add support for typescript type checking ([#37](https://github.com/kaisermann/svelte-preprocess/issues/37)) ([e6dd744](https://github.com/kaisermann/svelte-preprocess/commit/e6dd7441db64906f79d7105723e23a8ef949e2d5))
- 🎸 add svelte pug mixins ([#38](https://github.com/kaisermann/svelte-preprocess/issues/38)) ([543ab75](https://github.com/kaisermann/svelte-preprocess/commit/543ab7557bd8e8172ea52e89355101d3c88a38ba))
- 🎸 add typescript preprocessor ([c195aa1](https://github.com/kaisermann/svelte-preprocess/commit/c195aa183b60899603d72743432de501b23f6087))
- prepend scss with data property ([#36](https://github.com/kaisermann/svelte-preprocess/issues/36)) ([dfa2b2a](https://github.com/kaisermann/svelte-preprocess/commit/dfa2b2a24124c94c3d3af6e63eff8963489f7caa))

## [2.7.1](https://github.com/kaisermann/svelte-preprocess/compare/v2.6.5...v2.7.1) (2019-05-08)

### Bug Fixes

- 🐛 cut 90% of downloaded package size ([882a4dd](https://github.com/kaisermann/svelte-preprocess/commit/882a4dd5c185c5063ceb27884877958d4178c0e8))

### Features

- 🎸 watch internal files imported with postcss-import ([5b14624](https://github.com/kaisermann/svelte-preprocess/commit/5b14624ac04a9812e680b252b8f6d69c97c30188))

## [2.6.5](https://github.com/kaisermann/svelte-preprocess/compare/v2.6.4...v2.6.5) (2019-05-05)

### Bug Fixes

- 🐛 stand-alone processors not exported ([ced0fd1](https://github.com/kaisermann/svelte-preprocess/commit/ced0fd1dfc34e13aefa13ba9d31efd81255e348d))

## [2.6.4](https://github.com/kaisermann/svelte-preprocess/compare/v2.6.3...v2.6.4) (2019-05-05)

### Bug Fixes

- 🐛 less and stylus stand-alone processor ([85827bb](https://github.com/kaisermann/svelte-preprocess/commit/85827bbd53340b39b99b706f03c926d3b01bbad6))

## [2.6.3](https://github.com/kaisermann/svelte-preprocess/compare/v2.6.2...v2.6.3) (2019-05-01)

### Features

- support dart-sass ([e56f8b2](https://github.com/kaisermann/svelte-preprocess/commit/e56f8b24c8f93db82ef9bb0f17dd658aaf000126))

## [2.6.2](https://github.com/kaisermann/svelte-preprocess/compare/v2.5.2...v2.6.2) (2019-04-11)

### Bug Fixes

- 🐛 standalone processors breaking everything :) ([ce11323](https://github.com/kaisermann/svelte-preprocess/commit/ce113236f0ca2fe5876b75d7c9935f664634cae0))

### Features

- 🎸 add stand-alone processors ([f19c90a](https://github.com/kaisermann/svelte-preprocess/commit/f19c90a1ed2838a8712b0c95dccbd8b005d8f9c0))

## [2.5.2](https://github.com/kaisermann/svelte-preprocess/compare/v2.5.1...v2.5.2) (2019-04-10)

### Features

- 🎸 support async onBefore() ([a6af2a2](https://github.com/kaisermann/svelte-preprocess/commit/a6af2a276cfc728ed60631eba5072b83cb035991))

## [2.5.1](https://github.com/kaisermann/svelte-preprocess/compare/v2.4.2...v2.5.1) (2019-04-02)

### Bug Fixes

- 🐛 custom transformer not working with external src files ([cc037c3](https://github.com/kaisermann/svelte-preprocess/commit/cc037c3cdae72f16c1f977986a1434006dc3fe96))

## [2.4.2](https://github.com/kaisermann/svelte-preprocess/compare/v2.4.1...v2.4.2) (2018-11-03)

## [2.4.1](https://github.com/kaisermann/svelte-preprocess/compare/v2.4.0...v2.4.1) (2018-11-02)

# [2.4.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.3.1...v2.4.0) (2018-11-01)

## [2.3.1](https://github.com/kaisermann/svelte-preprocess/compare/v2.2.2...v2.3.1) (2018-09-01)

## [2.2.2](https://github.com/kaisermann/svelte-preprocess/compare/v2.2.1...v2.2.2) (2018-07-18)

## [2.2.1](https://github.com/kaisermann/svelte-preprocess/compare/v2.2.0...v2.2.1) (2018-07-18)

# [2.2.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.1.4...v2.2.0) (2018-07-18)

## [2.1.3](https://github.com/kaisermann/svelte-preprocess/compare/v2.1.0...v2.1.3) (2018-06-21)

# [2.1.0](https://github.com/kaisermann/svelte-preprocess/compare/v2.0.5...v2.1.0) (2018-06-20)

## [2.0.5](https://github.com/kaisermann/svelte-preprocess/compare/v2.0.4...v2.0.5) (2018-05-17)

## [2.0.4](https://github.com/kaisermann/svelte-preprocess/compare/v2.0.3...v2.0.4) (2018-05-17)

## [2.0.2](https://github.com/kaisermann/svelte-preprocess/compare/v2.0.1...v2.0.2) (2018-05-15)

## [2.0.1](https://github.com/kaisermann/svelte-preprocess/compare/1.1.2...v2.0.1) (2018-05-15)

## 1.1.2 (2018-05-14)
