_base_ = './deeplabv3_r50-d8_769x769_80k_cityscapes.py'
model = dict(pretrained='torchvision://resnet50', backbone=dict(type='ResNet'))
