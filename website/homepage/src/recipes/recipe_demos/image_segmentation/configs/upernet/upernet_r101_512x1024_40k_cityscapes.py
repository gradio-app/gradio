_base_ = './upernet_r50_512x1024_40k_cityscapes.py'
model = dict(pretrained='open-mmlab://resnet101_v1c', backbone=dict(depth=101))
