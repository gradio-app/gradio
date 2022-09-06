_base_ = './fpn_r50_512x1024_80k_cityscapes.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
