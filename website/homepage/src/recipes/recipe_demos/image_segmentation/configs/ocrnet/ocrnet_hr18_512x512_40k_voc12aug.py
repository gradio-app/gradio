_base_ = [
    '../_base_/models/ocrnet_hr18.py',
    '../_base_/datasets/pascal_voc12_aug.py', '../_base_/default_runtime.py',
    '../_base_/schedules/schedule_40k.py'
]
norm_cfg = dict(type='SyncBN', requires_grad=True)
model = dict(decode_head=[
    dict(
        type='FCNHead',
        in_channels=[18, 36, 72, 144],
        channels=sum([18, 36, 72, 144]),
        in_index=(0, 1, 2, 3),
        input_transform='resize_concat',
        kernel_size=1,
        num_convs=1,
        concat_input=False,
        dropout_ratio=-1,
        num_classes=21,
        norm_cfg=norm_cfg,
        align_corners=False,
        loss_decode=dict(
            type='CrossEntropyLoss', use_sigmoid=False, loss_weight=0.4)),
    dict(
        type='OCRHead',
        in_channels=[18, 36, 72, 144],
        in_index=(0, 1, 2, 3),
        input_transform='resize_concat',
        channels=512,
        ocr_channels=256,
        dropout_ratio=-1,
        num_classes=21,
        norm_cfg=norm_cfg,
        align_corners=False,
        loss_decode=dict(
            type='CrossEntropyLoss', use_sigmoid=False, loss_weight=1.0)),
])
