# Copyright      2022  Xiaomi Corp.        (authors: Fangjun Kuang)
#
# Copied from https://github.com/k2-fsa/sherpa/blob/master/sherpa/bin/conformer_rnnt/decode.py
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

import math
from typing import List

import torch
from sherpa import RnntConformerModel, greedy_search, modified_beam_search
from torch.nn.utils.rnn import pad_sequence

LOG_EPS = math.log(1e-10)


@torch.no_grad()
def run_model_and_do_greedy_search(
    model: RnntConformerModel,
    features: List[torch.Tensor],
) -> List[List[int]]:
    """Run RNN-T model with the given features and use greedy search
    to decode the output of the model.

    Args:
      model:
        The RNN-T model.
      features:
        A list of 2-D tensors. Each entry is of shape
        (num_frames, feature_dim).
    Returns:
      Return a list-of-list containing the decoding token IDs.
    """
    features_length = torch.tensor(
        [f.size(0) for f in features],
        dtype=torch.int64,
    )
    features = pad_sequence(
        features,
        batch_first=True,
        padding_value=LOG_EPS,
    )

    device = model.device
    features = features.to(device)
    features_length = features_length.to(device)

    encoder_out, encoder_out_length = model.encoder(
        features=features,
        features_length=features_length,
    )

    hyp_tokens = greedy_search(
        model=model,
        encoder_out=encoder_out,
        encoder_out_length=encoder_out_length.cpu(),
    )
    return hyp_tokens


@torch.no_grad()
def run_model_and_do_modified_beam_search(
    model: RnntConformerModel,
    features: List[torch.Tensor],
    num_active_paths: int,
) -> List[List[int]]:
    """Run RNN-T model with the given features and use greedy search
    to decode the output of the model.

    Args:
      model:
        The RNN-T model.
      features:
        A list of 2-D tensors. Each entry is of shape
        (num_frames, feature_dim).
      num_active_paths:
        Used only when decoding_method is modified_beam_search.
        It specifies number of active paths for each utterance. Due to
        merging paths with identical token sequences, the actual number
        may be less than "num_active_paths".
    Returns:
      Return a list-of-list containing the decoding token IDs.
    """
    features_length = torch.tensor(
        [f.size(0) for f in features],
        dtype=torch.int64,
    )
    features = pad_sequence(
        features,
        batch_first=True,
        padding_value=LOG_EPS,
    )

    device = model.device
    features = features.to(device)
    features_length = features_length.to(device)

    encoder_out, encoder_out_length = model.encoder(
        features=features,
        features_length=features_length,
    )

    hyp_tokens = modified_beam_search(
        model=model,
        encoder_out=encoder_out,
        encoder_out_length=encoder_out_length.cpu(),
        num_active_paths=num_active_paths,
    )
    return hyp_tokens
