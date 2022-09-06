_base_ = './danet_r50-d8_512x512_80k_ade20k.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
