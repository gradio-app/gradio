_base_ = [
    '../_base_/models/encnet_r50-d8.py', '../_base_/datasets/ade20k.py',
    '../_base_/default_runtime.py', '../_base_/schedules/schedule_80k.py'
]
model = dict(
    backbone=dict(stem_channels=128),
    decode_head=dict(num_classes=150),
    auxiliary_head=dict(num_classes=150))
