_base_ = './deeplabv3plus_r50-d8_512x1024_80k_cityscapes.py'
model = dict(pretrained='torchvision://resnet50', backbone=dict(type='ResNet'))
