_base_ = './deeplabv3_r50-d8_480x480_80k_pascal_context_59.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
