_base_ = './deeplabv3_r50-d8_769x769_80k_cityscapes.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
