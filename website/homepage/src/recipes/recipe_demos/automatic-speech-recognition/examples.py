#!/usr/bin/env python3
#
# Copyright      2022  Xiaomi Corp.        (authors: Fangjun Kuang)
#
# See LICENSE for clarification regarding multiple authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
examples = [
    # librispeech
    # https://huggingface.co/csukuangfj/icefall-asr-librispeech-pruned-transducer-stateless5-2022-05-13/tree/main/test_wavs
    [
        "English",
        "csukuangfj/icefall-asr-librispeech-pruned-transducer-stateless3-2022-05-13",
        "greedy_search",
        4,
        "./test_wavs/librispeech/1089-134686-0001.wav",
    ],
    [
        "English",
        "csukuangfj/icefall-asr-librispeech-pruned-transducer-stateless3-2022-05-13",
        "greedy_search",
        4,
        "./test_wavs/librispeech/1221-135766-0001.wav",
    ],
    [
        "English",
        "csukuangfj/icefall-asr-librispeech-pruned-transducer-stateless3-2022-05-13",
        "greedy_search",
        4,
        "./test_wavs/librispeech/1221-135766-0002.wav",
    ],
    # gigaspeech
    [
        "English",
        "wgb14/icefall-asr-gigaspeech-pruned-transducer-stateless2",
        "greedy_search",
        4,
        "./test_wavs/gigaspeech/1-minute-audiobook.opus",
    ],
    [
        "English",
        "wgb14/icefall-asr-gigaspeech-pruned-transducer-stateless2",
        "greedy_search",
        4,
        "./test_wavs/gigaspeech/100-seconds-podcast.opus",
    ],
    [
        "English",
        "wgb14/icefall-asr-gigaspeech-pruned-transducer-stateless2",
        "greedy_search",
        4,
        "./test_wavs/gigaspeech/100-seconds-youtube.opus",
    ],
    # wenetspeech
    # https://huggingface.co/luomingshuang/icefall_asr_wenetspeech_pruned_transducer_stateless2/tree/main/test_wavs
    [
        "Chinese",
        "luomingshuang/icefall_asr_wenetspeech_pruned_transducer_stateless2",
        "greedy_search",
        4,
        "./test_wavs/wenetspeech/DEV_T0000000000.opus",
    ],
    [
        "Chinese",
        "luomingshuang/icefall_asr_wenetspeech_pruned_transducer_stateless2",
        "greedy_search",
        4,
        "./test_wavs/wenetspeech/DEV_T0000000001.opus",
    ],
    [
        "Chinese",
        "luomingshuang/icefall_asr_wenetspeech_pruned_transducer_stateless2",
        "greedy_search",
        4,
        "./test_wavs/wenetspeech/DEV_T0000000002.opus",
    ],
    # aishell2-A
    # https://huggingface.co/yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-A-2022-07-12/tree/main/test_wavs
    [
        "Chinese",
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-A-2022-07-12",
        "greedy_search",
        4,
        "./test_wavs/aishell2/ID0012W0030.wav",
    ],
    [
        "Chinese",
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-A-2022-07-12",
        "greedy_search",
        4,
        "./test_wavs/aishell2/ID0012W0162.wav",
    ],
    [
        "Chinese",
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-A-2022-07-12",
        "greedy_search",
        4,
        "./test_wavs/aishell2/ID0012W0215.wav",
    ],
    # aishell2-B
    # https://huggingface.co/yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-A-2022-07-12/tree/main/test_wavs
    [
        "Chinese",
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-B-2022-07-12",
        "greedy_search",
        4,
        "./test_wavs/aishell2/ID0012W0030.wav",
    ],
    [
        "Chinese",
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-B-2022-07-12",
        "greedy_search",
        4,
        "./test_wavs/aishell2/ID0012W0162.wav",
    ],
    [
        "Chinese",
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-B-2022-07-12",
        "greedy_search",
        4,
        "./test_wavs/aishell2/ID0012W0215.wav",
    ],
    # aishell2-B
    # https://huggingface.co/luomingshuang/icefall_asr_aidatatang-200zh_pruned_transducer_stateless2/tree/main/test_wavs
    [
        "Chinese",
        "luomingshuang/icefall_asr_aidatatang-200zh_pruned_transducer_stateless2",
        "greedy_search",
        4,
        "./test_wavs/aidatatang_200zh/T0055G0036S0002.wav",
    ],
    [
        "Chinese",
        "luomingshuang/icefall_asr_aidatatang-200zh_pruned_transducer_stateless2",
        "greedy_search",
        4,
        "./test_wavs/aidatatang_200zh/T0055G0036S0003.wav",
    ],
    [
        "Chinese",
        "luomingshuang/icefall_asr_aidatatang-200zh_pruned_transducer_stateless2",
        "greedy_search",
        4,
        "./test_wavs/aidatatang_200zh/T0055G0036S0004.wav",
    ],
    # tal_csasr
    # https://huggingface.co/luomingshuang/icefall_asr_tal-csasr_pruned_transducer_stateless5/tree/main/test_wavs
    [
        "Chinese+English",
        "luomingshuang/icefall_asr_tal-csasr_pruned_transducer_stateless5",
        "greedy_search",
        4,
        "./test_wavs/tal_csasr/210_36476_210_8341_1_1533271973_7057520_132.wav",
    ],
    [
        "Chinese+English",
        "luomingshuang/icefall_asr_tal-csasr_pruned_transducer_stateless5",
        "greedy_search",
        4,
        "./test_wavs/tal_csasr/210_36476_210_8341_1_1533271973_7057520_138.wav",
    ],
    [
        "Chinese+English",
        "luomingshuang/icefall_asr_tal-csasr_pruned_transducer_stateless5",
        "greedy_search",
        4,
        "./test_wavs/tal_csasr/210_36476_210_8341_1_1533271973_7057520_145.wav",
    ],
]
