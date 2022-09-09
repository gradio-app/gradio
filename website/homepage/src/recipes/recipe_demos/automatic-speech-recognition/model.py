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

from huggingface_hub import hf_hub_download
from functools import lru_cache


from offline_asr import OfflineAsr

sample_rate = 16000


@lru_cache(maxsize=30)
def get_pretrained_model(repo_id: str) -> OfflineAsr:
    if repo_id in chinese_models:
        return chinese_models[repo_id](repo_id)
    elif repo_id in english_models:
        return english_models[repo_id](repo_id)
    elif repo_id in chinese_english_mixed_models:
        return chinese_english_mixed_models[repo_id](repo_id)
    else:
        raise ValueError(f"Unsupported repo_id: {repo_id}")


def _get_nn_model_filename(
    repo_id: str,
    filename: str,
    subfolder: str = "exp",
) -> str:
    nn_model_filename = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        subfolder=subfolder,
    )
    return nn_model_filename


def _get_bpe_model_filename(
    repo_id: str,
    filename: str = "bpe.model",
    subfolder: str = "data/lang_bpe_500",
) -> str:
    bpe_model_filename = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        subfolder=subfolder,
    )
    return bpe_model_filename


def _get_token_filename(
    repo_id: str,
    filename: str = "tokens.txt",
    subfolder: str = "data/lang_char",
) -> str:
    token_filename = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        subfolder=subfolder,
    )
    return token_filename


@lru_cache(maxsize=10)
def _get_aishell2_pretrained_model(repo_id: str) -> OfflineAsr:
    assert repo_id in [
        # context-size 1
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-A-2022-07-12",  # noqa
        # context-size 2
        "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-B-2022-07-12",  # noqa
    ], repo_id

    nn_model_filename = _get_nn_model_filename(
        repo_id=repo_id,
        filename="cpu_jit.pt",
    )
    token_filename = _get_token_filename(repo_id=repo_id)

    return OfflineAsr(
        nn_model_filename=nn_model_filename,
        bpe_model_filename=None,
        token_filename=token_filename,
        sample_rate=sample_rate,
        device="cpu",
    )


@lru_cache(maxsize=10)
def _get_gigaspeech_pre_trained_model(repo_id: str) -> OfflineAsr:
    assert repo_id in [
        "wgb14/icefall-asr-gigaspeech-pruned-transducer-stateless2",
    ], repo_id

    nn_model_filename = _get_nn_model_filename(
        repo_id=repo_id,
        filename="cpu_jit-iter-3488000-avg-20.pt",
    )
    bpe_model_filename = _get_bpe_model_filename(repo_id=repo_id)

    return OfflineAsr(
        nn_model_filename=nn_model_filename,
        bpe_model_filename=bpe_model_filename,
        token_filename=None,
        sample_rate=sample_rate,
        device="cpu",
    )


@lru_cache(maxsize=10)
def _get_librispeech_pre_trained_model(repo_id: str) -> OfflineAsr:
    assert repo_id in [
        "csukuangfj/icefall-asr-librispeech-pruned-transducer-stateless3-2022-05-13",  # noqa
    ], repo_id

    nn_model_filename = _get_nn_model_filename(
        repo_id=repo_id,
        filename="cpu_jit.pt",
    )
    bpe_model_filename = _get_bpe_model_filename(repo_id=repo_id)

    return OfflineAsr(
        nn_model_filename=nn_model_filename,
        bpe_model_filename=bpe_model_filename,
        token_filename=None,
        sample_rate=sample_rate,
        device="cpu",
    )


@lru_cache(maxsize=10)
def _get_wenetspeech_pre_trained_model(repo_id: str):
    assert repo_id in [
        "luomingshuang/icefall_asr_wenetspeech_pruned_transducer_stateless2",
    ], repo_id

    nn_model_filename = _get_nn_model_filename(
        repo_id=repo_id,
        filename="cpu_jit_epoch_10_avg_2_torch_1.7.1.pt",
    )
    token_filename = _get_token_filename(repo_id=repo_id)

    return OfflineAsr(
        nn_model_filename=nn_model_filename,
        bpe_model_filename=None,
        token_filename=token_filename,
        sample_rate=sample_rate,
        device="cpu",
    )


@lru_cache(maxsize=10)
def _get_tal_csasr_pre_trained_model(repo_id: str):
    assert repo_id in [
        "luomingshuang/icefall_asr_tal-csasr_pruned_transducer_stateless5",
    ], repo_id

    nn_model_filename = _get_nn_model_filename(
        repo_id=repo_id,
        filename="cpu_jit.pt",
    )
    token_filename = _get_token_filename(repo_id=repo_id)

    return OfflineAsr(
        nn_model_filename=nn_model_filename,
        bpe_model_filename=None,
        token_filename=token_filename,
        sample_rate=sample_rate,
        device="cpu",
    )


@lru_cache(maxsize=10)
def _get_alimeeting_pre_trained_model(repo_id: str):
    assert repo_id in [
        "luomingshuang/icefall_asr_alimeeting_pruned_transducer_stateless2",
    ], repo_id

    nn_model_filename = _get_nn_model_filename(
        repo_id=repo_id,
        filename="cpu_jit_torch_1.7.1.pt",
    )
    token_filename = _get_token_filename(repo_id=repo_id)

    return OfflineAsr(
        nn_model_filename=nn_model_filename,
        bpe_model_filename=None,
        token_filename=token_filename,
        sample_rate=sample_rate,
        device="cpu",
    )


@lru_cache(maxsize=10)
def _get_aidatatang_200zh_pretrained_mode(repo_id: str):
    assert repo_id in [
        "luomingshuang/icefall_asr_aidatatang-200zh_pruned_transducer_stateless2",
    ], repo_id

    nn_model_filename = _get_nn_model_filename(
        repo_id=repo_id,
        filename="cpu_jit_torch.1.7.1.pt",
    )
    token_filename = _get_token_filename(repo_id=repo_id)

    return OfflineAsr(
        nn_model_filename=nn_model_filename,
        bpe_model_filename=None,
        token_filename=token_filename,
        sample_rate=sample_rate,
        device="cpu",
    )


chinese_models = {
    "luomingshuang/icefall_asr_wenetspeech_pruned_transducer_stateless2": _get_wenetspeech_pre_trained_model,  # noqa
    "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-A-2022-07-12": _get_aishell2_pretrained_model,  # noqa
    "yuekai/icefall-asr-aishell2-pruned-transducer-stateless5-B-2022-07-12": _get_aishell2_pretrained_model,  # noqa
    "luomingshuang/icefall_asr_alimeeting_pruned_transducer_stateless2": _get_alimeeting_pre_trained_model,  # noqa
    "luomingshuang/icefall_asr_aidatatang-200zh_pruned_transducer_stateless2": _get_aidatatang_200zh_pretrained_mode,  # noqa
}

english_models = {
    "wgb14/icefall-asr-gigaspeech-pruned-transducer-stateless2": _get_gigaspeech_pre_trained_model,  # noqa
    "csukuangfj/icefall-asr-librispeech-pruned-transducer-stateless3-2022-05-13": _get_librispeech_pre_trained_model,  # noqa
}

chinese_english_mixed_models = {
    "luomingshuang/icefall_asr_tal-csasr_pruned_transducer_stateless5": _get_tal_csasr_pre_trained_model,  # noqa
}

all_models = {
    **chinese_models,
    **english_models,
    **chinese_english_mixed_models,
}

language_to_models = {
    "Chinese": list(chinese_models.keys()),
    "English": list(english_models.keys()),
    "Chinese+English": list(chinese_english_mixed_models.keys()),
}
