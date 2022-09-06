_base_ = [
    '../_base_/models/psanet_r50-d8.py', '../_base_/datasets/ade20k.py',
    '../_base_/default_runtime.py', '../_base_/schedules/schedule_80k.py'
]
model = dict(
    decode_head=dict(mask_size=(66, 66), num_classes=150),
    auxiliary_head=dict(num_classes=150))
