_base_ = './fcn_r50-d8_512x1024_80k_cityscapes.py'
model = dict(
    pretrained='torchvision://resnet101',
    backbone=dict(type='ResNet', depth=101))
