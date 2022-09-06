_base_ = [
    '../_base_/models/pspnet_unet_s5-d16.py', '../_base_/datasets/hrf.py',
    '../_base_/default_runtime.py', '../_base_/schedules/schedule_40k.py'
]
model = dict(test_cfg=dict(crop_size=(256, 256), stride=(170, 170)))
evaluation = dict(metric='mDice')
