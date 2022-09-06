_base_ = './fcn_d6_r50b-d16_512x1024_80k_cityscapes.py'
model = dict(
    pretrained='torchvision://resnet101',
    backbone=dict(type='ResNet', depth=101))
