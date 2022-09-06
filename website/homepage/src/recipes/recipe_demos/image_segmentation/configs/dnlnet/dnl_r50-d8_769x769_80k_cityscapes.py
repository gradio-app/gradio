_base_ = [
    '../_base_/models/dnl_r50-d8.py',
    '../_base_/datasets/cityscapes_769x769.py', '../_base_/default_runtime.py',
    '../_base_/schedules/schedule_80k.py'
]
model = dict(
    decode_head=dict(align_corners=True),
    auxiliary_head=dict(align_corners=True),
    test_cfg=dict(mode='slide', crop_size=(769, 769), stride=(513, 513)))
optimizer = dict(
    paramwise_cfg=dict(
        custom_keys=dict(theta=dict(wd_mult=0.), phi=dict(wd_mult=0.))))
