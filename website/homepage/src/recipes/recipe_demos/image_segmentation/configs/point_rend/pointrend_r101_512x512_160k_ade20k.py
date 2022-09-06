_base_ = './pointrend_r50_512x512_160k_ade20k.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
