_base_ = './deeplabv3_r50-d8_512x1024_40k_cityscapes.py'
model = dict(
    pretrained='open-mmlab://resnet101_v1c',
    backbone=dict(
        depth=101,
        dilations=(1, 1, 1, 2),
        strides=(1, 2, 2, 1),
        multi_grid=(1, 2, 4)),
    decode_head=dict(
        dilations=(1, 6, 12, 18),
        sampler=dict(type='OHEMPixelSampler', min_kept=100000)))
