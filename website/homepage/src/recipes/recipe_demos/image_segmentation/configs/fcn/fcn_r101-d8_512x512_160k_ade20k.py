_base_ = './fcn_r50-d8_512x512_160k_ade20k.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
