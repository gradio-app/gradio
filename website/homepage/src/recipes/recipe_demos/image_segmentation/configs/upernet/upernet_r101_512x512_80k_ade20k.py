_base_ = './upernet_r50_512x512_80k_ade20k.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
