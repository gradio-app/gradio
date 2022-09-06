_base_ = '../fcn/fcn_r101-d8_512x1024_80k_cityscapes.py'
model = dict(
    pretrained='mmcls://mobilenet_v2',
    backbone=dict(
        _delete_=True,
        type='MobileNetV2',
        widen_factor=1.,
        strides=(1, 2, 2, 1, 1, 1, 1),
        dilations=(1, 1, 1, 2, 2, 4, 4),
        out_indices=(1, 2, 4, 6)),
    decode_head=dict(in_channels=320),
    auxiliary_head=dict(in_channels=96))
