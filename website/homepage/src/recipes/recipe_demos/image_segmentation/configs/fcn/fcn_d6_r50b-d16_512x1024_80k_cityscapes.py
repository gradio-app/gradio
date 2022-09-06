_base_ = './fcn_d6_r50-d16_512x1024_80k_cityscapes.py'
model = dict(pretrained='torchvision://resnet50', backbone=dict(type='ResNet'))
